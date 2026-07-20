package translate

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"
)

// TranslatorClient là interface cho AI translation client.
// NVIDIAClient implement interface này.
// Dùng interface để dễ mock trong unit test mà không cần network thật.
type TranslatorClient interface {
	Translate(ctx context.Context, content, targetLang, sourceLang string) (string, error)
}

// NVIDIAClient là HTTP wrapper để gọi NVIDIA NIM API (tương thích OpenAI SDK).
// Dùng net/http thuần để tránh thêm dependency mới.
type NVIDIAClient struct {
	apiKey  string
	baseURL string
	model   string
	http    *http.Client
}

// nvidiaMessage là struct message trong OpenAI-compatible chat format.
type nvidiaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// nvidiaChatRequest là request body gửi đến NVIDIA NIM API.
type nvidiaChatRequest struct {
	Model       string          `json:"model"`
	Messages    []nvidiaMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
	MaxTokens   int             `json:"max_tokens"`
}

// nvidiaChatResponse là response body nhận từ NVIDIA NIM API.
type nvidiaChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

// retryableError là error wrapper để đánh dấu lỗi có thể retry.
type retryableError struct {
	statusCode int
	err        error
}

func (e *retryableError) Error() string { return e.err.Error() }

// NewNVIDIAClient tạo một NVIDIAClient mới với API key và model được chỉ định.
// HTTP client timeout được set 60s (HTTPClientTimeout) — đủ để nhận response từ chunk dài.
func NewNVIDIAClient(apiKey, model string) *NVIDIAClient {
	if model == "" {
		model = "meta/llama-3.1-70b-instruct"
	}
	return &NVIDIAClient{
		apiKey:  apiKey,
		baseURL: "https://integrate.api.nvidia.com/v1",
		model:   model,
		// HTTPClientTimeout (60s) = timeout tổng thể của http.Client (connection + response body)
		// Per-chunk context timeout (15s) được set từ service.go, tách riêng với HTTP client timeout
		http: &http.Client{Timeout: HTTPClientTimeout},
	}
}

// Translate gửi nội dung đến NVIDIA NIM và trả về bản dịch.
// Tự động retry tối đa MaxRetries lần với exponential backoff khi gặp 429/5xx.
// Context timeout được kiểm soát từ bên ngoài (per-chunk: 15s).
func (c *NVIDIAClient) Translate(ctx context.Context, content, targetLang, sourceLang string) (string, error) {
	systemPrompt := buildSystemPrompt(targetLang)

	payload := nvidiaChatRequest{
		Model: c.model,
		Messages: []nvidiaMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: content},
		},
		Temperature: 0.1, // Nhiệt độ thấp để đảm bảo dịch chính xác, ít sáng tạo
		MaxTokens:   4096,
	}

	var lastErr error
	for attempt := 0; attempt < MaxRetries; attempt++ {
		// Exponential backoff: 0s, 1s, 2s trước mỗi lần retry
		if attempt > 0 {
			backoff := time.Duration(math.Pow(2, float64(attempt-1))) * time.Second
			select {
			case <-ctx.Done():
				return "", ctx.Err()
			case <-time.After(backoff):
			}
		}

		result, err := c.doRequest(ctx, payload)
		if err == nil {
			return result, nil
		}

		lastErr = err
		// Chỉ retry nếu là lỗi 429 (rate limit) hoặc 5xx (server error)
		if re, ok := err.(*retryableError); ok {
			if re.statusCode == 429 || re.statusCode >= 500 {
				continue
			}
		}
		// Lỗi 4xx khác hoặc lỗi network — không retry
		break
	}

	return "", fmt.Errorf("NVIDIA API failed after %d attempts: %w", MaxRetries, lastErr)
}

// doRequest thực hiện một HTTP request đến NVIDIA NIM API.
func (c *NVIDIAClient) doRequest(ctx context.Context, payload nvidiaChatRequest) (string, error) {
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		c.baseURL+"/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("http do: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response body: %w", err)
	}

	// Xử lý HTTP error codes
	if resp.StatusCode != http.StatusOK {
		var apiErr nvidiaChatResponse
		_ = json.Unmarshal(respBytes, &apiErr)
		errMsg := fmt.Sprintf("HTTP %d", resp.StatusCode)
		if apiErr.Error != nil {
			errMsg = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, apiErr.Error.Message)
		}
		return "", &retryableError{
			statusCode: resp.StatusCode,
			err:        fmt.Errorf("%s", errMsg),
		}
	}

	var result nvidiaChatResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if len(result.Choices) == 0 || result.Choices[0].Message.Content == "" {
		return "", fmt.Errorf("empty response from NVIDIA API")
	}

	return result.Choices[0].Message.Content, nil
}

// buildSystemPrompt xây dựng system prompt để ép model dịch chính xác và giữ định dạng.
func buildSystemPrompt(targetLang string) string {
	lang := "English"
	if targetLang == "vi" {
		lang = "Vietnamese"
	}
	return fmt.Sprintf(
		"You are a professional technical translator specializing in IT, DevOps, Cloud Native, and software engineering content. "+
			"Translate the following text to %s. "+
			"RULES:\n"+
			"1. Preserve ALL markdown formatting exactly (headings, bold, italic, code blocks, lists, links)\n"+
			"2. Preserve ALL HTML tags exactly as-is\n"+
			"3. Do NOT translate code snippets, command names, technical terms in backticks, or proper nouns\n"+
			"4. Do NOT add explanations, notes, or commentary\n"+
			"5. Output ONLY the translated text, nothing else\n"+
			"6. If the text is already in %s, return it unchanged",
		lang, lang,
	)
}

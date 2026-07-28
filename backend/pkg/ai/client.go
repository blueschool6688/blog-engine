package ai

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

const (
	HTTPClientTimeout = 180 * time.Second
	MaxRetries        = 3
)

// Message represents a single chat message.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest is the payload for chat completion.
type ChatRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
	MaxTokens   int       `json:"max_tokens"`
}

// ChatResponse matches the OpenAI chat completion response structure.
type ChatResponse struct {
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

type retryableError struct {
	statusCode int
	err        error
}

func (e *retryableError) Error() string { return e.err.Error() }

// Client wraps HTTP communication with an OpenAI-compatible API (e.g. NVIDIA NIM).
type Client struct {
	apiKey  string
	baseURL string
	model   string
	http    *http.Client
}

// NewClient creates a new generic AI client.
func NewClient(apiKey, model string) *Client {
	if model == "" {
		model = "meta/llama-3.1-70b-instruct"
	}
	return &Client{
		apiKey:  apiKey,
		baseURL: "https://integrate.api.nvidia.com/v1",
		model:   model,
		http:    &http.Client{Timeout: HTTPClientTimeout},
	}
}

// ChatCompletion generates a response using chat models.
func (c *Client) ChatCompletion(ctx context.Context, systemPrompt, userPrompt string, temperature float64, maxTokens int) (string, error) {
	payload := ChatRequest{
		Model: c.model,
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		Temperature: temperature,
		MaxTokens:   maxTokens,
	}

	var lastErr error
	for attempt := 0; attempt < MaxRetries; attempt++ {
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
		if re, ok := err.(*retryableError); ok {
			if re.statusCode == 429 || re.statusCode >= 500 {
				continue
			}
		}
		break
	}

	return "", fmt.Errorf("AI API failed after %d attempts: %w", MaxRetries, lastErr)
}

func (c *Client) doRequest(ctx context.Context, payload ChatRequest) (string, error) {
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

	if resp.StatusCode != http.StatusOK {
		var apiErr ChatResponse
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

	var result ChatResponse
	if err := json.Unmarshal(respBytes, &result); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if len(result.Choices) == 0 || result.Choices[0].Message.Content == "" {
		return "", fmt.Errorf("empty response from AI API")
	}

	return result.Choices[0].Message.Content, nil
}

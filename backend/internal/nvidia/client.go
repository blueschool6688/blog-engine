package nvidia

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"backend/pkg/config"
)

type Client struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type EmbedRequest struct {
	Input []string `json:"input"`
	Model string   `json:"model"`
	InputType string `json:"input_type"`
}

type EmbedResponse struct {
	Data []struct {
		Embedding []float32 `json:"embedding"`
	} `json:"data"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type ChatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

func (c *Client) Embed(ctx context.Context, text string) ([]float32, error) {
	reqBody := EmbedRequest{
		Input: []string{text},
		Model: c.cfg.NVIDIAEmbedModel,
		InputType: "passage",
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/embeddings", c.cfg.NVIDIAAPIBaseURL)
	var respData EmbedResponse

	err = c.doRequestWithRetry(ctx, "POST", url, body, &respData)
	if err != nil {
		return nil, err
	}

	if len(respData.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}
	return respData.Data[0].Embedding, nil
}

func (c *Client) ChatComplete(ctx context.Context, sysPrompt, userPrompt string) (string, error) {
	reqBody := ChatRequest{
		Model: c.cfg.NVIDIAChatModel,
		Messages: []Message{
			{Role: "system", Content: sysPrompt},
			{Role: "user", Content: userPrompt},
		},
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/chat/completions", c.cfg.NVIDIAAPIBaseURL)
	var respData ChatResponse

	err = c.doRequestWithRetry(ctx, "POST", url, body, &respData)
	if err != nil {
		return "", err
	}

	if len(respData.Choices) == 0 {
		return "", fmt.Errorf("no choices returned")
	}
	return respData.Choices[0].Message.Content, nil
}

func (c *Client) doRequestWithRetry(ctx context.Context, method, url string, body []byte, target interface{}) error {
	maxRetries := 3
	backoff := 1 * time.Second

	for i := 0; i <= maxRetries; i++ {
		req, err := http.NewRequestWithContext(ctx, method, url, bytes.NewBuffer(body))
		if err != nil {
			return err
		}

		req.Header.Set("Authorization", "Bearer "+c.cfg.NVIDIAAPIKey)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			if i == maxRetries {
				return err
			}
			time.Sleep(backoff)
			backoff *= 2
			continue
		}

		if resp.StatusCode == http.StatusTooManyRequests {
			resp.Body.Close()
			if i == maxRetries {
				return fmt.Errorf("rate limited (429) after %d retries", maxRetries)
			}
			time.Sleep(backoff)
			backoff *= 2
			continue
		}

		if resp.StatusCode != http.StatusOK {
			respBody, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return fmt.Errorf("API error: status %d, body %s", resp.StatusCode, string(respBody))
		}

		err = json.NewDecoder(resp.Body).Decode(target)
		resp.Body.Close()
		if err != nil {
			return err
		}

		return nil
	}
	return nil
}

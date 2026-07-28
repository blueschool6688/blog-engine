package translate

import (
	"context"
	"fmt"

	"backend/pkg/ai"
)

// TranslatorClient là interface cho AI translation client.
// NVIDIAClient implement interface này.
type TranslatorClient interface {
	Translate(ctx context.Context, content, targetLang, sourceLang string) (string, error)
}

// NVIDIAClient là HTTP wrapper để gọi NVIDIA NIM API thông qua package shared pkg/ai.
type NVIDIAClient struct {
	client *ai.Client
}

// NewNVIDIAClient tạo một NVIDIAClient mới.
func NewNVIDIAClient(apiKey, model string) *NVIDIAClient {
	return &NVIDIAClient{
		client: ai.NewClient(apiKey, model),
	}
}

// Translate gửi nội dung đến AI client và trả về bản dịch.
func (c *NVIDIAClient) Translate(ctx context.Context, content, targetLang, sourceLang string) (string, error) {
	systemPrompt := buildSystemPrompt(targetLang)
	// Cho translate, ta dùng temperature thấp (0.1) để đảm bảo độ chính xác
	return c.client.ChatCompletion(ctx, systemPrompt, content, 0.1, 4096)
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

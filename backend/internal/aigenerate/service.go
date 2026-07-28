package aigenerate

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"backend/pkg/ai"
	"backend/pkg/logger"
)

type GenerateRequest struct {
	Topic string `json:"topic"`
}

type GeneratedPost struct {
	TitleVI       string   `json:"title_vi"`
	TitleEN       string   `json:"title_en"`
	ContentVI     string   `json:"content_vi"`
	ContentEN     string   `json:"content_en"`
	MetaTitleVI   string   `json:"meta_title_vi"`
	MetaTitleEN   string   `json:"meta_title_en"`
	MetaDescVI    string   `json:"meta_desc_vi"`
	MetaDescEN    string   `json:"meta_desc_en"`
	ExcerptVI     string   `json:"excerpt_vi"`
	ExcerptEN     string   `json:"excerpt_en"`
	SuggestedTags []string `json:"suggested_tags"`
}

// SummarizeResult is the structured output from AI summarization.
type SummarizeResult struct {
	Summary   string `json:"summary"`
	SummaryEN string `json:"summary_en,omitempty"`
}

// SpamResult is the structured output from spam detection.
type SpamResult struct {
	SpamScore float64 `json:"spam_score"` // 0.0 (ham) to 1.0 (spam)
	Reason    string  `json:"reason"`
}

type SEOScoreResult struct {
	Score       int      `json:"score"`       // 0-100
	Grade       string   `json:"grade"`       // A, B, C, D, F
	Suggestions []string `json:"suggestions"` // Improvement hints
}

type SentimentResult struct {
	Sentiment string  `json:"sentiment"` // positive, neutral, negative
	Score     float64 `json:"score"`     // 0.0-1.0
}


// Service holds AI clients for content generation and spam detection.
type Service struct {
	aiClient     *ai.Client
	spamAiClient *ai.Client // Separate, faster model for spam detection
	log          *logger.Logger
}

// NewService creates a Service with the same model for all AI tasks.
func NewService(aiClient *ai.Client, log *logger.Logger) *Service {
	return &Service{
		aiClient:     aiClient,
		spamAiClient: aiClient,
		log:          log,
	}
}

// NewServiceWithSpamModel creates a Service with separate models for content generation and spam detection.
func NewServiceWithSpamModel(aiClient *ai.Client, spamClient *ai.Client, log *logger.Logger) *Service {
	return &Service{
		aiClient:     aiClient,
		spamAiClient: spamClient,
		log:          log,
	}
}

// GeneratePost calls LLM to generate a structured blog post based on the topic.
func (s *Service) GeneratePost(ctx context.Context, topic string) (*GeneratedPost, error) {
	s.log.Info("[ai-generate] Generating post for topic: %s\n", topic)

	systemPrompt := `You are an expert technical blog writer specializing in IT, DevOps, Cloud Native, Kubernetes, and software engineering.
Your task is to write a comprehensive, high-quality blog post about the topic provided by the user.

Output MUST be a single, valid JSON object matching this schema:
{
  "title_vi": "Tiêu đề tiếng Việt hấp dẫn, chuẩn SEO",
  "title_en": "Attractive English title, SEO friendly",
  "content_vi": "Nội dung chi tiết bằng tiếng Việt (định dạng HTML đầy đủ). Sử dụng h2, h3, p, strong, code, pre code, blockquote. Nội dung dài khoảng 800-1200 từ, có ví dụ thực tế.",
  "content_en": "Detailed content in English (full HTML format). Use h2, h3, p, strong, code, pre code, blockquote. Length 800-1200 words.",
  "meta_title_vi": "Tiêu đề SEO tiếng Việt (tối đa 60 ký tự)",
  "meta_title_en": "SEO Title in English (max 60 chars)",
  "meta_desc_vi": "Mô tả SEO tiếng Việt (tối đa 160 ký tự)",
  "meta_desc_en": "SEO Description in English (max 160 chars)",
  "excerpt_vi": "Tóm tắt ngắn gọn tiếng Việt của bài viết (tối đa 300 ký tự)",
  "excerpt_en": "Short English summary of the post (max 300 chars)",
  "suggested_tags": ["tag1", "tag2", "tag3"]
}

RULES:
1. Output ONLY the JSON block. Do not include markdown wraps like ` + "`" + `json or text before/after.
2. The Vietnamese and English contents must be high quality, natural, and accurately capture technical terms.
3. Code snippets should be formatted with <pre><code>...</code></pre>.
4. Follow standard HTML tags for post layout. Do not use Markdown characters inside HTML.`

	userPrompt := fmt.Sprintf("Write a detailed blog post about: %s", topic)

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.7, 4096)
	if err != nil {
		return nil, fmt.Errorf("AI completion: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var post GeneratedPost
	if err := json.Unmarshal([]byte(respText), &post); err != nil {
		s.log.Error("[ai-generate] Failed to parse JSON: %v. Raw text:\n%s\n", err, respText)
		return nil, fmt.Errorf("unmarshal generated post: %w", err)
	}

	s.log.Info("[ai-generate] Successfully generated post titles VI: %s, EN: %s\n", post.TitleVI, post.TitleEN)
	return &post, nil
}

// sanitizeJSONNewlines replaces literal newline characters inside JSON string values with escaped \n sequences.
func sanitizeJSONNewlines(s string) string {
	var result strings.Builder
	inString := false
	escaped := false

	for i := 0; i < len(s); i++ {
		ch := s[i]
		if escaped {
			result.WriteByte(ch)
			escaped = false
			continue
		}

		if ch == '\\' {
			result.WriteByte(ch)
			escaped = true
			continue
		}

		if ch == '"' {
			inString = !inString
			result.WriteByte(ch)
			continue
		}

		if inString {
			if ch == '\n' {
				result.WriteString("\\n")
			} else if ch == '\r' {
				result.WriteString("\\r")
			} else {
				result.WriteByte(ch)
			}
		} else {
			result.WriteByte(ch)
		}
	}
	return result.String()
}

func (s *Service) GenerateSummary(ctx context.Context, content, language string, maxWords int) (*SummarizeResult, error) {
	if maxWords <= 0 {
		maxWords = 80
	}
	if language == "" {
		language = "vi"
	}
	s.log.Info("[ai-summarize] Summarizing content, language=%s maxWords=%d\n", language, maxWords)

	var systemPrompt, userPrompt string

	if language == "both" {
		systemPrompt = fmt.Sprintf(`You are a professional blog content summarizer.
Read the blog post content provided by the user and generate a concise summary in BOTH Vietnamese and English.

Output MUST be a single valid JSON object:
{
  "summary": "Tóm tắt ngắn gọn bằng tiếng Việt (tối đa %d từ)",
  "summary_en": "Concise English summary (max %d words)"
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Summaries must be engaging and capture the core value of the post.
3. Do not start with "This post...", "The article..." — go straight to the key point.`, maxWords, maxWords)
	} else {
		lang := "Vietnamese"
		langNote := "tiếng Việt"
		if language == "en" {
			lang = "English"
			langNote = lang
		}
		systemPrompt = fmt.Sprintf(`You are a professional blog content summarizer.
Read the blog post content provided by the user and generate a concise summary in %s.

Output MUST be a single valid JSON object:
{
  "summary": "Concise %s summary (max %d words)"
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. The summary must be engaging and capture the core value.
3. Do not start with "This post..." — go straight to the key point.`, lang, langNote, maxWords)
	}

	userPrompt = "Summarize this blog post:\n\n" + truncateContent(content, 8000)

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.3, 512)
	if err != nil {
		return nil, fmt.Errorf("AI summarize: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result SummarizeResult
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-summarize] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return nil, fmt.Errorf("unmarshal summary: %w", err)
	}

	s.log.Info("[ai-summarize] Summary generated OK\n")
	return &result, nil
}

// ScoreSpam uses AI to calculate the spam probability of a comment.
// Returns SpamResult with spam_score in [0.0, 1.0].
// Designed to be called with a short timeout (5s); fails open (returns 0.0) if AI is unavailable.
func (s *Service) ScoreSpam(ctx context.Context, authorName, content string) (*SpamResult, error) {
	s.log.Info("[ai-spam] Scoring spam for comment from: %s\n", authorName)

	systemPrompt := `You are a spam detection system for a technical blog comment section.
Analyze the comment provided and determine whether it is spam.

Consider these spam signals:
- Promotional content, ads, product pitches
- Irrelevant or nonsensical text not related to technical topics
- Excessive links or URLs
- Generic filler like "Great post!" without any substance
- Phishing attempts, scams, or malicious links
- Very short meaningless comments designed to farm backlinks

Output MUST be a single valid JSON object:
{
  "spam_score": 0.95,
  "reason": "Short explanation why (max 20 words)"
}

Where spam_score is:
- 0.0 = definitely NOT spam (legitimate comment)
- 0.5 = ambiguous / borderline
- 1.0 = definitely SPAM

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Be conservative — only mark as spam if clearly problematic (score >= 0.8).
3. Technical questions, feedback, and discussions should score low (< 0.3).`

	userPrompt := fmt.Sprintf("Author: %s\nComment: %s", authorName, truncateContent(content, 500))

	respText, err := s.spamAiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.0, 128)
	if err != nil {
		// Fail open: if AI is unavailable, don't block the comment
		s.log.Error("[ai-spam] Spam scoring failed (fail-open): %v\n", err)
		return &SpamResult{SpamScore: 0.0, Reason: "AI unavailable"}, nil
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result SpamResult
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-spam] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return &SpamResult{SpamScore: 0.0, Reason: "parse error"}, nil
	}

	// Clamp score to [0, 1]
	if result.SpamScore < 0 {
		result.SpamScore = 0
	}
	if result.SpamScore > 1 {
		result.SpamScore = 1
	}

	s.log.Info("[ai-spam] Score=%.2f Reason=%s\n", result.SpamScore, result.Reason)
	return &result, nil
}

// ExtractKeywords extracts SEO-relevant keywords from content.
func (s *Service) ExtractKeywords(ctx context.Context, content, language string) ([]string, error) {
	s.log.Info("[ai-keywords] Extracting keywords\n")

	systemPrompt := `You are an expert SEO and content analyzer.
Extract the most relevant SEO keywords and tags from the provided content.

Output MUST be a single valid JSON object:
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Provide 5 to 10 highly relevant keywords.
3. Keywords should match the language of the content.`

	userPrompt := fmt.Sprintf("Language: %s\nContent: %s", language, truncateContent(content, 4000))

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.3, 256)
	if err != nil {
		return nil, fmt.Errorf("AI keywords: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result struct {
		Keywords []string `json:"keywords"`
	}
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-keywords] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return nil, fmt.Errorf("unmarshal keywords: %w", err)
	}

	return result.Keywords, nil
}

// ScoreSEO evaluates the SEO quality of a post.
func (s *Service) ScoreSEO(ctx context.Context, title, metaDesc, content string) (*SEOScoreResult, error) {
	s.log.Info("[ai-seo] Scoring SEO\n")

	systemPrompt := `You are an expert SEO auditor.
Analyze the provided blog post Title, Meta Description, and Content.
Provide an SEO score (0-100), a Grade (A, B, C, D, F), and a list of actionable suggestions for improvement.

Output MUST be a single valid JSON object:
{
  "score": 85,
  "grade": "B",
  "suggestions": [
    "Include the primary keyword in the first paragraph.",
    "Make the meta description more engaging."
  ]
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Be strict but fair in grading.
3. Suggestions should be concrete and actionable.`

	userPrompt := fmt.Sprintf("Title: %s\nMeta Description: %s\nContent: %s", title, metaDesc, truncateContent(content, 4000))

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.2, 512)
	if err != nil {
		return nil, fmt.Errorf("AI SEO: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result SEOScoreResult
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-seo] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return nil, fmt.Errorf("unmarshal seo score: %w", err)
	}

	return &result, nil
}

// GenerateAltText creates descriptive alt text for an image from its URL.
func (s *Service) GenerateAltText(ctx context.Context, imageURL, imgContext string) (string, error) {
	s.log.Info("[ai-alttext] Generating Alt Text for %s\n", imageURL)

	systemPrompt := `You are an accessibility expert.
Generate a concise, descriptive alt text for an image based on its context or URL.

Output MUST be a single valid JSON object:
{
  "alt_text": "A clear description of the image"
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Keep it under 125 characters.
3. Don't start with "Image of" or "Picture of".`

	userPrompt := fmt.Sprintf("Image URL: %s\nContext: %s", imageURL, imgContext)

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.4, 128)
	if err != nil {
		return "", fmt.Errorf("AI alt text: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result struct {
		AltText string `json:"alt_text"`
	}
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-alttext] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return "", fmt.Errorf("unmarshal alt text: %w", err)
	}

	return result.AltText, nil
}

// AnalyzeSentiment classifies reader sentiment of a comment.
func (s *Service) AnalyzeSentiment(ctx context.Context, author, content string) (*SentimentResult, error) {
	s.log.Info("[ai-sentiment] Analyzing sentiment from %s\n", author)

	systemPrompt := `You are an AI trained to analyze the sentiment of blog comments.
Classify the comment as "positive", "neutral", or "negative". Provide a confidence score between 0.0 and 1.0.

Output MUST be a single valid JSON object:
{
  "sentiment": "positive",
  "score": 0.95
}

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. "sentiment" must be exactly "positive", "neutral", or "negative".`

	userPrompt := fmt.Sprintf("Author: %s\nComment: %s", author, truncateContent(content, 1000))

	respText, err := s.aiClient.ChatCompletion(ctx, systemPrompt, userPrompt, 0.1, 128)
	if err != nil {
		return nil, fmt.Errorf("AI sentiment: %w", err)
	}

	respText = cleanJSONString(respText)
	respText = sanitizeJSONNewlines(respText)

	var result SentimentResult
	if err := json.Unmarshal([]byte(respText), &result); err != nil {
		s.log.Error("[ai-sentiment] Failed to parse JSON: %v. Raw: %s\n", err, respText)
		return nil, fmt.Errorf("unmarshal sentiment: %w", err)
	}

	return &result, nil
}

// truncateContent caps content to maxChars to avoid oversized prompts.
func truncateContent(content string, maxChars int) string {
	content = strings.TrimSpace(content)
	if len(content) <= maxChars {
		return content
	}
	return content[:maxChars] + "... [truncated]"
}

// cleanJSONString extracts json from ```json ... ``` or cleans whitespace.
func cleanJSONString(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```") {
		lines := strings.Split(s, "\n")
		if len(lines) > 2 {
			start := 1
			end := len(lines) - 1
			for end > start && !strings.HasPrefix(lines[end], "```") {
				end--
			}
			s = strings.Join(lines[start:end], "\n")
		}
	}
	return strings.TrimSpace(s)
}

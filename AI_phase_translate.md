# Prompt: Xây dựng tính năng AI Translate (VI ↔ EN) cho nội dung động

## Bối cảnh dự án
Tôi đang xây dựng một hệ thống với:
- **Backend**: Golang (dùng [net/http hoặc gin/echo — điền framework bạn đang dùng])
- **Frontend**: ReactJS (dùng [điền: CRA / Vite / Next.js])
- **Database**: [điền: PostgreSQL / MySQL / MongoDB]
- **Cache**: [điền: Redis / in-memory / chưa có, cần đề xuất]

Tôi cần xây dựng tính năng **dịch động (on-the-fly) nội dung giữa tiếng Việt và tiếng Anh**, sử dụng AI translation API của NVIDIA NIM (endpoint tương thích OpenAI SDK tại `https://integrate.api.nvidia.com/v1`).

---

## Yêu cầu chức năng

1. Cho một đoạn nội dung (bài viết, comment, mô tả sản phẩm...) và ngôn ngữ đích (`vi` hoặc `en`), hệ thống trả về bản dịch.
2. Tự động **phát hiện ngôn ngữ nguồn** nếu không được cung cấp trước (không dịch nếu ngôn ngữ nguồn == ngôn ngữ đích).
3. **Cache kết quả dịch** theo cặp (nội dung, ngôn ngữ đích) để tránh gọi API lặp lại — dùng hash SHA-256 của nội dung làm key.
4. Hỗ trợ dịch **hàng loạt (batch)** nhiều đoạn text trong 1 request để tối ưu số lần gọi API.
5. Xử lý **rate limit** của NVIDIA NIM (429/402) bằng retry với exponential backoff, tối đa 3 lần thử lại.
6. Có **timeout** hợp lý cho mỗi lần gọi API (ví dụ 10s) và fallback trả về nội dung gốc kèm cờ báo lỗi nếu dịch thất bại, không để hệ thống crash.
7. Log lại: thời gian gọi API, model dùng, số ký tự dịch, cache hit/miss — để sau này theo dõi chi phí và hiệu năng.

---

## Yêu cầu kỹ thuật cho Backend (Golang)

### Cấu trúc

```
/internal
  /translate
    service.go       // business logic: check cache, gọi NVIDIA API, lưu cache
    client.go        // wrapper gọi NVIDIA NIM API (OpenAI-compatible)
    cache.go         // interface + implementation cache (Redis hoặc in-memory)
    types.go         // struct request/response
  /handler
    translate_handler.go  // HTTP handler expose endpoint
```

### Yêu cầu cụ thể

- Viết struct `TranslateRequest` gồm: `Content string`, `SourceLang string` (optional), `TargetLang string` (bắt buộc, "vi" hoặc "en").
- Viết struct `TranslateResponse` gồm: `TranslatedText string`, `SourceLang string`, `FromCache bool`, `Error string` (nếu có).
- Viết interface `Cache` với 2 method `Get(key string) (string, bool)` và `Set(key string, value string, ttl time.Duration)`, implement bằng Redis (dùng `go-redis/v9`). Key cache = `translate:{sha256(content)}:{targetLang}`.
- Viết `TranslateClient` dùng package `openai-go` (hoặc gọi REST thuần bằng `net/http` nếu không muốn thêm dependency) để gọi NVIDIA NIM API với:
  - Base URL: `https://integrate.api.nvidia.com/v1`
  - API key lấy từ biến môi trường `NVIDIA_API_KEY`
  - Model: dùng model translate chuyên dụng nếu có (Riva Translate) hoặc model chat tổng quát với system prompt ép dịch chính xác, giữ nguyên định dạng (markdown, xuống dòng), không thêm giải thích ngoài lề.
- Viết endpoint `POST /api/translate`:
  - Nhận JSON `{ "content": string, "target_lang": string, "source_lang": string (optional) }`
  - Validate: content không rỗng, target_lang phải là "vi" hoặc "en"
  - Check cache trước, nếu có trả ngay kèm `from_cache: true`
  - Nếu không, gọi NVIDIA API, lưu cache, trả kết quả
  - Trả lỗi 400 nếu input sai, 502 nếu gọi API ngoài thất bại sau khi retry
- Viết endpoint `POST /api/translate/batch` nhận mảng nhiều content, xử lý song song bằng goroutine + errgroup (giới hạn concurrency, ví dụ 5 goroutine cùng lúc để tránh vượt rate limit).
- Viết unit test cho `service.go` dùng mock Cache và mock TranslateClient (dùng interface để dễ mock).

---

## Yêu cầu kỹ thuật cho Frontend (ReactJS)

- Viết custom hook `useTranslate(content: string, targetLang: 'vi' | 'en')`:
  - Gọi API backend `/api/translate` qua `fetch` hoặc `axios`
  - Trả về `{ translatedText, isLoading, error, isFromCache }`
  - Debounce nếu content thay đổi liên tục (300ms)
  - Hủy request cũ nếu có request mới (dùng AbortController)
- Viết component `<TranslateToggle content={...} defaultLang="vi" />`:
  - Có nút/switch để người dùng chuyển đổi xem nội dung gốc hoặc bản dịch
  - Hiển thị loading spinner nhỏ khi đang dịch
  - Hiển thị fallback (nội dung gốc + icon cảnh báo nhỏ) nếu dịch lỗi
  - Style dùng [Tailwind / CSS module / styled-components — điền theo dự án]
- Không dùng `react-i18next` cho phần này vì đây là nội dung động, không phải UI string tĩnh — nhưng cần đảm bảo component tương thích, không xung đột nếu dự án đã dùng react-i18next cho UI.

---

## Ràng buộc & lưu ý quan trọng

- **Không được gọi trực tiếp NVIDIA API từ frontend** — mọi request phải qua backend Golang để bảo vệ API key.
- **Không dịch lại** nội dung đã có trong cache trừ khi cache đã hết hạn (TTL mặc định 30 ngày, có thể cấu hình).
- Giới hạn độ dài content mỗi lần dịch (ví dụ tối đa 5000 ký tự/request) — nếu vượt, tự động chia nhỏ theo đoạn văn rồi ghép lại kết quả.
- Code phải có comment giải thích rõ từng phần, dùng tiếng Việt hoặc tiếng Anh đều được nhưng nhất quán trong toàn bộ codebase.
- Ưu tiên code dễ đọc, dễ test hơn là tối ưu quá mức (premature optimization).

---

## Output mong muốn

Hãy generate:
1. Toàn bộ code Golang cho các file nêu trên (đầy đủ, chạy được, có xử lý lỗi).
2. Custom hook + component React nêu trên.
3. File `.env.example` liệt kê các biến môi trường cần thiết.
4. Hướng dẫn ngắn cách chạy thử (curl command test endpoint `/api/translate`).

Nếu có phần nào tôi chưa cung cấp đủ thông tin (ví dụ framework Golang cụ thể, cách tôi đang quản lý config), hãy hỏi lại tôi trước khi generate code.
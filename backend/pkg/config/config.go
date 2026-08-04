package config

import (
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	DBSSLMode     string
	MemcachedAddr string
	UploadsDir    string
	JWTSecret     string
	SMTPHost      string
	SMTPPort      int
	SMTPUser      string
	SMTPPass      string
	SMTPFrom      string
	AppURL        string
	CFZoneID           string
	CFAPIToken         string
	// NVIDIA NIM API cho tính năng dịch thuật AI
	NVIDIAAPIKey       string
	NVIDIAModel        string
	NVIDIASpamModel    string
	NVIDIAAPIBaseURL   string
	NVIDIAEmbedModel   string
	NVIDIAChatModel    string
	RagTopK            int
	// TranslateChunkSize: số ký tự tối đa mỗi chunk khi dịch nội dung dài
	TranslateChunkSize int
	// Discord webhook settings
	DiscordPublicKey   string
	DiscordBotSecret   string
	DiscordAuthorID    uint
	// Storage config
	StorageProvider string // local, s3, minio, cloudfly
	S3Endpoint      string
	S3Region        string
	S3Bucket        string
	S3AccessKey     string
	S3SecretKey     string
	MinerUServiceURL string
}

func Load() *Config {
	envPath := ".env"
	for i := 0; i < 3; i++ {
		if _, err := os.Stat(envPath); err == nil {
			_ = godotenv.Load(envPath)
			break
		}
		envPath = filepath.Join("..", envPath)
	}

	return &Config{
		Port:          getEnv("PORT", "8080"),
		DBHost:        getEnv("DB_HOST", "127.0.0.1"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "root"),
		DBName:        getEnv("DB_NAME", "blogs"),
		DBSSLMode:     getEnv("DB_SSLMODE", "disable"),
		MemcachedAddr: getEnv("MEMCACHED_ADDR", "127.0.0.1:11211"),
		UploadsDir:    getEnv("UPLOADS_DIR", "./uploads"),
		JWTSecret:     getEnv("JWT_SECRET", "change-me-in-production-secret-key"),
		SMTPHost:      getEnv("SMTP_HOST", ""),
		SMTPPort:      getEnvInt("SMTP_PORT", 587),
		SMTPUser:      getEnv("SMTP_USER", ""),
		SMTPPass:      getEnv("SMTP_PASS", ""),
		SMTPFrom:      getEnv("SMTP_FROM", "noreply@example.com"),
		AppURL:        getEnv("APP_URL", "http://localhost:5173"),
		CFZoneID:           getEnv("CF_ZONE_ID", ""),
		CFAPIToken:         getEnv("CF_API_TOKEN", ""),
		NVIDIAAPIKey:       getEnv("NVIDIA_API_KEY", ""),
		NVIDIAModel:        getEnv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct"),
		NVIDIASpamModel:    getEnv("NVIDIA_SPAM_MODEL", "meta/llama-3.1-8b-instruct"),
		NVIDIAAPIBaseURL:   getEnv("NVIDIA_API_BASE_URL", "https://integrate.api.nvidia.com/v1"),
		NVIDIAEmbedModel:   getEnv("NVIDIA_EMBED_MODEL", "snowflake/arctic-embed-l"),
		NVIDIAChatModel:    getEnv("NVIDIA_CHAT_MODEL", "meta/llama-3.1-8b-instruct"),
		RagTopK:            getEnvInt("RAG_TOP_K", 5),
		TranslateChunkSize: getEnvInt("TRANSLATE_CHUNK_SIZE", 2000),
		DiscordPublicKey:   getEnv("DISCORD_PUBLIC_KEY", ""),
		DiscordBotSecret:   getEnv("DISCORD_BOT_SECRET", ""),
		DiscordAuthorID:    uint(getEnvInt("DISCORD_AUTHOR_ID", 1)),
		StorageProvider: getEnv("STORAGE_PROVIDER", "local"),
		S3Endpoint:      getEnv("S3_ENDPOINT", ""),
		S3Region:        getEnv("S3_REGION", "HN-01"),
		S3Bucket:        getEnv("S3_BUCKET", ""),
		S3AccessKey:     getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey:     getEnv("S3_SECRET_KEY", ""),
		MinerUServiceURL: getEnv("MINERU_SERVICE_URL", "http://localhost:8082"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	i, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return i
}

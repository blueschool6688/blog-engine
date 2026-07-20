package translate

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"backend/internal/shared/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// JobStore là interface cho việc lưu trữ và lấy async translation job.
// Implement bằng PostgreSQL (PostgresJobStore) — dùng interface để dễ test.
type JobStore interface {
	// CreateJob tạo một job mới và trả về job_id (UUID)
	CreateJob(ctx context.Context, req TranslateRequest) (string, error)
	// GetJob lấy kết quả và trạng thái của job theo job_id
	GetJob(ctx context.Context, jobID string) (*AsyncJobResult, error)
	// ClaimNextJob lấy 1 job pending và đánh dấu là processing.
	// Dùng SELECT FOR UPDATE SKIP LOCKED để tránh 2 worker cùng lấy 1 job.
	// Trả về nil nếu không có job nào.
	ClaimNextJob(ctx context.Context) (*TranslateJobRow, error)
	// UpdateJobResult cập nhật kết quả và trạng thái của job sau khi xử lý xong.
	UpdateJobResult(ctx context.Context, jobID string, result AsyncJobResult) error
}

// TranslateJobRow là GORM model cho bảng "translate_jobs".
// Mỗi row là một async translation job.
type TranslateJobRow struct {
	models.BaseModel
	// JobID là UUID định danh duy nhất của job (dùng để polling)
	JobID      string `gorm:"uniqueIndex;size:36" json:"job_id"`
	Content    string `gorm:"type:text"           json:"content"`
	TargetLang string `gorm:"size:5"              json:"target_lang"`
	SourceLang string `gorm:"size:5"              json:"source_lang"`
	// Status: "pending" | "processing" | "done" | "failed"
	Status string `gorm:"size:20;default:'pending';index" json:"status"`
	// Result là JSON của AsyncJobResult, lưu sau khi worker xử lý xong
	Result string `gorm:"type:text" json:"result"`
}

// TableName trả về tên bảng trong PostgreSQL.
func (TranslateJobRow) TableName() string { return "translate_jobs" }

// PostgresJobStore implement JobStore dùng GORM + PostgreSQL.
type PostgresJobStore struct {
	db *gorm.DB
}

// NewPostgresJobStore tạo một PostgresJobStore mới.
// Yêu cầu bảng "translate_jobs" đã được AutoMigrate.
func NewPostgresJobStore(db *gorm.DB) *PostgresJobStore {
	return &PostgresJobStore{db: db}
}

// CreateJob tạo một job mới trong bảng translate_jobs, trả về job_id.
func (s *PostgresJobStore) CreateJob(ctx context.Context, req TranslateRequest) (string, error) {
	jobID := uuid.New().String()
	job := &TranslateJobRow{
		JobID:      jobID,
		Content:    req.Content,
		TargetLang: req.TargetLang,
		SourceLang: req.SourceLang,
		Status:     string(JobPending),
	}
	if err := s.db.WithContext(ctx).Create(job).Error; err != nil {
		return "", fmt.Errorf("create translate job: %w", err)
	}
	return jobID, nil
}

// GetJob lấy trạng thái và kết quả của job theo job_id.
func (s *PostgresJobStore) GetJob(ctx context.Context, jobID string) (*AsyncJobResult, error) {
	var job TranslateJobRow
	if err := s.db.WithContext(ctx).Where("job_id = ?", jobID).First(&job).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("job not found: %s", jobID)
		}
		return nil, fmt.Errorf("get translate job: %w", err)
	}

	result := &AsyncJobResult{
		JobID:  job.JobID,
		Status: JobStatus(job.Status),
	}

	// Nếu job đã xong, unmarshal kết quả
	if job.Status == string(JobDone) || job.Status == string(JobFailed) {
		if job.Result != "" {
			var stored AsyncJobResult
			if err := json.Unmarshal([]byte(job.Result), &stored); err == nil {
				result.TranslatedText = stored.TranslatedText
				result.Partial = stored.Partial
				result.Error = stored.Error
			}
		}
	}

	return result, nil
}

// ClaimNextJob lấy 1 job có status = "pending" và chuyển sang "processing".
// Dùng raw SQL với SELECT FOR UPDATE SKIP LOCKED để tránh 2 worker cùng xử lý 1 job.
// Trả về nil nếu không có job pending.
func (s *PostgresJobStore) ClaimNextJob(ctx context.Context) (*TranslateJobRow, error) {
	var job TranslateJobRow

	// Transaction để đảm bảo atomic claim
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// SELECT FOR UPDATE SKIP LOCKED: chỉ dùng được với PostgreSQL
		result := tx.Raw(
			`SELECT * FROM translate_jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`,
		).Scan(&job)

		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 || job.ID == 0 {
			return nil // Không có job pending
		}

		// Đánh dấu là processing
		return tx.Model(&job).Updates(map[string]interface{}{
			"status":     string(JobProcessing),
			"updated_at": time.Now(),
		}).Error
	})

	if err != nil {
		return nil, fmt.Errorf("claim next job: %w", err)
	}

	if job.ID == 0 {
		return nil, nil // Không có job
	}

	return &job, nil
}

// UpdateJobResult cập nhật kết quả và trạng thái sau khi worker xử lý xong.
func (s *PostgresJobStore) UpdateJobResult(ctx context.Context, jobID string, result AsyncJobResult) error {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("marshal job result: %w", err)
	}

	err = s.db.WithContext(ctx).
		Model(&TranslateJobRow{}).
		Where("job_id = ?", jobID).
		Updates(map[string]interface{}{
			"status":     string(result.Status),
			"result":     string(resultJSON),
			"updated_at": time.Now(),
		}).Error

	if err != nil {
		return fmt.Errorf("update job result: %w", err)
	}
	return nil
}

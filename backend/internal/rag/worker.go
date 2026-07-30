package rag

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	postModels "backend/internal/post/models"
	"backend/internal/nvidia"

	"gorm.io/gorm"
)

type Worker struct {
	db     *gorm.DB
	client *nvidia.Client
}

func NewWorker(db *gorm.DB, client *nvidia.Client) *Worker {
	return &Worker{
		db:     db,
		client: client,
	}
}

func (w *Worker) Start(ctx context.Context) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.processNextJob(ctx)
		}
	}
}

func (w *Worker) processNextJob(ctx context.Context) {
	err := w.db.Transaction(func(tx *gorm.DB) error {
		var job RagJob
		// Get pending job
		err := tx.Raw("SELECT id, post_id, status, error_msg, created_at, updated_at FROM rag_jobs WHERE status = 'pending' FOR UPDATE SKIP LOCKED LIMIT 1").Scan(&job).Error
		if err != nil {
			return err
		}
		if job.ID == 0 {
			return nil // No pending jobs
		}

		// Mark as processing
		if err := tx.Model(&RagJob{}).Where("id = ?", job.ID).Update("status", "processing").Error; err != nil {
			return err
		}

		// Commit to release lock and let other workers (if any) grab other jobs
		// Actually, since we are inside a transaction, if we return nil it commits.
		// So we should do the heavy lifting OUTSIDE the transaction or use a separate connection.
		// For simplicity, we can do it inside or outside. Let's do it outside.
		return nil
	})

	if err != nil {
		log.Println("RAG worker transaction error:", err)
		return
	}

	// Wait, we need to actually do the work. If we just committed the "processing" status,
	// we need to fetch the job again to process it. Let's do it properly without locking for a long time.
	var job RagJob
	w.db.Where("status = ?", "processing").First(&job)
	if job.ID == 0 {
		return
	}

	err = w.doProcessJob(ctx, job)
	if err != nil {
		w.db.Model(&RagJob{}).Where("id = ?", job.ID).Updates(map[string]interface{}{
			"status":    "failed",
			"error_msg": err.Error(),
		})
	} else {
		w.db.Model(&RagJob{}).Where("id = ?", job.ID).Update("status", "done")
	}
}

func (w *Worker) doProcessJob(ctx context.Context, job RagJob) error {
	var post postModels.Post
	if err := w.db.First(&post, job.PostID).Error; err != nil {
		return err
	}

	// Delete old chunks
	if err := w.db.Where("post_id = ?", job.PostID).Delete(&BlogChunk{}).Error; err != nil {
		return err
	}

	// Chunk content
	content := post.Content
	if content == "" {
		return nil
	}

	chunks := ChunkText(content, 400, 50)
	for i, chunkText := range chunks {
		emb, err := w.client.Embed(ctx, chunkText)
		var embStr string
		if err != nil {
			log.Printf("⚠️   Failed to embed chunk %d: %v. Storing empty embedding.", i, err)
			embStr = ""
		} else {
			embStr = formatVector(emb)
		}

		// Remove ::vector cast so it works with TEXT column type locally
		err = w.db.Exec("INSERT INTO blog_chunks (post_id, chunk_index, content, embedding) VALUES (?, ?, ?, ?)",
			job.PostID, i, chunkText, embStr).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func formatVector(v []float32) string {
	strs := make([]string, len(v))
	for i, f := range v {
		strs[i] = fmt.Sprintf("%f", f)
	}
	return "[" + strings.Join(strs, ",") + "]"
}

package repository

import (
	"context"
	"fmt"

	"backend/internal/comment/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ReactionRepository struct {
	DB *gorm.DB
}

func NewReactionRepository(db *gorm.DB) *ReactionRepository {
	return &ReactionRepository{DB: db}
}

var AllEmojis = []string{"like", "love", "wow", "haha", "sad"}

func (r *ReactionRepository) GetCountsByPost(ctx context.Context, postID uint, fingerprint string) ([]models.ReactionCount, error) {
	type row struct {
		Emoji string
		Count int64
	}
	var rows []row
	err := r.DB.WithContext(ctx).Model(&models.Reaction{}).
		Select("emoji, COUNT(*) as count").
		Where("post_id = ?", postID).
		Group("emoji").
		Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("group reaction counts: %w", err)
	}

	var myReaction models.Reaction
	myErr := r.DB.WithContext(ctx).Where("post_id = ? AND fingerprint = ?", postID, fingerprint).
		First(&myReaction).Error

	countMap := make(map[string]int64)
	for _, rw := range rows {
		countMap[rw.Emoji] = rw.Count
	}

	result := make([]models.ReactionCount, 0, len(AllEmojis))
	for _, emoji := range AllEmojis {
		result = append(result, models.ReactionCount{
			Emoji:   emoji,
			Count:   countMap[emoji],
			Reacted: myErr == nil && myReaction.Emoji == emoji,
		})
	}

	return result, nil
}

func (r *ReactionRepository) Toggle(ctx context.Context, postID uint, emoji, fingerprint string) error {
	var existing models.Reaction
	err := r.DB.WithContext(ctx).
		Where("post_id = ? AND fingerprint = ?", postID, fingerprint).
		First(&existing).Error

	if err == nil {
		// Existing reaction found
		if existing.Emoji == emoji {
			// Same emoji -> Unreact (delete)
			return r.DB.WithContext(ctx).Delete(&existing).Error
		}
		// Different emoji -> Update
		return r.DB.WithContext(ctx).Model(&existing).UpdateColumn("emoji", emoji).Error
	}

	// No existing reaction -> Create
	reaction := &models.Reaction{
		PostID:      postID,
		Emoji:       emoji,
		Fingerprint: fingerprint,
	}

	return r.DB.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "post_id"}, {Name: "fingerprint"}},
		DoUpdates: clause.AssignmentColumns([]string{"emoji"}),
	}).Create(reaction).Error
}

package storage

import (
	"context"
	"database/sql"
	"time"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"
	"github.com/google/uuid"
)

type achievementRepo struct{ db *sql.DB }

func NewAchievementRepo(db *SQLiteDB) ports.AchievementRepository {
	return &achievementRepo{db: db.DB()}
}

func (r *achievementRepo) Unlock(ctx context.Context, userID, key string) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_key, unlocked_at) VALUES (?,?,?,?)`,
		uuid.New().String(), userID, key, time.Now())
	return err
}

func (r *achievementRepo) ListByUserID(ctx context.Context, userID string) ([]*domain.UserAchievement, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, user_id, achievement_key, unlocked_at FROM user_achievements WHERE user_id=? ORDER BY unlocked_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []*domain.UserAchievement
	for rows.Next() {
		a := &domain.UserAchievement{}
		rows.Scan(&a.ID, &a.UserID, &a.AchievementKey, &a.UnlockedAt)
		list = append(list, a)
	}
	return list, nil
}

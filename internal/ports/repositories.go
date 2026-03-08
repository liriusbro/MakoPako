package ports

import (
	"context"
	"time"
	"articul-tracker/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByUsername(ctx context.Context, username string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	ListAll(ctx context.Context) ([]*domain.User, error)
}

type ArticulRepository interface {
	Create(ctx context.Context, articul *domain.Articul) error
	GetByID(ctx context.Context, id string) (*domain.Articul, error)
	ListByUserID(ctx context.Context, userID string) ([]*domain.Articul, error)
	ListAllCurrentByUser(ctx context.Context, userID string) ([]*domain.Articul, error)
	AddChange(ctx context.Context, change *domain.ArticulChange) error
	GetChangesByArticulID(ctx context.Context, articulID string) ([]*domain.ArticulChange, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
	CountByUserIDToday(ctx context.Context, userID string) (int, error)
	GetByUserIDAndNumber(ctx context.Context, userID, number string) (*domain.Articul, error)
	DeleteAllByUserID(ctx context.Context, userID string) error
	GetTopUserByPeriod(ctx context.Context, since string) (userID string, count int, err error)
	UpdateComment(ctx context.Context, articulID, userID, comment string) error
	DeleteByID(ctx context.Context, articulID string) error
	// For chart: returns count per day for last 30 days
	GetDailyCountsByUserID(ctx context.Context, userID string) ([]DailyCount, error)
}

type AchievementRepository interface {
	Unlock(ctx context.Context, userID, key string) error
	ListByUserID(ctx context.Context, userID string) ([]*domain.UserAchievement, error)
}

type MonthlyHistoryRepository interface {
	Archive(ctx context.Context, userID string, year, month int, articulNumber string, createdAt time.Time) error
	GetMonths(ctx context.Context, userID string) ([]domain.MonthSummary, error)
	GetByMonth(ctx context.Context, userID string, year, month int) ([]*domain.MonthlyHistoryEntry, error)
}

type SessionRepository interface {
	Create(ctx context.Context, session *domain.Session) error
	GetByToken(ctx context.Context, token string) (*domain.Session, error)
	DeleteByToken(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID string) error
}

type DailyCount struct {
	Date  string `json:"date"`  // "2006-01-02"
	Count int    `json:"count"`
}

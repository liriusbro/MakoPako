package ports

import (
	"context"
	"articul-tracker/internal/domain"
)

type AuthService interface {
	Register(ctx context.Context, username, password string) (*domain.User, *domain.Session, error)
	Login(ctx context.Context, username, password string) (*domain.User, *domain.Session, error)
	Logout(ctx context.Context, token string) error
	GetUserBySession(ctx context.Context, token string) (*domain.User, error)
}

type UserService interface {
	GetProfile(ctx context.Context, userID string) (*domain.User, error)
	UpdateAvatar(ctx context.Context, userID, avatarDataURL string) error
	UpdateUsername(ctx context.Context, userID, newUsername string) error
	ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error
	GetUserStats(ctx context.Context, userID string) (*UserStats, error)
}

type ArticulService interface {
	Create(ctx context.Context, userID, number string) (*domain.Articul, error)
	List(ctx context.Context, userID string) ([]*domain.Articul, error)
	AddChange(ctx context.Context, articulID, userID, description string) error
	GetWithChanges(ctx context.Context, articulID, requestingUserID string) (*domain.Articul, error)
}

type LeaderboardService interface {
	GetLeaderboard(ctx context.Context) ([]LeaderboardEntry, error)
}

type UserStats struct {
	TotalArticuls int          `json:"total_articuls"`
	DailyCounts  []DailyCount `json:"daily_counts"`
}

type LeaderboardEntry struct {
	User         *domain.User `json:"user"`
	ArticulCount int          `json:"articul_count"`
	Rank         int          `json:"rank"`
}

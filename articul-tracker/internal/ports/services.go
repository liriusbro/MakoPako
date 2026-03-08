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
	Create(ctx context.Context, userID, number string) (*domain.Articul, *AchievementResult, error)
	List(ctx context.Context, userID string) ([]*domain.Articul, error)
	AddChange(ctx context.Context, articulID, userID, description string) error
	GetWithChanges(ctx context.Context, articulID, requestingUserID string) (*domain.Articul, error)
	UpdateComment(ctx context.Context, articulID, userID, comment string) error
	Delete(ctx context.Context, articulID, userID string) error
}

type AchievementResult struct {
	DailyCompleted      bool `json:"daily_completed"`
	NewPersonalRecord   bool `json:"new_personal_record"`
	PersonalRecordCount int  `json:"personal_record_count"`
	CurrentStreak      int  `json:"current_streak"`
	StreakMilestone    int  `json:"streak_milestone"`
}

type DailyProgress struct {
	TodayCount       int    `json:"today_count"`
	DailyGoal        int    `json:"daily_goal"`
	Streak           int    `json:"streak"`
	PersonalBest     int    `json:"personal_best"`
	PersonalBestDate string `json:"personal_best_date"`
}

type LeaderboardService interface {
	GetLeaderboard(ctx context.Context) ([]LeaderboardEntry, error)
	GetSeasonalLeaders(ctx context.Context) (*SeasonalLeaders, error)
}

type SeasonalEntry struct {
	User  *domain.User `json:"user"`
	Count int          `json:"count"`
}

type SeasonalLeaders struct {
	DayLeader   *SeasonalEntry `json:"day_leader"`
	WeekLeader  *SeasonalEntry `json:"week_leader"`
	MonthLeader *SeasonalEntry `json:"month_leader"`
}

type UserStats struct {
	TotalArticuls int          `json:"total_articuls"`
	DailyCounts  []DailyCount `json:"daily_counts"`
	AllTimeCount int          `json:"all_time_count"`
	Level        string       `json:"level"`
	LevelIcon    string       `json:"level_icon"`
}

type LeaderboardEntry struct {
	User         *domain.User `json:"user"`
	ArticulCount int          `json:"articul_count"`
	Rank         int          `json:"rank"`
}

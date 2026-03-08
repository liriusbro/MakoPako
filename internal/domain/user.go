package domain

import "time"

type User struct {
	ID               string    `json:"id"`
	Username         string    `json:"username"`
	PasswordHash     string    `json:"-"`
	AvatarURL        string    `json:"avatar_url"` // base64 data URL or path
	CreatedAt        time.Time `json:"created_at"`
	PersonalBestDay  int       `json:"personal_best_day"`
	PersonalBestDate string    `json:"personal_best_date"` // "2006-01-02"
	AllTimeCount     int       `json:"all_time_count"`
	CurrentStreak    int       `json:"current_streak"`
	LastActiveDate   string    `json:"last_active_date"` // "2006-01-02"
}

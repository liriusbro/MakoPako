package domain

import "time"

type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	AvatarURL    string    `json:"avatar_url"` // base64 data URL or path
	CreatedAt    time.Time `json:"created_at"`
}

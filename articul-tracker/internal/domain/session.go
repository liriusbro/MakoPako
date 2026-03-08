package domain

import "time"

type Session struct {
	Token     string
	UserID    string
	ExpiresAt time.Time
}

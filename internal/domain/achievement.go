package domain

import "time"

type UserAchievement struct {
	ID             string
	UserID         string
	AchievementKey string
	UnlockedAt     time.Time
}

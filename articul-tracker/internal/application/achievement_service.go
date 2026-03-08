package application

import (
	"context"
	"fmt"
	"time"

	"articul-tracker/internal/ports"
)

type achievementChecker struct {
	users        ports.UserRepository
	articuls     ports.ArticulRepository
	achievements ports.AchievementRepository
}

func NewAchievementChecker(u ports.UserRepository, a ports.ArticulRepository, ach ports.AchievementRepository) *achievementChecker {
	return &achievementChecker{users: u, articuls: a, achievements: ach}
}

func (c *achievementChecker) CheckAfterCreate(ctx context.Context, userID string) (*ports.AchievementResult, error) {
	user, err := c.users.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := &ports.AchievementResult{}
	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	todayCount, _ := c.articuls.CountByUserIDToday(ctx, userID)

	if todayCount >= 20 {
		c.achievements.Unlock(ctx, userID, "daily_20")
		result.DailyCompleted = true
	}

	if todayCount > user.PersonalBestDay {
		user.PersonalBestDay = todayCount
		user.PersonalBestDate = today
		result.NewPersonalRecord = true
		result.PersonalRecordCount = todayCount
	}

	if user.LastActiveDate == yesterday {
		user.CurrentStreak++
	} else if user.LastActiveDate != today {
		user.CurrentStreak = 1
	}
	user.LastActiveDate = today
	user.AllTimeCount++

	highestMilestone := 0
	for _, m := range []int{2, 3, 5, 7, 14, 30} {
		if user.CurrentStreak >= m {
			c.achievements.Unlock(ctx, userID, fmt.Sprintf("streak_%d", m))
			highestMilestone = m
		}
	}
	result.StreakMilestone = highestMilestone
	if user.CurrentStreak > 0 {
		result.CurrentStreak = user.CurrentStreak
	}

	c.users.Update(ctx, user)
	return result, nil
}

func (c *achievementChecker) GetDailyProgress(ctx context.Context, userID string) (*ports.DailyProgress, error) {
	user, err := c.users.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	todayCount, _ := c.articuls.CountByUserIDToday(ctx, userID)
	return &ports.DailyProgress{
		TodayCount:       todayCount,
		DailyGoal:        20,
		Streak:           user.CurrentStreak,
		PersonalBest:     user.PersonalBestDay,
		PersonalBestDate: user.PersonalBestDate,
	}, nil
}

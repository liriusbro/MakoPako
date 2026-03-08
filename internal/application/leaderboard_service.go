package application

import (
	"context"
	"sort"
	"time"

	"articul-tracker/internal/ports"
)

type leaderboardService struct {
	users    ports.UserRepository
	articuls ports.ArticulRepository
}

func NewLeaderboardService(u ports.UserRepository, a ports.ArticulRepository) ports.LeaderboardService {
	return &leaderboardService{users: u, articuls: a}
}

func (s *leaderboardService) GetLeaderboard(ctx context.Context) ([]ports.LeaderboardEntry, error) {
	users, err := s.users.ListAll(ctx)
	if err != nil {
		return nil, err
	}
	var entries []ports.LeaderboardEntry
	for _, u := range users {
		count, _ := s.articuls.CountByUserID(ctx, u.ID)
		entries = append(entries, ports.LeaderboardEntry{User: u, ArticulCount: count})
	}
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].ArticulCount > entries[j].ArticulCount
	})
	for i := range entries {
		entries[i].Rank = i + 1
	}
	return entries, nil
}

func (s *leaderboardService) GetSeasonalLeaders(ctx context.Context) (*ports.SeasonalLeaders, error) {
	now := time.Now()
	periods := map[string]string{
		"day":   now.Format("2006-01-02") + " 00:00:00",
		"week":  now.AddDate(0, 0, -7).Format("2006-01-02 15:04:05"),
		"month": now.Format("2006-01") + "-01 00:00:00",
	}
	result := &ports.SeasonalLeaders{}
	for key, since := range periods {
		uid, cnt, err := s.articuls.GetTopUserByPeriod(ctx, since)
		if err != nil || uid == "" {
			continue
		}
		user, err := s.users.GetByID(ctx, uid)
		if err != nil {
			continue
		}
		entry := &ports.SeasonalEntry{User: user, Count: cnt}
		switch key {
		case "day":
			result.DayLeader = entry
		case "week":
			result.WeekLeader = entry
		case "month":
			result.MonthLeader = entry
		}
	}
	return result, nil
}

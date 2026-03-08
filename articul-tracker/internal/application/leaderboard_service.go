package application

import (
	"context"
	"sort"

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

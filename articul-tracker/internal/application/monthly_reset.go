package application

import (
	"context"
	"log"
	"time"

	"articul-tracker/internal/ports"
)

func StartMonthlyResetScheduler(
	userRepo ports.UserRepository,
	articulRepo ports.ArticulRepository,
	historyRepo ports.MonthlyHistoryRepository,
) {
	go func() {
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
			log.Printf("[scheduler] Next monthly reset at %s", next.Format("2006-01-02 15:04:05"))
			time.Sleep(time.Until(next))
			runMonthlyReset(userRepo, articulRepo, historyRepo)
		}
	}()
}

func runMonthlyReset(
	userRepo ports.UserRepository,
	articulRepo ports.ArticulRepository,
	historyRepo ports.MonthlyHistoryRepository,
) {
	ctx := context.Background()
	prev := time.Now().AddDate(0, -1, 0)
	year, month := prev.Year(), int(prev.Month())

	users, err := userRepo.ListAll(ctx)
	if err != nil {
		log.Printf("[reset] ListAll error: %v", err)
		return
	}

	for _, u := range users {
		articuls, err := articulRepo.ListByUserID(ctx, u.ID)
		if err != nil {
			continue
		}
		for _, a := range articuls {
			historyRepo.Archive(ctx, u.ID, year, month, a.Number, a.CreatedAt)
		}
		articulRepo.DeleteAllByUserID(ctx, u.ID)
	}
	log.Printf("[reset] Monthly reset complete for %d-%02d, %d users processed", year, month, len(users))
}

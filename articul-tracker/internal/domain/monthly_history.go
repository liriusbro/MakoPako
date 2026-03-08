package domain

import "time"

type MonthlyHistoryEntry struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Year          int       `json:"year"`
	Month         int       `json:"month"`
	ArticulNumber string    `json:"articul_number"`
	CreatedAt     time.Time `json:"created_at"`
}

type MonthSummary struct {
	Year  int `json:"year"`
	Month int `json:"month"`
	Count int `json:"count"`
}

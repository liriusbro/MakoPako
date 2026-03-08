package domain

import "time"

type Articul struct {
	ID        string          `json:"id"`
	UserID    string          `json:"user_id"`
	Number    string          `json:"number"`   // the SKU/article number entered by user
	Comment   string          `json:"comment"`  // optional free-text comment, editable only on current month
	CreatedAt time.Time       `json:"created_at"`
	Changes   []ArticulChange `json:"changes"`
}

type ArticulChange struct {
	ID          string    `json:"id"`
	ArticulID   string    `json:"articul_id"`
	Description string    `json:"description"`
	ChangedAt   time.Time `json:"changed_at"`
}

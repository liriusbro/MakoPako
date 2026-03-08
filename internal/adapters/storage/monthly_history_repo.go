package storage

import (
	"context"
	"database/sql"
	"time"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"
	"github.com/google/uuid"
)

type monthlyHistoryRepo struct{ db *sql.DB }

func NewMonthlyHistoryRepo(db *SQLiteDB) ports.MonthlyHistoryRepository {
	return &monthlyHistoryRepo{db: db.DB()}
}

func (r *monthlyHistoryRepo) Archive(ctx context.Context, userID string, year, month int, number string, createdAt time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO monthly_history (id,user_id,year,month,articul_number,created_at) VALUES (?,?,?,?,?,?)`,
		uuid.New().String(), userID, year, month, number, createdAt)
	return err
}

func (r *monthlyHistoryRepo) GetMonths(ctx context.Context, userID string) ([]domain.MonthSummary, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT year, month, COUNT(*) FROM monthly_history WHERE user_id=? GROUP BY year, month ORDER BY year DESC, month DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []domain.MonthSummary
	for rows.Next() {
		var s domain.MonthSummary
		rows.Scan(&s.Year, &s.Month, &s.Count)
		out = append(out, s)
	}
	return out, nil
}

func (r *monthlyHistoryRepo) GetByMonth(ctx context.Context, userID string, year, month int) ([]*domain.MonthlyHistoryEntry, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id,user_id,year,month,articul_number,created_at FROM monthly_history
		 WHERE user_id=? AND year=? AND month=? ORDER BY created_at`, userID, year, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*domain.MonthlyHistoryEntry
	for rows.Next() {
		e := &domain.MonthlyHistoryEntry{}
		rows.Scan(&e.ID, &e.UserID, &e.Year, &e.Month, &e.ArticulNumber, &e.CreatedAt)
		out = append(out, e)
	}
	return out, nil
}

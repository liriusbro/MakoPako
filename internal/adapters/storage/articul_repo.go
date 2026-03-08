package storage

import (
	"context"
	"database/sql"
	"errors"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"
)

type articulRepo struct{ db *sql.DB }

func NewArticulRepo(db *SQLiteDB) ports.ArticulRepository {
	return &articulRepo{db: db.DB()}
}

func (r *articulRepo) Create(ctx context.Context, a *domain.Articul) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO articuls (id, user_id, number, comment, created_at) VALUES (?,?,?,?,?)`,
		a.ID, a.UserID, a.Number, a.Comment, a.CreatedAt)
	return err
}

func (r *articulRepo) GetByID(ctx context.Context, id string) (*domain.Articul, error) {
	row := r.db.QueryRowContext(ctx, `SELECT id,user_id,number,comment,created_at FROM articuls WHERE id=?`, id)
	a := &domain.Articul{}
	err := row.Scan(&a.ID, &a.UserID, &a.Number, &a.Comment, &a.CreatedAt)
	if err != nil {
		return nil, err
	}
	return a, nil
}

func (r *articulRepo) ListByUserID(ctx context.Context, userID string) ([]*domain.Articul, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id,user_id,number,comment,created_at FROM articuls WHERE user_id=? ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var articuls []*domain.Articul
	for rows.Next() {
		a := &domain.Articul{}
		rows.Scan(&a.ID, &a.UserID, &a.Number, &a.Comment, &a.CreatedAt)
		articuls = append(articuls, a)
	}
	return articuls, nil
}

func (r *articulRepo) AddChange(ctx context.Context, c *domain.ArticulChange) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO articul_changes (id, articul_id, description, changed_at) VALUES (?,?,?,?)`,
		c.ID, c.ArticulID, c.Description, c.ChangedAt)
	return err
}

func (r *articulRepo) GetChangesByArticulID(ctx context.Context, articulID string) ([]*domain.ArticulChange, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id,articul_id,description,changed_at FROM articul_changes WHERE articul_id=? ORDER BY changed_at`, articulID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var changes []*domain.ArticulChange
	for rows.Next() {
		c := &domain.ArticulChange{}
		rows.Scan(&c.ID, &c.ArticulID, &c.Description, &c.ChangedAt)
		changes = append(changes, c)
	}
	return changes, nil
}

func (r *articulRepo) CountByUserID(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM articuls WHERE user_id=?`, userID).Scan(&count)
	return count, err
}

func (r *articulRepo) ListAllCurrentByUser(ctx context.Context, userID string) ([]*domain.Articul, error) {
	return r.ListByUserID(ctx, userID)
}

func (r *articulRepo) CountByUserIDToday(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM articuls WHERE user_id=? AND date(created_at)=date('now')`, userID).Scan(&count)
	return count, err
}

func (r *articulRepo) GetByUserIDAndNumber(ctx context.Context, userID, number string) (*domain.Articul, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT id, user_id, number, comment, created_at FROM articuls WHERE user_id=? AND lower(number)=lower(?)`, userID, number)
	a := &domain.Articul{}
	err := row.Scan(&a.ID, &a.UserID, &a.Number, &a.Comment, &a.CreatedAt)
	if err != nil {
		return nil, err
	}
	return a, nil
}

func (r *articulRepo) DeleteAllByUserID(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM articuls WHERE user_id=?`, userID)
	return err
}

func (r *articulRepo) GetTopUserByPeriod(ctx context.Context, since string) (userID string, count int, err error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT user_id, COUNT(*) as cnt FROM articuls
		WHERE created_at >= ?
		GROUP BY user_id ORDER BY cnt DESC LIMIT 1`, since)
	err = row.Scan(&userID, &count)
	return
}

func (r *articulRepo) DeleteByID(ctx context.Context, articulID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM articuls WHERE id=?`, articulID)
	return err
}

func (r *articulRepo) UpdateComment(ctx context.Context, articulID, userID, comment string) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE articuls SET comment=? WHERE id=? AND user_id=?`,
		comment, articulID, userID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("forbidden or not found")
	}
	return nil
}

func (r *articulRepo) GetDailyCountsByUserID(ctx context.Context, userID string) ([]ports.DailyCount, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT date(created_at) as day, COUNT(*) as cnt
		FROM articuls
		WHERE user_id=? AND created_at >= date('now', '-30 days')
		GROUP BY day ORDER BY day`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var counts []ports.DailyCount
	for rows.Next() {
		var d ports.DailyCount
		rows.Scan(&d.Date, &d.Count)
		counts = append(counts, d)
	}
	return counts, nil
}

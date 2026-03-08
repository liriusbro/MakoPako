package storage

import (
	"context"
	"database/sql"
	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"
)

type sessionRepo struct{ db *sql.DB }

func NewSessionRepo(db *SQLiteDB) ports.SessionRepository {
	return &sessionRepo{db: db.DB()}
}

func (r *sessionRepo) Create(ctx context.Context, s *domain.Session) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)`,
		s.Token, s.UserID, s.ExpiresAt)
	return err
}

func (r *sessionRepo) GetByToken(ctx context.Context, token string) (*domain.Session, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT token, user_id, expires_at FROM sessions WHERE token=?`, token)
	s := &domain.Session{}
	err := row.Scan(&s.Token, &s.UserID, &s.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *sessionRepo) DeleteByToken(ctx context.Context, token string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sessions WHERE token=?`, token)
	return err
}

func (r *sessionRepo) DeleteByUserID(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sessions WHERE user_id=?`, userID)
	return err
}

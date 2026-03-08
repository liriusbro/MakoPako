package storage

import (
	"context"
	"database/sql"
	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"
)

type userRepo struct{ db *sql.DB }

func NewUserRepo(db *SQLiteDB) ports.UserRepository {
	return &userRepo{db: db.DB()}
}

func (r *userRepo) Create(ctx context.Context, u *domain.User) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO users (id, username, password_hash, avatar_url, created_at) VALUES (?,?,?,?,?)`,
		u.ID, u.Username, u.PasswordHash, u.AvatarURL, u.CreatedAt)
	return err
}

func (r *userRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	row := r.db.QueryRowContext(ctx, `SELECT id,username,password_hash,avatar_url,created_at FROM users WHERE id=?`, id)
	return scanUser(row)
}

func (r *userRepo) GetByUsername(ctx context.Context, username string) (*domain.User, error) {
	row := r.db.QueryRowContext(ctx, `SELECT id,username,password_hash,avatar_url,created_at FROM users WHERE username=?`, username)
	return scanUser(row)
}

func (r *userRepo) Update(ctx context.Context, u *domain.User) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET username=?, password_hash=?, avatar_url=? WHERE id=?`,
		u.Username, u.PasswordHash, u.AvatarURL, u.ID)
	return err
}

func (r *userRepo) ListAll(ctx context.Context) ([]*domain.User, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id,username,password_hash,avatar_url,created_at FROM users ORDER BY created_at`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []*domain.User
	for rows.Next() {
		u := &domain.User{}
		rows.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.AvatarURL, &u.CreatedAt)
		users = append(users, u)
	}
	return users, nil
}

func scanUser(row *sql.Row) (*domain.User, error) {
	u := &domain.User{}
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

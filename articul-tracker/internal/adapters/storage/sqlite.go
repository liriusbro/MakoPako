package storage

import (
	"database/sql"
	_ "modernc.org/sqlite"
)

type SQLiteDB struct {
	db *sql.DB
}

func NewSQLiteDB(path string) (*SQLiteDB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1) // SQLite WAL mode still benefits from single writer
	s := &SQLiteDB{db: db}
	if err := s.migrate(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *SQLiteDB) migrate() error {
	_, err := s.db.Exec(`
		PRAGMA journal_mode=WAL;
		PRAGMA foreign_keys=ON;

		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			avatar_url TEXT DEFAULT '',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS sessions (
			token TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			expires_at DATETIME NOT NULL
		);

		CREATE TABLE IF NOT EXISTS articuls (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			number TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS articul_changes (
			id TEXT PRIMARY KEY,
			articul_id TEXT NOT NULL REFERENCES articuls(id) ON DELETE CASCADE,
			description TEXT NOT NULL,
			changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE INDEX IF NOT EXISTS idx_articuls_user_id ON articuls(user_id);
		CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
		CREATE INDEX IF NOT EXISTS idx_changes_articul_id ON articul_changes(articul_id);

		CREATE TABLE IF NOT EXISTS user_achievements (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			achievement_key TEXT NOT NULL,
			unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, achievement_key)
		);

		CREATE TABLE IF NOT EXISTS monthly_history (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			year INT NOT NULL,
			month INT NOT NULL,
			articul_number TEXT NOT NULL,
			created_at DATETIME NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_history_user_month ON monthly_history(user_id, year, month);
	`)
	if err != nil {
		return err
	}
	alters := []string{
		`ALTER TABLE users ADD COLUMN personal_best_day INT DEFAULT 0`,
		`ALTER TABLE users ADD COLUMN personal_best_date TEXT DEFAULT ''`,
		`ALTER TABLE users ADD COLUMN all_time_count INT DEFAULT 0`,
		`ALTER TABLE users ADD COLUMN current_streak INT DEFAULT 0`,
		`ALTER TABLE users ADD COLUMN last_active_date TEXT DEFAULT ''`,
		`ALTER TABLE articuls ADD COLUMN comment TEXT DEFAULT ''`,
		`ALTER TABLE monthly_history ADD COLUMN comment TEXT DEFAULT ''`,
	}
	for _, a := range alters {
		s.db.Exec(a) // ignore error — column may already exist
	}
	return nil
}

func (s *SQLiteDB) DB() *sql.DB { return s.db }

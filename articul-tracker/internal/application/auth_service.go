package application

import (
	"context"
	"errors"
	"time"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type authService struct {
	users    ports.UserRepository
	sessions ports.SessionRepository
}

func NewAuthService(u ports.UserRepository, s ports.SessionRepository) ports.AuthService {
	return &authService{users: u, sessions: s}
}

func (a *authService) Register(ctx context.Context, username, password string) (*domain.User, *domain.Session, error) {
	existing, _ := a.users.GetByUsername(ctx, username)
	if existing != nil {
		return nil, nil, errors.New("username already taken")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, err
	}
	user := &domain.User{
		ID:           uuid.New().String(),
		Username:     username,
		PasswordHash: string(hash),
	}
	if err := a.users.Create(ctx, user); err != nil {
		return nil, nil, err
	}
	session, err := a.createSession(ctx, user.ID)
	return user, session, err
}

func (a *authService) Login(ctx context.Context, username, password string) (*domain.User, *domain.Session, error) {
	user, err := a.users.GetByUsername(ctx, username)
	if err != nil {
		return nil, nil, errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, nil, errors.New("invalid credentials")
	}
	session, err := a.createSession(ctx, user.ID)
	return user, session, err
}

func (a *authService) Logout(ctx context.Context, token string) error {
	return a.sessions.DeleteByToken(ctx, token)
}

func (a *authService) GetUserBySession(ctx context.Context, token string) (*domain.User, error) {
	session, err := a.sessions.GetByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if time.Now().After(session.ExpiresAt) {
		a.sessions.DeleteByToken(ctx, token)
		return nil, errors.New("session expired")
	}
	return a.users.GetByID(ctx, session.UserID)
}

func (a *authService) createSession(ctx context.Context, userID string) (*domain.Session, error) {
	session := &domain.Session{
		Token:     uuid.New().String(),
		UserID:    userID,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	}
	if err := a.sessions.Create(ctx, session); err != nil {
		return nil, err
	}
	return session, nil
}

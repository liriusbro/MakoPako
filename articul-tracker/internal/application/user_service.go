package application

import (
	"context"
	"errors"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"

	"golang.org/x/crypto/bcrypt"
)

type userService struct {
	users    ports.UserRepository
	articuls ports.ArticulRepository
}

func NewUserService(u ports.UserRepository, a ports.ArticulRepository) ports.UserService {
	return &userService{users: u, articuls: a}
}

func (s *userService) GetProfile(ctx context.Context, userID string) (*domain.User, error) {
	return s.users.GetByID(ctx, userID)
}

func (s *userService) UpdateAvatar(ctx context.Context, userID, avatarDataURL string) error {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	user.AvatarURL = avatarDataURL
	return s.users.Update(ctx, user)
}

func (s *userService) UpdateUsername(ctx context.Context, userID, newUsername string) error {
	existing, _ := s.users.GetByUsername(ctx, newUsername)
	if existing != nil && existing.ID != userID {
		return errors.New("username already taken")
	}
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	user.Username = newUsername
	return s.users.Update(ctx, user)
}

func (s *userService) ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
		return errors.New("wrong old password")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hash)
	return s.users.Update(ctx, user)
}

func (s *userService) GetUserStats(ctx context.Context, userID string) (*ports.UserStats, error) {
	total, err := s.articuls.CountByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	daily, err := s.articuls.GetDailyCountsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &ports.UserStats{TotalArticuls: total, DailyCounts: daily}, nil
}

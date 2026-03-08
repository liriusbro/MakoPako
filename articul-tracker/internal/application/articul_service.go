package application

import (
	"context"
	"errors"
	"time"

	"articul-tracker/internal/domain"
	"articul-tracker/internal/ports"

	"github.com/google/uuid"
)

type articulService struct {
	articuls          ports.ArticulRepository
	users             ports.UserRepository
	achievementChecker *achievementChecker
}

func NewArticulService(a ports.ArticulRepository, u ports.UserRepository, ach *achievementChecker) ports.ArticulService {
	return &articulService{articuls: a, users: u, achievementChecker: ach}
}

func (s *articulService) Create(ctx context.Context, userID, number string) (*domain.Articul, *ports.AchievementResult, error) {
	existing, _ := s.articuls.GetByUserIDAndNumber(ctx, userID, number)
	if existing != nil {
		return nil, nil, errors.New("duplicate: articul number already exists")
	}
	a := &domain.Articul{
		ID:        uuid.New().String(),
		UserID:    userID,
		Number:    number,
		CreatedAt: time.Now(),
	}
	if err := s.articuls.Create(ctx, a); err != nil {
		return nil, nil, err
	}
	achResult, _ := s.achievementChecker.CheckAfterCreate(ctx, userID)
	return a, achResult, nil
}

func (s *articulService) List(ctx context.Context, userID string) ([]*domain.Articul, error) {
	return s.articuls.ListByUserID(ctx, userID)
}

func (s *articulService) AddChange(ctx context.Context, articulID, userID, description string) error {
	a, err := s.articuls.GetByID(ctx, articulID)
	if err != nil {
		return errors.New("articul not found")
	}
	if a.UserID != userID {
		return errors.New("forbidden: you can only modify your own articuls")
	}
	change := &domain.ArticulChange{
		ID:          uuid.New().String(),
		ArticulID:   articulID,
		Description: description,
		ChangedAt:   time.Now(),
	}
	return s.articuls.AddChange(ctx, change)
}

func (s *articulService) GetWithChanges(ctx context.Context, articulID, requestingUserID string) (*domain.Articul, error) {
	a, err := s.articuls.GetByID(ctx, articulID)
	if err != nil {
		return nil, err
	}
	changes, err := s.articuls.GetChangesByArticulID(ctx, articulID)
	if err != nil {
		return nil, err
	}
	a.Changes = make([]domain.ArticulChange, len(changes))
	for i, c := range changes {
		a.Changes[i] = *c
	}
	return a, nil
}

func (s *articulService) Delete(ctx context.Context, articulID, userID string) error {
	a, err := s.articuls.GetByID(ctx, articulID)
	if err != nil {
		return errors.New("articul not found")
	}
	if a.UserID != userID {
		return errors.New("forbidden")
	}
	return s.articuls.DeleteByID(ctx, articulID)
}

func (s *articulService) UpdateComment(ctx context.Context, articulID, userID, comment string) error {
	a, err := s.articuls.GetByID(ctx, articulID)
	if err != nil {
		return errors.New("articul not found")
	}
	if a.UserID != userID {
		return errors.New("forbidden")
	}
	return s.articuls.UpdateComment(ctx, articulID, userID, comment)
}

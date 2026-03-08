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
	articuls ports.ArticulRepository
	users    ports.UserRepository
}

func NewArticulService(a ports.ArticulRepository, u ports.UserRepository) ports.ArticulService {
	return &articulService{articuls: a, users: u}
}

func (s *articulService) Create(ctx context.Context, userID, number string) (*domain.Articul, error) {
	a := &domain.Articul{
		ID:        uuid.New().String(),
		UserID:    userID,
		Number:    number,
		CreatedAt: time.Now(),
	}
	return a, s.articuls.Create(ctx, a)
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

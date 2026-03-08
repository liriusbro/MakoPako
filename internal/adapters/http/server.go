package http

import (
	"context"
	"net/http"

	"articul-tracker/internal/ports"
)

type Server struct {
	mux               *http.ServeMux
	authService       ports.AuthService
	userService       ports.UserService
	articulService    ports.ArticulService
	leaderboardSvc    ports.LeaderboardService
	achievementRepo   ports.AchievementRepository
	achievementChecker achievementChecker
	historyRepo       ports.MonthlyHistoryRepository
}

type achievementChecker interface {
	GetDailyProgress(ctx context.Context, userID string) (*ports.DailyProgress, error)
}

func NewServer(
	auth ports.AuthService,
	user ports.UserService,
	articul ports.ArticulService,
	lb ports.LeaderboardService,
	achievementRepo ports.AchievementRepository,
	ach achievementChecker,
	historyRepo ports.MonthlyHistoryRepository,
) *Server {
	s := &Server{
		mux:               http.NewServeMux(),
		authService:       auth,
		userService:       user,
		articulService:    articul,
		leaderboardSvc:    lb,
		achievementRepo:   achievementRepo,
		achievementChecker: ach,
		historyRepo:       historyRepo,
	}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	// Auth (must be before static to take precedence)
	s.mux.HandleFunc("POST /api/register", s.handleRegister)
	s.mux.HandleFunc("POST /api/login", s.handleLogin)
	s.mux.HandleFunc("POST /api/logout", s.requireAuth(s.handleLogout))

	// Current user
	s.mux.HandleFunc("GET /api/me", s.requireAuth(s.handleGetMe))
	s.mux.HandleFunc("PUT /api/me/avatar", s.requireAuth(s.handleUpdateAvatar))
	s.mux.HandleFunc("PUT /api/me/username", s.requireAuth(s.handleUpdateUsername))
	s.mux.HandleFunc("PUT /api/me/password", s.requireAuth(s.handleChangePassword))
	s.mux.HandleFunc("GET /api/me/stats", s.requireAuth(s.handleGetMyStats))
	s.mux.HandleFunc("GET /api/me/achievements", s.requireAuth(s.handleGetAchievements))
	s.mux.HandleFunc("GET /api/me/daily-progress", s.requireAuth(s.handleDailyProgress))

	// Articuls
	s.mux.HandleFunc("GET /api/articuls", s.requireAuth(s.handleListArticuls))
	s.mux.HandleFunc("POST /api/articuls", s.requireAuth(s.handleCreateArticul))
	s.mux.HandleFunc("GET /api/articuls/{id}", s.requireAuth(s.handleGetArticul))
	s.mux.HandleFunc("POST /api/articuls/{id}/changes", s.requireAuth(s.handleAddChange))
	s.mux.HandleFunc("PUT /api/articuls/{id}/comment", s.requireAuth(s.handleUpdateComment))
	s.mux.HandleFunc("DELETE /api/articuls/{id}", s.requireAuth(s.handleDeleteArticul))

	// Leaderboard & other profiles
	s.mux.HandleFunc("GET /api/leaderboard", s.requireAuth(s.handleLeaderboard))
	s.mux.HandleFunc("GET /api/leaderboard/seasonal", s.requireAuth(s.handleSeasonalLeaders))
	s.mux.HandleFunc("GET /api/users/{id}", s.requireAuth(s.handleGetUser))
	s.mux.HandleFunc("GET /api/users/{id}/history", s.requireAuth(s.handleGetUserHistory))
	s.mux.HandleFunc("GET /api/users/{id}/history/{year}/{month}", s.requireAuth(s.handleGetUserHistoryMonth))
	s.mux.HandleFunc("GET /api/users/{id}/stats", s.requireAuth(s.handleGetUserStats))
	s.mux.HandleFunc("GET /api/users/{id}/articuls", s.requireAuth(s.handleGetUserArticuls))

	// Static files (must be last - catch-all)
	s.mux.Handle("/", http.FileServer(http.Dir("./static")))
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

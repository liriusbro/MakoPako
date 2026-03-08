package http

import (
	"net/http"
	"articul-tracker/internal/ports"
)

type Server struct {
	mux            *http.ServeMux
	authService    ports.AuthService
	userService    ports.UserService
	articulService ports.ArticulService
	leaderboardSvc ports.LeaderboardService
}

func NewServer(
	auth ports.AuthService,
	user ports.UserService,
	articul ports.ArticulService,
	lb ports.LeaderboardService,
) *Server {
	s := &Server{
		mux:            http.NewServeMux(),
		authService:    auth,
		userService:    user,
		articulService: articul,
		leaderboardSvc: lb,
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

	// Articuls
	s.mux.HandleFunc("GET /api/articuls", s.requireAuth(s.handleListArticuls))
	s.mux.HandleFunc("POST /api/articuls", s.requireAuth(s.handleCreateArticul))
	s.mux.HandleFunc("GET /api/articuls/{id}", s.requireAuth(s.handleGetArticul))
	s.mux.HandleFunc("POST /api/articuls/{id}/changes", s.requireAuth(s.handleAddChange))

	// Leaderboard & other profiles
	s.mux.HandleFunc("GET /api/leaderboard", s.requireAuth(s.handleLeaderboard))
	s.mux.HandleFunc("GET /api/users/{id}", s.requireAuth(s.handleGetUser))
	s.mux.HandleFunc("GET /api/users/{id}/stats", s.requireAuth(s.handleGetUserStats))
	s.mux.HandleFunc("GET /api/users/{id}/articuls", s.requireAuth(s.handleGetUserArticuls))

	// Static files (must be last - catch-all)
	s.mux.Handle("/", http.FileServer(http.Dir("./static")))
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

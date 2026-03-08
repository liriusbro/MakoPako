package http

import "net/http"

func (s *Server) handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	entries, err := s.leaderboardSvc.GetLeaderboard(r.Context())
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, entries)
}

func (s *Server) handleGetUser(w http.ResponseWriter, r *http.Request) {
	targetID := r.PathValue("id")
	user, err := s.userService.GetProfile(r.Context(), targetID)
	if err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, user)
}

func (s *Server) handleGetUserStats(w http.ResponseWriter, r *http.Request) {
	targetID := r.PathValue("id")
	stats, err := s.userService.GetUserStats(r.Context(), targetID)
	if err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, stats)
}

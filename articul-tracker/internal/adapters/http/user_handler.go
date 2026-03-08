package http

import (
	"encoding/json"
	"net/http"
)

func (s *Server) handleUpdateAvatar(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var body struct {
		AvatarDataURL string `json:"avatar"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if err := s.userService.UpdateAvatar(r.Context(), userID, body.AvatarDataURL); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleUpdateUsername(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var body struct {
		Username string `json:"username"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if len(body.Username) < 2 {
		jsonError(w, "username too short", http.StatusBadRequest)
		return
	}
	if err := s.userService.UpdateUsername(r.Context(), userID, body.Username); err != nil {
		jsonError(w, err.Error(), http.StatusConflict)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var body struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if len(body.NewPassword) < 4 {
		jsonError(w, "new password too short", http.StatusBadRequest)
		return
	}
	if err := s.userService.ChangePassword(r.Context(), userID, body.OldPassword, body.NewPassword); err != nil {
		jsonError(w, err.Error(), http.StatusForbidden)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleGetMyStats(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	stats, err := s.userService.GetUserStats(r.Context(), userID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, stats)
}

func (s *Server) handleGetAchievements(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	list, err := s.achievementRepo.ListByUserID(r.Context(), userID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, list)
}

func (s *Server) handleDailyProgress(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	prog, err := s.achievementChecker.GetDailyProgress(r.Context(), userID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, prog)
}

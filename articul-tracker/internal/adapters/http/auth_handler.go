package http

import (
	"encoding/json"
	"net/http"
	"time"
)

type registerRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid body", http.StatusBadRequest)
		return
	}
	if len(req.Username) < 2 || len(req.Password) < 4 {
		jsonError(w, "username min 2 chars, password min 4 chars", http.StatusBadRequest)
		return
	}
	user, session, err := s.authService.Register(r.Context(), req.Username, req.Password)
	if err != nil {
		jsonError(w, err.Error(), http.StatusConflict)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    session.Token,
		Expires:  session.ExpiresAt,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	jsonOK(w, map[string]any{"user": user, "ok": true})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid body", http.StatusBadRequest)
		return
	}
	user, session, err := s.authService.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    session.Token,
		Expires:  session.ExpiresAt,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	jsonOK(w, map[string]any{"user": user, "ok": true})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("session_token")
	if cookie != nil {
		s.authService.Logout(r.Context(), cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:    "session_token",
		Value:   "",
		Expires: time.Unix(0, 0),
		Path:    "/",
	})
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleGetMe(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	user, err := s.userService.GetProfile(r.Context(), userID)
	if err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, user)
}

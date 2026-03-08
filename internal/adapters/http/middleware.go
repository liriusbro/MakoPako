package http

import (
	"context"
	"encoding/json"
	"net/http"
)

type contextKey string

const userIDKey contextKey = "userID"

func (s *Server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			jsonError(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		user, err := s.authService.GetUserBySession(r.Context(), cookie.Value)
		if err != nil {
			jsonError(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, user.ID)
		next(w, r.WithContext(ctx))
	}
}

func getUserID(r *http.Request) string {
	id, _ := r.Context().Value(userIDKey).(string)
	return id
}

func jsonOK(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

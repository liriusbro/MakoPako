package http

import (
	"encoding/json"
	"net/http"
	"strings"
)

func (s *Server) handleListArticuls(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	articuls, err := s.articulService.List(r.Context(), userID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, articuls)
}

func (s *Server) handleCreateArticul(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	var body struct {
		Number string `json:"number"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Number == "" {
		jsonError(w, "number required", http.StatusBadRequest)
		return
	}
	a, achResult, err := s.articulService.Create(r.Context(), userID, body.Number)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			jsonError(w, err.Error(), http.StatusConflict)
			return
		}
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	jsonOK(w, map[string]any{"articul": a, "achievements": achResult})
}

func (s *Server) handleGetArticul(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	articulID := r.PathValue("id")
	a, err := s.articulService.GetWithChanges(r.Context(), articulID, userID)
	if err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	jsonOK(w, a)
}

func (s *Server) handleAddChange(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	articulID := r.PathValue("id")
	var body struct {
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Description == "" {
		jsonError(w, "description required", http.StatusBadRequest)
		return
	}
	if err := s.articulService.AddChange(r.Context(), articulID, userID, body.Description); err != nil {
		jsonError(w, err.Error(), http.StatusForbidden)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleUpdateComment(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	articulID := r.PathValue("id")
	var body struct {
		Comment string `json:"comment"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if err := s.articulService.UpdateComment(r.Context(), articulID, userID, body.Comment); err != nil {
		if strings.Contains(err.Error(), "forbidden") {
			jsonError(w, err.Error(), http.StatusForbidden)
			return
		}
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleDeleteArticul(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)
	articulID := r.PathValue("id")
	if err := s.articulService.Delete(r.Context(), articulID, userID); err != nil {
		if strings.Contains(err.Error(), "forbidden") {
			jsonError(w, err.Error(), http.StatusForbidden)
			return
		}
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}
	jsonOK(w, map[string]bool{"ok": true})
}

func (s *Server) handleGetUserArticuls(w http.ResponseWriter, r *http.Request) {
	targetUserID := r.PathValue("id")
	articuls, err := s.articulService.List(r.Context(), targetUserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, articuls)
}

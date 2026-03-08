package http

import (
	"net/http"
	"strconv"
)

func (s *Server) handleGetUserHistory(w http.ResponseWriter, r *http.Request) {
	targetID := r.PathValue("id")
	months, err := s.historyRepo.GetMonths(r.Context(), targetID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, months)
}

func (s *Server) handleGetUserHistoryMonth(w http.ResponseWriter, r *http.Request) {
	targetID := r.PathValue("id")
	year, _ := strconv.Atoi(r.PathValue("year"))
	month, _ := strconv.Atoi(r.PathValue("month"))
	entries, err := s.historyRepo.GetByMonth(r.Context(), targetID, year, month)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, entries)
}

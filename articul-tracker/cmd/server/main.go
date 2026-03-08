package main

import (
	"log"
	"net/http"

	"articul-tracker/internal/adapters/storage"
	httpadapter "articul-tracker/internal/adapters/http"
	"articul-tracker/internal/application"
)

func main() {
	db, err := storage.NewSQLiteDB("./data/articul.db")
	if err != nil {
		log.Fatalf("db init: %v", err)
	}

	// Repositories (output adapters)
	userRepo := storage.NewUserRepo(db)
	articulRepo := storage.NewArticulRepo(db)
	sessionRepo := storage.NewSessionRepo(db)

	// Application services (use cases)
	authSvc := application.NewAuthService(userRepo, sessionRepo)
	userSvc := application.NewUserService(userRepo, articulRepo)
	articulSvc := application.NewArticulService(articulRepo, userRepo)
	leaderboardSvc := application.NewLeaderboardService(userRepo, articulRepo)

	// HTTP adapter (input adapter)
	server := httpadapter.NewServer(authSvc, userSvc, articulSvc, leaderboardSvc)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", server))
}

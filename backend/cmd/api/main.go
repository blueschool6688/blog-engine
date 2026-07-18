package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"backend/bootstrap"
)

func main() {
	// Create context that listens for SIGINT and SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	app, cleanup, err := bootstrap.New(ctx)
	if err != nil {
		log.Fatalf("Failed to bootstrap API server: %v", err)
	}
	defer cleanup()

	// Listen in goroutine
	go func() {
		log.Println("Starting API server on port 8080...")
		if err := app.Listen(":8080"); err != nil {
			log.Printf("Server closed: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-ctx.Done()
	log.Println("Shutting down API server gracefully...")

	// Shutdown Fiber app safely
	if err := app.Shutdown(); err != nil {
		log.Printf("Server shutdown error: %v", err)
	} else {
		log.Println("Server shut down successfully.")
	}
}

.PHONY: help up up-build down restart logs ps db clean

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Docker Compose:"
	@echo "  up        - Start all services (frontend + backend + db)"
	@echo "  up-build  - Start all services with rebuild"
	@echo "  down      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - Show logs (follow mode)"
	@echo "  ps        - Show running containers"
	@echo ""
	@echo "Development:"
	@echo "  db        - Start only database"
	@echo "  clean     - Stop all and remove volumes"

# Docker Compose commands
up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

# Development commands
db:
	docker compose up -d db

clean:
	docker compose down -v

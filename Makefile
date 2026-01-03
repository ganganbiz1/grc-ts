.PHONY: help up up-build down restart logs ps db clean migrate migrate-create migrate-reset prisma-studio

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
	@echo ""
	@echo "Database:"
	@echo "  migrate        - Run pending migrations"
	@echo "  migrate-create - Create a new migration (NAME=xxx)"
	@echo "  migrate-reset  - Reset database and run all migrations"
	@echo "  prisma-studio  - Open Prisma Studio (DB GUI)"

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

# Database commands
migrate:
	docker compose exec backend npx prisma migrate deploy

migrate-create:
	docker compose exec backend npx prisma migrate dev --name $(NAME)

migrate-reset:
	docker compose exec backend npx prisma migrate reset --force

prisma-studio:
	docker compose exec backend npx prisma studio

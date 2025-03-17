.PHONY: build up down client-dev client-dev-server client-admin-dev-server dummy-server

build:
	docker compose build

up:
	docker compose up --build

down:
	docker compose down

client-dev: client-dev-server client-admin-dev-server dummy-server

client-dev-server:
	cd client && npm run dev

client-admin-dev-server:
	cd client-admin && npm run dev

dummy-server:
	cd utils/dummy-server && npm run dev

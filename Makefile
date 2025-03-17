.PHONY: build up down client-setup client-dev client-dev-server client-admin-dev-server dummy-server

build:
	docker compose build

up:
	docker compose up --build

down:
	docker compose down

client-setup:
	cd client && npm install && cp .env-sample .env
	cd client-admin && npm install && cp .env-sample .env
	cd utils/dummy-server && npm install && cp .env-sample .env

client-dev: client-dev-server client-admin-dev-server dummy-server

client-dev-server:
	cd client && npm run dev

client-admin-dev-server:
	cd client-admin && npm run dev

dummy-server:
	cd utils/dummy-server && npm run dev

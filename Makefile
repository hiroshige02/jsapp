.PHONY: front api front_up api_up

up:
	docker compose up -d
front:
	docker compose exec front bash
front_up:
	docker compose stop front && docker compose up front
api:
	docker compose exec api bash
api_up:
	docker compose stop api && docker compose up api
cypress:
	docker compose up cypress
stop:
	docker compose stop

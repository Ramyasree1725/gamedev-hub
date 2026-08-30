.PHONY: install run test docker-build docker-run clean

install:
	cd backend && pip install -r requirements.txt

run:
	cd backend && python app.py

test:
	cd backend && python -m pytest tests/ -v --tb=short

docker-build:
	docker build -t gamedev-hub .

docker-run:
	docker run -p 5000:5000 gamedev-hub

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true

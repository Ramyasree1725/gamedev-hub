# Docker quick start

Build the image from the repository root:

```bash
docker build -t gamedev-hub .
docker run -p 5000:5000 gamedev-hub
```

Open `http://localhost:5000` after the container starts. Stop the container with `Ctrl+C` when you finish testing.

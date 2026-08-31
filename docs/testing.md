# Testing guide

Run the backend suite from the project root:

```bash
cd backend
pytest tests/ -v --cov=.
```

Add a regression test for every fixed bug. Test route behavior through the Flask test client and keep browser checks for gameplay interactions manual and focused.

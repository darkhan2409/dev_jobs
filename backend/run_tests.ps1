# Run integration tests with correct DATABASE_URL
$env:DATABASE_URL="postgresql+asyncpg://postgres:1234@localhost:5432/dev_jobs_test"
pytest tests/ -k "integration" -v --tb=short

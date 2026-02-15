@echo off
echo Starting B.L.A.S.T. Test Plan Agent...

:: Start Backend in a new window
echo Starting FastAPI Backend...
start cmd /k "cd backend && ..\venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: Start Frontend in a new window
echo Starting Vite Frontend...
start cmd /k "cd frontend && npm run dev"

echo Done! Waiting for services to initialize...
timeout /t 5
start http://localhost:3000

echo Application should be running at http://localhost:3000
echo Check the individual terminal windows for logs.

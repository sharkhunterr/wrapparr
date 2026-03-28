# Installation

## Docker (recommended)

```bash
cd docker
cp ../.env.example ../.env
# Edit .env with your settings
docker compose up -d
```

Access Wrapparr at `http://localhost:8080`

## Manual

### Backend
```bash
cd src/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd src/frontend
npm install
npm run dev
```

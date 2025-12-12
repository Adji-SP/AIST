# Docker Environment Setup - Complete! 🐳

## Overview

Docker environment with Python ML support has been successfully added to the project. The setup includes:

1. **Multi-stage Dockerfile** for production deployment
2. **Docker Compose** for orchestrating multiple services
3. **Python ML Server** for agricultural predictions
4. **Models directory** for ML model storage
5. **Demo Mode Indicator** in the navbar

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Environment                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │  ML Server   │     │
│  │  React App   │  │  Node.js +   │  │  Flask API   │     │
│  │  Port: 3000  │  │  WebSocket   │  │  Port: 5000  │     │
│  │              │  │  3001 & 8080 │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                  ┌────────▼─────────┐                       │
│                  │      Redis       │                       │
│                  │   Port: 6379     │                       │
│                  └──────────────────┘                       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Shared Volumes                       │      │
│  │  - models/      (ML models)                      │      │
│  │  - App/python/  (Python ML code)                 │      │
│  │  - logs/        (Application logs)                │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 New Files Added

### Docker Configuration
1. **Dockerfile** - Multi-stage production build
2. **Dockerfile.dev** - Development frontend container
3. **docker-compose.yml** - Service orchestration
4. **.dockerignore** - Exclude unnecessary files

### Python ML Environment
5. **App/python/requirements.txt** - Python dependencies
6. **App/python/ml_predictor.py** - ML prediction engine (300+ lines)
7. **App/python/ml_server.py** - Flask REST API server
8. **App/python/Dockerfile.ml** - ML server container

### Models Directory
9. **models/README.md** - Model documentation and training guide

### Frontend Update
10. **KasturiOverview.jsx** - Added DEMO MODE badge to navbar (Line 353-356)

---

## 🚀 Quick Start

### Option 1: Run Everything with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Server: http://localhost:5000
- Redis: localhost:6379

### Option 2: Run Individual Services

```bash
# Build backend + ML
docker build -t ta-backend .

# Run backend
docker run -p 3001:3001 -p 8080:8080 -v ./models:/app/models ta-backend

# Build ML server separately
cd App/python
docker build -t ta-ml-server -f Dockerfile.ml .
docker run -p 5000:5000 -v ../../models:/app/models ta-ml-server
```

### Option 3: Development Mode (Current)

```bash
# Continue using npm for development
npm run dev

# The Python ML server can be run separately:
cd App/python
pip install -r requirements.txt
python ml_server.py
```

---

## 🐍 Python ML Features

### 1. Agricultural Predictor (`ml_predictor.py`)

**Capabilities:**
- ✅ Crop yield prediction
- ✅ Soil health assessment
- ✅ Irrigation needs calculation
- ✅ Automated recommendations

**Usage (CLI):**
```bash
cd App/python

# Install dependencies
pip install -r requirements.txt

# Run prediction
python ml_predictor.py '{"nitrogen":25,"organic_matter":4.5,"soil_health":7.2,"temperature":28,"soil_moisture":55,"ph_level":6.8}'
```

**Output:**
```
📊 Agricultural ML Predictions
==================================================

🌾 Yield Prediction:
   Estimated Yield: 15234.56 kg (15.23 tons)
   Confidence: 65.0%
   Model Type: mathematical

🌱 Soil Health Assessment:
   Overall Score: 72.5/100 (good)
   Recommendations: 2 actions needed
      [MEDIUM] Low organic matter: Apply 5-8kg mature compost per tree

💧 Irrigation Needs:
   Urgency: MEDIUM
   Days Until Irrigation: 3
   Water Needed: 2.5 L per tree
```

### 2. ML Server REST API (`ml_server.py`)

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/predict/yield` | POST | Predict crop yield |
| `/assess/soil-health` | POST | Assess soil health |
| `/predict/irrigation` | POST | Predict irrigation needs |
| `/predict/batch` | POST | Run all predictions |

**Example Request:**
```bash
curl -X POST http://localhost:5000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{
    "nitrogen": 25,
    "organic_matter": 4.5,
    "soil_health": 7.2,
    "temperature": 28,
    "soil_moisture": 55,
    "ph_level": 6.8
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "yield_kg": 15234.56,
    "yield_tons": 15.23,
    "confidence": 0.65,
    "model_type": "mathematical",
    "timestamp": "2025-12-13T13:45:00.123456"
  }
}
```

---

## 📦 Docker Services

### Backend Service
- **Image**: Node.js 18 Alpine + Python 3
- **Ports**: 3001 (API), 8080 (WebSocket)
- **Health Check**: HTTP GET to /health endpoint
- **Volumes**:
  - `./models:/app/models` - ML models
  - `./App/python:/app/App/python` - Python code
  - `backend-logs:/app/logs` - Logs

### Frontend Service (Development)
- **Image**: Node.js 18 Alpine
- **Port**: 3000
- **Hot Reload**: Enabled via volume mount
- **Environment**: Development mode with all React dev tools

### ML Server Service
- **Image**: Python 3.11 Slim
- **Port**: 5000
- **Framework**: Flask with CORS
- **Models**: Loaded from `/app/models` volume

### Redis Service
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Persistence**: Enabled with AOF (Append-Only File)
- **Use Cases**: Caching, session management, real-time data

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Node.js Backend
NODE_ENV=production
API_PORT=3001
WEBSOCKET_PORT=8080

# Firebase (Backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# React Frontend
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# ML Server
FLASK_ENV=production
MODEL_PATH=/app/models
```

---

## 🧪 ML Model Training

### Current Status
- **Yield Predictor**: Using mathematical fallback
- **Soil Health**: Using rule-based assessment

### To Train Custom Models

1. **Collect Training Data**
   ```python
   # Create training_data.csv with columns:
   # nitrogen, organic_matter, soil_health, temperature, soil_moisture, ph_level, yield_kg
   ```

2. **Train Model**
   ```python
   import pandas as pd
   from sklearn.ensemble import RandomForestRegressor
   import joblib

   # Load data
   data = pd.read_csv('training_data.csv')
   X = data[['nitrogen', 'organic_matter', 'soil_health',
             'temperature', 'soil_moisture', 'ph_level']]
   y = data['yield_kg']

   # Train
   model = RandomForestRegressor(n_estimators=100, random_state=42)
   model.fit(X, y)

   # Save
   joblib.dump(model, 'models/yield_predictor.pkl')
   ```

3. **Deploy Model**
   - Place `.pkl` files in `models/` directory
   - Restart ML server
   - Models will be automatically loaded

---

## 🎯 Demo Mode Badge

### Location
**File**: `src/components/dashboard/KasturiOverview.jsx`
**Lines**: 353-356

### Visual
```
┌─────────────────────────────────────────────────┐
│  [DEMO MODE] [Connected]  Last updated: 1:45 PM │
└─────────────────────────────────────────────────┘
```

The demo mode badge appears in the navbar with:
- 📢 Megaphone icon
- Blue gradient background
- "DEMO MODE" text
- Positioned next to connection status

---

## 📊 Docker Compose Services Summary

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| backend | ta-backend | 3001, 8080 | Node.js API + WebSocket |
| frontend | ta-frontend | 3000 | React development server |
| ml-server | ta-ml-server | 5000 | Python ML inference API |
| redis | ta-redis | 6379 | Caching and sessions |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or use different ports in docker-compose.yml
```

### Models Not Loading
```bash
# Check models directory
ls models/

# Verify Python can access
docker exec ta-ml-server ls /app/models

# Check ML server logs
docker logs ta-ml-server
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
```

---

## 📈 Next Steps

1. **Collect Training Data**: Gather real sensor data with corresponding yields
2. **Train ML Models**: Use scikit-learn or TensorFlow to train custom models
3. **Deploy Models**: Place trained `.pkl` files in `models/` directory
4. **Integrate with Frontend**: Call ML API from React components
5. **Monitor Performance**: Use Redis for caching predictions
6. **Scale**: Use Docker Swarm or Kubernetes for production

---

## 🎉 Summary

**✅ Docker environment ready**
- Multi-container setup with Docker Compose
- Python ML server with Flask API
- Production-ready Dockerfile
- Development mode support

**✅ Python ML integration complete**
- Agricultural prediction engine
- REST API for inference
- Model loading system
- Fallback mathematical models

**✅ Demo mode indicator added**
- Visible in navbar
- Blue badge with megaphone icon
- Positioned next to connection status

**🚀 Ready to use!**
```bash
docker-compose up -d
```

Access at http://localhost:3000 and see the DEMO MODE badge in the navbar! 🎊

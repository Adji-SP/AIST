# ML Models Directory

This directory contains trained machine learning models for agricultural predictions.

## Models

### 1. `yield_predictor.pkl`
- **Purpose**: Predicts crop yield based on sensor data
- **Inputs**: nitrogen, organic_matter, soil_health, temperature, soil_moisture, ph_level
- **Output**: Predicted yield in kg
- **Status**: Not yet trained (using mathematical fallback)

### 2. `soil_health_model.pkl`
- **Purpose**: Assesses soil health and provides recommendations
- **Inputs**: ph_level, nitrogen, organic_matter, soil_moisture
- **Output**: Health score (0-100) and recommendations
- **Status**: Not yet trained (using rule-based fallback)

## Training Models

To train your own models, create a Jupyter notebook or Python script with your training data:

```python
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load your training data
data = pd.read_csv('training_data.csv')

# Train yield prediction model
X = data[['nitrogen', 'organic_matter', 'soil_health', 'temperature', 'soil_moisture', 'ph_level']]
y = data['yield_kg']

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
joblib.dump(model, 'models/yield_predictor.pkl')
```

## Model Placement

Place your trained `.pkl` files in this directory:
- `models/yield_predictor.pkl`
- `models/soil_health_model.pkl`

The ML predictor will automatically load them when the server starts.

## Fallback Behavior

If models are not found, the system uses:
- **Yield Prediction**: Mathematical formula based on agronomic research
- **Soil Health**: Rule-based assessment using optimal ranges
- **Irrigation**: Evapotranspiration calculations

This ensures the system remains functional while you develop and train custom models.

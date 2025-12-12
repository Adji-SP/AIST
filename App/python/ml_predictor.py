"""
ML Predictor for Agricultural Data
Predicts crop yield, soil health, and provides recommendations
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime
import joblib
from pathlib import Path

# Model paths
BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / 'models'

class AgriculturalPredictor:
    """
    Agricultural ML Predictor
    Handles yield prediction, soil health assessment, and recommendations
    """

    def __init__(self):
        self.yield_model = None
        self.soil_health_model = None
        self.models_loaded = False
        self._load_models()

    def _load_models(self):
        """Load ML models from disk"""
        try:
            # Check if models directory exists
            if not MODELS_DIR.exists():
                print(f"⚠️ Models directory not found: {MODELS_DIR}")
                print("📝 Using fallback mathematical models")
                return

            # Load yield prediction model
            yield_model_path = MODELS_DIR / 'yield_predictor.pkl'
            if yield_model_path.exists():
                self.yield_model = joblib.load(yield_model_path)
                print(f"✅ Loaded yield model from {yield_model_path}")

            # Load soil health model
            soil_model_path = MODELS_DIR / 'soil_health_model.pkl'
            if soil_model_path.exists():
                self.soil_health_model = joblib.load(soil_model_path)
                print(f"✅ Loaded soil health model from {soil_model_path}")

            self.models_loaded = True

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            print("📝 Using fallback mathematical models")

    def predict_yield(self, sensor_data):
        """
        Predict crop yield based on sensor data

        Args:
            sensor_data (dict): Dictionary containing sensor readings
                - nitrogen (float): Soil nitrogen in ppm
                - organic_matter (float): Organic matter percentage
                - soil_health (float): Soil health index
                - temperature (float): Temperature in Celsius
                - soil_moisture (float): Soil moisture percentage
                - ph_level (float): Soil pH level

        Returns:
            dict: Prediction results with yield and confidence
        """
        try:
            # Extract features
            nitrogen = sensor_data.get('nitrogen', 0)
            organic_matter = sensor_data.get('organic_matter', 0)
            soil_health = sensor_data.get('soil_health', 0)
            temperature = sensor_data.get('temperature', 0)
            soil_moisture = sensor_data.get('soil_moisture', 0)
            ph_level = sensor_data.get('ph_level', 7.0)

            if self.yield_model:
                # Use ML model if available
                features = np.array([[
                    nitrogen, organic_matter, soil_health,
                    temperature, soil_moisture, ph_level
                ]])
                yield_kg = self.yield_model.predict(features)[0]
                confidence = 0.85  # Model confidence
            else:
                # Fallback mathematical model
                yield_kg = (
                    42434.72 +
                    (-8647.17 * nitrogen) +
                    (1751.18 * organic_matter) +
                    (-8005.21 * soil_health) +
                    (-29.76 * temperature) +
                    (-4.01 * soil_moisture)
                )
                yield_kg = max(0, yield_kg)  # Ensure non-negative
                confidence = 0.65  # Lower confidence for mathematical model

            return {
                'yield_kg': round(yield_kg, 2),
                'yield_tons': round(yield_kg / 1000, 2),
                'confidence': confidence,
                'model_type': 'ml' if self.yield_model else 'mathematical',
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"❌ Error predicting yield: {e}")
            return {
                'yield_kg': 0,
                'yield_tons': 0,
                'confidence': 0,
                'error': str(e)
            }

    def assess_soil_health(self, sensor_data):
        """
        Assess soil health and provide recommendations

        Args:
            sensor_data (dict): Dictionary containing sensor readings

        Returns:
            dict: Soil health assessment and recommendations
        """
        try:
            ph_level = sensor_data.get('ph_level', 7.0)
            nitrogen = sensor_data.get('nitrogen', 0)
            organic_matter = sensor_data.get('organic_matter', 0)
            soil_moisture = sensor_data.get('soil_moisture', 0)

            # Calculate health score (0-100)
            ph_score = 100 - abs(ph_level - 6.5) * 10  # Optimal pH: 6.0-7.0
            nitrogen_score = min(nitrogen * 2, 100)  # Higher is better
            om_score = min(organic_matter * 20, 100)  # 5% is ideal
            moisture_score = 100 - abs(soil_moisture - 60) * 2  # Optimal: 60%

            overall_score = (ph_score + nitrogen_score + om_score + moisture_score) / 4
            overall_score = max(0, min(100, overall_score))

            # Generate recommendations
            recommendations = []

            if ph_level < 6.0:
                recommendations.append({
                    'issue': 'Low pH (acidic soil)',
                    'action': 'Apply 200-300g dolomite lime per tree',
                    'priority': 'high'
                })
            elif ph_level > 7.5:
                recommendations.append({
                    'issue': 'High pH (alkaline soil)',
                    'action': 'Apply 50-80g elemental sulfur per tree',
                    'priority': 'high'
                })

            if nitrogen < 20:
                recommendations.append({
                    'issue': 'Low nitrogen levels',
                    'action': 'Apply liquid NPK fertilizer (100ml per 10L water)',
                    'priority': 'high'
                })

            if organic_matter < 3:
                recommendations.append({
                    'issue': 'Low organic matter',
                    'action': 'Apply 5-8kg mature compost per tree',
                    'priority': 'medium'
                })

            if soil_moisture < 30:
                recommendations.append({
                    'issue': 'Low soil moisture',
                    'action': 'Immediate irrigation needed (15-20L per tree)',
                    'priority': 'critical'
                })
            elif soil_moisture > 80:
                recommendations.append({
                    'issue': 'Excessive soil moisture',
                    'action': 'Create drainage channels, avoid watering for 2-3 days',
                    'priority': 'medium'
                })

            return {
                'overall_score': round(overall_score, 1),
                'status': self._get_health_status(overall_score),
                'components': {
                    'ph_score': round(ph_score, 1),
                    'nitrogen_score': round(nitrogen_score, 1),
                    'organic_matter_score': round(om_score, 1),
                    'moisture_score': round(moisture_score, 1)
                },
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"❌ Error assessing soil health: {e}")
            return {
                'overall_score': 0,
                'status': 'error',
                'error': str(e)
            }

    def _get_health_status(self, score):
        """Get health status based on score"""
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'fair'
        else:
            return 'poor'

    def predict_irrigation_needs(self, sensor_data, weather_forecast=None):
        """
        Predict irrigation needs based on sensor data and weather

        Args:
            sensor_data (dict): Current sensor readings
            weather_forecast (dict): Weather forecast data (optional)

        Returns:
            dict: Irrigation recommendations
        """
        try:
            soil_moisture = sensor_data.get('soil_moisture', 0)
            temperature = sensor_data.get('temperature', 25)

            # Calculate evapotranspiration estimate
            et_rate = 0.15 * (temperature - 20) if temperature > 20 else 0

            # Predict days until irrigation needed
            if soil_moisture > 70:
                days_until_irrigation = 5
                urgency = 'low'
            elif soil_moisture > 50:
                days_until_irrigation = 3
                urgency = 'medium'
            elif soil_moisture > 30:
                days_until_irrigation = 1
                urgency = 'high'
            else:
                days_until_irrigation = 0
                urgency = 'critical'

            # Calculate recommended water amount
            water_needed_liters = max(0, (60 - soil_moisture) * 0.5)  # Per tree

            return {
                'days_until_irrigation': days_until_irrigation,
                'urgency': urgency,
                'water_needed_liters_per_tree': round(water_needed_liters, 1),
                'current_moisture': soil_moisture,
                'et_rate': round(et_rate, 2),
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"❌ Error predicting irrigation needs: {e}")
            return {'error': str(e)}


def main():
    """Main function for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python ml_predictor.py <sensor_data_json>")
        print("Example: python ml_predictor.py '{\"nitrogen\":25,\"organic_matter\":4.5,\"soil_health\":7.2,\"temperature\":28,\"soil_moisture\":55,\"ph_level\":6.8}'")
        sys.exit(1)

    # Parse sensor data from command line
    sensor_data = json.loads(sys.argv[1])

    # Initialize predictor
    predictor = AgriculturalPredictor()

    # Run predictions
    print("\n📊 Agricultural ML Predictions\n")
    print("=" * 50)

    # Yield prediction
    yield_result = predictor.predict_yield(sensor_data)
    print(f"\n🌾 Yield Prediction:")
    print(f"   Estimated Yield: {yield_result['yield_kg']} kg ({yield_result['yield_tons']} tons)")
    print(f"   Confidence: {yield_result['confidence']*100:.1f}%")
    print(f"   Model Type: {yield_result['model_type']}")

    # Soil health assessment
    health_result = predictor.assess_soil_health(sensor_data)
    print(f"\n🌱 Soil Health Assessment:")
    print(f"   Overall Score: {health_result['overall_score']}/100 ({health_result['status']})")
    print(f"   Recommendations: {len(health_result['recommendations'])} actions needed")

    for rec in health_result['recommendations']:
        print(f"      [{rec['priority'].upper()}] {rec['issue']}: {rec['action']}")

    # Irrigation needs
    irrigation_result = predictor.predict_irrigation_needs(sensor_data)
    print(f"\n💧 Irrigation Needs:")
    print(f"   Urgency: {irrigation_result['urgency'].upper()}")
    print(f"   Days Until Irrigation: {irrigation_result['days_until_irrigation']}")
    print(f"   Water Needed: {irrigation_result['water_needed_liters_per_tree']} L per tree")

    print("\n" + "=" * 50 + "\n")


if __name__ == "__main__":
    main()

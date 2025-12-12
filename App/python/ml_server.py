"""
Flask ML Model Server
REST API for agricultural predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from ml_predictor import AgriculturalPredictor

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize ML predictor
predictor = AgriculturalPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Prediction Server',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': predictor.models_loaded
    })

@app.route('/predict/yield', methods=['POST'])
def predict_yield():
    """
    Predict crop yield

    POST /predict/yield
    Body: {
        "nitrogen": 25,
        "organic_matter": 4.5,
        "soil_health": 7.2,
        "temperature": 28,
        "soil_moisture": 55,
        "ph_level": 6.8
    }
    """
    try:
        sensor_data = request.json

        if not sensor_data:
            return jsonify({'error': 'No sensor data provided'}), 400

        result = predictor.predict_yield(sensor_data)

        return jsonify({
            'success': True,
            'data': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/assess/soil-health', methods=['POST'])
def assess_soil_health():
    """
    Assess soil health

    POST /assess/soil-health
    Body: {
        "nitrogen": 25,
        "organic_matter": 4.5,
        "ph_level": 6.8,
        "soil_moisture": 55
    }
    """
    try:
        sensor_data = request.json

        if not sensor_data:
            return jsonify({'error': 'No sensor data provided'}), 400

        result = predictor.assess_soil_health(sensor_data)

        return jsonify({
            'success': True,
            'data': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/irrigation', methods=['POST'])
def predict_irrigation():
    """
    Predict irrigation needs

    POST /predict/irrigation
    Body: {
        "soil_moisture": 55,
        "temperature": 28,
        "weather_forecast": {...}
    }
    """
    try:
        data = request.json

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        sensor_data = data.get('sensor_data', data)
        weather_forecast = data.get('weather_forecast')

        result = predictor.predict_irrigation_needs(sensor_data, weather_forecast)

        return jsonify({
            'success': True,
            'data': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Run all predictions in batch

    POST /predict/batch
    Body: {
        "nitrogen": 25,
        "organic_matter": 4.5,
        "soil_health": 7.2,
        "temperature": 28,
        "soil_moisture": 55,
        "ph_level": 6.8
    }
    """
    try:
        sensor_data = request.json

        if not sensor_data:
            return jsonify({'error': 'No sensor data provided'}), 400

        # Run all predictions
        yield_result = predictor.predict_yield(sensor_data)
        health_result = predictor.assess_soil_health(sensor_data)
        irrigation_result = predictor.predict_irrigation_needs(sensor_data)

        return jsonify({
            'success': True,
            'data': {
                'yield': yield_result,
                'soil_health': health_result,
                'irrigation': irrigation_result,
                'timestamp': datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

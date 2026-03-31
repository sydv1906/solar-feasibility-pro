"""Solar Feasibility Pro - Flask Backend
Windows-compatible standalone server (no Linux/IC required)
Runs on http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import uuid
import time

app = Flask(__name__)
CORS(app)  # Allow React frontend on localhost:5173

HISTORY_FILE = os.path.join(os.path.dirname(__file__), 'history.json')


def load_history():
    """Load prediction history from JSON file."""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_history(history):
    """Save prediction history to JSON file."""
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'Solar backend running!'})


@app.route('/api/history', methods=['GET'])
def get_history():
    """Get all prediction records sorted by newest first."""
    history = load_history()
    history.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
    return jsonify(history)


@app.route('/api/history', methods=['POST'])
def add_history():
    """Add a new prediction record."""
    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    history = load_history()
    record = {
        'id': str(uuid.uuid4()),
        'timestamp': int(time.time() * 1000),  # milliseconds
        'locationName': data.get('locationName', 'Unknown'),
        'latitude': data.get('latitude', 0),
        'longitude': data.get('longitude', 0),
        'solarCapacity': data.get('solarCapacity', 5),
        'temperature': data.get('temperature', 0),
        'humidity': data.get('humidity', 0),
        'cloudCover': data.get('cloudCover', 0),
        'precipitation': data.get('precipitation', 0),
        'shortwaveRadiation': data.get('shortwaveRadiation', 0),
        'zenithAngle': data.get('zenithAngle', 0),
        'azimuthAngle': data.get('azimuthAngle', 0),
        'predictedDailyOutput': data.get('predictedDailyOutput', 0),
        'predictedWeeklyOutput': data.get('predictedWeeklyOutput', 0),
        'predictedMonthlyOutput': data.get('predictedMonthlyOutput', 0),
        'predictedYearlyOutput': data.get('predictedYearlyOutput', 0),
        'feasibilityStatus': data.get('feasibilityStatus', 'moderate'),
    }
    history.append(record)
    save_history(history)
    return jsonify(record), 201


@app.route('/api/history/<record_id>', methods=['DELETE'])
def delete_history(record_id):
    """Delete a prediction record by ID."""
    history = load_history()
    original_len = len(history)
    history = [r for r in history if r.get('id') != record_id]

    if len(history) == original_len:
        return jsonify({'error': 'Record not found'}), 404

    save_history(history)
    return jsonify({'success': True, 'deleted_id': record_id})


if __name__ == '__main__':
    print('\n' + '='*50)
    print('  Solar Feasibility Pro - Backend Server')
    print('  Running at: http://localhost:5000')
    print('  Health check: http://localhost:5000/api/health')
    print('='*50 + '\n')
    app.run(debug=True, port=5000, host='0.0.0.0')

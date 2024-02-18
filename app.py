from flask import Flask, request, jsonify, send_from_directory
import pickle
import numpy as np
import os

app = Flask(__name__)

# Load the machine learning model
with open('modl.pkl', 'rb') as file:
    model = pickle.load(file)

@app.route('/')
def home():
    # Replace '/path/to/frontend/build' with the actual build folder path
    return send_from_directory(r'C:\Users\srini\OneDrive\Documents\Final Year Project\hospital_management\hospital_management_frontend\dist', 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Extract features from the JSON data
    features = [float(data[key]) for key in data]
    # Prepare the features for prediction
    input_features = np.array(features).reshape(1, -1)
    # Make predictions using the loaded model
    prediction = model.predict(input_features)[0]
    # Return the prediction as JSON
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)

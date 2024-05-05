from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load the machine learning model
with open('modl.pkl', 'rb') as file:
    modl = pickle.load(file)

@app.route('/predict', methods=['POST'])
def predict():
    # Get the data from the frontend
    data = request.json

    # Extract the features from the data
    features = [float(data[key]) for key in data.keys()]

    # Make a prediction using the loaded model
    prediction = modl.predict([features])

    # Return the prediction as JSON response
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify, send_from_directory
import pickle
import numpy as np

app = Flask(__name__)

# Load the machine learning model
with open('modl.pkl', 'rb') as file:
    modl = pickle.load(file)

@app.route('/')
def home():
    # Assuming your React build files are in the specified directory
    return send_from_directory(r'C:\Users\srini\OneDrive\Documents\Final Year Project\hospital_management\hospital_management_frontend\src\Pages\HeartDiseasePrediction', 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Extract features from the JSON data
    int_features = [float(x) for x in data.values()]
    # Prepare the features for prediction
    final = [np.array(int_features)]
    # Make predictions using the loaded model
    prediction = modl.predict(final)
    # Return the prediction as JSON
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)

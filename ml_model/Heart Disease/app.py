from flask import Flask, request, jsonify, send_from_directory
import pickle
import numpy as np
import os
import warnings


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
    # Get the feature values from the form
    
    print(request.form)
    int_features=[float(x) for x in request.form.values()]
    final=[np.array(int_features)]
    print(int_features)
    print(final)
    prediction=modl.predict(final)
    #output='(0:{1}f)'.format(prediction[0][1],2)
  
    

    # Make a prediction using the loaded model
   

    # Render the prediction result
    if(prediction==0):
    #return render_template('result.html', prediction=prediction)
     return render_template('resultfail.html',prediction=prediction);
     
    else :
       return render_template('resultsucess.html',prediction=prediction);
    
 
 

if __name__ == '__main__':
    app.run(debug=True)
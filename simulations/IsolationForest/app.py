from flask import Flask, jsonify, request
import numpy as np
import joblib


app = Flask(__name__)

#add model
model = joblib.load("isolation_forest.pkl");

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json;
    # Dummy prediction logic
    features = np.array([data['features']]).reshape(1, -1)
    # prediction = {"prediction": "positive" if data.get("value", 0) > 0 else "negative"}
    prediction = model.predict(features)[0];
    return jsonify({"prediction": int(prediction)})

@app.route("/predict", methods=["GET"])
def predict_get():
    return "200 OK!"

app.run(host="0.0.0.0", port=5000);

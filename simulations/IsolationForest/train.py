from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd
import joblib

# df = pd.read_csv("synthetic_connections.csv")
df = pd.read_csv("synthetic_requests_encoded.csv")

# X = df[['request_rate', 'failed_requests', 'avg_payload_size']].values
X = df[['type_of_request_GET','type_of_request_POST','avg_payload_size', 'request_rate', 'failed_requests']].values


model = IsolationForest(contamination=0.05, random_state=42)
model.fit(X)


# Save model
joblib.dump(model, 'isolation_forest.pkl')
print("Model trained on synthetic data and saved as isolation_forest.pkl")
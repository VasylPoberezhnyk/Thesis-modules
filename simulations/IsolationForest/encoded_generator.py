
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import OneHotEncoder

# Завантаження шаблону з JSON файлу
with open('template.json', 'r') as f:
    config = json.load(f)

def generate_feature(dist_config, size):
    dist = dist_config['dist']
    if dist == 'normal':
        return np.random.normal(loc=dist_config['loc'], scale=dist_config['scale'], size=size)
    elif dist == 'poisson':
        return np.random.poisson(lam=dist_config['lam'], size=size)
    else:
        raise ValueError(f"Unsupported distribution: {dist}")

def generate_data(section):
    size = config[section]['samples']
    # Випадкова генерація типу запиту
    request_types = np.random.choice(config[section]['type_of_request'], size=size)
    # Випадковогенерація інших ознак
    request_rate = generate_feature(config[section]['request_rate'], size)
    failed_requests = generate_feature(config[section]['failed_requests'], size)
    # Визначення розміру payload на основі типу запиту (GET має 0, POST має 150)
    payload_size = np.where(request_types == "GET", 0, 150)
    return request_types, payload_size, request_rate, failed_requests

# Генерація даних для нормальних та аномальних запитів
req_types_normal, payload_normal, rate_normal, fail_normal = generate_data('normal')
req_types_anomaly, payload_anomaly, rate_anomaly, fail_anomaly = generate_data('anomaly')

# Об'єднання даних та створення міток
request_types = np.concatenate((req_types_normal, req_types_anomaly))
payload_size = np.concatenate((payload_normal, payload_anomaly))
request_rate = np.concatenate((rate_normal, rate_anomaly))
failed_requests = np.concatenate((fail_normal, fail_anomaly))
labels = np.array([1]*config['normal']['samples'] + [-1]*config['anomaly']['samples'])

# Кодування категоріальної ознаки "type_of_request" за допомогою One-Hot Encoding
encoder = OneHotEncoder(sparse_output =False)
encoded_types = encoder.fit_transform(request_types.reshape(-1, 1))

# Об'єднання всіх ознак у один масив
X = np.column_stack((encoded_types, payload_size, request_rate, failed_requests))

# Створення DataFrame та збереження у CSV файл
columns = list(encoder.get_feature_names_out(['type_of_request'])) + ['avg_payload_size', 'request_rate', 'failed_requests']
df = pd.DataFrame(X, columns=columns)
df['label'] = labels
df.to_csv('synthetic_requests_encoded.csv', index=False)

print("Synthetic data with encoding generated and saved to synthetic_requests_encoded.csv")

# Візуалізація розподілу даних
plt.figure(figsize=(10, 6))
plt.scatter(request_rate, failed_requests, c=labels, cmap='coolwarm', alpha=0.6)
plt.xlabel('Request Rate')
plt.ylabel('Failed Requests')
plt.title('Synthetic Data Distribution')
plt.colorbar(label='Label (1=Normal, -1=Anomaly)')
plt.savefig('request_distribution.png')
plt.show()

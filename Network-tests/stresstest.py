
import requests
import concurrent.futures
import time
import matplotlib.pyplot as plt
from collections import defaultdict

# Налаштування
BASE_URL = "Цільовий_сервер"  # Потребує заміни на реальний URL
ENDPOINTS = ["/login", "/signature", "/mfa", "/sign"]
TOTAL_REQUESTS = 1000  # загальна кількість запитів
MAX_WORKERS = 5      # кількість потоків

# Збір статистики
stats = defaultdict(lambda: {"success": 0, "fail": 0})

def send_request(endpoint):
    url = BASE_URL + endpoint
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            stats[endpoint]["success"] += 1
        else:
            stats[endpoint]["fail"] += 1
    except requests.RequestException:
        stats[endpoint]["fail"] += 1

# Виконання тесту
start_time = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    futures = []
    for _ in range(TOTAL_REQUESTS):
        for endpoint in ENDPOINTS:
            futures.append(executor.submit(send_request, endpoint))
    concurrent.futures.wait(futures)
end_time = time.time()

# Вивід статистики
print("\n=== Результати тесту ===")
for endpoint, data in stats.items():
    total = data["success"] + data["fail"]
    print(f"{endpoint} {total} запитів | Успішні: {data['success']} | Помилки: {data['fail']}")

# Побудова графіка
labels = ENDPOINTS
success_counts = [stats[e]["success"] for e in ENDPOINTS]
fail_counts = [stats[e]["fail"] for e in ENDPOINTS]

x = range(len(labels))
plt.bar(x, success_counts, width=0.4, label="Успішні (200)", color="red")
plt.bar([i + 0.4 for i in x], fail_counts, width=0.4, label="Заблоковаеі (403)", color="green")
plt.xticks([i + 0.2 for i in x], labels)
plt.ylabel("Кількість запитів")
plt.title("Статистика навантажувального тесту")
plt.legend()
plt.show()

print(f"\nЧас виконання: {end_time - start_time:.2f} секунд")
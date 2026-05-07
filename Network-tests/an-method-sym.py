import matplotlib.pyplot as plt
import numpy as np
import random

# --- КОНФІГУРАЦІЯ МОДЕЛІ ---
NUM_NODES = 3         # Кількість вузлів у кластері (N)
NUM_USERS = 10        # Загальна кількість користувачів (U_total)
COMPROMISED_NODES = 1  # Кількість вузлів під контролем зловмисника (M)
MAX_ROTATIONS = 10     # Максимальна кількість змін сесій для аналізу (R)

# --- ЧАСТИНА 1: СИМУЛЯЦІЯ РОЗПОДІЛУ КОРИСТУВАЧІВ (МИТТЄВА АНОНІМНІСТЬ) ---
def simulate_load_balancing(users, nodes):
    # Випадковий розподіл користувачів по вузлах
    # Це імітує реальний вибір вузла клієнтом
    node_counts = [0] * nodes
    for _ in range(users):
        chosen_node = random.randint(0, nodes - 1)
        node_counts[chosen_node] += 1
    return node_counts

# Запуск симуляції
distribution = simulate_load_balancing(NUM_USERS, NUM_NODES)
min_k = min(distribution) # Найслабша ланка
avg_k = sum(distribution) / NUM_NODES

# --- ЧАСТИНА 2: РОЗРАХУНОК РИЗИКУ ПРИ РОТАЦІЇ (ДИНАМІЧНА АНОНІМНІСТЬ) ---
def calculate_risk_curve(total_nodes, bad_nodes, max_r):
    rotations = np.arange(1, max_r + 1)
    # Формула: P = (M / N) ^ R
    probability = (bad_nodes / total_nodes) ** rotations
    return rotations, probability

rotations_x, risk_y = calculate_risk_curve(NUM_NODES, COMPROMISED_NODES, MAX_ROTATIONS)

# --- ВІЗУАЛІЗАЦІЯ РЕЗУЛЬТАТІВ ---
plt.figure(figsize=(14, 6))

# Графік 1: Розподіл користувачів (k-анонімність вузлів)
plt.subplot(1, 2, 1)
bars = plt.bar([f'Вузол {i+1}' for i in range(NUM_NODES)], distribution, color=['#4285F4', '#34A853', '#EA4335'])
plt.title(f'Миттєва k-анонімність (Всього {NUM_USERS} користувачів)', fontsize=12)
plt.ylabel('Кількість користувачів (k)', fontsize=10)
plt.grid(axis='y', linestyle='--', alpha=0.7)

for bar in bars:
    yval = bar.get_height()
    # plt.text(bar.get_x() + bar.get_width()/2, yval + 2, int(yval), ha='center', va='bottom', fontweight='bold')
    plt.annotate(f"{yval}", (bar.get_x() + bar.get_width()/2, yval), 
                 textcoords="offset points", xytext=(0,10), ha='center')

plt.axhline(y=min_k, color='r', linestyle='--', label=f'Мін. k = {min_k}')
plt.tight_layout()
plt.legend()

# Графік 2: Падіння ризику при ротації
plt.subplot(1, 2, 2)
plt.plot(rotations_x, risk_y * 100, marker='o', color='#FBBC05', linewidth=2, markersize=8)
plt.title(f'Зниження ризику профілювання (Зловмисник контролює {COMPROMISED_NODES} з {NUM_NODES} вузлів)', fontsize=12)
plt.xlabel('Кількість ротацій/сесій (R)', fontsize=10)
plt.ylabel('Ймовірність повного перехоплення (%)', fontsize=10)
plt.xticks(rotations_x)
plt.grid(True, linestyle='--', alpha=0.6)

# Підписи точок ризику
for i, txt in enumerate(risk_y):
    plt.annotate(f"{txt*100:.4f}%", (rotations_x[i], risk_y[i]*100), 
                 textcoords="offset points", xytext=(0,15), ha='center', bbox=dict(boxstyle="round,pad=0.3", edgecolor='black', facecolor='white'), arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=0.2"))

plt.tight_layout()
plt.show()
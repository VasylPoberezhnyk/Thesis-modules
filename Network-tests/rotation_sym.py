# -*- coding: utf-8 -*-
"""
Created on Jan 15 00:43:02 2026

@author: Vas Poberezhnyk
"""

import random
import matplotlib.pyplot as plt
import numpy as np

# --- КЛАСИ ---

class Node:
    def __init__(self, node_id, reputation):
        # Жорстка перевірка: репутація має бути в межах [0.0, 1.0]
        if not (0.0 <= reputation <= 1.0):
            raise ValueError(f"Репутація для {node_id} має бути між 0.0 та 1.0. Отримано: {reputation}")
            
        self.node_id = node_id
        self.reputation = reputation

class RotationSimulator:
    def __init__(self, time_limit, data_limit, k_sensitivity=2):
        self.t_max = time_limit
        self.v_max = data_limit
        self.k = k_sensitivity
        # self.jitter_range = 0.1
        self.jitter_range = 0.2
        self.reset_threshold()

    def reset_threshold(self):
        # Рандомізація порогу (щоб уникнути таймінг-атак)
        # Поріг спрацювання буде плавати в межах 0.9 ... 1.1
        self.current_threshold = random.uniform(1.0 - self.jitter_range, 1.0 + self.jitter_range)

    def calculate_index(self, current_time, current_data):
        # Формула ротації: I = 0.5 * (t/T)^k + 0.5 * (v/V)^k
        # Це нормалізоване значення від 0 до ~1+
        t_term = 0.5 * ((current_time / self.t_max) ** self.k)
        v_term = 0.5 * ((current_data / self.v_max) ** self.k)
        return t_term + v_term

    def check_rotation(self, index):
        if index >= self.current_threshold:
            self.reset_threshold()
            return True
        return False

# --- СИМУЛЯЦІЯ ---

def run_simulation():
    # === ОНОВЛЕНІ ДАНІ (Репутація <= 1.0) ===
    nodes = [
        Node("Node A (Bad)",   0.10), # 10% надійності
        Node("Node B (Avg)",   0.45), # 45% надійності
        Node("Node C (Good)",  0.80), # 80% надійності
        Node("Node D (Best)",  0.99)  # 99% надійності
    ]
    
    sim = RotationSimulator(time_limit=100, data_limit=500, k_sensitivity=1)
    
    history_index = []
    rotation_events = []
    node_usage_counts = {n.node_id: 0 for n in nodes}
    
    current_t = 0
    current_v = 0
    total_steps = 100000  # Кількість кроків симуляції
    
    # Початковий вибір
    weights = [n.reputation for n in nodes]
    current_node = random.choices(nodes, weights=weights, k=1)[0]
    node_usage_counts[current_node.node_id] += 1
    
    print(f"Початковий вузол: {current_node.node_id} (Rep: {current_node.reputation})")

    for step in range(total_steps):
        # Імітація трафіку
        current_t += random.uniform(0.5, 2.0)
        current_v += random.uniform(1.0, 10.0)
        
        idx = sim.calculate_index(current_t, current_v)
        history_index.append(idx)
        
        if sim.check_rotation(idx):
            rotation_events.append(step)
            current_t = 0
            current_v = 0
            
            # ВИБІР НОВОГО ВУЗЛА
            # random.choices автоматично обробляє ваги, навіть якщо вони < 1.
            # Ймовірність P(i) = Rep(i) / Sum(Rep)
            current_node = random.choices(nodes, weights=weights, k=1)[0]
            node_usage_counts[current_node.node_id] += 1

    return list(range(total_steps)), history_index, rotation_events, node_usage_counts, nodes

# --- ГРАФІКИ ---

def plot_results(times, indices, rotations, usage, node_objects):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10))
    plt.subplots_adjust(hspace=0.4)

    # 1. Графік тригера
    ax1.plot(times, indices, label='Індекс ротації', color='#1f77b4', linewidth=1)
    ax1.axhline(y=1.0, color='r', linestyle='--', alpha=0.5, label='Поріг (1.0)')
    if rotations:
        ax1.scatter(rotations, [1.0]*len(rotations), color='red', marker='x', s=50, label='Момент ротації', zorder=5)
    ax1.set_title('Тригер ротації (Fatigue Accumulation)')
    ax1.set_ylabel('Індекс (>=1 -> Ротація)')
    ax1.legend(loc='upper left')
    ax1.grid(True, alpha=0.3)

    # 2. Графік розподілу (Репутація vs Використання)
    node_ids = [n.node_id for n in node_objects]
    raw_counts = [usage[nid] for nid in node_ids]
    raw_reps = [n.reputation for n in node_objects]
    
    # Рахуємо відсотки для порівняння
    total_usage = sum(raw_counts)
    total_rep_sum = sum(raw_reps) # Сума репутацій (наприклад 0.1+0.45+0.8+0.99 = 2.34)
    
    usage_pct = [c / total_usage * 100 for c in raw_counts]
    rep_pct = [r / total_rep_sum * 100 for r in raw_reps] # Нормалізуємо до 100%

    x = np.arange(len(node_ids))
    width = 0.35

    ax2.bar(x - width/2, rep_pct, width, label='Теоретична ймовірність (на основі репутації)', color='gray', alpha=0.5)
    ax2.bar(x + width/2, usage_pct, width, label='Фактична частота вибору', color='#2ca02c')

    ax2.set_title(f'Аналіз селекції (Всього ротацій: {total_usage})')
    ax2.set_ylabel('Частка використання (%)')
    ax2.set_xticks(x)
    ax2.set_xticklabels([f"{n.node_id}\n(R={n.reputation})" for n in node_objects])
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)

    plt.show()

if __name__ == "__main__":
    t, i, rot, use, nodes = run_simulation()
    plot_results(t, i, rot, use, nodes)
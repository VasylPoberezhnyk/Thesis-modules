import matplotlib.pyplot as plt
import json
import numpy as np

with open('data_badNode.json', 'r') as file:
    data = json.load(file)


plt.title('Залежність репутації вузла від параметрів')
rep = [scores['r'] for scores in data]
a = [scores['a'] for scores in data]
i = [scores['i'] for scores in data]
l = [scores['l'] for scores in data]

line1, = plt.plot(a, label='Доступність')
line2, = plt.plot(i, label='Надійність')
line3, = plt.plot(l, label="Затримка")
line4, = plt.plot(rep, label="Репутація")
plt.legend(handles=[line1, line2, line3, line4])
plt.show()
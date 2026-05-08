
const ipStats = new Map();

function updateStats(ip, payloadSize, statusCode) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1-minute window

    if (!ipStats.has(ip)) {
        ipStats.set(ip, { requests: [], failed: 0, totalPayload: 0 });
    }

    const stats = ipStats.get(ip);

    // Видаляємо запити, які вийшли за межі часового вікна
    stats.requests = stats.requests.filter(ts => now - ts < windowMs);

    // Додаємо поточний timestamp запиту
    stats.requests.push(now);

    // Оновлюємо кількість невдалих запитів
    if (statusCode >= 400) {
        stats.failed += 1;
    }

    // Оновлення розміру payload
    stats.totalPayload += payloadSize;

    ipStats.set(ip, stats);
}

function getFeatures(ip) {
    const stats = ipStats.get(ip);
    if (!stats) return [0, 0, 0]; // Якщо немає статистики, встановлюються нульові значення

    const requestRate = stats.requests.length; // Кількість запитів за останню хвилину
    const failedRequests = stats.failed;
    const avgPayloadSize = stats.totalPayload / stats.requests.length || 0;

    // return [requestRate, failedRequests, avgPayloadSize];
    return [avgPayloadSize, requestRate, failedRequests];
}

module.exports = { updateStats, getFeatures };

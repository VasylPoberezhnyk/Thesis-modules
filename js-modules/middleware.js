
const axios = require('axios');
const { updateStats, getFeatures } = require('./featureTracker');

async function checkConnection(req, res, next) {

    if (req.path === '/favicon.ico' || req.path === '/style.css') { 
        return next();
    }
    
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const bodylength = req.method === 'GET' ? 0 : JSON.stringify(req.body || {}).length;
        const payloadSize = bodylength;
        const isPost = req.method === 'POST' ? 1 : 0;
        const isGet = req.method === 'GET' ? 1 : 0;

        // Оновити статистику після відповіді
        res.on('finish', () => {
            updateStats(ip, payloadSize, res.statusCode);
        });

        // Виділення параметрів для перевірки в моделі
        const features = getFeatures(ip);
        console.log(`Features for IP ${ip}:`, isGet, isPost, ...features);

        const response = await axios.post('http://localhost:5000/predict', {
            features: [isGet, isPost, ...features]
        });

        if (response.data.prediction === -1) {
            return res.status(403).send('Заблоковано: Виявлено підозрілу активність.');
        }

        next();
    } catch (error) {
        console.error('Error checking connection:', error.message);
        return res.status(500).send('Internal error');
    }
}

module.exports = { checkConnection };

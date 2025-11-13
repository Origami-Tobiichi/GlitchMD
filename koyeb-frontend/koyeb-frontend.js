const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi
const BACKEND_URL = process.env.BACKEND_URL || 'https://takamiya.netlify.app';
const KOYEB_API_KEY = process.env.KOYEB_API_KEY || 'zzk3hg68nuqafhoezbco6ckz15dzm4tvvekij4g202cow4oxufe5gv843yywfxx9';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Proxy Routes - Terhubung ke Panel Backend
app.get('/api/status', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/status`);
        res.json({ 
            ...response.data, 
            frontend: 'Koyeb', 
            backend: 'Panel',
            integrated: true 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Cannot connect to backend',
            frontend: 'Koyeb',
            backend_url: BACKEND_URL,
            message: error.message
        });
    }
});

app.post('/api/pair', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/pair`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Backend connection failed',
            message: error.message 
        });
    }
});

app.post('/api/clear-session', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/clear-session`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Backend connection failed',
            message: error.message 
        });
    }
});

// Management APIs
app.get('/api/settings', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Cannot fetch settings',
            message: error.message 
        });
    }
});

app.post('/api/update-owner', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/update-owner`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to update owner',
            message: error.message 
        });
    }
});

// Premium Management
app.get('/api/premium-users', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/premium-users`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Cannot fetch premium users' });
    }
});

app.post('/api/add-premium', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/add-premium`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add premium user' });
    }
});

// Multi-Bot Management
app.get('/api/bots', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/bots`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Cannot fetch bots' });
    }
});

app.post('/api/add-bot', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/add-bot`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add bot' });
    }
});

// Koyeb-specific routes
app.get('/api/koyeb-status', async (req, res) => {
    try {
        res.json({
            koyeb: 'operational',
            frontend: 'Koyeb',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    } catch (error) {
        res.json({
            koyeb: 'degraded',
            frontend: 'Koyeb',
            timestamp: new Date().toISOString()
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check untuk Koyeb
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Koyeb Frontend',
        timestamp: new Date().toISOString(),
        backend_url: BACKEND_URL,
        version: '1.0.0'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Frontend Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        service: 'Koyeb Frontend'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════╗');
    console.log('║         🚀 KOYEB FRONTEND           ║');
    console.log('║        Integrated System            ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Backend: ${BACKEND_URL}`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);

});

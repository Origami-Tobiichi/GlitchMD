const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: [
        'https://gastric-ferdinanda-takamiyaryuuzak71-53a6ccec.koyeb.app/', // Ganti dengan domain Koyeb Anda
        'http://localhost:3000',
        '*'
    ],
    credentials: true
}));
app.use(express.json());

// Global variables untuk integrasi dengan bot
global.botStatus = 'Initializing...';
global.connectionStatus = 'initializing';
global.phoneNumber = null;
global.pairingCode = null;
global.botInfo = null;
global.owner = ['6282113821188'];
global.botname = 'Hitori Bot';
global.packname = 'Bot WhatsApp';
global.author = 'Nazedev';

// API Routes untuk frontend
app.get('/api/status', (req, res) => {
    res.json({
        status: global.botStatus,
        connection_status: global.connectionStatus,
        phone_number: global.phoneNumber,
        pairing_code: global.pairingCode,
        bot_info: global.botInfo,
        owner: global.owner,
        botname: global.botname,
        packname: global.packname,
        author: global.author,
        backend: 'Panel',
        timestamp: new Date().toISOString(),
        integrated: true
    });
});

app.post('/api/pair', (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Format phone number
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    global.phoneNumber = formattedNumber;
    global.connectionStatus = 'pairing';
    global.botStatus = 'Requesting pairing code...';
    
    // Simulasi proses pairing (akan diintegrasikan dengan bot WhatsApp)
    setTimeout(() => {
        global.pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        global.botStatus = 'Pairing code generated';
    }, 2000);
    
    res.json({ 
        status: 'success', 
        message: 'Pairing process started',
        phone: formattedNumber 
    });
});

app.post('/api/clear-session', (req, res) => {
    global.phoneNumber = null;
    global.pairingCode = null;
    global.botInfo = null;
    global.connectionStatus = 'initializing';
    global.botStatus = 'Session cleared';
    
    res.json({ status: 'success', message: 'Session cleared successfully' });
});

// Management APIs
app.get('/api/settings', (req, res) => {
    res.json({
        owner: global.owner,
        botname: global.botname,
        packname: global.packname,
        author: global.author,
        multi_bot: global.multiBot || { enabled: true, bots: [] },
        web_settings: global.webSettings || { adminPassword: 'admin123' }
    });
});

app.post('/api/update-owner', (req, res) => {
    const { owners } = req.body;
    
    if (!owners || !Array.isArray(owners)) {
        return res.status(400).json({ error: 'Owners must be an array' });
    }
    
    global.owner = owners;
    
    // Simpan ke database jika ada
    if (global.db && global.db.settings) {
        global.db.settings.owner = owners;
    }
    
    res.json({ 
        status: 'success', 
        message: 'Owner list updated', 
        owners: global.owner 
    });
});

// Panel-specific routes
app.get('/api/panel-status', (req, res) => {
    res.json({
        panel: 'operational',
        backend: 'Panel',
        bot_status: global.connectionStatus,
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Panel Backend',
        timestamp: new Date().toISOString(),
        bot_status: global.connectionStatus 
    });
});

// Start server
app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════╗');
    console.log('║         🔧 PANEL BACKEND            ║');
    console.log('║        Integrated System            ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Ready for Koyeb frontend`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

// Export untuk digunakan oleh bot WhatsApp
module.exports = {
    app,
    setBotStatus: (status) => { global.botStatus = status; },
    setConnectionStatus: (status) => { global.connectionStatus = status; },
    setPhoneNumber: (number) => { global.phoneNumber = number; },
    setPairingCode: (code) => { global.pairingCode = code; },
    setBotInfo: (info) => { global.botInfo = info; }

};

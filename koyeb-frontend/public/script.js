class WhatsAppBotFrontend {
    constructor() {
        this.backendUrl = window.location.origin;
        this.updateInterval = null;
        this.isConnected = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.startAutoUpdate();
        this.showNotification('Koyeb Frontend initialized', 'success');
    }

    bindEvents() {
        document.getElementById('refreshBtn').addEventListener('click', () => this.updateStatus());
        document.getElementById('connectBtn').addEventListener('click', () => this.startConnection());
        document.getElementById('clearSessionBtn').addEventListener('click', () => this.clearSession());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartBot());
    }

    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            this.updateUI(data);
            this.updateIntegrationStatus(true);
            
        } catch (error) {
            console.error('Error fetching status:', error);
            this.updateIntegrationStatus(false);
            this.showNotification('Cannot connect to backend', 'danger');
        }
    }

    updateUI(data) {
        // Update connection status
        document.getElementById('connectionStatus').textContent = data.connection_status || 'unknown';
        document.getElementById('statusText').textContent = data.connection_status || 'unknown';
        document.getElementById('statusBadge').textContent = data.connection_status || 'unknown';
        
        // Update status indicator
        const indicator = document.getElementById('statusIndicator');
        indicator.className = `status-indicator status-${data.connection_status || 'offline'}`;
        
        // Update phone info
        const phoneInfo = document.getElementById('phoneText');
        if (data.phone_number) {
            phoneInfo.textContent = `Connected: +${data.phone_number}`;
            document.getElementById('phoneInfo').style.display = 'block';
        } else {
            phoneInfo.textContent = 'No phone connected';
            document.getElementById('phoneInfo').style.display = 'block';
        }
        
        // Update pairing info
        const pairingInfo = document.getElementById('pairingInfo');
        if (data.pairing_code) {
            document.getElementById('pairingCodeDisplay').textContent = data.pairing_code;
            pairingInfo.style.display = 'block';
        } else {
            pairingInfo.style.display = 'none';
        }
        
        // Update system info
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        document.getElementById('apiStatus').textContent = 'Connected';
        document.getElementById('apiStatus').className = 'text-success';
    }

    updateIntegrationStatus(isConnected) {
        const statusElement = document.getElementById('integrationStatus');
        const backendStatus = document.getElementById('backendStatus');
        
        if (isConnected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'badge bg-success';
            backendStatus.textContent = 'Operational';
            backendStatus.className = 'badge bg-success';
            this.isConnected = true;
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'badge bg-danger';
            backendStatus.textContent = 'Offline';
            backendStatus.className = 'badge bg-danger';
            this.isConnected = false;
        }
    }

    async startConnection() {
        const phoneNumber = prompt('Enter your WhatsApp number (e.g., 6281234567890):');
        
        if (!phoneNumber) return;
        
        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showNotification('Invalid phone number format', 'danger');
            return;
        }
        
        try {
            const response = await fetch('/api/pair', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.showNotification('Pairing process started!', 'success');
                this.updateStatus();
            } else {
                this.showNotification(result.error || 'Failed to start pairing', 'danger');
            }
            
        } catch (error) {
            this.showNotification('Error starting pairing process', 'danger');
        }
    }

    async clearSession() {
        if (!confirm('Are you sure you want to clear the session? This will require re-authentication.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/clear-session', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.showNotification('Session cleared successfully', 'success');
                this.updateStatus();
            } else {
                this.showNotification('Failed to clear session', 'danger');
            }
            
        } catch (error) {
            this.showNotification('Error clearing session', 'danger');
        }
    }

    async restartBot() {
        if (!confirm('Restart the bot?')) {
            return;
        }
        
        this.showNotification('Restart command sent...', 'warning');
        // Note: You might want to implement a restart endpoint in the backend
    }

    validatePhoneNumber(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
    }

    startAutoUpdate() {
        this.updateStatus(); // Initial update
        this.updateInterval = setInterval(() => {
            this.updateStatus();
        }, 5000); // Update every 5 seconds
    }

    showNotification(message, type = 'info') {
        const notificationArea = document.getElementById('notificationArea');
        const notificationId = 'notif-' + Date.now();
        
        const icons = {
            success: 'fa-check-circle',
            danger: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `alert alert-${type} notification alert-dismissible fade show`;
        notification.innerHTML = `
            <i class="fas ${icons[type]} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="document.getElementById('${notificationId}').remove()"></button>
        `;
        
        notificationArea.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById(notificationId)) {
                document.getElementById(notificationId).remove();
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.whatsappBot = new WhatsAppBotFrontend();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.whatsappBot) {
        window.whatsappBot.updateStatus();
    }
});
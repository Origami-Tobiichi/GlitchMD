class WhatsAppBotFrontend {
    constructor() {
        this.backendUrl = window.location.origin;
        this.updateInterval = null;
        this.isConnected = false;
        this.pairingCountdown = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.startAutoUpdate();
        this.showNotification('Koyeb Frontend initialized', 'success');
    }

    bindEvents() {
        // Event untuk form submit
        document.getElementById('phoneForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Event untuk tombol lainnya
        document.getElementById('refreshBtn').addEventListener('click', () => this.updateStatus());
        document.getElementById('clearSessionBtn').addEventListener('click', () => this.clearSession());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartBot());
        
        // Tombol connect lama (fallback)
        document.getElementById('connectBtn').addEventListener('click', () => this.showPhoneForm());
    }

    // Handle form submit untuk nomor telepon
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const phoneInput = document.getElementById('phoneInput');
        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');
        const phone = phoneInput.value.trim();
        
        if (!phone) {
            formMessage.innerHTML = '<div class="alert alert-danger">Please enter a phone number</div>';
            return;
        }
        
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 8) {
            formMessage.innerHTML = '<div class="alert alert-danger">Phone number must be at least 8 digits</div>';
            return;
        }
        
        // Disable button dan show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
        formMessage.innerHTML = '';
        
        try {
            const response = await fetch('/api/pair', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber: phone })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                formMessage.innerHTML = '<div class="alert alert-success">Phone number accepted! Starting WhatsApp connection...</div>';
                this.showNotification('Phone number accepted! Starting connection...', 'success');
                
                // Sembunyikan form setelah berhasil
                document.getElementById('connectionSection').style.display = 'none';
                
            } else if (result.status === 'rate_limited') {
                formMessage.innerHTML = '<div class="alert alert-warning">Too many attempts. Please wait before trying again.</div>';
                this.showNotification(result.message, 'warning');
            } else {
                formMessage.innerHTML = '<div class="alert alert-danger">Error: ' + (result.message || result.error) + '</div>';
            }
            
        } catch (error) {
            formMessage.innerHTML = '<div class="alert alert-danger">Network error: Could not connect to server</div>';
            console.error('Connection error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Start Connection';
        }
    }

    // Fallback untuk tombol connect lama
    showPhoneForm() {
        const connectionSection = document.getElementById('connectionSection');
        connectionSection.style.display = 'block';
        document.getElementById('phoneInput').focus();
    }

    // Update UI dengan data dari backend
    updateUI(data) {
        // Update connection status
        document.getElementById('connectionStatus').textContent = data.connection_status || 'unknown';
        document.getElementById('statusText').textContent = data.connection_status || 'unknown';
        document.getElementById('statusBadge').textContent = data.connection_status || 'unknown';
        
        // Update status indicator
        const indicator = document.getElementById('statusIndicator');
        indicator.className = `status-indicator status-${data.connection_status || 'offline'}`;
        
        // Update phone info
        const phoneInfo = document.getElementById('phoneInfo');
        const phoneText = document.getElementById('phoneText');
        
        if (data.phone_number) {
            phoneText.textContent = `Connected: +${data.phone_number}`;
            phoneInfo.style.display = 'block';
            // Sembunyikan form connection jika sudah ada nomor
            document.getElementById('connectionSection').style.display = 'none';
        } else {
            phoneText.textContent = 'No phone connected';
            phoneInfo.style.display = 'block';
            // Tampilkan form connection jika belum ada nomor
            document.getElementById('connectionSection').style.display = 'block';
        }
        
        // Update pairing info
        const pairingInfo = document.getElementById('pairingInfo');
        if (data.pairing_code) {
            document.getElementById('pairingCodeDisplay').textContent = data.pairing_code;
            pairingInfo.style.display = 'block';
            this.startPairingCountdown();
        } else {
            pairingInfo.style.display = 'none';
            this.stopPairingCountdown();
        }
        
        // Update system info
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        document.getElementById('apiStatus').textContent = 'Connected';
        document.getElementById('apiStatus').className = 'text-success';
        
        // Update badge colors berdasarkan status
        this.updateStatusBadge(data.connection_status);
    }

    // Countdown untuk pairing code
    startPairingCountdown() {
        this.stopPairingCountdown();
        
        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        
        this.pairingCountdown = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                this.stopPairingCountdown();
                this.showNotification('Pairing code expired', 'warning');
            }
        }, 1000);
    }

    stopPairingCountdown() {
        if (this.pairingCountdown) {
            clearInterval(this.pairingCountdown);
            this.pairingCountdown = null;
        }
    }

    // Update warna badge berdasarkan status
    updateStatusBadge(status) {
        const badge = document.getElementById('statusBadge');
        const statusColors = {
            'online': 'bg-success',
            'offline': 'bg-danger',
            'connecting': 'bg-warning',
            'pairing': 'bg-info',
            'initializing': 'bg-secondary'
        };
        
        // Remove all status classes
        badge.className = 'badge';
        // Add appropriate class
        badge.classList.add(statusColors[status] || 'bg-secondary');
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
                // Tampilkan kembali form connection
                document.getElementById('connectionSection').style.display = 'block';
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
    }

    validatePhoneNumber(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 8 && cleanPhone.length <= 15;
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

// Cleanup pada page unload
window.addEventListener('beforeunload', function() {
    if (window.whatsappBot && window.whatsappBot.pairingCountdown) {
        window.whatsappBot.stopPairingCountdown();
    }
});

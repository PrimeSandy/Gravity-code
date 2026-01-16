class PasswordGenerator {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.initSettings();
        this.generatePassword();
        this.loadHistory();
    }

    initElements() {
        // Password display
        this.passwordDisplay = document.getElementById('passwordDisplay');
        this.passwordLengthBadge = document.getElementById('passwordLengthBadge');

        // Strength meter
        this.strengthText = document.getElementById('strengthText');
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthHint = document.getElementById('strengthHint');

        // Settings controls
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');

        // Character toggles
        this.uppercaseToggle = document.getElementById('uppercaseToggle');
        this.lowercaseToggle = document.getElementById('lowercaseToggle');
        this.numbersToggle = document.getElementById('numbersToggle');
        this.symbolsToggle = document.getElementById('symbolsToggle');

        // Buttons
        this.copyBtn = document.getElementById('copyBtn');
        this.toggleVisibility = document.getElementById('toggleVisibility');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.clearHistory = document.getElementById('clearHistory');
        this.historyBtn = document.getElementById('historyBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.tipsBtn = document.getElementById('tipsBtn');
        this.settingsBtn = document.getElementById('settingsBtn');

        // History
        this.historyList = document.getElementById('historyList');
        this.historyPanel = document.getElementById('historyPanel');

        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        this.toastIcon = document.getElementById('toastIcon');
        this.toastClose = document.getElementById('toastClose');

        // Stats
        this.totalGenerated = document.getElementById('totalGenerated');
        this.totalCopied = document.getElementById('totalCopied');
        this.totalSaved = document.getElementById('totalSaved');
        this.currentStrength = document.getElementById('currentStrength');

        // Character sets
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Current password
        this.currentPassword = '';
        this.isPasswordVisible = true; // Default visible for better UX

        // Settings
        this.settings = {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
            theme: 'dark'
        };

        // Statistics
        this.stats = {
            generated: 0,
            copied: 0,
            saved: 0,
            strengthSum: 0
        };

        // History
        this.history = [];

        // Load saved data
        this.loadAllData();
    }

    initEventListeners() {
        // Generate password on load
        document.addEventListener('DOMContentLoaded', () => {
            this.generatePassword();
        });

        // Slider events
        this.lengthSlider.addEventListener('input', (e) => this.updateLength(e.target.value));
        this.lengthSlider.addEventListener('change', () => this.generatePassword());

        // Toggle events
        this.uppercaseToggle.addEventListener('change', () => {
            this.updateSetting('uppercase', this.uppercaseToggle.checked);
            this.generatePassword();
        });
        this.lowercaseToggle.addEventListener('change', () => {
            this.updateSetting('lowercase', this.lowercaseToggle.checked);
            this.generatePassword();
        });
        this.numbersToggle.addEventListener('change', () => {
            this.updateSetting('numbers', this.numbersToggle.checked);
            this.generatePassword();
        });
        this.symbolsToggle.addEventListener('change', () => {
            this.updateSetting('symbols', this.symbolsToggle.checked);
            this.generatePassword();
        });

        // Button events
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.toggleVisibility.addEventListener('click', () => this.togglePasswordVisibility());
        this.refreshBtn.addEventListener('click', () => this.generatePassword());
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.saveBtn.addEventListener('click', () => this.savePassword());
        this.clearHistory.addEventListener('click', () => this.clearHistoryConfirm());

        if (this.historyBtn) this.historyBtn.addEventListener('click', () => this.toggleHistoryPanel());
        if (this.themeToggle) this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Quick action buttons
        if (this.exportBtn) this.exportBtn.addEventListener('click', () => this.exportHistory());
        if (this.importBtn) this.importBtn.addEventListener('click', () => this.importHistory());
        if (this.tipsBtn) this.tipsBtn.addEventListener('click', () => this.showSecurityTips());
        if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.showSettings());

        // Toast close
        this.toastClose.addEventListener('click', () => this.hideToast());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                // e.preventDefault(); // Don't prevent default copy if user selected text
                // this.copyPassword();
            }
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                this.generatePassword();
            }
        });
    }

    initSettings() {
        // Set initial values
        this.lengthSlider.value = this.settings.length;
        this.lengthValue.textContent = this.settings.length;
        this.passwordLengthBadge.textContent = `${this.settings.length} chars`;

        this.uppercaseToggle.checked = this.settings.uppercase;
        this.lowercaseToggle.checked = this.settings.lowercase;
        this.numbersToggle.checked = this.settings.numbers;
        this.symbolsToggle.checked = this.settings.symbols;

        // Apply theme
        if (this.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    updateLength(value) {
        this.settings.length = parseInt(value);
        this.lengthValue.textContent = value;
        this.passwordLengthBadge.textContent = `${value} chars`;
        this.saveSettings();
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();

        if (!this.settings.uppercase && !this.settings.lowercase &&
            !this.settings.numbers && !this.settings.symbols) {
            this.settings.lowercase = true;
            this.lowercaseToggle.checked = true;
            this.showToast('At least one character set must be enabled', 'warning');
            this.saveSettings();
        }
    }

    generatePassword() {
        let characters = '';

        if (this.settings.uppercase) characters += this.charSets.uppercase;
        if (this.settings.lowercase) characters += this.charSets.lowercase;
        if (this.settings.numbers) characters += this.charSets.numbers;
        if (this.settings.symbols) characters += this.charSets.symbols;

        if (characters === '') {
            characters = this.charSets.lowercase;
            this.settings.lowercase = true;
            this.lowercaseToggle.checked = true;
            this.saveSettings();
        }

        const array = new Uint32Array(this.settings.length);
        crypto.getRandomValues(array);

        let password = '';
        for (let i = 0; i < this.settings.length; i++) {
            password += characters[array[i] % characters.length];
        }

        this.currentPassword = password;
        this.updatePasswordDisplay();
        this.updateStrengthMeter(password);

        this.stats.generated++;
        this.updateStats();
        this.saveStats();
    }

    updatePasswordDisplay() {
        const displayText = this.isPasswordVisible ? this.currentPassword : '•'.repeat(this.currentPassword.length);
        this.passwordDisplay.textContent = displayText;

        const icon = this.toggleVisibility.querySelector('.material-symbols-outlined');
        icon.textContent = this.isPasswordVisible ? 'visibility' : 'visibility_off';
    }

    updateStrengthMeter(password) {
        let score = 0;
        const hints = [];

        if (password.length >= 20) score += 3;
        else if (password.length >= 16) score += 2;
        else if (password.length >= 12) score += 1;

        if (/[A-Z]/.test(password)) { score += 1; hints.push('uppercase'); }
        if (/[a-z]/.test(password)) { score += 1; hints.push('lowercase'); }
        if (/[0-9]/.test(password)) { score += 1; hints.push('numbers'); }
        if (/[^A-Za-z0-9]/.test(password)) { score += 1; hints.push('symbols'); }

        const uniqueChars = new Set(password).size;
        if (uniqueChars < password.length / 2) score -= 1;

        score = Math.max(0, Math.min(7, score));
        const percentage = Math.min(100, (score / 7) * 100);

        let level, color, text;

        if (percentage >= 85) {
            level = 'very-strong';
            color = '#10b981'; // Emerald 500
            text = 'Very Strong';
        } else if (percentage >= 70) {
            level = 'strong';
            color = '#34d399'; // Emerald 400
            text = 'Strong';
        } else if (percentage >= 50) {
            level = 'medium';
            color = '#fbbf24'; // Amber 400
            text = 'Medium';
        } else {
            level = 'weak';
            color = '#f87171'; // Red 400
            text = 'Weak';
        }

        this.strengthBar.style.width = `${percentage}%`;
        this.strengthBar.style.backgroundColor = color;
        this.strengthText.textContent = text;
        this.strengthText.style.color = color;

        this.stats.strengthSum += percentage;
        this.currentStrength.textContent = `${Math.round(this.stats.strengthSum / this.stats.generated)}%`;
    }

    copyPassword() {
        if (!this.currentPassword) return;

        navigator.clipboard.writeText(this.currentPassword).then(() => {
            this.showToast('Password copied!', 'success');

            this.stats.copied++;
            this.updateStats();
            this.saveStats();
        });
    }

    togglePasswordVisibility() {
        this.isPasswordVisible = !this.isPasswordVisible;
        this.updatePasswordDisplay();
    }

    savePassword() {
        if (!this.currentPassword) return;

        const passwordData = {
            id: Date.now(),
            password: this.currentPassword,
            timestamp: new Date().toLocaleString(),
            length: this.currentPassword.length,
            strength: this.strengthText.textContent,
            settings: { ...this.settings }
        };

        this.history.unshift(passwordData);
        if (this.history.length > 50) this.history.pop();

        this.saveHistory();
        this.loadHistory();

        this.stats.saved++;
        this.updateStats();
        this.saveStats();

        this.showToast('Saved to history', 'success');
    }

    loadHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl opacity-50 mb-2">history</span>
                    <p class="text-sm">No history yet</p>
                </div>
            `;
            return;
        }

        let historyHTML = '';
        this.history.forEach((item) => {
            // Glassmorphism styling for history items
            historyHTML += `
                <div class="history-item p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group" data-id="${item.id}">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="font-mono text-sm text-gray-200 mb-1 truncate">${item.password}</div>
                            <div class="flex items-center gap-2 text-xs text-gray-500">
                                <span>${item.length} chars</span>
                                <span class="text-gray-600">•</span>
                                <span class="${this.getStrengthColor(item.strength)}">${item.strength}</span>
                            </div>
                        </div>
                        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="copy-history p-1.5 rounded text-gray-400 hover:text-white" title="Copy">
                                <span class="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                            <button class="delete-history p-1.5 rounded text-gray-400 hover:text-red-400" title="Delete">
                                <span class="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        this.historyList.innerHTML = historyHTML;

        this.historyList.querySelectorAll('.history-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const historyItem = this.history.find(h => h.id === id);

            item.querySelector('.copy-history').addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(historyItem.password).then(() => {
                    this.showToast('Copied from history', 'success');
                });
            });

            item.querySelector('.delete-history').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteHistoryItem(id);
            });

            item.addEventListener('click', () => {
                // Optional: Load this password back into main display? 
                // For now just copy it makes sense or do nothing
                this.currentPassword = historyItem.password;
                this.updatePasswordDisplay();
            });
        });
    }

    getStrengthColor(strength) {
        // Return text color classes for history items
        switch (strength.toLowerCase()) {
            case 'very strong': return 'text-emerald-400';
            case 'strong': return 'text-emerald-300';
            case 'medium': return 'text-amber-400';
            case 'weak': return 'text-red-400';
            default: return 'text-gray-400';
        }
    }

    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.loadHistory();
    }

    clearHistoryConfirm() {
        if (this.history.length === 0) return;
        if (confirm('Clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.loadHistory();
            this.showToast('History cleared', 'success');
        }
    }

    toggleHistoryPanel() {
        // No-op for now as panel is always visible in desktop layout
    }

    toggleTheme() {
        // Theme is currently enforced to dark in new UI
    }

    // Helper stubs for quick actions if we implement them later
    exportHistory() { }
    importHistory() { }
    showSecurityTips() { }
    showSettings() { }

    showToast(message, type = 'info') {
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

        this.toastMessage.textContent = message;
        this.toastIcon.textContent = icons[type] || 'info';

        // Show
        this.toast.style.opacity = '1';
        this.toast.style.transform = 'translateY(0)';

        // Hide
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => this.hideToast(), 3000);
    }

    hideToast() {
        this.toast.style.opacity = '0';
        this.toast.style.transform = 'translateY(20px)';
    }

    updateStats() {
        if (this.totalGenerated) this.totalGenerated.textContent = this.stats.generated;
        if (this.totalCopied) this.totalCopied.textContent = this.stats.copied;
        if (this.totalSaved) this.totalSaved.textContent = this.stats.saved;

        const avgStrength = this.stats.generated > 0
            ? Math.round(this.stats.strengthSum / this.stats.generated)
            : 0;
        if (this.currentStrength) this.currentStrength.textContent = `${avgStrength}%`;
    }

    saveSettings() { localStorage.setItem('passwordGeneratorSettings', JSON.stringify(this.settings)); }
    saveStats() { localStorage.setItem('passwordGeneratorStats', JSON.stringify(this.stats)); }
    saveHistory() { localStorage.setItem('passwordGeneratorHistory', JSON.stringify(this.history)); }

    loadAllData() {
        // Simple load without strict schema validation for now
        try {
            const s = localStorage.getItem('passwordGeneratorSettings');
            if (s) this.settings = { ...this.settings, ...JSON.parse(s) };

            const st = localStorage.getItem('passwordGeneratorStats');
            if (st) this.stats = JSON.parse(st);

            const h = localStorage.getItem('passwordGeneratorHistory');
            if (h) this.history = JSON.parse(h);
        } catch (e) { }

        this.initSettings();
        this.updateStats();
        this.loadHistory();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.passwordGenerator = new PasswordGenerator();
});
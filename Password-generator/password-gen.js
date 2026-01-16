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
        this.isPasswordVisible = false;
        
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
        this.historyBtn.addEventListener('click', () => this.toggleHistoryPanel());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Quick action buttons
        this.exportBtn.addEventListener('click', () => this.exportHistory());
        this.importBtn.addEventListener('click', () => this.importHistory());
        this.tipsBtn.addEventListener('click', () => this.showSecurityTips());
        this.settingsBtn.addEventListener('click', () => this.showSettings());

        // Toast close
        this.toastClose.addEventListener('click', () => this.hideToast());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+C or Cmd+C to copy
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                this.copyPassword();
            }
            // Space to generate new
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                this.generatePassword();
            }
            // Escape to hide history
            if (e.key === 'Escape') {
                this.historyPanel.classList.add('hidden');
            }
        });

        // Auto-hide toast after 3 seconds
        setInterval(() => {
            if (this.toast.style.opacity === '1') {
                this.hideToast();
            }
        }, 3000);
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
            this.themeToggle.querySelector('.material-symbols-outlined').textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
            this.themeToggle.querySelector('.material-symbols-outlined').textContent = 'dark_mode';
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
        
        // Ensure at least one character set is selected
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
        
        // Build character pool
        if (this.settings.uppercase) characters += this.charSets.uppercase;
        if (this.settings.lowercase) characters += this.charSets.lowercase;
        if (this.settings.numbers) characters += this.charSets.numbers;
        if (this.settings.symbols) characters += this.charSets.symbols;
        
        // Fallback to lowercase if nothing selected
        if (characters === '') {
            characters = this.charSets.lowercase;
            this.settings.lowercase = true;
            this.lowercaseToggle.checked = true;
            this.saveSettings();
        }
        
        // Generate secure password using crypto API
        const array = new Uint32Array(this.settings.length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < this.settings.length; i++) {
            password += characters[array[i] % characters.length];
        }
        
        // Store and display
        this.currentPassword = password;
        this.updatePasswordDisplay();
        
        // Update strength meter
        this.updateStrengthMeter(password);
        
        // Update stats
        this.stats.generated++;
        this.updateStats();
        this.saveStats();
        
        // Show success message
        this.showToast('New password generated', 'success');
    }

    updatePasswordDisplay() {
        const displayText = this.isPasswordVisible ? this.currentPassword : '•'.repeat(this.currentPassword.length);
        this.passwordDisplay.textContent = displayText;
        
        // Update visibility icon
        const icon = this.toggleVisibility.querySelector('.material-symbols-outlined');
        icon.textContent = this.isPasswordVisible ? 'visibility_off' : 'visibility';
    }

    updateStrengthMeter(password) {
        let score = 0;
        const hints = [];
        
        // Length score (max 3 points)
        if (password.length >= 20) score += 3;
        else if (password.length >= 16) score += 2;
        else if (password.length >= 12) score += 1;
        
        // Character variety (max 4 points)
        if (/[A-Z]/.test(password)) {
            score += 1;
            hints.push('uppercase');
        }
        if (/[a-z]/.test(password)) {
            score += 1;
            hints.push('lowercase');
        }
        if (/[0-9]/.test(password)) {
            score += 1;
            hints.push('numbers');
        }
        if (/[^A-Za-z0-9]/.test(password)) {
            score += 1;
            hints.push('symbols');
        }
        
        // Deduct for repeated patterns
        const uniqueChars = new Set(password).size;
        if (uniqueChars < password.length / 2) score -= 1;
        
        // Ensure score is between 0 and 7
        score = Math.max(0, Math.min(7, score));
        
        // Calculate percentage and determine level
        const percentage = (score / 7) * 100;
        let level, color, text;
        
        if (percentage >= 85) {
            level = 'very-strong';
            color = '#3b82f6';
            text = 'Very Strong';
        } else if (percentage >= 70) {
            level = 'strong';
            color = '#10b981';
            text = 'Strong';
        } else if (percentage >= 50) {
            level = 'medium';
            color = '#f59e0b';
            text = 'Medium';
        } else {
            level = 'weak';
            color = '#ef4444';
            text = 'Weak';
        }
        
        // Update display
        this.strengthBar.style.width = `${percentage}%`;
        this.strengthBar.style.backgroundColor = color;
        this.strengthText.textContent = text;
        this.strengthText.className = `text-sm font-medium strength-${level}`;
        
        // Update hint
        if (hints.length > 0) {
            const hintText = hints.map(h => {
                switch(h) {
                    case 'uppercase': return 'uppercase letters';
                    case 'lowercase': return 'lowercase letters';
                    case 'numbers': return 'numbers';
                    case 'symbols': return 'symbols';
                    default: return h;
                }
            }).join(', ');
            this.strengthHint.textContent = `Contains ${hintText}`;
        } else {
            this.strengthHint.textContent = 'Add character sets for better security';
        }
        
        // Update average strength
        this.stats.strengthSum += percentage;
        this.currentStrength.textContent = `${Math.round(this.stats.strengthSum / this.stats.generated)}%`;
    }

    copyPassword() {
        if (!this.currentPassword) return;
        
        navigator.clipboard.writeText(this.currentPassword).then(() => {
            this.showToast('Password copied to clipboard', 'success');
            
            // Visual feedback
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span><span>Copied!</span>';
            this.copyBtn.classList.remove('bg-primary-500');
            this.copyBtn.classList.add('bg-emerald-500');
            
            // Update stats
            this.stats.copied++;
            this.updateStats();
            this.saveStats();
            
            // Reset button after 2 seconds
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
                this.copyBtn.classList.remove('bg-emerald-500');
                this.copyBtn.classList.add('bg-primary-500');
            }, 2000);
            
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy password', 'error');
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
        
        // Add to history
        this.history.unshift(passwordData);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        // Save and update display
        this.saveHistory();
        this.loadHistory();
        
        // Update stats
        this.stats.saved++;
        this.updateStats();
        this.saveStats();
        
        this.showToast('Password saved to history', 'success');
    }

    loadHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="text-center py-8 text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined text-4xl opacity-50 mb-2">history</span>
                    <p class="text-sm">No password history yet</p>
                    <p class="text-xs mt-1">Generated passwords will appear here</p>
                </div>
            `;
            return;
        }
        
        let historyHTML = '';
        this.history.forEach((item, index) => {
            const strengthColor = this.getStrengthColor(item.strength);
            const maskedPassword = '•'.repeat(item.length);
            
            historyHTML += `
                <div class="history-item p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer" data-id="${item.id}">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="password-mono text-sm font-medium mb-1">${maskedPassword}</div>
                            <div class="flex items-center gap-2 text-xs">
                                <span class="text-slate-500 dark:text-slate-400">${item.timestamp}</span>
                                <span class="px-1.5 py-0.5 rounded text-xs ${strengthColor}">${item.strength}</span>
                                <span class="text-slate-400">•</span>
                                <span class="text-slate-500 dark:text-slate-400">${item.length} chars</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <button class="copy-history p-1.5 rounded text-slate-400 hover:text-primary-500 transition-colors" title="Copy password">
                                <span class="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                            <button class="delete-history p-1.5 rounded text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                <span class="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.historyList.innerHTML = historyHTML;
        
        // Add event listeners to history items
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const historyItem = this.history.find(h => h.id === id);
            
            // Copy from history
            item.querySelector('.copy-history').addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(historyItem.password).then(() => {
                    this.showToast('Password copied from history', 'success');
                    this.stats.copied++;
                    this.updateStats();
                    this.saveStats();
                });
            });
            
            // Delete from history
            item.querySelector('.delete-history').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteHistoryItem(id);
            });
            
            // Click to load
            item.addEventListener('click', () => {
                this.currentPassword = historyItem.password;
                this.settings.length = historyItem.length;
                this.settings.uppercase = historyItem.settings.uppercase;
                this.settings.lowercase = historyItem.settings.lowercase;
                this.settings.numbers = historyItem.settings.numbers;
                this.settings.symbols = historyItem.settings.symbols;
                
                // Update UI
                this.updatePasswordDisplay();
                this.initSettings();
                this.generatePassword(); // This will update strength meter
                this.showToast('Password loaded from history', 'info');
            });
        });
    }

    getStrengthColor(strength) {
        switch(strength.toLowerCase()) {
            case 'very strong': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'strong': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
            case 'weak': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
        }
    }

    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.loadHistory();
        this.showToast('Password removed from history', 'info');
    }

    clearHistoryConfirm() {
        if (this.history.length === 0) {
            this.showToast('History is already empty', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all password history? This action cannot be undone.')) {
            this.history = [];
            this.saveHistory();
            this.loadHistory();
            this.showToast('History cleared', 'success');
        }
    }

    toggleHistoryPanel() {
        if (window.innerWidth < 1024) {
            // For mobile, show modal
            this.showMobileHistory();
        } else {
            this.historyPanel.classList.toggle('hidden');
        }
    }

    showMobileHistory() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 class="font-semibold text-lg text-slate-900 dark:text-white">Password History</h3>
                    <button class="close-history p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-4">
                    ${this.historyList.innerHTML}
                </div>
                <div class="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button class="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors" id="mobileClearHistory">
                        Clear All History
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-history').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#mobileClearHistory')?.addEventListener('click', () => {
            this.clearHistoryConfirm();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const icon = this.themeToggle.querySelector('.material-symbols-outlined');
        
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            this.settings.theme = 'light';
            icon.textContent = 'dark_mode';
        } else {
            html.classList.add('dark');
            this.settings.theme = 'dark';
            icon.textContent = 'light_mode';
        }
        
        this.saveSettings();
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showToast('No history to export', 'warning');
            return;
        }
        
        const data = {
            version: '1.0',
            exported: new Date().toISOString(),
            count: this.history.length,
            passwords: this.history
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `password-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('History exported successfully', 'success');
    }

    importHistory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.passwords && Array.isArray(data.passwords)) {
                        // Merge with existing history
                        this.history = [...data.passwords, ...this.history];
                        // Keep only unique IDs
                        this.history = this.history.filter((item, index, self) =>
                            index === self.findIndex((t) => t.id === item.id)
                        );
                        // Keep only last 50 items
                        if (this.history.length > 50) {
                            this.history = this.history.slice(0, 50);
                        }
                        
                        this.saveHistory();
                        this.loadHistory();
                        this.showToast(`Imported ${data.count} passwords`, 'success');
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (err) {
                    this.showToast('Failed to import history', 'error');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    showSecurityTips() {
        const tips = [
            "🔐 Use passwords with at least 12 characters",
            "🎯 Include a mix of uppercase, lowercase, numbers, and symbols",
            "🚫 Avoid using personal information (names, birthdays)",
            "🔄 Use unique passwords for each account",
            "💾 Consider using a password manager",
            "🔑 Enable two-factor authentication (2FA)",
            "📅 Change passwords every 3-6 months",
            "⚠️ Avoid common patterns and dictionary words",
            "🔒 Never share passwords via email or text",
            "📱 Use biometric authentication when available"
        ];
        
        alert("🔒 Security Best Practices:\n\n" + tips.map((tip, i) => `${tip}`).join('\n\n'));
    }

    showSettings() {
        const settings = {
            'Auto-copy': false,
            'Auto-save': true,
            'Clear clipboard after': '1 minute',
            'Default length': this.settings.length,
            'Strength threshold': 'Medium',
            'Export format': 'JSON'
        };
        
        let settingsText = "Settings:\n\n";
        for (const [key, value] of Object.entries(settings)) {
            settingsText += `${key}: ${value}\n`;
        }
        
        alert(settingsText);
    }

    showToast(message, type = 'info') {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        
        const colors = {
            success: 'text-emerald-400',
            error: 'text-red-400',
            warning: 'text-amber-400',
            info: 'text-blue-400'
        };
        
        this.toastMessage.textContent = message;
        this.toastIcon.textContent = icons[type];
        this.toastIcon.className = `material-symbols-outlined ${colors[type]}`;
        
        // Show toast with animation
        this.toast.style.opacity = '1';
        this.toast.style.transform = 'translateY(0)';
        
        // Auto-hide after 3 seconds
        setTimeout(() => this.hideToast(), 3000);
    }

    hideToast() {
        this.toast.style.opacity = '0';
        this.toast.style.transform = 'translateY(10px)';
    }

    updateStats() {
        this.totalGenerated.textContent = this.stats.generated;
        this.totalCopied.textContent = this.stats.copied;
        this.totalSaved.textContent = this.stats.saved;
        
        const avgStrength = this.stats.generated > 0 
            ? Math.round(this.stats.strengthSum / this.stats.generated)
            : 0;
        this.currentStrength.textContent = `${avgStrength}%`;
    }

    saveSettings() {
        localStorage.setItem('passwordGeneratorSettings', JSON.stringify(this.settings));
    }

    saveStats() {
        localStorage.setItem('passwordGeneratorStats', JSON.stringify(this.stats));
    }

    saveHistory() {
        localStorage.setItem('passwordGeneratorHistory', JSON.stringify(this.history));
    }

    loadAllData() {
        // Load settings
        const savedSettings = localStorage.getItem('passwordGeneratorSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        
        // Load stats
        const savedStats = localStorage.getItem('passwordGeneratorStats');
        if (savedStats) {
            try {
                this.stats = JSON.parse(savedStats);
            } catch (e) {
                console.error('Error loading stats:', e);
            }
        }
        
        // Load history
        const savedHistory = localStorage.getItem('passwordGeneratorHistory');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
        
        // Initialize UI with loaded data
        this.initSettings();
        this.updateStats();
        this.loadHistory();
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.passwordGenerator = new PasswordGenerator();
});
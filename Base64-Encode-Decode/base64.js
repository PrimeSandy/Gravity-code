// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const base64Input = document.getElementById('base64-input');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const homeButton = document.getElementById('home-button');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const statusEl = document.getElementById('status');
const charCount = document.getElementById('char-count');
const desktopCharCount = document.getElementById('desktop-char-count');
const inputSize = document.getElementById('input-size');
const outputSize = document.getElementById('output-size');
const lastAction = document.getElementById('last-action');
const historyList = document.getElementById('history-list');
const copyIcon = document.getElementById('copy-icon');
const encodeIcon = document.getElementById('encode-icon');
const decodeIcon = document.getElementById('decode-icon');
const helpBtn = document.getElementById('help-btn');
const aboutBtn = document.getElementById('about-btn');
const quickActionEncode = document.querySelector('.quick-action-encode');
const quickActionDecode = document.querySelector('.quick-action-decode');
const quickActionCopy = document.querySelector('.quick-action-copy');

// State Variables
let history = [];
let lastOperation = null;
let originalText = '';
let currentText = '';

// Loading Simulation Function
function simulateLoading() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
}

// Hide Loading Screen and Show Content
function showContent() {
    loadingScreen.classList.add('hidden');
    mainContent.classList.remove('blur-content');
    mainContent.classList.add('content-loaded');
    
    setTimeout(() => {
        base64Input.focus();
    }, 300);
}

// Initialize
async function initializeApp() {
    loadingScreen.classList.remove('hidden');
    mainContent.classList.add('blur-content');
    
    await simulateLoading();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'dark_mode';
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('base64History');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        renderHistory();
    }

    // Set initial sample text
    const sampleText = "Welcome to Base64 Utility! 🎉\n\nTry encoding this text or paste your own Base64 string to decode.\n\nExample Base64 string:\nV2VsY29tZSB0byBCYXNlNjQgVXRpbGl0eSEg8J+NiQoKVHJ5IGVuY29kaW5nIHRoaXMgdGV4dCBvciBwYXN0ZSB5b3VyIG93biBCYXNlNjQgc3RyaW5nIHRvIGRlY29kZS4KCkV4YW1wbGUgQmFzZTY0IHN0cmluZzo=";
    base64Input.value = sampleText;
    originalText = sampleText;
    currentText = sampleText;
    updateStatistics();
    updateStatus('ready');
    
    setTimeout(showContent, 300);
}

// Base64 Encoding Function
function encodeBase64(text) {
    try {
        const base64 = btoa(unescape(encodeURIComponent(text)));
        return base64;
    } catch (error) {
        throw new Error('Encoding failed. Please check your input.');
    }
}

// Base64 Decoding Function
function decodeBase64(base64) {
    try {
        const text = decodeURIComponent(escape(atob(base64)));
        return text;
    } catch (error) {
        throw new Error('Decoding failed. Invalid Base64 string.');
    }
}

// Validate Base64 string
function isValidBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

// Update Statistics
function updateStatistics() {
    const text = base64Input.value;
    const chars = text.length;
    const bytes = new Blob([text]).size;
    
    charCount.textContent = `${chars} chars`;
    desktopCharCount.textContent = `${chars} chars`;
    inputSize.textContent = `${formatBytes(bytes)}`;
    
    // Calculate output size
    let outputBytes = 0;
    if (lastOperation === 'encode') {
        const encoded = encodeBase64(text);
        outputBytes = new Blob([encoded]).size;
    } else if (lastOperation === 'decode') {
        try {
            const decoded = decodeBase64(text);
            outputBytes = new Blob([decoded]).size;
        } catch (e) {
            outputBytes = 0;
        }
    } else {
        outputBytes = bytes;
    }
    
    outputSize.textContent = `${formatBytes(outputBytes)}`;
}

// Format bytes to human readable format
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update Status
function updateStatus(status, message = '') {
    statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch(status) {
        case 'ready':
            statusEl.className = 'text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full';
            break;
        case 'encoding':
            statusEl.className = 'text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full';
            break;
        case 'decoding':
            statusEl.className = 'text-sm font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full';
            break;
        case 'success':
            statusEl.className = 'text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full';
            break;
        case 'error':
            statusEl.className = 'text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full';
            break;
    }
    
    if (message) {
        lastAction.textContent = message;
    }
}

// Add to History
function addToHistory(action, input, output) {
    const timestamp = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    const historyItem = {
        action: action,
        input: input.length > 25 ? input.substring(0, 25) + '...' : input,
        output: output.length > 25 ? output.substring(0, 25) + '...' : output,
        time: timestamp,
        fullInput: input,
        fullOutput: output
    };
    
    history.unshift(historyItem);
    if (history.length > 8) history.pop();
    
    localStorage.setItem('base64History', JSON.stringify(history));
    renderHistory();
}

// Render History
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-8 text-[#616f89] dark:text-[#A0AEC0] text-sm">
                <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">history_toggle_off</span>
                No actions yet
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="bg-[#f9fafb] dark:bg-[#151a23] rounded-lg p-3 cursor-pointer hover:bg-[#f0f2f4] dark:hover:bg-[#1a202c] transition-colors group"
             onclick="loadFromHistory(${index})">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold ${item.action === 'encode' ? 'text-primary' : 'text-secondary'}">
                    ${item.action === 'encode' ? 'Encode' : 'Decode'}
                </span>
                <span class="text-xs text-[#616f89] dark:text-[#A0AEC0]">${item.time}</span>
            </div>
            <div class="text-xs text-[#616f89] dark:text-[#A0AEC0] mb-1 truncate">
                <span class="font-medium">In:</span> ${item.input}
            </div>
            <div class="text-xs text-[#616f89] dark:text-[#A0AEC0] truncate">
                <span class="font-medium">Out:</span> ${item.output}
            </div>
            <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-xs text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                    Click to load
                </span>
            </div>
        </div>
    `).join('');
}

// Load from History
window.loadFromHistory = function(index) {
    const item = history[index];
    if (item) {
        base64Input.value = item.fullOutput;
        originalText = item.fullInput;
        currentText = item.fullOutput;
        updateStatistics();
        updateStatus('ready', `Loaded ${item.action} from history`);
        lastOperation = item.action;
    }
};

// Encode Text
window.encodeText = function() {
    const text = base64Input.value;
    if (!text.trim()) {
        updateStatus('error', 'Please enter text to encode');
        return;
    }
    
    try {
        updateStatus('encoding', 'Encoding to Base64...');
        
        setTimeout(() => {
            const encoded = encodeBase64(text);
            base64Input.value = encoded;
            originalText = text;
            currentText = encoded;
            lastOperation = 'encode';
            
            updateStatistics();
            updateStatus('success', 'Text encoded successfully');
            addToHistory('encode', text, encoded);
            
            // Button animation
            encodeIcon.textContent = 'check';
            encodeBtn.classList.add('bg-green-600');
            setTimeout(() => {
                encodeIcon.textContent = 'enhanced_encryption';
                encodeBtn.classList.remove('bg-green-600');
            }, 1000);
        }, 300);
    } catch (error) {
        updateStatus('error', error.message);
    }
};

// Decode Text
window.decodeText = function() {
    const text = base64Input.value.trim();
    if (!text) {
        updateStatus('error', 'Please enter Base64 to decode');
        return;
    }
    
    if (!isValidBase64(text)) {
        updateStatus('error', 'Invalid Base64 string');
        return;
    }
    
    try {
        updateStatus('decoding', 'Decoding from Base64...');
        
        setTimeout(() => {
            const decoded = decodeBase64(text);
            base64Input.value = decoded;
            originalText = text;
            currentText = decoded;
            lastOperation = 'decode';
            
            updateStatistics();
            updateStatus('success', 'Text decoded successfully');
            addToHistory('decode', text, decoded);
            
            // Button animation
            decodeIcon.textContent = 'check';
            decodeBtn.classList.add('bg-green-600');
            setTimeout(() => {
                decodeIcon.textContent = 'no_encryption';
                decodeBtn.classList.remove('bg-green-600');
            }, 1000);
        }, 300);
    } catch (error) {
        updateStatus('error', error.message);
    }
};

// Copy to Clipboard
window.copyToClipboard = async function() {
    if (!base64Input.value.trim()) {
        updateStatus('error', 'Nothing to copy');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(base64Input.value);
        updateStatus('success', 'Copied to clipboard');
        
        copyIcon.textContent = 'check';
        copyBtn.classList.add('bg-green-100', 'dark:bg-green-900/30');
        setTimeout(() => {
            copyIcon.textContent = 'content_copy';
            copyBtn.classList.remove('bg-green-100', 'dark:bg-green-900/30');
        }, 2000);
    } catch (err) {
        updateStatus('error', 'Failed to copy');
    }
};

// Clear Text
function clearText() {
    if (base64Input.value.trim()) {
        addToHistory('clear', base64Input.value, '');
    }
    
    base64Input.value = '';
    base64Input.focus();
    originalText = '';
    currentText = '';
    lastOperation = null;
    
    updateStatistics();
    updateStatus('ready', 'Text cleared');
}

// Clear History
function clearHistory() {
    if (history.length === 0) {
        updateStatus('error', 'No history to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all history?')) {
        history = [];
        localStorage.removeItem('base64History');
        renderHistory();
        updateStatus('success', 'History cleared');
    }
}

// Home Button - Reset to Welcome
function goHome() {
    const welcomeText = "Welcome to Base64 Utility! 🎉\n\nTry encoding this text or paste your own Base64 string to decode.\n\nExample Base64 string:\nV2VsY29tZSB0byBCYXNlNjQgVXRpbGl0eSEg8J+NiQoKVHJ5IGVuY29kaW5nIHRoaXMgdGV4dCBvciBwYXN0ZSB5b3VyIG93biBCYXNlNjQgc3RyaW5nIHRvIGRlY29kZS4KCkV4YW1wbGUgQmFzZTY0IHN0cmluZzo=";
    
    if (base64Input.value !== welcomeText) {
        addToHistory('home', base64Input.value, welcomeText);
    }
    
    base64Input.value = welcomeText;
    base64Input.focus();
    originalText = welcomeText;
    currentText = welcomeText;
    lastOperation = null;
    
    updateStatistics();
    updateStatus('ready', 'Welcome back!');
}

// Theme Toggle
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'dark_mode';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'light_mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Show Help
window.showHelp = function() {
    alert('Base64 Utility Help:\n\n• Encode: Convert any text to Base64 format\n• Decode: Convert Base64 back to text\n• Copy: Copy the result to clipboard\n• Clear: Clear all text\n• History: View and load previous conversions\n\nKeyboard Shortcuts:\n• Ctrl+E: Encode\n• Ctrl+D: Decode\n• Ctrl+C: Copy\n• Ctrl+L: Clear\n• Ctrl+H: Home\n• Ctrl+T: Toggle theme');
};

// Show About
window.showAbout = function() {
    alert('Base64 Utility v1.0.0\n\nA powerful tool for encoding and decoding Base64 strings.\n\nFeatures:\n• Client-side processing (no server)\n• Dark/Light theme\n• History tracking\n• Keyboard shortcuts\n• Responsive design\n\nYour data never leaves your browser!');
};

// Event Listeners Setup
function setupEventListeners() {
    base64Input.addEventListener('input', function() {
        currentText = this.value;
        updateStatistics();
        updateStatus('ready');
    });

    encodeBtn.addEventListener('click', window.encodeText);
    decodeBtn.addEventListener('click', window.decodeText);
    copyBtn.addEventListener('click', window.copyToClipboard);
    clearBtn.addEventListener('click', clearText);
    clearHistoryBtn.addEventListener('click', clearHistory);
    homeButton.addEventListener('click', goHome);
    themeToggle.addEventListener('click', toggleTheme);
    helpBtn.addEventListener('click', window.showHelp);
    aboutBtn.addEventListener('click', window.showAbout);
    
    if (quickActionEncode) {
        quickActionEncode.addEventListener('click', window.encodeText);
    }
    if (quickActionDecode) {
        quickActionDecode.addEventListener('click', window.decodeText);
    }
    if (quickActionCopy) {
        quickActionCopy.addEventListener('click', window.copyToClipboard);
    }

    // Auto-resize textarea
    base64Input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'e':
                    e.preventDefault();
                    window.encodeText();
                    break;
                case 'd':
                    e.preventDefault();
                    window.decodeText();
                    break;
                case 'c':
                    if (document.activeElement !== base64Input) {
                        e.preventDefault();
                        window.copyToClipboard();
                    }
                    break;
                case 'l':
                    e.preventDefault();
                    clearText();
                    break;
                case 'h':
                    e.preventDefault();
                    goHome();
                    break;
                case 't':
                    e.preventDefault();
                    toggleTheme();
                    break;
            }
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});
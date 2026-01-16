// DOM Elements
const base64Input = document.getElementById('base64-input');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const statusEl = document.getElementById('status');
const charCount = document.getElementById('char-count');
const inputSize = document.getElementById('input-size');
const outputSize = document.getElementById('output-size');
const historyList = document.getElementById('history-list');

// Toast Elements
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const toastClose = document.getElementById('toastClose');

// State
let history = [];
let toastTimeout;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    // Focus input on load
    if (base64Input) base64Input.focus();

    setupEventListeners();
});

function setupEventListeners() {
    base64Input.addEventListener('input', updateStatistics);

    // Core actions
    encodeBtn.addEventListener('click', encodeText);
    decodeBtn.addEventListener('click', decodeText);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearText);
    clearHistoryBtn.addEventListener('click', clearHistoryConfirm);

    if (toastClose) toastClose.addEventListener('click', hideToast);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey)) {
            switch (e.key.toLowerCase()) {
                case 'e':
                    e.preventDefault();
                    encodeText();
                    break;
                case 'd':
                    e.preventDefault();
                    decodeText();
                    break;
                // Don't override Ctrl+C globally, might annoy user if selecting text
            }
        }
    });

    // Auto-resize if needed (though we use fixed height in this design)
}

// Logic Functions
function encodeText() {
    const text = base64Input.value;
    if (!text) {
        showToast('Please enter text to encode', 'warning');
        return;
    }

    try {
        const encoded = btoa(unescape(encodeURIComponent(text)));
        base64Input.value = encoded;
        updateStatistics();
        addToHistory('encode', text, encoded);
        showToast('Encoded successfully', 'success');
        updateStatus('Encoded');
    } catch (error) {
        showToast('Encoding failed. Check input.', 'error');
    }
}

function decodeText() {
    const text = base64Input.value.trim();
    if (!text) {
        showToast('Please enter Base64 to decode', 'warning');
        return;
    }

    try {
        // Simple validation
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text)) {
            throw new Error('Invalid characters');
        }

        const decoded = decodeURIComponent(escape(atob(text)));
        base64Input.value = decoded;
        updateStatistics();
        addToHistory('decode', text, decoded);
        showToast('Decoded successfully', 'success');
        updateStatus('Decoded');
    } catch (error) {
        showToast('Invalid Base64 string', 'error');
    }
}

async function copyToClipboard() {
    if (!base64Input.value) return;
    try {
        await navigator.clipboard.writeText(base64Input.value);
        showToast('Copied to clipboard', 'success');

        const btn = document.getElementById('copy-icon');
        const original = btn.textContent;
        btn.textContent = 'check';
        setTimeout(() => btn.textContent = original, 2000);
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
}

function clearText() {
    if (base64Input.value) {
        base64Input.value = '';
        updateStatistics();
        updateStatus('Ready');
        base64Input.focus();
    }
}

function updateStatistics() {
    const text = base64Input.value;
    const chars = text.length;
    const bytes = new Blob([text]).size;

    charCount.textContent = `${chars} chars`;
    inputSize.textContent = formatBytes(bytes);

    // For output size, strictly speaking it is the same as input size unless we just transformed it.
    // In this unified box design, "Output" size is just current size.
    // But to be helpful, if we just encoded, we could show what the decoded size WAS? 
    // For simplicity sake in unified box, let's make Input/Output sizes match current content or 
    // maybe "Input" is what it was before? 
    // Actually, simpler: Input Size = Current Size. Output Size = Predicted size if converted?
    // Let's just set both to current size for now, or maybe hide one?
    // The previous logic tried to calculate "Output Size" based on potential operation.
    // Let's stick to: Input Size = Current Text Size. Output Size = Text Size if we were to reverse operation?
    // No, that's confusing. Let's just show Current Size.

    outputSize.textContent = formatBytes(bytes);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateStatus(status) {
    if (statusEl) statusEl.textContent = status;
}

// History
function addToHistory(action, input, output) {
    const item = {
        action,
        input: input.length > 50 ? input.substring(0, 50) + '...' : input,
        output: output.length > 50 ? output.substring(0, 50) + '...' : output,
        fullInput: input,
        fullOutput: output,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
    };

    history.unshift(item);
    if (history.length > 20) history.pop(); // Keep last 20

    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (!historyList) return;

    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-8 text-slate-500 text-sm">
                <span class="material-symbols-outlined text-3xl mb-2 opacity-30">history_toggle_off</span>
                <p>No recent actions</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group" 
             onclick="loadHistoryItem(${item.id})">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold uppercase tracking-wider ${item.action === 'encode' ? 'text-primary-400' : 'text-secondary-400'}">
                    ${item.action}
                </span>
                <span class="text-[10px] text-slate-500">${item.timestamp}</span>
            </div>
            <div class="text-xs text-slate-400 font-mono truncate opacity-70 mb-0.5">
                ${item.input}
            </div>
            <div class="text-xs text-slate-300 font-mono truncate">
                <span class="text-primary-500/50">→</span> ${item.output}
            </div>
        </div>
    `).join('');
}

window.loadHistoryItem = function (id) {
    const item = history.find(h => h.id === id);
    if (item) {
        base64Input.value = item.fullOutput;
        updateStatistics();
        showToast(`Loaded ${item.action} result`, 'info');
    }
}

function clearHistoryConfirm() {
    if (history.length === 0) return;
    if (confirm('Clear history?')) {
        history = [];
        saveHistory();
        renderHistory();
        showToast('History cleared', 'success');
    }
}

function saveHistory() {
    localStorage.setItem('base64History', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('base64History');
    if (saved) {
        try { history = JSON.parse(saved); } catch (e) { history = []; }
        renderHistory();
    }
}

// Toast
function showToast(message, type = 'info') {
    if (!toast) return;

    toastMessage.textContent = message;

    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const colors = { success: 'text-emerald-400', error: 'text-red-400', warning: 'text-amber-400', info: 'text-primary-400' };

    toastIcon.textContent = icons[type] || 'info';
    toastIcon.className = `material-symbols-outlined ${colors[type] || 'text-blue-400'}`;

    toast.classList.remove('translate-y-20', 'opacity-0');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, 3000);
}

function hideToast() {
    if (!toast) return;
    toast.classList.add('translate-y-20', 'opacity-0');
}
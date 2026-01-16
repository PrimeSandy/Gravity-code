// DOM Elements
const textBox = document.getElementById('text-box');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const previewBox = document.getElementById('preview-box');
const currentCase = document.getElementById('current-case');
const historyContainer = document.getElementById('history-container');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Buttons
const copyBtn = document.getElementById('copy-btn');
const pasteBtn = document.getElementById('paste-btn');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const caseButtons = document.querySelectorAll('.case-btn');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const toastClose = document.getElementById('toastClose');
let toastTimeout;

// State
let history = []; // Visual history list
let undoStack = []; // Stack for undo functionality
let redoStack = []; // Stack for potential redo (not implemented yet, but good practice)

// Constants
const MAX_HISTORY_ITEMS = 30;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    if (textBox) {
        textBox.focus();
        updateStatistics(textBox.value);
    }
    setupEventListeners();
});

function setupEventListeners() {
    // Text Input
    textBox.addEventListener('input', (e) => {
        updateStatistics(e.target.value);
        updatePreview(e.target.value);
    });

    // Core Actions
    copyBtn.addEventListener('click', copyToClipboard);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    clearBtn.addEventListener('click', clearText);

    // Undo
    if (undoBtn) undoBtn.addEventListener('click', undoInfo); // The new design uses history list for restoring, undo button is kept but logic changes slightly or we just use it for last action. 
    // Actually, distinct "Undo" button in UI can just pop the last state from a separate stack or restart previous history item.
    // simpler: Undo restores the previous text state from `undoStack`.
    undoBtn.addEventListener('click', performUndo);

    // Case Conversion Buttons
    caseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const caseType = btn.dataset.case;
            convertText(caseType);
        });
    });

    // History
    clearHistoryBtn.addEventListener('click', clearHistoryConfirm);

    // Toast
    if (toastClose) toastClose.addEventListener('click', hideToast);

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Case Converters
const converters = {
    uppercase: (text) => text.toUpperCase(),

    lowercase: (text) => text.toLowerCase(),

    titlecase: (text) => {
        // More robust title case: capitalize first letter of each word, lower others
        // Also handle small words if we wanted to be fancy, but simple is usually expected.
        return text.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    },

    sentencecase: (text) => {
        // Capitalize first letter of every sentence (digits/punctuations ending with space)
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, function (c) { return c.toUpperCase(); });
    },

    alternatingcase: (text) => {
        return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    },

    inversecase: (text) => {
        return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    }
};

const caseDisplayNames = {
    uppercase: 'UPPERCASE',
    lowercase: 'lowercase',
    titlecase: 'Title Case',
    sentencecase: 'Sentence Case',
    alternatingcase: 'Alternating Case',
    inversecase: 'Inverse Case',
    original: 'Original'
};


// Core Logic
function convertText(caseType) {
    const text = textBox.value;
    if (!text) {
        showToast('Please enter some text first', 'warning');
        return;
    }

    pushToUndoStack(text); // Save state before change

    const converter = converters[caseType];
    if (converter) {
        const newText = converter(text);
        textBox.value = newText;
        updateStatistics(newText);
        updatePreview(newText, caseType);

        addToHistory(caseType, text, newText);
        showToast(`Converted to ${caseDisplayNames[caseType]}`, 'success');
    }
}

function updateStatistics(text) {
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    charCount.textContent = `${chars} chars`;
    wordCount.textContent = `${words} words`;
}

function updatePreview(text, caseType = 'original') {
    if (!previewBox) return;

    if (!text.trim()) {
        previewBox.innerHTML = '<em>Preview will appear here...</em>';
        if (currentCase) currentCase.textContent = 'Original';
        return;
    }

    previewBox.textContent = text.length > 100 ? text.substring(0, 100) + '...' : text;
    if (currentCase) currentCase.textContent = caseDisplayNames[caseType] || 'Custom';
}

// History System
function addToHistory(action, input, result) {
    // Avoid duplicates at top of list
    if (history.length > 0 && history[0].result === result && history[0].action === action) return;

    const item = {
        id: Date.now(),
        action,
        input,
        result,
        timestamp: new Date().toLocaleTimeString()
    };

    history.unshift(item);
    if (history.length > MAX_HISTORY_ITEMS) history.pop();

    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (!historyContainer) return;

    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center py-8 text-slate-500 text-sm">
                <span class="material-symbols-outlined text-3xl mb-2 opacity-30">history_toggle_off</span>
                <p>No recent conversions</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = history.map(item => `
        <div class="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group relative pr-10"
             onclick="loadHistoryItem(${item.id})">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold uppercase tracking-wider text-primary-400">
                    ${caseDisplayNames[item.action] || item.action}
                </span>
                <span class="text-[10px] text-slate-500">${item.timestamp}</span>
            </div>
            <div class="text-sm text-slate-300 font-mono truncate">
                ${item.result}
            </div>
            <button onclick="copyHistoryItem(event, ${item.id})" 
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Copy Result">
                <span class="material-symbols-outlined text-lg">content_copy</span>
            </button>
        </div>
    `).join('');
}

window.copyHistoryItem = async function (e, id) {
    e.stopPropagation();
    const item = history.find(i => i.id === id);
    if (item) {
        try {
            await navigator.clipboard.writeText(item.result);
            showToast('Copied from history', 'success');
        } catch (err) {
            showToast('Failed to copy', 'error');
        }
    }
};


window.loadHistoryItem = function (id) {
    const item = history.find(i => i.id === id);
    if (item) {
        pushToUndoStack(textBox.value); // Save current before loading history
        textBox.value = item.result;
        updateStatistics(item.result);
        updatePreview(item.result, item.action);
        showToast('Restored from history', 'info');
    }
}

function clearHistoryConfirm() {
    if (history.length === 0) return;
    if (confirm('Clear all history?')) {
        history = [];
        saveHistory();
        renderHistory();
        showToast('History cleared', 'success');
    }
}

function saveHistory() {
    localStorage.setItem('textCaseHistory', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('textCaseHistory');
    if (saved) {
        try { history = JSON.parse(saved); } catch (e) { history = []; }
        renderHistory();
    }
}

// Undo System
function pushToUndoStack(text) {
    undoStack.push(text);
    if (undoStack.length > 20) undoStack.shift();
}

function performUndo() {
    if (undoStack.length === 0) {
        showToast('Nothing to undo', 'warning');
        return;
    }

    const previousText = undoStack.pop();
    textBox.value = previousText;
    updateStatistics(previousText);
    updatePreview(previousText);
    showToast('Undid last action', 'info');
}

function undoInfo() {
    // If undo stack is empty, maybe we want to hint user?
    // This function is just a listener target, logic is in performUndo
}


// Clipboard & Utilities
async function copyToClipboard() {
    if (!textBox.value) return;
    try {
        await navigator.clipboard.writeText(textBox.value);
        showToast('Copied to clipboard', 'success');

        const icon = document.getElementById('copy-icon');
        if (icon) {
            const original = icon.textContent;
            icon.textContent = 'check';
            setTimeout(() => icon.textContent = original, 2000);
        }
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        pushToUndoStack(textBox.value);

        // Insert at cursor or replace selection
        const start = textBox.selectionStart;
        const end = textBox.selectionEnd;
        const currentVal = textBox.value;

        const newValue = currentVal.substring(0, start) + text + currentVal.substring(end);
        textBox.value = newValue;

        updateStatistics(newValue);
        updatePreview(newValue);
        showToast('Pasted from clipboard', 'success');
    } catch (err) {
        showToast('Failed to paste. Please check permissions.', 'error');
    }
}

function clearText() {
    if (textBox.value) {
        pushToUndoStack(textBox.value);
        textBox.value = '';
        updateStatistics('');
        updatePreview('');
        showToast('Editor cleared', 'info');
        textBox.focus();
    }
}

// Toast Notification
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

// Shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                performUndo();
                break;
            // Add more if needed, but be careful not to override system defaults too much
        }
    }
}
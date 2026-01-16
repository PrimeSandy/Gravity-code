// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const homeButton = document.getElementById('home-button');
const textBox = document.getElementById('text-box');
const copyBtn = document.getElementById('copy-btn');
const pasteBtn = document.getElementById('paste-btn');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const selectAllBtn = document.getElementById('select-all-btn');
const settingsBtn = document.getElementById('settings-btn');
const caseButtons = document.querySelectorAll('.case-btn');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const previewBox = document.getElementById('preview-box');
const currentCase = document.getElementById('current-case');
const copyIcon = document.getElementById('copy-icon');

// State Variables
let history = [];
let currentCaseType = 'original';

// Loading Simulation Function
function simulateLoading() {
    return new Promise((resolve) => {
        // Simulate minimum loading time of 1.5 seconds
        setTimeout(() => {
            resolve();
        }, 1500);
    });
}

// Hide Loading Screen and Show Content
function showContent() {
    loadingScreen.classList.add('hidden');
    mainContent.classList.remove('blur-content');
    mainContent.classList.add('content-loaded');
    
    // Focus on text box after transition
    setTimeout(() => {
        textBox.focus();
    }, 300);
}

// Initialize
async function initializeApp() {
    // Show loading screen initially
    loadingScreen.classList.remove('hidden');
    mainContent.classList.add('blur-content');
    
    // Wait for loading simulation
    await simulateLoading();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    // Initialize with sample text
    const sampleText = `Welcome to Text Case Converter! ✨

Type or paste your text above, then click any conversion button.

Try this example:
"hello world text converter"

Features:
• Multiple case conversions
• Real-time preview
• Copy/paste functionality
• Dark/light mode
• Mobile responsive

Start converting now! 🚀`;
    
    textBox.value = sampleText;
    updateStatistics(sampleText);
    updatePreview(sampleText, 'original');
    
    // Show content with transition
    setTimeout(showContent, 300);
}

// Home Button Functionality - Reset to Welcome Text
function goHome() {
    // Save current text to history if not empty
    if (textBox.value.trim()) {
        saveToHistory(textBox.value, currentCaseType);
    }
    
    // Reset to welcome text
    const welcomeText = `Welcome to Text Case Converter! ✨

Type or paste your text above, then click any conversion button.

Try this example:
"hello world text converter"

Features:
• Multiple case conversions
• Real-time preview
• Copy/paste functionality
• Dark/light mode
• Mobile responsive

Start converting now! 🚀`;
    
    textBox.value = welcomeText;
    textBox.focus();
    updateStatistics(welcomeText);
    updatePreview(welcomeText, 'original');
    resetActiveButtons();
    
    // Save to history
    saveToHistory(welcomeText, 'original');
}

// Case Conversion Functions
const caseConverters = {
    uppercase: (text) => text.toUpperCase(),
    lowercase: (text) => text.toLowerCase(),
    titlecase: (text) => {
        return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    },
    sentencecase: (text) => {
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, match => match.toUpperCase());
    }
};

// Update Statistics
function updateStatistics(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    charCount.textContent = `${chars} chars`;
    wordCount.textContent = `${words} words`;
}

// Update Preview
function updatePreview(text, caseType) {
    if (!text.trim()) {
        previewBox.textContent = 'Text preview will appear here...';
        currentCase.textContent = 'Original Text';
        return;
    }
    
    const preview = text.length > 150 ? text.substring(0, 150) + '...' : text;
    previewBox.textContent = preview;
    
    const caseNames = {
        uppercase: 'UPPERCASE',
        lowercase: 'lowercase',
        titlecase: 'Title Case',
        sentencecase: 'Sentence Case',
        original: 'Original Text'
    };
    
    currentCase.textContent = caseNames[caseType] || 'Original Text';
    currentCaseType = caseType;
}

// Save to History
function saveToHistory(text, caseType) {
    history.push({
        text: text,
        caseType: caseType,
        time: new Date().toLocaleTimeString()
    });
    
    // Keep only last 50 actions
    if (history.length > 50) {
        history.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('conversionHistory', JSON.stringify(history));
}

// Convert Text
function convertText(caseType) {
    const text = textBox.value;
    if (!text.trim()) return;
    
    // Save current state to history
    saveToHistory(text, currentCaseType);
    
    const converter = caseConverters[caseType];
    if (converter) {
        const convertedText = converter(text);
        textBox.value = convertedText;
        updateStatistics(convertedText);
        updatePreview(convertedText, caseType);
        
        // Update button active state
        caseButtons.forEach(btn => {
            if (btn.dataset.case === caseType) {
                btn.classList.add('bg-primary/20', 'border-primary', 'text-primary');
            } else {
                btn.classList.remove('bg-primary/20', 'border-primary', 'text-primary');
            }
        });
    }
}

// Copy to Clipboard
async function copyToClipboard() {
    if (!textBox.value.trim()) return;
    
    try {
        await navigator.clipboard.writeText(textBox.value);
        copyIcon.textContent = 'check';
        copyBtn.classList.add('bg-green-200', 'dark:bg-green-800/50');
        
        setTimeout(() => {
            copyIcon.textContent = 'content_copy';
            copyBtn.classList.remove('bg-green-200', 'dark:bg-green-800/50');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        copyIcon.textContent = 'error';
        setTimeout(() => {
            copyIcon.textContent = 'content_copy';
        }, 2000);
    }
}

// Paste from Clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const cursorPos = textBox.selectionStart;
        const currentText = textBox.value;
        const newText = currentText.substring(0, cursorPos) + text + currentText.substring(cursorPos);
        
        textBox.value = newText;
        textBox.focus();
        textBox.selectionStart = cursorPos + text.length;
        textBox.selectionEnd = cursorPos + text.length;
        
        updateStatistics(newText);
        updatePreview(newText, 'original');
        resetActiveButtons();
        
        // Save to history
        saveToHistory(newText, 'original');
    } catch (err) {
        console.error('Failed to paste:', err);
        textBox.focus();
    }
}

// Clear Text
function clearText() {
    if (textBox.value.trim()) {
        saveToHistory(textBox.value, currentCaseType);
    }
    textBox.value = '';
    textBox.focus();
    updateStatistics('');
    updatePreview('', 'original');
    resetActiveButtons();
}

// Undo Action
function undoAction() {
    if (history.length > 0) {
        const lastAction = history.pop();
        if (lastAction) {
            textBox.value = lastAction.text;
            updateStatistics(lastAction.text);
            updatePreview(lastAction.text, lastAction.caseType);
            textBox.focus();
            
            // Update active button
            caseButtons.forEach(btn => {
                if (btn.dataset.case === lastAction.caseType) {
                    btn.classList.add('bg-primary/20', 'border-primary', 'text-primary');
                } else {
                    btn.classList.remove('bg-primary/20', 'border-primary', 'text-primary');
                }
            });
            
            // Save updated history
            localStorage.setItem('conversionHistory', JSON.stringify(history));
        }
    }
}

// Select All Text
function selectAllText() {
    textBox.select();
    textBox.focus();
}

// Reset Active Buttons
function resetActiveButtons() {
    caseButtons.forEach(btn => {
        btn.classList.remove('bg-primary/20', 'border-primary', 'text-primary');
    });
    currentCaseType = 'original';
    currentCase.textContent = 'Original Text';
}

// Navigate to Settings
function goToSettings() {
    // Show loading screen before navigating
    loadingScreen.classList.remove('hidden');
    mainContent.classList.add('blur-content');
    
    setTimeout(() => {
        window.location.href = 'settings.html';
    }, 300);
}

// Event Listeners
homeButton.addEventListener('click', goHome);
textBox.addEventListener('input', function() {
    updateStatistics(this.value);
    updatePreview(this.value, currentCaseType);
});

copyBtn.addEventListener('click', copyToClipboard);
pasteBtn.addEventListener('click', pasteFromClipboard);
clearBtn.addEventListener('click', clearText);
undoBtn.addEventListener('click', undoAction);
selectAllBtn.addEventListener('click', selectAllText);
settingsBtn.addEventListener('click', goToSettings);

caseButtons.forEach(button => {
    button.addEventListener('click', () => {
        convertText(button.dataset.case);
    });
});

// Auto-resize textarea
textBox.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'c':
                if (document.activeElement === textBox) {
                    // Allow default copy
                } else {
                    e.preventDefault();
                    copyToClipboard();
                }
                break;
            case 'v':
                if (document.activeElement === textBox) {
                    // Allow default paste
                    setTimeout(() => {
                        updateStatistics(textBox.value);
                        updatePreview(textBox.value, currentCaseType);
                    }, 0);
                } else {
                    e.preventDefault();
                    pasteFromClipboard();
                }
                break;
            case 'a':
                e.preventDefault();
                selectAllText();
                break;
            case 'z':
                e.preventDefault();
                undoAction();
                break;
            case 'd':
                e.preventDefault();
                clearText();
                break;
            case 'h':
                e.preventDefault();
                goHome();
                break;
        }
    }
});

// Load history from localStorage
const savedHistory = localStorage.getItem('conversionHistory');
if (savedHistory) {
    history = JSON.parse(savedHistory);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);
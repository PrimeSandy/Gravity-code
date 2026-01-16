// DOM Elements
const textInput = document.getElementById('text-input');
const wordsCount = document.getElementById('words-count');
const charsCount = document.getElementById('chars-count');
const charsNoSpaceCount = document.getElementById('chars-no-space-count');
const sentencesCount = document.getElementById('sentences-count');
const paragraphsCount = document.getElementById('paragraphs-count');
const readingTime = document.getElementById('reading-time');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const homeButton = document.getElementById('home-button');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const copyIcon = document.getElementById('copy-icon');

// Constants
const WORDS_PER_MINUTE = 200; // Average reading speed

// Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();
    
    // Create new toast
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    
    // Style based on type
    if (type === 'success') {
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        toast.style.background = '#ef4444';
    } else if (type === 'warning') {
        toast.style.background = '#f59e0b';
    }
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Initialize with sample text
function initializeSampleText() {
    const sampleText = `Welcome to Word Counter! ✨

This is a sample text to demonstrate all the features of this tool.

As you type or paste text in this area, the statistics will update in real-time. You can see:
• Word count
• Character count (with and without spaces)
• Sentence count
• Paragraph count
• Estimated reading time

Try editing this text or pasting your own content to see instant results!

Features:
✅ Real-time counting
✅ Dark/light mode toggle
✅ Copy to clipboard
✅ Local processing (no data sent to servers)
✅ Mobile responsive design

Happy writing! 📝`;
    
    textInput.value = sampleText;
    updateStatistics();
    textInput.focus();
}

// Count words
function countWords(text) {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

// Count characters (with spaces)
function countCharacters(text) {
    return text.length;
}

// Count characters (without spaces)
function countCharactersNoSpace(text) {
    return text.replace(/\s+/g, '').length;
}

// Count sentences
function countSentences(text) {
    if (!text.trim()) return 0;
    // Split by . ! ? and filter out empty strings
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
}

// Count paragraphs
function countParagraphs(text) {
    if (!text.trim()) return 0;
    // Split by newlines and filter out empty paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    return paragraphs.length;
}

// Calculate reading time
function calculateReadingTime(text) {
    const words = countWords(text);
    const minutes = Math.ceil(words / WORDS_PER_MINUTE);
    return minutes;
}

// Update all statistics
function updateStatistics() {
    const text = textInput.value;
    
    // Update counts
    wordsCount.textContent = countWords(text).toLocaleString();
    charsCount.textContent = countCharacters(text).toLocaleString();
    charsNoSpaceCount.textContent = countCharactersNoSpace(text).toLocaleString();
    sentencesCount.textContent = countSentences(text).toLocaleString();
    paragraphsCount.textContent = countParagraphs(text).toLocaleString();
    
    // Update reading time
    const readingMinutes = calculateReadingTime(text);
    if (readingMinutes === 0) {
        readingTime.textContent = '0m';
    } else if (readingMinutes < 60) {
        readingTime.textContent = `${readingMinutes}m`;
    } else {
        const hours = Math.floor(readingMinutes / 60);
        const minutes = readingMinutes % 60;
        readingTime.textContent = `${hours}h ${minutes}m`;
    }
}

// Copy text to clipboard
async function copyToClipboard() {
    if (!textInput.value.trim()) {
        showToast('Please enter some text first', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(textInput.value);
        copyIcon.textContent = 'check';
        copyBtn.classList.add('bg-green-600');
        showToast('Text copied to clipboard!', 'success');
        
        setTimeout(() => {
            copyIcon.textContent = 'content_copy';
            copyBtn.classList.remove('bg-green-600');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        copyIcon.textContent = 'error';
        showToast('Failed to copy text', 'error');
        
        setTimeout(() => {
            copyIcon.textContent = 'content_copy';
        }, 2000);
    }
}

// Clear text
function clearText() {
    if (!textInput.value.trim()) {
        showToast('Text area is already empty', 'info');
        return;
    }
    
    textInput.value = '';
    textInput.focus();
    updateStatistics();
    showToast('Text cleared', 'info');
}

// Home button functionality
function goHome() {
    textInput.value = '';
    initializeSampleText();
    showToast('Reset to sample text', 'info');
}

// Toggle theme
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'light_mode';
        localStorage.setItem('theme', 'light');
        showToast('Switched to light mode', 'info');
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'dark_mode';
        localStorage.setItem('theme', 'dark');
        showToast('Switched to dark mode', 'info');
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    textInput.style.height = 'auto';
    textInput.style.height = textInput.scrollHeight + 'px';
    
    // Limit max height
    if (textInput.scrollHeight > 500) {
        textInput.style.height = '500px';
        textInput.style.overflowY = 'auto';
    } else {
        textInput.style.overflowY = 'hidden';
    }
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'dark_mode';
    }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + C to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement !== textInput) {
            e.preventDefault();
            copyToClipboard();
        }
        
        // Ctrl/Cmd + A to select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement === textInput) {
            // Allow default select all behavior
        }
        
        // Ctrl/Cmd + D to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            clearText();
        }
        
        // Ctrl/Cmd + H to go home
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            goHome();
        }
        
        // Ctrl/Cmd + / to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Initialize the application
function initializeApp() {
    // Load theme
    initializeTheme();
    
    // Set up sample text
    initializeSampleText();
    
    // Set up event listeners
    textInput.addEventListener('input', () => {
        updateStatistics();
        autoResizeTextarea();
    });
    
    textInput.addEventListener('keydown', (e) => {
        // Tab key indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textInput.selectionStart;
            const end = textInput.selectionEnd;
            const spaces = '  ';
            
            // Insert 2 spaces
            textInput.value = textInput.value.substring(0, start) + spaces + textInput.value.substring(end);
            
            // Move cursor
            textInput.selectionStart = textInput.selectionEnd = start + spaces.length;
            
            // Update stats
            updateStatistics();
            autoResizeTextarea();
        }
    });
    
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearText);
    homeButton.addEventListener('click', goHome);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initial auto-resize
    setTimeout(() => {
        autoResizeTextarea();
    }, 100);
    
    // Focus on text input
    textInput.focus();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
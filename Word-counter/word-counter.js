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
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const keywordList = document.getElementById('keyword-list');

// Constants
const WORDS_PER_MINUTE = 200;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    textInput.addEventListener('input', updateStatistics);
    copyBtn.addEventListener('click', copyText);
    clearBtn.addEventListener('click', clearText);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Auto-focus
    textInput.focus();
});

function updateStatistics() {
    const text = textInput.value;
    
    // Core Counts
    const words = countWords(text);
    wordsCount.textContent = words.toLocaleString();
    charsCount.textContent = text.length.toLocaleString();
    charsNoSpaceCount.textContent = text.replace(/\s+/g, '').length.toLocaleString();
    sentencesCount.textContent = countSentences(text).toLocaleString();
    paragraphsCount.textContent = countParagraphs(text).toLocaleString();
    
    // Reading Time
    const minutes = Math.ceil(words / WORDS_PER_MINUTE);
    readingTime.textContent = minutes < 60 ? `${minutes}m` : `${Math.floor(minutes/60)}h ${minutes%60}m`;
    if (words === 0) readingTime.textContent = '0m';

    // Keyword Density
    updateKeywordDensity(text);
}

function countWords(text) {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function countSentences(text) {
    if (!text.trim()) return 0;
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function countParagraphs(text) {
    if (!text.trim()) return 0;
    return text.split(/\n+/).filter(p => p.trim().length > 0).length;
}

function updateKeywordDensity(text) {
    if (!text.trim()) {
        keywordList.innerHTML = '<div class="text-sm text-gray-500 italic text-center py-4">Start typing to see keywords</div>';
        return;
    }

    const words = text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3); // Filter short words

    const freq = {};
    words.forEach(word => freq[word] = (freq[word] || 0) + 1);

    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5

    keywordList.innerHTML = sorted.map(([word, count]) => `
        <div class="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
            <span class="text-gray-300 font-medium">${word}</span>
            <span class="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">${count}</span>
        </div>
    `).join('');
}

// Actions
async function copyText() {
    if (!textInput.value) return;
    await navigator.clipboard.writeText(textInput.value);
    
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Copied!';
    copyBtn.classList.add('text-green-400');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('text-green-400');
    }, 2000);
}

function clearText() {
    textInput.value = '';
    updateStatistics();
    textInput.focus();
}

// Theme Handling
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'dark_mode';
    }
}
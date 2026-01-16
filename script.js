// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

// Mobile Menu
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuButton?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Search
const searchInput = document.getElementById('searchInput');
const toolCards = document.querySelectorAll('.tool-card');

searchInput?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    toolCards.forEach(card => {
        const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        const tag = card.querySelector('[class*="tag-"]')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       tag.includes(searchTerm);
        
        card.style.display = matches ? 'block' : 'none';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    }
});

// Add keyboard shortcut for search
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInput?.focus();
    }
});
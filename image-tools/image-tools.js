// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const selectImagesBtn = document.getElementById('select-images-btn');
const settingsSection = document.getElementById('settings-section');
const uploadedList = document.getElementById('uploaded-list');
const imagesContainer = document.getElementById('images-container');
const totalImagesSpan = document.getElementById('total-images');
const progressSection = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressTitle = document.getElementById('progress-title');
const processedCount = document.getElementById('processed-count');
const totalCount = document.getElementById('total-count');
const resultsSection = document.getElementById('results-section');
const resultsContainer = document.getElementById('results-container');
const resultsTitle = document.getElementById('results-title');
const downloadAllBtn = document.getElementById('download-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const clearAllBtn = document.getElementById('clear-all-btn');
const mainTitle = document.getElementById('main-title');
const mainSubtitle = document.getElementById('main-subtitle');

// Mobile Menu Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const closeMobileMenuBtn = document.querySelector('.close-mobile-menu');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const mobileThemeIcon = document.getElementById('mobile-theme-icon');
const mobileMenuCompress = document.getElementById('mobile-menu-compress');
const mobileMenuResize = document.getElementById('mobile-menu-resize');

// Tab Elements
const tabCompress = document.getElementById('tab-compress');
const tabResize = document.getElementById('tab-resize');
const tabCompressMobile = document.getElementById('tab-compress-mobile');
const tabResizeMobile = document.getElementById('tab-resize-mobile');
const compressSettings = document.getElementById('compress-settings');
const resizeSettings = document.getElementById('resize-settings');

// Compression Settings
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const outputFormatSelect = document.getElementById('output-format');
const maxWidthInput = document.getElementById('max-width');
const batchCompressBtn = document.getElementById('batch-compress-btn');

// Resize Settings
const batchResizeBtn = document.getElementById('batch-resize-btn');
const resizeModeButtons = document.querySelectorAll('.resize-mode-btn');
const customSizeSettings = document.getElementById('custom-size-settings');
const presetSizeSettings = document.getElementById('preset-size-settings');
const percentageSizeSettings = document.getElementById('percentage-size-settings');
const aspectRatioToggle = document.getElementById('aspect-ratio-toggle');
const resizeWidthInput = document.getElementById('resize-width');
const resizeHeightInput = document.getElementById('resize-height');
const aspectRatioButtons = document.querySelectorAll('.aspect-ratio-btn');
const presetSizeButtons = document.querySelectorAll('.preset-size-btn');
const percentageSlider = document.getElementById('percentage-slider');
const percentageValue = document.getElementById('percentage-value');

// State variables
let uploadedImages = [];
let processedResults = [];
let isProcessing = false;
let currentMode = 'compress'; // 'compress' or 'resize'
let resizeMode = 'custom'; // 'custom', 'preset', or 'percentage'

// Event Listeners
// Tab Switching
function setupEventListeners() {
    // Select Images
    if (selectImagesBtn) selectImagesBtn.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);

    // Drop Zone
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }

    // Batch Buttons
    if (batchCompressBtn) batchCompressBtn.addEventListener('click', startBatchCompression);
    if (batchResizeBtn) batchResizeBtn.addEventListener('click', startBatchResize);

    // Misc
    if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAllProcessed);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllImages);

    // Settings Inputs
    if (qualitySlider) qualitySlider.addEventListener('input', updateQualityValue);
    if (percentageSlider) percentageSlider.addEventListener('input', updatePercentageValue);
    if (aspectRatioToggle) aspectRatioToggle.addEventListener('change', toggleAspectRatioLock);
    if (resizeWidthInput) resizeWidthInput.addEventListener('input', handleWidthChange);
    if (resizeHeightInput) resizeHeightInput.addEventListener('input', handleHeightChange);

    // Mobile Menu
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) closeMobileMenu();
        });
    }

    // Tabs
    if (tabCompress) tabCompress.addEventListener('click', () => switchTab('compress'));
    if (tabResize) tabResize.addEventListener('click', () => switchTab('resize'));
    if (tabCompressMobile) tabCompressMobile.addEventListener('click', () => switchTab('compress'));
    if (tabResizeMobile) tabResizeMobile.addEventListener('click', () => switchTab('resize'));

    // Mobile Menu Tabs
    if (mobileMenuCompress) {
        mobileMenuCompress.addEventListener('click', () => {
            switchTab('compress');
            closeMobileMenu();
        });
    }
    if (mobileMenuResize) {
        mobileMenuResize.addEventListener('click', () => {
            switchTab('resize');
            closeMobileMenu();
        });
    }

    // Resize Mode Buttons
    if (resizeModeButtons) {
        resizeModeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const mode = this.id.replace('resize-mode-', '');
                switchResizeMode(mode);
            });
        });
    }

    // Aspect Ratio Buttons
    if (aspectRatioButtons) {
        aspectRatioButtons.forEach(button => {
            button.addEventListener('click', function () {
                const width = parseInt(this.getAttribute('data-width'));
                const height = parseInt(this.getAttribute('data-height'));
                // width/height logic...
                // Re-implementing logic here safely or assume existing function? 
                // Existing logic was inline. I need to keep it inline or move to function.
                // I will keep inline logic from original file but guarded.

                // Update inputs
                if (resizeWidthInput) resizeWidthInput.value = width;
                if (resizeHeightInput) resizeHeightInput.value = height;

                // Update active state
                aspectRatioButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Lock aspect ratio
                if (aspectRatioToggle) aspectRatioToggle.checked = true;
            });
        });
    }

    // Preset Size Buttons
    if (presetSizeButtons) {
        presetSizeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const width = parseInt(this.getAttribute('data-width'));
                const height = parseInt(this.getAttribute('data-height'));

                if (resizeWidthInput) resizeWidthInput.value = width;
                if (resizeHeightInput) resizeHeightInput.value = height;

                presetSizeButtons.forEach(btn => btn.classList.remove('active', 'bg-primary/10', 'dark:bg-primary/20'));
                this.classList.add('active', 'bg-primary/10', 'dark:bg-primary/20');
                this.classList.add('border-primary', 'dark:border-primary');
            });
        });
    }
}



// Mobile Menu Functions
function openMobileMenu() {
    mobileMenuOverlay.classList.remove('hidden');
    setTimeout(() => {
        mobileMenuOverlay.querySelector('div').classList.remove('translate-x-full');
    }, 10);
}

function closeMobileMenu() {
    mobileMenuOverlay.querySelector('div').classList.add('translate-x-full');
    setTimeout(() => {
        mobileMenuOverlay.classList.add('hidden');
    }, 300);
}

// Initialize
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupEventListeners();
});

// Theme Functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'light_mode';
        mobileThemeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'dark_mode';
        mobileThemeIcon.textContent = 'dark_mode';
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeIcon.textContent = 'dark_mode';
        mobileThemeIcon.textContent = 'dark_mode';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.textContent = 'light_mode';
        mobileThemeIcon.textContent = 'light_mode';
    }
}

// Tab Switching Functions
function switchTab(tab) {
    currentMode = tab;

    // Desktop Tabs
    const desktopTabs = [tabCompress, tabResize].filter(t => t); // Filter guards against null

    // Reset desktop tabs to inactive state
    desktopTabs.forEach(t => {
        t.classList.remove('active');
        t.classList.add('text-slate-400'); // Ensure gray when inactive
        t.classList.remove('text-slate-200', 'text-white'); // Remove explicit white if any
    });

    // Mobile Menu Items (if they exist/are visible)
    if (mobileMenuCompress && mobileMenuResize) {
        mobileMenuCompress.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
        mobileMenuResize.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
        mobileMenuCompress.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        mobileMenuResize.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
    }

    if (tab === 'compress') {
        // Activate Compress Tab
        if (tabCompress) {
            tabCompress.classList.add('active');
            tabCompress.classList.remove('text-slate-400'); // Let active CSS handle color
        }

        // Mobile
        if (tabCompressMobile) tabCompressMobile.classList.add('active');
        if (mobileMenuCompress) {
            mobileMenuCompress.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            mobileMenuCompress.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
        }

        // Show/Hide Settings
        if (compressSettings) compressSettings.classList.remove('hidden');
        if (resizeSettings) resizeSettings.classList.add('hidden');

        // Update Title
        if (mainTitle) mainTitle.textContent = 'Smart Image Compression';
        if (mainSubtitle) mainSubtitle.textContent = 'Reduce file size by up to 80% while maintaining perfect quality. Fast, secure, and free.';
        if (dropZone) { const t = dropZone.querySelector('h3'); if (t) t.textContent = 'Drag & Drop Images to Compress'; }

        // Toggle Dropzone/Batch Buttons
        if (batchCompressBtn) batchCompressBtn.classList.remove('hidden');
        if (batchResizeBtn) batchResizeBtn.classList.add('hidden');

    } else {
        // Activate Resize Tab
        if (tabResize) {
            tabResize.classList.add('active');
            tabResize.classList.remove('text-slate-400');
        }

        // Mobile
        if (tabResizeMobile) tabResizeMobile.classList.add('active');
        if (mobileMenuResize) {
            mobileMenuResize.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
            mobileMenuResize.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
        }

        // Show/Hide Settings
        if (compressSettings) compressSettings.classList.add('hidden');
        if (resizeSettings) resizeSettings.classList.remove('hidden');

        // Update Title
        if (mainTitle) mainTitle.textContent = 'Image Resizer Tool';
        if (mainSubtitle) mainSubtitle.textContent = 'Resize images to any dimension with perfect quality. Batch resize, aspect ratio control, and more.';
        if (dropZone) { const t = dropZone.querySelector('h3'); if (t) t.textContent = 'Drag & Drop Images to Resize'; }

        // Toggle Dropzone/Batch Buttons
        if (batchCompressBtn) batchCompressBtn.classList.add('hidden');
        if (batchResizeBtn) batchResizeBtn.classList.remove('hidden');
    }

    // Update results title
    updateResultsTitle();

    // Refresh uploaded images list to update buttons
    updateUploadedList();
}

function switchResizeMode(mode) {
    resizeMode = mode;

    // Update mode buttons
    resizeModeButtons.forEach(btn => {
        btn.classList.remove('active');
        const icon = btn.querySelector('.material-symbols-outlined');
        icon.classList.remove('text-primary');
        icon.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    const activeBtn = document.getElementById(`resize-mode-${mode}`);
    activeBtn.classList.add('active');
    const activeIcon = activeBtn.querySelector('.material-symbols-outlined');
    activeIcon.classList.remove('text-slate-500', 'dark:text-slate-400');
    activeIcon.classList.add('text-primary');

    // Show/hide settings
    customSizeSettings.classList.add('hidden');
    presetSizeSettings.classList.add('hidden');
    percentageSizeSettings.classList.add('hidden');

    if (mode === 'custom') {
        customSizeSettings.classList.remove('hidden');
    } else if (mode === 'preset') {
        presetSizeSettings.classList.remove('hidden');
    } else {
        percentageSizeSettings.classList.remove('hidden');
    }
}

// Update display values
function updateQualityValue() {
    qualityValue.textContent = qualitySlider.value;
}

function updatePercentageValue() {
    percentageValue.textContent = percentageSlider.value;
}

// Aspect Ratio Handling
let originalAspectRatio = null;
let isAspectRatioLocked = true;

function toggleAspectRatioLock() {
    isAspectRatioLocked = aspectRatioToggle.checked;
}

function handleWidthChange() {
    if (isAspectRatioLocked && originalAspectRatio && resizeWidthInput.value) {
        const newHeight = Math.round(resizeWidthInput.value / originalAspectRatio);
        resizeHeightInput.value = newHeight;
    }
}

function handleHeightChange() {
    if (isAspectRatioLocked && originalAspectRatio && resizeHeightInput.value) {
        const newWidth = Math.round(resizeHeightInput.value * originalAspectRatio);
        resizeWidthInput.value = newWidth;
    }
}

// File Handling
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        alert('Please select valid image files');
        return;
    }

    // Check file sizes (max 10MB)
    const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
        alert(`${oversizedFiles.length} file(s) exceed 10MB limit and will be skipped.`);
    }

    const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);

    // Limit to 20 files
    if (validFiles.length > 20) {
        alert(`You can only upload up to 20 images at once. Only the first 20 will be processed.`);
        validFiles.splice(20);
    }

    // Add files to uploaded images
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = {
                id: generateId(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                url: e.target.result,
                originalWidth: 0,
                originalHeight: 0,
                status: 'pending', // 'pending', 'compressed', 'resized'
                processed: null,
                resultUrl: null,
                resultSize: 0,
                compressionRatio: 0
            };

            // Get image dimensions
            const img = new Image();
            img.onload = function () {
                imageData.originalWidth = this.width;
                imageData.originalHeight = this.height;

                // Set initial aspect ratio if not set
                if (!originalAspectRatio) {
                    originalAspectRatio = this.width / this.height;
                }
            };
            img.src = e.target.result;

            uploadedImages.push(imageData);
            updateUploadedList();
        };
        reader.readAsDataURL(file);
    });

    // Reset file input
    fileInput.value = '';
}

// Update uploaded images list
function updateUploadedList() {
    totalImagesSpan.textContent = uploadedImages.length;

    if (uploadedImages.length > 0) {
        settingsSection.classList.remove('hidden');
        uploadedList.classList.remove('hidden');

        // Clear container
        imagesContainer.innerHTML = '';

        // Add each image to the list
        uploadedImages.forEach((image) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors group';

            // Determine status badge
            let statusBadge = '';
            if (image.status === 'compressed') {
                statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">COMPRESSED</span>';
            } else if (image.status === 'resized') {
                statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-500/20 text-secondary-300 border border-secondary-500/20">RESIZED</span>';
            } else {
                statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/20">PENDING</span>';
            }

            // Determine action button
            let actionButton = '';
            if (image.status === 'pending') {
                if (currentMode === 'compress') {
                    actionButton = `
                        <button class="final-action-btn compress-btn final-compress-btn w-full py-2 rounded-xl bg-primary-600/20 text-primary-300 hover:bg-primary-600 hover:text-white border border-primary-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2" data-id="${image.id}">
                            <span class="material-symbols-outlined text-sm">compress</span>
                            Compress Now
                        </button>
                    `;
                } else {
                    actionButton = `
                        <button class="final-action-btn resize-btn final-resize-btn w-full py-2 rounded-xl bg-secondary-600/20 text-secondary-300 hover:bg-secondary-600 hover:text-white border border-secondary-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2" data-id="${image.id}">
                            <span class="material-symbols-outlined text-sm">aspect_ratio</span>
                            Resize Now
                        </button>
                    `;
                }
            } else {
                actionButton = `
                    <button class="final-action-btn download-btn final-download-btn w-full py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2" data-id="${image.id}">
                        <span class="material-symbols-outlined text-sm">download</span>
                        Download
                    </button>
                `;
            }

            imageCard.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="size-12 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                        <img src="${image.url}" alt="Preview" class="size-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <p class="text-white font-medium text-sm truncate pr-2">${image.name}</p>
                            ${statusBadge}
                        </div>
                        <p class="text-slate-400 text-xs">${formatFileSize(image.size)} • ${image.originalWidth}×${image.originalHeight}</p>
                        ${image.status !== 'pending' ? `
                            <p class="text-emerald-400 text-xs font-bold mt-0.5">
                                ${currentMode === 'compress' ? 'Saved: ' + (image.compressionRatio * 100).toFixed(1) + '%' : 'Resized: ' + image.resultSize + ' (' + formatFileSize(image.resultSize) + ')'}
                            </p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex gap-2 mt-2">
                    <button class="preview-btn flex-1 flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" data-id="${image.id}">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                        Preview
                    </button>
                    
                    <button class="remove-image-btn flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" data-id="${image.id}">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
                
                <div class="mt-2">
                    ${actionButton}
                </div>
            `;

            imagesContainer.appendChild(imageCard);
        });

        // Add event listeners for buttons
        document.querySelectorAll('.remove-image-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                removeImage(id);
            });
        });

        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                previewImage(id);
            });
        });

        // Final action buttons
        document.querySelectorAll('.final-compress-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                processSingleImage(id);
            });
        });

        document.querySelectorAll('.final-resize-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                processSingleImage(id);
            });
        });

        document.querySelectorAll('.final-download-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                downloadProcessedImageById(id);
            });
        });
    } else {
        settingsSection.classList.add('hidden');
        uploadedList.classList.add('hidden');
        resultsSection.classList.add('hidden');
    }
}

// Remove image from list
function removeImage(id) {
    uploadedImages = uploadedImages.filter(img => img.id !== id);
    updateUploadedList();
}

// Clear all images
function clearAllImages() {
    if (uploadedImages.length > 0) {
        if (confirm('Are you sure you want to remove all images?')) {
            uploadedImages = [];
            processedResults = [];
            updateUploadedList();
            resultsSection.classList.add('hidden');
        }
    }
}

// Preview image in modal
function previewImage(id) {
    const image = uploadedImages.find(img => img.id === id);
    if (!image) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4';

    // Status text logic
    const statusText = image.status === 'pending' ? 'Not Processed' : image.status === 'compressed' ? 'Compressed' : 'Resized';

    modal.innerHTML = `
        <div class="bg-[#0f172a] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-enter">
            <div class="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <h3 class="text-white font-bold text-lg flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary-400">image</span>
                    ${image.name}
                </h3>
                <button class="text-slate-400 hover:text-white close-modal p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto bg-[#0f172a]">
                <div class="flex justify-center bg-black/30 rounded-xl border border-white/5 p-4 mb-6">
                    <img src="${image.status !== 'pending' && image.resultUrl ? image.resultUrl : image.url}" alt="${image.name}" class="max-h-[50vh] object-contain rounded-lg shadow-lg">
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p class="text-slate-400 text-xs uppercase font-bold mb-1">File Size</p>
                        <p class="text-white font-mono">${formatFileSize(image.size)}</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p class="text-slate-400 text-xs uppercase font-bold mb-1">Dimensions</p>
                        <p class="text-white font-mono">${image.originalWidth} × ${image.originalHeight}px</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p class="text-slate-400 text-xs uppercase font-bold mb-1">Format</p>
                        <p class="text-white font-mono">${image.type.split('/')[1].toUpperCase()}</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p class="text-slate-400 text-xs uppercase font-bold mb-1">Status</p>
                        <p class="text-primary-400 font-bold">${statusText}</p>
                    </div>
                </div>
                
                ${image.status !== 'pending' ? `
                    <div class="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <h4 class="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                            <span class="material-symbols-outlined">check_circle</span>
                            Processing Result
                        </h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-slate-400 text-xs">Reduction / Change</p>
                                <p class="text-white font-bold text-lg">${currentMode === 'compress' ? (image.compressionRatio * 100).toFixed(1) + '%' : 'Completed'}</p>
                            </div>
                            <div>
                                <p class="text-slate-400 text-xs">New Size</p>
                                <p class="text-white font-bold text-lg">${formatFileSize(image.resultSize)}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                ${image.status === 'pending' ? `
                    <button class="process-from-modal-btn px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2" data-id="${image.id}">
                        <span class="material-symbols-outlined text-sm">play_arrow</span>
                        ${currentMode === 'compress' ? 'Compress Now' : 'Resize Now'}
                    </button>
                ` : `
                    <button class="download-from-modal-btn px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2" data-id="${image.id}">
                        <span class="material-symbols-outlined text-sm">download</span>
                        Download
                    </button>
                `}
                <button class="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-colors close-modal">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal logic
    const closeBtns = modal.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', () => document.body.removeChild(modal)));

    // Process from modal
    const processBtn = modal.querySelector('.process-from-modal-btn');
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            const id = processBtn.getAttribute('data-id');
            document.body.removeChild(modal);
            processSingleImage(id);
        });
    }

    // Download from modal
    const downloadBtn = modal.querySelector('.download-from-modal-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const id = downloadBtn.getAttribute('data-id');
            document.body.removeChild(modal);
            downloadProcessedImageById(id);
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Show single result
function showResult(result) {
    if (!resultsSection.classList.contains('hidden')) {
        addResultToContainer(result);
    }
}

// Show all results
function showAllResults() {
    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    updateResultsTitle();

    processedResults.forEach(result => {
        addResultToContainer(result);
    });
}

// Update results title based on mode
function updateResultsTitle() {
    if (currentMode === 'compress') {
        resultsTitle.textContent = 'Compression Results';
    } else {
        resultsTitle.textContent = 'Resizing Results';
    }
}

// Add result to results container
function addResultToContainer(result) {
    const resultElement = document.createElement('div');
    resultElement.className = 'glass rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5 hover:bg-white/5 transition-colors group';

    if (result.mode === 'compress') {
        const savingsPercent = (result.compressionRatio * 100).toFixed(1);
        const savingsClass = result.compressionRatio > 0.3 ? 'text-emerald-400' :
            result.compressionRatio > 0.1 ? 'text-amber-400' : 'text-slate-400';

        resultElement.innerHTML = `
            <div class="flex items-center gap-4 flex-1 w-full sm:w-auto">
                <div class="size-16 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                    <img src="${result.resultUrl}" alt="Compressed" class="size-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-bold text-sm truncate" title="${result.name}">${result.name}</h4>
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">${result.width}×${result.height}</span>
                        <span class="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">${result.format.split('/')[1]}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Original</p>
                    <p class="text-slate-300 font-mono text-xs">${formatFileSize(result.originalSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">New</p>
                    <p class="text-white font-mono text-sm">${formatFileSize(result.processedSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Saved</p>
                    <p class="font-bold text-sm ${savingsClass}">${savingsPercent}%</p>
                </div>
            </div>
             
             <button class="download-btn w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2" data-id="${result.id}">
                <span class="material-symbols-outlined text-lg">download</span>
                <span>Download</span>
            </button>
        `;
    } else {
        // Resize results
        const sizeChange = result.sizeChange >= 0 ? '+' : '';
        const sizeChangeClass = result.sizeChange < 0 ? 'text-emerald-400' :
            result.sizeChange > 0 ? 'text-amber-400' : 'text-slate-400';

        resultElement.innerHTML = `
            <div class="flex items-center gap-4 flex-1 w-full sm:w-auto">
                <div class="size-16 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                    <img src="${result.resultUrl}" alt="Resized" class="size-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-bold text-sm truncate" title="${result.name}">${result.name}</h4>
                    <div class="flex flex-col gap-1 mt-1">
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-slate-500">${result.originalWidth}×${result.originalHeight}</span>
                            <span class="text-slate-600">→</span>
                            <span class="text-white font-mono">${result.width}×${result.height}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Original</p>
                    <p class="text-slate-300 font-mono text-xs">${formatFileSize(result.originalSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">New</p>
                    <p class="text-white font-mono text-sm">${formatFileSize(result.processedSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Change</p>
                    <p class="font-bold text-sm ${sizeChangeClass}">${sizeChange}${result.sizeChangePercent}%</p>
                </div>
            </div>
            
            <button class="download-btn w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2" data-id="${result.id}">
                <span class="material-symbols-outlined text-lg">download</span>
                <span>Download</span>
            </button>
        `;
    }

    resultsContainer.appendChild(resultElement);

    // Add download event listener
    resultElement.querySelector('.download-btn').addEventListener('click', () => {
        downloadProcessedImage(result);
    });
}

// Download a single processed image
function downloadProcessedImage(result) {
    const link = document.createElement('a');
    link.href = result.resultUrl;

    // Create filename based on mode
    const prefix = result.mode === 'compress' ? 'compressed_' : 'resized_';
    link.download = prefix + result.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke object URL after delay
    setTimeout(() => {
        URL.revokeObjectURL(result.resultUrl);
    }, 1000);
}

// Download processed image by ID
function downloadProcessedImageById(id) {
    const image = uploadedImages.find(img => img.id === id);
    if (!image || image.status === 'pending') {
        showToast('error', 'Image not processed yet');
        return;
    }

    const link = document.createElement('a');
    link.href = image.resultUrl;

    // Create filename based on mode
    const prefix = image.status === 'compressed' ? 'compressed_' : 'resized_';
    link.download = prefix + image.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', `Downloading "${image.name}"`);
}

// Download all processed images
function downloadAllProcessed() {
    if (processedResults.length === 0) {
        // Check if any images have been processed
        const processedImages = uploadedImages.filter(img => img.status !== 'pending');
        if (processedImages.length === 0) {
            showToast('error', 'No images have been processed yet');
            return;
        }

        // Download all processed images
        showToast('info', `Downloading ${processedImages.length} processed file(s)...`);

        processedImages.forEach((image, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = image.resultUrl;
                const prefix = image.status === 'compressed' ? 'compressed_' : 'resized_';
                link.download = prefix + image.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 300);
        });

        return;
    }

    if (processedResults.length === 1) {
        // Single file, just download it
        downloadProcessedImage(processedResults[0]);
        return;
    }

    // For multiple files, download them individually
    showToast('info', `Downloading ${processedResults.length} file(s)...`);

    processedResults.forEach((result, index) => {
        setTimeout(() => {
            downloadProcessedImage(result);
        }, index * 300);
    });
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Toast notification
function showToast(type, message) {
    // Check if toast container exists, if not create it (though index.html has it now)
    let toastContainer = document.getElementById('toast');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast';
        toastContainer.className = 'fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300';
        document.body.appendChild(toastContainer);
    }

    // Icon and Color map
    const styles = {
        success: { icon: 'check_circle', color: 'text-emerald-400' },
        error: { icon: 'error', color: 'text-red-400' },
        warning: { icon: 'warning', color: 'text-amber-400' },
        info: { icon: 'info', color: 'text-blue-400' }
    };

    const style = styles[type] || styles.info;

    toastContainer.innerHTML = `
        <div class="glass border border-white/10 rounded-xl p-4 shadow-2xl flex items-center gap-3 text-white">
            <span class="material-symbols-outlined ${style.color}">${style.icon}</span>
            <span class="font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.classList.add('translate-y-20', 'opacity-0')" class="ml-2 text-slate-400 hover:text-white">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    `;

    // Show
    requestAnimationFrame(() => {
        toastContainer.classList.remove('translate-y-20', 'opacity-0');
    });

    // Hide after 3s
    setTimeout(() => {
        toastContainer.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Initialize the application
function init() {
    // initTheme(); // Theme is enforced to dark now
    updateQualityValue();
    updatePercentageValue();
    switchTab('compress');
    switchResizeMode('custom');
}
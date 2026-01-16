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
selectImagesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
batchCompressBtn.addEventListener('click', startBatchCompression);
batchResizeBtn.addEventListener('click', startBatchResize);
downloadAllBtn.addEventListener('click', downloadAllProcessed);
themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);
clearAllBtn.addEventListener('click', clearAllImages);
qualitySlider.addEventListener('input', updateQualityValue);
percentageSlider.addEventListener('input', updatePercentageValue);
aspectRatioToggle.addEventListener('change', toggleAspectRatioLock);
resizeWidthInput.addEventListener('input', handleWidthChange);
resizeHeightInput.addEventListener('input', handleHeightChange);

// Mobile Menu Event Listeners
mobileMenuBtn.addEventListener('click', openMobileMenu);
closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
    }
});

// Mobile menu tab switching
mobileMenuCompress.addEventListener('click', () => {
    switchTab('compress');
    closeMobileMenu();
});

mobileMenuResize.addEventListener('click', () => {
    switchTab('resize');
    closeMobileMenu();
});

// Tab Switching
tabCompress.addEventListener('click', () => switchTab('compress'));
tabResize.addEventListener('click', () => switchTab('resize'));
tabCompressMobile.addEventListener('click', () => switchTab('compress'));
tabResizeMobile.addEventListener('click', () => switchTab('resize'));

// Resize Mode Switching
resizeModeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const mode = this.id.replace('resize-mode-', '');
        switchResizeMode(mode);
    });
});

// Aspect Ratio Buttons
aspectRatioButtons.forEach(button => {
    button.addEventListener('click', function() {
        const width = parseInt(this.getAttribute('data-width'));
        const height = parseInt(this.getAttribute('data-height'));
        const ratio = this.getAttribute('data-ratio');
        
        // Update inputs
        resizeWidthInput.value = width;
        resizeHeightInput.value = height;
        
        // Update active state
        aspectRatioButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Lock aspect ratio
        aspectRatioToggle.checked = true;
    });
});

// Preset Size Buttons
presetSizeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const width = parseInt(this.getAttribute('data-width'));
        const height = parseInt(this.getAttribute('data-height'));
        
        // Update inputs
        resizeWidthInput.value = width;
        resizeHeightInput.value = height;
        
        // Update active state
        presetSizeButtons.forEach(btn => btn.classList.remove('active', 'bg-primary/10', 'dark:bg-primary/20'));
        this.classList.add('active', 'bg-primary/10', 'dark:bg-primary/20');
        this.classList.add('border-primary', 'dark:border-primary');
    });
});

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
function init() {
    initTheme();
    updateQualityValue();
    updatePercentageValue();
    switchTab('compress');
    switchResizeMode('custom');
}

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
    
    // Update tab buttons
    const tabs = [tabCompress, tabResize, tabCompressMobile, tabResizeMobile];
    tabs.forEach(t => t.classList.remove('active'));
    
    // Update mobile menu buttons
    mobileMenuCompress.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
    mobileMenuResize.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
    mobileMenuCompress.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
    mobileMenuResize.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
    
    if (tab === 'compress') {
        tabCompress.classList.add('active');
        tabCompressMobile.classList.add('active');
        compressSettings.classList.remove('hidden');
        resizeSettings.classList.add('hidden');
        mainTitle.textContent = 'Smart Image Compression';
        mainSubtitle.textContent = 'Reduce file size by up to 80% while maintaining perfect quality. Fast, secure, and free.';
        batchCompressBtn.classList.remove('hidden');
        batchResizeBtn.classList.add('hidden');
        
        // Update mobile menu active state
        mobileMenuCompress.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        mobileMenuCompress.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
    } else {
        tabResize.classList.add('active');
        tabResizeMobile.classList.add('active');
        compressSettings.classList.add('hidden');
        resizeSettings.classList.remove('hidden');
        mainTitle.textContent = 'Image Resizer Tool';
        mainSubtitle.textContent = 'Resize images to any dimension with perfect quality. Batch resize, aspect ratio control, and more.';
        batchCompressBtn.classList.add('hidden');
        batchResizeBtn.classList.remove('hidden');
        
        // Update mobile menu active state
        mobileMenuResize.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
        mobileMenuResize.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
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
        reader.onload = function(e) {
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
            img.onload = function() {
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
            imageCard.className = 'flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4';
            
            // Determine status badge
            let statusBadge = '';
            if (image.status === 'compressed') {
                statusBadge = '<span class="status-badge status-compressed">Compressed</span>';
            } else if (image.status === 'resized') {
                statusBadge = '<span class="status-badge status-resized">Resized</span>';
            } else {
                statusBadge = '<span class="status-badge status-pending">Pending</span>';
            }
            
            // Determine action button
            let actionButton = '';
            if (image.status === 'pending') {
                if (currentMode === 'compress') {
                    actionButton = `
                        <button class="final-action-btn compress-btn final-compress-btn" data-id="${image.id}">
                            <span class="material-symbols-outlined text-sm">compress</span>
                            Compress Now
                        </button>
                    `;
                } else {
                    actionButton = `
                        <button class="final-action-btn resize-btn final-resize-btn" data-id="${image.id}">
                            <span class="material-symbols-outlined text-sm">photo_size_select_large</span>
                            Resize Now
                        </button>
                    `;
                }
            } else {
                actionButton = `
                    <button class="final-action-btn download-btn final-download-btn" data-id="${image.id}">
                        <span class="material-symbols-outlined text-sm">download</span>
                        Download
                    </button>
                `;
            }
            
            imageCard.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="size-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <img src="${image.url}" alt="Preview" class="size-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <p class="text-slate-900 dark:text-white font-medium text-sm truncate">${image.name}</p>
                            ${statusBadge}
                        </div>
                        <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">${formatFileSize(image.size)} • ${image.originalWidth}×${image.originalHeight}</p>
                        ${image.status !== 'pending' ? `
                            <p class="text-success text-xs font-medium mt-1">
                                ${currentMode === 'compress' ? 'Saved: ' + (image.compressionRatio * 100).toFixed(1) + '%' : 'Resized: ' + image.resultSize + ' (' + formatFileSize(image.resultSize) + ')'}
                            </p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button class="preview-btn flex-1 flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-primary transition-colors" data-id="${image.id}">
                        <span class="material-symbols-outlined text-base">visibility</span>
                        <span>Preview</span>
                    </button>
                    
                    <button class="remove-image-btn flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-red-300" data-id="${image.id}">
                        <span class="material-symbols-outlined text-lg">delete</span>
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
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeImage(id);
            });
        });
        
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                previewImage(id);
            });
        });
        
        // Final action buttons
        document.querySelectorAll('.final-compress-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                processSingleImage(id);
            });
        });
        
        document.querySelectorAll('.final-resize-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                processSingleImage(id);
            });
        });
        
        document.querySelectorAll('.final-download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
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
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 class="text-slate-900 dark:text-white font-bold">${image.name}</h3>
                <button class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 close-modal">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-4 overflow-auto max-h-[70vh]">
                <img src="${image.status !== 'pending' && image.resultUrl ? image.resultUrl : image.url}" alt="${image.name}" class="max-w-full h-auto mx-auto rounded-lg">
                <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <p class="text-slate-500 dark:text-slate-400">File Size</p>
                        <p class="text-slate-900 dark:text-white font-medium">${formatFileSize(image.size)}</p>
                    </div>
                    <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <p class="text-slate-500 dark:text-slate-400">Dimensions</p>
                        <p class="text-slate-900 dark:text-white font-medium">${image.originalWidth} × ${image.originalHeight}px</p>
                    </div>
                    <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <p class="text-slate-500 dark:text-slate-400">Format</p>
                        <p class="text-slate-900 dark:text-white font-medium">${image.type.split('/')[1].toUpperCase()}</p>
                    </div>
                    <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <p class="text-slate-500 dark:text-slate-400">Status</p>
                        <p class="text-slate-900 dark:text-white font-medium">${image.status === 'pending' ? 'Not Processed' : image.status === 'compressed' ? 'Compressed' : 'Resized'}</p>
                    </div>
                </div>
                ${image.status !== 'pending' ? `
                    <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 class="text-green-800 dark:text-green-300 font-bold mb-2">Processing Result</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <p class="text-green-700 dark:text-green-400 text-xs">${currentMode === 'compress' ? 'Compression' : 'Resize'} Ratio</p>
                                <p class="text-green-900 dark:text-green-300 font-bold">${currentMode === 'compress' ? (image.compressionRatio * 100).toFixed(1) + '%' : 'Completed'}</p>
                            </div>
                            <div>
                                <p class="text-green-700 dark:text-green-400 text-xs">New Size</p>
                                <p class="text-green-900 dark:text-green-300 font-bold">${formatFileSize(image.resultSize)}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                ${image.status === 'pending' ? `
                    <button class="process-from-modal-btn px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium" data-id="${image.id}">
                        ${currentMode === 'compress' ? 'Compress Now' : 'Resize Now'}
                    </button>
                ` : `
                    <button class="download-from-modal-btn px-4 py-2 bg-success hover:bg-green-700 text-white rounded-lg font-medium" data-id="${image.id}">
                        Download
                    </button>
                `}
                <button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium close-modal">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
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

// Process a single image (Compress or Resize)
function processSingleImage(id) {
    const image = uploadedImages.find(img => img.id === id);
    if (!image || isProcessing) return;
    
    if (currentMode === 'compress') {
        const quality = parseInt(qualitySlider.value) / 100;
        const maxWidth = parseInt(maxWidthInput.value);
        const outputFormat = outputFormatSelect.value;
        
        compressImage(image, quality, maxWidth, outputFormat)
            .then(result => {
                // Update the image
                const index = uploadedImages.findIndex(img => img.id === id);
                if (index !== -1) {
                    uploadedImages[index].status = 'compressed';
                    uploadedImages[index].processed = result.processedBlob;
                    uploadedImages[index].resultUrl = result.resultUrl;
                    uploadedImages[index].resultSize = result.processedSize;
                    uploadedImages[index].compressionRatio = result.compressionRatio;
                    
                    // Add to processed results
                    processedResults.push(result);
                    
                    // Update UI
                    updateUploadedList();
                    showResult(result);
                    
                    // Show success message
                    showToast('success', `"${image.name}" compressed successfully!`);
                }
            })
            .catch(error => {
                console.error('Processing error:', error);
                showToast('error', `Failed to compress "${image.name}"`);
            });
    } else {
        // Resize mode
        let targetWidth, targetHeight;
        
        if (resizeMode === 'custom') {
            targetWidth = parseInt(resizeWidthInput.value);
            targetHeight = parseInt(resizeHeightInput.value);
        } else if (resizeMode === 'preset') {
            targetWidth = parseInt(resizeWidthInput.value);
            targetHeight = parseInt(resizeHeightInput.value);
        } else {
            // Percentage mode
            const percentage = parseInt(percentageSlider.value) / 100;
            targetWidth = Math.round(image.originalWidth * percentage);
            targetHeight = Math.round(image.originalHeight * percentage);
        }
        
        resizeImage(image, targetWidth, targetHeight)
            .then(result => {
                // Update the image
                const index = uploadedImages.findIndex(img => img.id === id);
                if (index !== -1) {
                    uploadedImages[index].status = 'resized';
                    uploadedImages[index].processed = result.processedBlob;
                    uploadedImages[index].resultUrl = result.resultUrl;
                    uploadedImages[index].resultSize = result.processedSize;
                    uploadedImages[index].compressionRatio = result.sizeChangePercent / 100;
                    
                    // Add to processed results
                    processedResults.push(result);
                    
                    // Update UI
                    updateUploadedList();
                    showResult(result);
                    
                    // Show success message
                    showToast('success', `"${image.name}" resized successfully!`);
                }
            })
            .catch(error => {
                console.error('Processing error:', error);
                showToast('error', `Failed to resize "${image.name}"`);
            });
    }
}

// Start batch compression
function startBatchCompression() {
    if (uploadedImages.length === 0 || isProcessing) return;
    
    isProcessing = true;
    processedResults = [];
    resultsContainer.innerHTML = '';
    resultsSection.classList.add('hidden');
    
    // Show progress section
    progressSection.classList.remove('hidden');
    progressTitle.textContent = 'Compressing Images';
    totalCount.textContent = uploadedImages.length;
    processedCount.textContent = '0';
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting compression...';
    
    const quality = parseInt(qualitySlider.value) / 100;
    const maxWidth = parseInt(maxWidthInput.value);
    const outputFormat = outputFormatSelect.value;
    
    processBatch(uploadedImages, 'compress', { quality, maxWidth, outputFormat });
}

// Start batch resize
function startBatchResize() {
    if (uploadedImages.length === 0 || isProcessing) return;
    
    isProcessing = true;
    processedResults = [];
    resultsContainer.innerHTML = '';
    resultsSection.classList.add('hidden');
    
    // Show progress section
    progressSection.classList.remove('hidden');
    progressTitle.textContent = 'Resizing Images';
    totalCount.textContent = uploadedImages.length;
    processedCount.textContent = '0';
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting resizing...';
    
    let resizeParams = {};
    
    if (resizeMode === 'custom' || resizeMode === 'preset') {
        resizeParams = {
            width: parseInt(resizeWidthInput.value),
            height: parseInt(resizeHeightInput.value)
        };
    } else {
        resizeParams = {
            percentage: parseInt(percentageSlider.value) / 100
        };
    }
    
    processBatch(uploadedImages, 'resize', resizeParams);
}

// Process batch of images
function processBatch(images, mode, params) {
    let processed = 0;
    
    // Process each image
    images.forEach((image, index) => {
        setTimeout(() => {
            const processPromise = mode === 'compress' 
                ? compressImage(image, params.quality, params.maxWidth, params.outputFormat)
                : resizeImage(image, params.width, params.height, params.percentage);
            
            processPromise
                .then(result => {
                    // Update the image
                    const imgIndex = uploadedImages.findIndex(img => img.id === image.id);
                    if (imgIndex !== -1) {
                        uploadedImages[imgIndex].status = mode === 'compress' ? 'compressed' : 'resized';
                        uploadedImages[imgIndex].processed = result.processedBlob;
                        uploadedImages[imgIndex].resultUrl = result.resultUrl;
                        uploadedImages[imgIndex].resultSize = result.processedSize;
                        uploadedImages[imgIndex].compressionRatio = mode === 'compress' ? result.compressionRatio : result.sizeChangePercent / 100;
                    }
                    
                    // Add to results
                    processedResults.push(result);
                    processed++;
                    
                    // Update progress
                    const progress = (processed / images.length) * 100;
                    progressBar.style.width = `${progress}%`;
                    processedCount.textContent = processed;
                    progressText.textContent = `${mode === 'compress' ? 'Compressing' : 'Resizing'} ${image.name}...`;
                    
                    // If all images processed
                    if (processed === images.length) {
                        isProcessing = false;
                        progressText.textContent = 'Processing complete!';
                        
                        // Update UI
                        updateUploadedList();
                        
                        // Hide progress after delay
                        setTimeout(() => {
                            progressSection.classList.add('hidden');
                            showAllResults();
                            showToast('success', `Successfully processed ${images.length} image(s)!`);
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Processing error:', error);
                    processed++;
                    
                    if (processed === images.length) {
                        isProcessing = false;
                        progressSection.classList.add('hidden');
                        showAllResults();
                    }
                });
        }, index * 100); // Stagger the processing
    });
}

// Compress image function
function compressImage(image, quality, maxWidth, outputFormat) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            // Calculate new dimensions
            let width = this.width;
            let height = this.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            
            // Fill with white background for transparent images
            if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Determine output format
            let mimeType = image.type;
            if (outputFormat !== 'original') {
                mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
            }
            
            // Compress to blob
            canvas.toBlob(
                blob => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob conversion failed'));
                        return;
                    }
                    
                    const compressionRatio = 1 - (blob.size / image.size);
                    const result = {
                        id: image.id,
                        name: image.name,
                        originalSize: image.size,
                        processedSize: blob.size,
                        compressionRatio: compressionRatio,
                        processedBlob: blob,
                        resultUrl: URL.createObjectURL(blob),
                        format: mimeType,
                        width: width,
                        height: height,
                        mode: 'compress'
                    };
                    
                    resolve(result);
                },
                mimeType,
                quality
            );
        };
        
        img.onerror = reject;
        img.src = image.url;
    });
}

// Resize image function
function resizeImage(image, targetWidth, targetHeight, percentage = null) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            // Calculate dimensions based on mode
            let width, height;
            
            if (percentage) {
                width = Math.round(this.width * percentage);
                height = Math.round(this.height * percentage);
            } else {
                width = targetWidth;
                height = targetHeight;
            }
            
            // Ensure minimum dimensions
            width = Math.max(10, width);
            height = Math.max(10, height);
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            
            // Use high-quality image scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob(
                blob => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob conversion failed'));
                        return;
                    }
                    
                    const sizeChange = blob.size - image.size;
                    const sizeChangePercent = ((blob.size / image.size - 1) * 100).toFixed(1);
                    
                    const result = {
                        id: image.id,
                        name: image.name,
                        originalSize: image.size,
                        processedSize: blob.size,
                        sizeChange: sizeChange,
                        sizeChangePercent: sizeChangePercent,
                        processedBlob: blob,
                        resultUrl: URL.createObjectURL(blob),
                        format: image.type,
                        originalWidth: image.originalWidth,
                        originalHeight: image.originalHeight,
                        width: width,
                        height: height,
                        mode: 'resize'
                    };
                    
                    resolve(result);
                },
                image.type,
                0.95 // High quality for resizing
            );
        };
        
        img.onerror = reject;
        img.src = image.url;
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
    resultElement.className = 'flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4';
    
    if (result.mode === 'compress') {
        const savingsPercent = (result.compressionRatio * 100).toFixed(1);
        const savingsClass = result.compressionRatio > 0.3 ? 'text-success' : 
                           result.compressionRatio > 0.1 ? 'text-warning' : 'text-slate-600 dark:text-slate-400';
        
        resultElement.innerHTML = `
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="size-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <img src="${result.resultUrl}" alt="Compressed" class="size-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-slate-900 dark:text-white font-medium text-sm truncate">${result.name}</p>
                    <div class="flex flex-wrap gap-3 mt-1">
                        <span class="text-xs text-slate-500 dark:text-slate-400">${result.width}×${result.height}px</span>
                        <span class="text-xs text-slate-500 dark:text-slate-400">${result.format.split('/')[1].toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-6">
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Original</p>
                    <p class="text-slate-900 dark:text-white font-medium text-sm">${formatFileSize(result.originalSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Compressed</p>
                    <p class="text-slate-900 dark:text-white font-medium text-sm">${formatFileSize(result.processedSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Saved</p>
                    <p class="font-bold text-sm ${savingsClass}">${savingsPercent}%</p>
                </div>
                
                <button class="download-btn flex items-center gap-1.5 rounded-lg h-9 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors shadow-sm" data-id="${result.id}">
                    <span class="material-symbols-outlined text-lg">download</span>
                    <span>Download</span>
                </button>
            </div>
        `;
    } else {
        // Resize results
        const sizeChange = result.sizeChange >= 0 ? '+' : '';
        const sizeChangeClass = result.sizeChange < 0 ? 'text-success' : 
                              result.sizeChange > 0 ? 'text-warning' : 'text-slate-600 dark:text-slate-400';
        
        resultElement.innerHTML = `
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="size-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <img src="${result.resultUrl}" alt="Resized" class="size-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-slate-900 dark:text-white font-medium text-sm truncate">${result.name}</p>
                    <div class="flex flex-col gap-1 mt-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-500 dark:text-slate-400">${result.originalWidth}×${result.originalHeight} →</span>
                            <span class="text-xs text-primary font-medium">${result.width}×${result.height}px</span>
                        </div>
                        <span class="text-xs text-slate-500 dark:text-slate-400">${result.format.split('/')[1].toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-6">
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Original</p>
                    <p class="text-slate-900 dark:text-white font-medium text-sm">${formatFileSize(result.originalSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Resized</p>
                    <p class="text-slate-900 dark:text-white font-medium text-sm">${formatFileSize(result.processedSize)}</p>
                </div>
                
                <div class="text-center">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Change</p>
                    <p class="font-bold text-sm ${sizeChangeClass}">${sizeChange}${result.sizeChangePercent}%</p>
                </div>
                
                <button class="download-btn flex items-center gap-1.5 rounded-lg h-9 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors shadow-sm" data-id="${result.id}">
                    <span class="material-symbols-outlined text-lg">download</span>
                    <span>Download</span>
                </button>
            </div>
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
        alert(`Downloading ${processedImages.length} processed file(s) individually...`);
        
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
    alert(`Downloading ${processedResults.length} file(s) individually...`);
    
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
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-transform duration-300 translate-x-full`;
    
    let bgColor = 'bg-green-500';
    let icon = 'check_circle';
    
    if (type === 'error') {
        bgColor = 'bg-red-500';
        icon = 'error';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
        icon = 'warning';
    }
    
    toast.innerHTML = `
        <span class="material-symbols-outlined text-white">${icon}</span>
        <span class="text-white font-medium">${message}</span>
    `;
    
    toast.classList.add(bgColor);
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
}

// Initialize the application
init();
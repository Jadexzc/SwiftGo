/**
 * Swift Go - Main Application Script
 */

// -----------------------------
// Helper: Normalize Names
// -----------------------------
const normalizeName = str => str.trim().toLowerCase();

// -----------------------------
// Initialize AOS (Animate on Scroll)
// -----------------------------
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 800, 
            once: true,
            offset: 100
        });
    }
}

// -----------------------------
// Navbar & Back to Top Scroll Effects
// -----------------------------
function handleScrollEffects() {
    const nav = document.querySelector('.modern-nav');
    const backBtn = document.getElementById('backToTop');
    
    // Using requestAnimationFrame for smoother performance during scroll
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // Navbar State
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }

                // Back to Top Button Visibility
                if (backBtn) {
                    if (window.scrollY > 400) {
                        backBtn.classList.add('show');
                    } else {
                        backBtn.classList.remove('show');
                    }
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Back to Top Click Action
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// -----------------------------
// Search Functionality
// -----------------------------
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const noResults = document.getElementById('no-results');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            let hasVisibleItems = false;

            galleryItems.forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                if (name.includes(query)) {
                    item.classList.remove('d-none');
                    // Add animation class for a smooth reveal
                    item.classList.add('animate__animated', 'animate__fadeIn');
                    hasVisibleItems = true;
                } else {
                    item.classList.add('d-none');
                    item.classList.remove('animate__animated', 'animate__fadeIn');
                }
            });

            // Toggle No Results Message
            if (noResults) {
                if (hasVisibleItems) {
                    noResults.classList.add('d-none');
                } else {
                    noResults.classList.remove('d-none');
                }
            }

            // Refresh AOS so it detects the new positions of the visible items
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        });
    }
}

// -----------------------------
// Modern Navbar Badge Logic
// -----------------------------
function updateFavoritesCount() {
    const badge = document.getElementById('nav-fav-count');
    if (!badge) return;

    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const oldCount = parseInt(badge.textContent) || 0;
    const newCount = favorites.length;

    badge.textContent = newCount;

    if (newCount > 0) {
        badge.classList.add('badge-active');
        // Only bounce if the count actually increased
        if (newCount > oldCount) {
            badge.classList.add('animate__animated', 'animate__bounceIn');
            setTimeout(() => {
                badge.classList.remove('animate__animated', 'animate__bounceIn');
            }, 800);
        }
    } else {
        badge.classList.remove('badge-active');
    }
}

// -----------------------------
// Initialize Save Buttons (Visual State)
// -----------------------------
function initSaveButtons() {
    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    
    // Check both card buttons and specific save buttons
    document.querySelectorAll('.gallery-card button, .save-btn, .card-save-btn').forEach(btn => {
        const name = btn.dataset.name || btn.getAttribute('data-name');
        if (name && favorites.some(fav => normalizeName(fav.name) === normalizeName(name))) {
            btn.classList.add('saved'); // For custom CSS styling
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            
            // If it's a standard bootstrap button, style it accordingly
            if (btn.classList.contains('btn-outline-danger')) {
                btn.classList.replace('btn-outline-danger', 'btn-danger');
                btn.innerHTML = '<i class="fas fa-heart me-1"></i> Saved';
                btn.disabled = true;
            }
        }
    });
}

// -----------------------------
// Save to Favorites Logic
// -----------------------------
function saveToFavorites(name, img, buttonElement) {
    let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const normalized = normalizeName(name);
    const isAlreadySaved = favorites.some(fav => normalizeName(fav.name) === normalized);

    if (!isAlreadySaved) {
        favorites.push({ name, img });
        localStorage.setItem('myTravelList', JSON.stringify(favorites));

        if (buttonElement) {
            buttonElement.classList.add('animate__animated', 'animate__pulse');
            
            // UI Update for the specific button
            if (buttonElement.classList.contains('btn-outline-danger')) {
                buttonElement.classList.replace('btn-outline-danger', 'btn-danger');
                buttonElement.innerHTML = '<i class="fas fa-heart me-1"></i> Saved';
                buttonElement.disabled = true;
            } else {
                // For custom circular icons
                buttonElement.innerHTML = '<i class="fas fa-heart"></i>';
                buttonElement.classList.add('saved');
            }
        }

        updateFavoritesCount();
        
        // Custom event to sync across components if needed
        window.dispatchEvent(new Event('favoritesUpdated'));
    }
}

// Export to window for global access (so your HTML onclick works)
window.saveToFavorites = saveToFavorites;

// -----------------------------
// DOM Content Loaded
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    handleScrollEffects();
    initSearch();
    updateFavoritesCount();
    initSaveButtons();

    // Cascading entrance animation for gallery items
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
});

// Sync across multiple tabs automatically
window.addEventListener('storage', e => {
    if (e.key === 'myTravelList') {
        updateFavoritesCount();
        initSaveButtons();
    }
});
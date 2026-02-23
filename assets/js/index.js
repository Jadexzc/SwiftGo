/**
 * Swift Go - Index Page Logic
 */

// Initialize AOS Animations
AOS.init({ duration: 800, once: true });

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const noResults = document.getElementById('noResults');

    // Initial UI Sync for badge and hearts
    updateFavoriteUI();

    function filterDestinations() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const priceRange = priceFilter ? priceFilter.value : 'all';
        let visibleCount = 0;

        galleryItems.forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            const price = parseInt(item.getAttribute('data-price'));
            const link = item.querySelector('a');

            const matchesSearch = name.includes(searchTerm);
            let matchesPrice = true;
            if (priceRange !== 'all') {
                const parts = priceRange.split('-');
                const min = Number(parts[0]);
                const max = parts[1] ? Number(parts[1]) : Infinity;
                matchesPrice = price >= min && price <= max;
            }

            if (matchesSearch && matchesPrice) {
                item.classList.remove('d-none');
                visibleCount++;
                if (link) {
                    const currentHref = link.getAttribute('href');
                    const baseUrl = currentHref.split('&price=')[0]; 
                    link.setAttribute('href', `${baseUrl}&price=${priceRange}`);
                }
            } else {
                item.classList.add('d-none');
            }
        });

        if (noResults) {
            visibleCount === 0 ? noResults.classList.remove('d-none') : noResults.classList.add('d-none');
        }
    }

    if (searchInput) searchInput.addEventListener('input', filterDestinations);
    if (priceFilter) priceFilter.addEventListener('change', filterDestinations);
    filterDestinations();

    // UI Scroll Effects
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.modern-nav');
        const topBtn = document.getElementById('backToTop');
        if (window.scrollY > 50) {
            nav?.classList.add('scrolled');
            topBtn?.classList.add('show');
        } else {
            nav?.classList.remove('scrolled');
            topBtn?.classList.remove('show');
        }
    });

    document.getElementById('backToTop')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// --- FAVORITES SYNC LOGIC ---

window.saveToFavorites = function(name, image, btn) {
    let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];    
    const index = favorites.findIndex(fav => fav.name.toLowerCase() === name.toLowerCase());
    const icon = btn.querySelector('i');

    if (index === -1) {
        // Add to list
        favorites.push({ name: name, img: image });
        if (icon) {
            icon.classList.replace('far', 'fas');
            icon.style.color = '#ff4757';
        }
    } else {
        // Remove from list
        favorites.splice(index, 1);
        if (icon) {
            icon.classList.replace('fas', 'far');
            icon.style.color = 'white';
        }
    }

    localStorage.setItem('myTravelList', JSON.stringify(favorites));
    updateFavoriteUI();
};

function updateFavoriteUI() {
    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const countBadge = document.getElementById('nav-fav-count');
    
    // Update Badge Number
    if (countBadge) {
        countBadge.innerText = favorites.length;
        countBadge.style.display = favorites.length > 0 ? 'inline-block' : 'none';
    }

    // Update heart icons on cards to match state
    document.querySelectorAll('.gallery-item').forEach(item => {
        const h2 = item.querySelector('h2');
        if(!h2) return;
        const cardName = h2.innerText.trim();
        const btnIcon = item.querySelector('.card-save-btn i');
        
        const isFav = favorites.some(fav => fav.name.toLowerCase() === cardName.toLowerCase());
        if (btnIcon) {
            if (isFav) {
                btnIcon.classList.replace('far', 'fas');
                btnIcon.style.color = '#ff4757';
            } else {
                btnIcon.classList.replace('fas', 'far');
                btnIcon.style.color = 'white';
            }
        }
    });
}

// Global listener for changes made in other tabs (e.g., Favorites page)
window.addEventListener('storage', (e) => {
    if (e.key === 'myTravelList') updateFavoriteUI();
});
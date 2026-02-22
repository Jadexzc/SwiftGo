/**
 * Swift Go - Favorites Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
});

function renderFavorites() {
    const display = document.getElementById('favorites-container');
    const countBadge = document.getElementById('fav-count'); // Badge in the navbar
    
    if (!display) return;

    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];

    // Update the badge count in the nav
    if (countBadge) {
        countBadge.innerText = favorites.length;
        favorites.length > 0 ? countBadge.classList.add('badge-active') : countBadge.classList.remove('badge-active');
    }

    if (favorites.length === 0) {
        display.innerHTML = `
            <div class="col-12 text-center py-5 animate__animated animate__fadeIn">
                <i class="fas fa-heart-broken fa-3x mb-3 text-muted"></i>
                <h3 class="text-dark">Your bucket list is empty</h3>
                <p class="text-muted">Explore the beauty of the Philippines and save gems here!</p>
                <a href="index.html" class="btn btn-primary rounded-pill px-4 mt-2">Explore Now</a>
            </div>`;
        return;
    }

    let html = '';
    favorites.forEach((p, i) => {
        // We use a temporary ID for the card to handle smooth removal animations
        html += `
            <div class="col-lg-4 col-md-6 mb-4 animate__animated animate__fadeInUp" id="fav-card-${i}">
                <div class="gallery-card h-100 shadow-sm bg-white rounded-4 overflow-hidden border-0">
                    <div class="image-wrapper" style="height: 220px; overflow: hidden; position: relative;">
                        <img src="${p.img}" alt="${p.name}" class="w-100 h-100" style="object-fit: cover;">
                        <button class="card-save-btn btn-danger" onclick="removeFromFavorites('${p.name.replace(/'/g, "\\'")}', ${i})" style="background: var(--ph-red);">
                             <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="p-4">
                        <h4 class="fw-bold text-primary mb-1">${p.name}</h4>
                        <p class="text-muted small mb-3">Saved in your bucket list</p>
                        <div class="d-flex gap-2">
                             <button class="btn btn-outline-danger btn-sm rounded-pill w-100" 
                                    onclick="removeFromFavorites('${p.name.replace(/'/g, "\\'")}', ${i})">
                                <i class="fas fa-trash-alt me-2"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    display.innerHTML = html;
}

function removeFromFavorites(name, index) {
    let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    
    // 1. Update Data by filtering out the specific name
    favorites = favorites.filter(fav => fav.name !== name);
    localStorage.setItem('myTravelList', JSON.stringify(favorites));

    // 2. Visual Animation
    const card = document.getElementById(`fav-card-${index}`);
    if (card) {
        card.classList.remove('animate__fadeInUp');
        card.classList.add('animate__zoomOut');
        
        // Wait for animation to finish before re-rendering
        setTimeout(() => {
            renderFavorites();
            // Sync with navbar if updateFavoritesCount exists in index context
            if (typeof updateFavoritesCount === 'function') updateFavoritesCount();
        }, 300); 
    } else {
        renderFavorites();
    }
}

function clearAllFavorites() {
    if (confirm("Are you sure you want to remove all saved destinations?")) {
        const container = document.getElementById('favorites-container');
        
        // Animate all cards out
        container.classList.add('animate__animated', 'animate__fadeOutDown');

        setTimeout(() => {
            localStorage.removeItem('myTravelList');
            container.classList.remove('animate__fadeOutDown');
            renderFavorites();
            if (typeof updateFavoritesCount === 'function') updateFavoritesCount();
        }, 400);
    }
}
/**
 * Swift Go - My Lists (Favorites) Page Logic
 */

let currentCheckoutData = {};
let masterData = null; 
let guestData = { adult: 1, child: 0, infant: 0 };

// --- GUEST COUNTER LOGIC ---

window.updateGuest = function(type, change) {
    const newVal = guestData[type] + change;
    if (newVal >= (type === 'adult' ? 1 : 0)) {
        guestData[type] = newVal;
        document.getElementById(`cnt-${type}`).innerText = newVal;
        updateGuestSummary();
    }
};

window.clearGuests = function() {
    guestData = { adult: 1, child: 0, infant: 0 };
    document.getElementById('cnt-adult').innerText = 1;
    document.getElementById('cnt-child').innerText = 0;
    document.getElementById('cnt-infant').innerText = 0;
    updateGuestSummary();
};

function updateGuestSummary() {
    let parts = [];
    if (guestData.adult > 0) parts.push(`${guestData.adult} Adult${guestData.adult > 1 ? 's' : ''}`);
    if (guestData.child > 0) parts.push(`${guestData.child} Child${guestData.child > 1 ? 'ren' : ''}`);
    if (guestData.infant > 0) parts.push(`${guestData.infant} Infant${guestData.infant > 1 ? 's' : ''}`);
    document.getElementById('guestSummaryText').innerText = parts.join(', ') || "1 Adult";
}

window.handleDateTypeChange = function() {
    const selected = document.querySelector('input[name="schedOption"]:checked').value;
    const container = document.getElementById('dateSelectors');
    const label = document.getElementById('dateInputLabel');
    if (selected === 'Anytime') {
        container.classList.add('d-none');
    } else {
        container.classList.remove('d-none');
        label.innerText = (selected === 'Fixed') ? 'Select Date' : 'Target Start Date';
    }
};

// --- DATA & CALCULATIONS ---

async function loadDestinationData() {
    try {
        const response = await fetch('data/destinations.json'); 
        masterData = await response.json();
    } catch (error) { console.error("Data Load Error:", error); }
}

function getFees(placeName) {
    if (!masterData) return { entrance: 0, booking: 150 }; 
    for (const regionKey in masterData) {
        const region = masterData[regionKey];
        const place = region.places.find(p => p.name.toLowerCase() === placeName.toLowerCase());
        if (place) return { entrance: place.price || 0, booking: region.bookingFee || 0 };
    }
    return { entrance: 0, booking: 150 }; 
}

// --- UI RENDERING ---

function renderFavorites() {
    const display = document.getElementById('favorites-container');
    const countBadge = document.getElementById('nav-fav-count');
    if (!display) return;

    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    
    // Sync Navbar Badge
    if (countBadge) {
        countBadge.innerText = favorites.length;
        countBadge.style.display = favorites.length > 0 ? 'inline-block' : 'none';
    }

    // EMPTY STATE UI
    if (favorites.length === 0) {
        display.innerHTML = `
            <div class="col-12 text-center py-5 animate__animated animate__fadeIn">
                <div class="empty-state-container">
                    <div class="broken-heart-wrapper mb-4">
                        <i class="fas fa-heart-broken"></i>
                    </div>
                    <h2 class="fw-bold h3 mb-2">Your list is feeling lonely</h2>
                    <p class="text-muted mb-4">Start adding your 2026 bucket list destinations and <br> make your travel dreams a reality!</p>
                    <a href="index.html" class="btn-book-all px-5">
                        <i class="fas fa-compass me-2"></i>Explore Now
                    </a>
                </div>
            </div>`;
        return;
    }

    let html = '';
    let grandTotal = 0;

    favorites.forEach((p, i) => {
        const fees = getFees(p.name);
        const subtotal = fees.entrance + fees.booking;
        grandTotal += subtotal;

        html += `
            <div class="col-lg-4 col-md-6 mb-4" id="fav-card-${i}">
                <div class="gallery-card">
                    <div class="image-wrapper">
                        <img src="${p.img}" alt="${p.name}">
                        <button class="remove-btn" title="Remove from list" 
                                onclick="animateRemoval('${p.name.replace(/'/g, "\\'")}', 'fav-card-${i}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="card-body-content">
                        <h3>${p.name}</h3>
                        
                        <div class="price-breakdown">
                            <div class="w-100">
                                <div class="price-row">
                                    <span>Entrance Fee</span>
                                    <span>₱${fees.entrance.toLocaleString()}</span>
                                </div>
                                <div class="price-row">
                                    <span>Booking Fee</span>
                                    <span>₱${fees.booking.toLocaleString()}</span>
                                </div>
                                <div class="price-row total">
                                    <span>Subtotal</span>
                                    <span>₱${subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <button class="btn-book-all w-100 py-2 fs-6" 
                                onclick="handleCheckout('${p.name.replace(/'/g, "\\'")}', ${subtotal})">
                            Book This Only
                        </button>
                    </div>
                </div>
            </div>`;
    });

    html += `
        <div class="col-12 mt-4 mb-5">
            <div class="total-summary-card d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div class="text-center text-md-start mb-3 mb-md-0">
                    <span class="grand-total-label">Grand Total Budget</span>
                    <h2 class="grand-total-price m-0">₱${grandTotal.toLocaleString()}</h2>
                </div>
                <button class="btn-book-all" onclick="handleBulkCheckout()">Checkout All</button>
            </div>
        </div>`;
    display.innerHTML = html;
}

// --- PROFESSIONAL ANIMATION HANDLER ---

window.animateRemoval = function(name, cardId) {
    const cardContainer = document.getElementById(cardId);
    if (!cardContainer) return;

    // Phase 1: Slide to left and fade (uses your card-slide-out CSS)
    cardContainer.classList.add('card-slide-out');

    // Phase 2: Collapse space smoothly
    setTimeout(() => {
        cardContainer.classList.add('card-shrink');
    }, 250);

    // Phase 3: Final Removal from storage and re-render
    setTimeout(() => {
        let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
        favorites = favorites.filter(f => f.name.toLowerCase() !== name.toLowerCase());
        localStorage.setItem('myTravelList', JSON.stringify(favorites));
        renderFavorites();
    }, 500);
};

// --- CHECKOUT & MODAL LOGIC ---

function openModal(displayTitle, internalData, totalPrice) {
    currentCheckoutData = { destination: internalData, price: totalPrice };
    document.getElementById('modalDestLabel').innerText = displayTitle;
    document.getElementById('modalTotalPrice').innerText = `₱${totalPrice.toLocaleString()}`;
    
    // Autofill user info if saved previously
    document.getElementById('modalName').value = localStorage.getItem('travelerName') || "";
    document.getElementById('modalContact').value = localStorage.getItem('travelerContact') || "";
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('checkoutModal')).show();
}

window.handleCheckout = (name, price) => openModal(name, name, price);

window.handleBulkCheckout = function() {
    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    if(favorites.length === 0) return;
    let total = 0, names = [];
    favorites.forEach(f => {
        const fees = getFees(f.name);
        total += (fees.entrance + fees.booking);
        names.push(f.name);
    });
    openModal(`${favorites.length} Destinations`, names.join(', '), total);
};

window.submitCheckout = function() {
    const nameVal = document.getElementById('modalName').value;
    const contactVal = document.getElementById('modalContact').value;
    const schedOption = document.querySelector('input[name="schedOption"]:checked');
    const travelDate = document.getElementById('modalTripDate').value;
    const durationDays = document.getElementById('tripDuration').value;

    if (!nameVal || !contactVal || !schedOption) { alert("Please provide details."); return; }

    const schedType = schedOption.value;
    const guestString = `Adults: ${guestData.adult}, Children: ${guestData.child}, Infants: ${guestData.infant}`;
    const priceString = `₱${currentCheckoutData.price.toLocaleString()}`;

    // Google Forms URL with pre-filled entries
    const formBaseURL = "https://docs.google.com/forms/d/e/1FAIpQLScpYy8y74C_zdbMZxEUwj9mqOhd3btkQA9hWyJ0W5evvOsc9g/viewform";
    const finalURL = `${formBaseURL}?usp=pp_url` +
        `&entry.1771519309=${encodeURIComponent(currentCheckoutData.destination)}` +
        `&entry.735416535=${encodeURIComponent(guestString)}` +
        `&entry.478258744=${encodeURIComponent(nameVal)}` +
        `&entry.1145167868=${encodeURIComponent(contactVal)}` +
        `&entry.870599424=${encodeURIComponent(schedType)}` +
        `&entry.254589418=${encodeURIComponent(travelDate)}` +
        `&entry.376162033=${encodeURIComponent(durationDays)}` +
        `&entry.1367833301=${encodeURIComponent(priceString)}`;

    localStorage.setItem('travelerName', nameVal);
    localStorage.setItem('travelerContact', contactVal);
    
    window.open(finalURL, '_blank');
    bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();
};

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', async () => {
    await loadDestinationData();
    renderFavorites();
});
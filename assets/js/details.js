/**
 * Swift Go - Details Page Logic
 * Version: 2.2 (Restored Infant & Schedule Logic)
 */

let allDestinationsData = null;
let currentCheckoutData = {};
let guestData = { adult: 1, child: 0, infant: 0 }; 

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const region = params.get('region');
    const display = document.getElementById('content-area');
    
    const WEATHER_API_KEY = '525449a8f4664672a7e19f9c402408f8';

    if (!region) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('data/destinations.json');
        allDestinationsData = await response.json(); 

        if (!allDestinationsData[region]) {
            display.innerHTML = `<div class="text-center py-5"><h1>Region Not Found</h1></div>`;
            return;
        }

        const data = allDestinationsData[region];
        const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
        
        let html = `
            <div class="mb-5">
                <h1 class="region-title animate__animated animate__fadeInDown">${data.title}</h1>
                <p class="lead">${data.desc}</p>
            </div>
            <div class="row g-4">
        `;

        data.places.forEach((p, i) => {
            const isSaved = favorites.some(fav => fav.name.toLowerCase() === p.name.toLowerCase());
            
            html += `
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${i * 50}">
                    <div class="place-item card h-100 border-0 shadow-sm">
                        <div class="image-wrapper" onclick="openLightbox('${p.img}', '${p.name.replace(/'/g, "\\'")}')">
                            <img src="${p.img}" alt="${p.name}" class="place-image">
                            <div class="view-overlay"><i class="fas fa-expand text-white"></i></div>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h3 class="h5 fw-bold mb-2">${p.name}</h3>
                            <p class="text-muted small flex-grow-1">${p.text}</p>
                            <p class="fw-bold text-success mb-2">Entrance: ₱${p.price.toLocaleString()}</p>
                            
                            <div class="d-flex gap-2 mt-auto">
                                <button onclick="handleCheckout('${p.name.replace(/'/g, "\\'")}', ${p.price})" 
                                        class="btn btn-success btn-modern flex-grow-1">
                                    Checkout
                                </button>
                                <button class="btn ${isSaved ? 'btn-danger' : 'btn-outline-danger'} btn-modern" 
                                        onclick="saveToFavorites('${p.name.replace(/'/g, "\\'")}', '${p.img}', this)">
                                    <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        display.innerHTML = html;
        
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
        
        fetchWeather(region, WEATHER_API_KEY);
        updateBadgeOnly();

    } catch (err) {
        console.error("Error loading destinations:", err);
    }
});

// --- WEATHER SYSTEM ---
async function fetchWeather(regionKey, apiKey) {
    const cityMap = { 
        baguio: "Baguio", manila: "Manila", zambales: "Iba", 
        tagaytay: "Tagaytay", launion: "San Fernando", bulacan: "Malolos",
        cebu: "Cebu City", palawan: "Puerto Princesa", siargao: "General Luna"
    };

    const cityName = cityMap[regionKey] || "Manila";
    const widget = document.getElementById('weather-widget');

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName},PH&units=metric&appid=${apiKey}`);
        const data = await res.json();

        if (data.cod === 200 && widget) {
            widget.style.display = 'block';
            document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
            document.getElementById('description').innerText = data.weather[0].description;
            document.getElementById('humidity').innerText = data.main.humidity;
            document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        }
    } catch (e) {
        console.warn("Weather API unreachable.");
    }
}

// --- LIGHTBOX SYSTEM ---
window.openLightbox = function(imgSrc, title) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgSrc;
        if (lightboxCaption) lightboxCaption.innerText = title.replace(/\\'/g, "'");
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// --- FAVORITES & BADGE ---
function updateBadgeOnly() {
    const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const countBadge = document.getElementById('nav-fav-count');
    if (countBadge) {
        countBadge.innerText = favorites.length;
        countBadge.style.display = favorites.length > 0 ? 'inline-block' : 'none';
    }
}

window.saveToFavorites = function(name, img, btn) {
    let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const index = favorites.findIndex(fav => fav.name.toLowerCase() === name.toLowerCase());
    const icon = btn.querySelector('i');

    if (index === -1) {
        favorites.push({ name, img });
        btn.classList.replace('btn-outline-danger', 'btn-danger');
        icon.classList.replace('far', 'fas');
    } else {
        favorites.splice(index, 1);
        btn.classList.replace('btn-danger', 'btn-outline-danger');
        icon.classList.replace('fas', 'far');
    }

    localStorage.setItem('myTravelList', JSON.stringify(favorites));
    updateBadgeOnly();
};

// --- CHECKOUT & GUEST PICKER ---
window.handleCheckout = function(destinationName, price) {
    const params = new URLSearchParams(window.location.search);
    const region = params.get('region');
    const regionData = allDestinationsData ? allDestinationsData[region] : null;
    const bookingFee = (regionData && regionData.bookingFee) ? regionData.bookingFee : 0;
    const total = price + bookingFee;

    currentCheckoutData = { destination: destinationName, price: total };
    
    document.getElementById('modalName').value = localStorage.getItem('travelerName') || "";
    document.getElementById('modalContact').value = localStorage.getItem('travelerContact') || "";
    document.getElementById('modalDestLabel').innerText = destinationName;
    document.getElementById('modalTotalPrice').innerText = `₱${total.toLocaleString()}`;

    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
};

window.updateGuest = function(type, change) {
    const newVal = guestData[type] + change;
    // Check minimums (1 for adult, 0 for others)
    if (newVal >= (type === 'adult' ? 1 : 0)) {
        guestData[type] = newVal;
        document.getElementById(`cnt-${type}`).innerText = newVal;
        
        let parts = [];
        if (guestData.adult > 0) parts.push(`${guestData.adult} Adult${guestData.adult > 1 ? 's' : ''}`);
        if (guestData.child > 0) parts.push(`${guestData.child} Child${guestData.child > 1 ? 'ren' : ''}`);
        if (guestData.infant > 0) parts.push(`${guestData.infant} Infant${guestData.infant > 1 ? 's' : ''}`);
        
        document.getElementById('guestSummaryText').innerText = parts.join(', ') || "1 Adult";
    }
};

window.updateScheduleHint = function() {
    const selected = document.querySelector('input[name="schedOption"]:checked').value;
    const hint = document.getElementById('scheduleHint');
    const selectors = document.getElementById('dateSelectors');
    
    if (selected === 'Anytime') {
        selectors.style.display = 'none';
        hint.innerText = "We'll contact you for the best slot.";
    } else {
        selectors.style.display = 'flex';
        hint.innerText = selected === 'Fixed' ? "Checking exact date." : "Flexible date matching.";
    }
};

window.submitCheckout = function() {
    const userName = document.getElementById('modalName').value;
    const contactNum = document.getElementById('modalContact').value;
    const travelDate = document.getElementById('modalTripDate').value;
    const duration = document.getElementById('tripDuration').value;
    
    // Capture the schedule type
    const schedOptionEl = document.querySelector('input[name="schedOption"]:checked');
    const schedType = schedOptionEl ? schedOptionEl.value : "Fixed";

    if (!userName || !contactNum) {
        alert("Please fill in your details.");
        return;
    }

    // --- FIXED GUEST STRING FORMAT ---
    const guestStr = `Adult: ${guestData.adult}. Children: ${guestData.child}. Infant: ${guestData.infant}.`;
    
    const totalStr = `₱${currentCheckoutData.price.toLocaleString()}`;

    const formBaseURL = "https://docs.google.com/forms/d/e/1FAIpQLScpYy8y74C_zdbMZxEUwj9mqOhd3btkQA9hWyJ0W5evvOsc9g/viewform";
    const finalURL = `${formBaseURL}?usp=pp_url` +
        `&entry.1771519309=${encodeURIComponent(currentCheckoutData.destination)}` +
        `&entry.735416535=${encodeURIComponent(guestStr)}` + // Now sends: Adult: X. Children: Y. Infant: Z.
        `&entry.478258744=${encodeURIComponent(userName)}` +
        `&entry.1145167868=${encodeURIComponent(contactNum)}` +
        `&entry.870599424=${encodeURIComponent(schedType)}` + 
        `&entry.254589418=${encodeURIComponent(travelDate)}` +
        `&entry.376162033=${encodeURIComponent(duration)}` +
        `&entry.1367833301=${encodeURIComponent(totalStr)}`;

    localStorage.setItem('travelerName', userName);
    localStorage.setItem('travelerContact', contactNum);
    window.open(finalURL, '_blank');
    bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
};
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
        const data = await response.json();

        if (!data[region]) {
            display.innerHTML = `<div class="text-center py-5"><h1>Region Not Found</h1></div>`;
            return;
        }

        const favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
        
        let html = `
            <div class="mb-5 text-center text-md-start">
                <h1 class="region-title animate__animated animate__fadeInDown">${data[region].title}</h1>
                <p class="lead animate__animated animate__fadeIn animate__delay-1s">${data[region].desc}</p>
            </div>
            <div class="row g-4">
        `;

        data[region].places.forEach((p, i) => {
            const isSaved = favorites.some(fav => fav.name.toLowerCase() === p.name.toLowerCase());
            const btnClass = isSaved ? 'btn-danger' : 'btn-outline-danger';
            const btnIcon = isSaved ? 'fas fa-heart' : 'far fa-heart';
            
            html += `
                <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${i * 100}">
                    <div class="place-item">
                        <div class="image-wrapper" onclick="openLightbox('${p.img}', '${p.name}')">
                            <img src="${p.img}" alt="${p.name}" class="place-image">
                            <div class="view-overlay"><i class="fas fa-expand"></i></div>
                        </div>
                        <div class="place-info-content">
                            <h3 class="h5 fw-bold mb-2">${p.name}</h3>
                            <p class="text-muted small flex-grow-1">${p.text}</p>
                            <div class="d-flex gap-2 mt-3">
                                <a href="https://www.google.com/maps/search/${encodeURIComponent(p.name + ' ' + data[region].title)}" 
                                   target="_blank" class="btn btn-primary btn-modern flex-grow-1">
                                   <i class="fas fa-map-marker-alt me-2"></i>Map
                                </a>
                                <button class="btn ${btnClass} btn-modern" 
                                        onclick="saveToFavorites('${p.name.replace(/'/g, "\\'")}', '${p.img}', this)">
                                    <i class="${btnIcon}"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        display.innerHTML = html;
        
        AOS.init({ duration: 800, once: true });
        fetchWeather(region, WEATHER_API_KEY);

    } catch (err) {
        console.error("Error loading content:", err);
    }
});

// Global Helper Functions
window.openLightbox = function(imgSrc, title) {
    document.getElementById('lightboxImg').src = imgSrc;
    document.getElementById('lightboxCaption').innerText = title;
    document.getElementById('imageLightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    document.getElementById('imageLightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.saveToFavorites = function(name, img, btn) {
    let favorites = JSON.parse(localStorage.getItem('myTravelList')) || [];
    const exists = favorites.some(fav => fav.name.toLowerCase() === name.toLowerCase());

    if (!exists) {
        favorites.push({ name, img });
        localStorage.setItem('myTravelList', JSON.stringify(favorites));

        const icon = btn.querySelector('i');
        icon.classList.replace('far', 'fas');
        btn.classList.replace('btn-outline-danger', 'btn-danger');
        
        const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast'));
        document.getElementById('toastMessage').innerText = `${name} added to list!`;
        toast.show();
    }
};

async function fetchWeather(regionKey, apiKey) {
    const cityMap = { baguio: "Baguio", manila: "Manila", zambales: "Iba", tagaytay: "Tagaytay", launion: "San Fernando" };
    const cityName = cityMap[regionKey] || "Manila";
    
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName},PH&units=metric&appid=${apiKey}`);
        const data = await res.json();
        if(data.cod !== 200) return;

        document.getElementById('weather-widget').style.display = 'block';
        document.getElementById('temp').innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').innerText = data.weather[0].description;
        document.getElementById('humidity').innerText = data.main.humidity;
        document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    } catch(e) { console.warn("Weather API unreachable."); }
}
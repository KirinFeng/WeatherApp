
//------CONFIGURATION---------//
// The OpenWeatherMap API key is no longer hard-coded in the source code.
// It is requested from the user on first use and kept in the browser's localStorage.
const API_KEY_STORAGE = 'owmApiKey';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
// Must match the folder name exactly: GitHub Pages paths are case-sensitive.
const IMAGE_DIR = 'Images/';

//------INITIALIZE VARIABLES---------//
const cityName = document.getElementById('cityName');
const crossBtn = document.getElementById('crossBtn');
const logShow = document.getElementById('logShow');
const logTable = document.getElementById('logTable');
const Live = document.getElementById('Live');

//------EVENT LISTENERS---------//
cityName.onchange = () => {
    fetchWeather();
    localStorage.setItem('lastLocation', cityName.value);
};

cityName.onkeyup = () => crossBtn.style.display = (cityName.value == '' ? 'none' : 'inline-block');

crossBtn.onclick = () => {
    cityName.value = '';
    crossBtn.style.display = 'none';
};

window.addEventListener('load', () => {
    // getItem() returns null on first visit; fall back to an empty string
    // so the literal text "null" is never sent as a city name.
    cityName.value = localStorage.getItem('lastLocation') || '';
    crossBtn.style.display = (cityName.value == '' ? 'none' : 'inline-block');
    fetchWeather();
});

logShow.onclick = () => {
    document.getElementById('tableWrapper').classList.toggle('block');
    logShow.innerHTML = (logShow.innerHTML === 'Show Logs' ? 'Hide Logs' : 'Show Logs');
};

Live.onclick = fetchLocation;

//------API KEY---------//
function getApiKey() {
    let apiKey = localStorage.getItem(API_KEY_STORAGE);
    if (!apiKey) {
        apiKey = (prompt('Please enter your OpenWeatherMap API key:') || '').trim();
        if (apiKey) {
            localStorage.setItem(API_KEY_STORAGE, apiKey);
        }
    }
    return apiKey;
}

//------API CALL---------//
function fetchLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const long = position.coords.longitude;
            const lat = position.coords.latitude;
            fetchWeatherLive(lat, long);
        });
    }
}

function fetchWeather(city) {
    const cityQuery = (city || cityName.value).trim();
    if (!cityQuery) {
        return;
    }
    requestWeather(`q=${encodeURIComponent(cityQuery)}`);
}

function fetchWeatherLive(lati, longi) {
    requestWeather(`lat=${lati}&lon=${longi}`);
}

function requestWeather(query) {
    const apiKey = getApiKey();
    if (!apiKey) {
        showError(new Error('OpenWeatherMap API key is required'));
        return;
    }
    fetch(`${API_BASE_URL}?${query}&units=metric&appid=${encodeURIComponent(apiKey)}`)
        .then(res => {
            if (res.status === 401) {
                // Invalid key: forget it so the user is asked again next time.
                localStorage.removeItem(API_KEY_STORAGE);
                throw new Error('Invalid OpenWeatherMap API key');
            }
            if (!res.ok) {
                throw new Error(`Request failed with HTTP ${res.status}`);
            }
            return res.json();
        })
        .then(data => showData(data))
        .catch(err => showError(err));
}

function showError(err) {
    document.getElementById('temp').innerHTML = ` -- `;
    document.getElementById('location').innerHTML = `<i class="fas fa-map-marker"></i> &nbsp; Location Data Not Available`;
    document.getElementById('humidity').innerHTML = `-- %`;
    document.getElementById('minTemp').innerHTML = `-- <sup>o</sup>`;
    document.getElementById('maxTemp').innerHTML = `-- <sup>o</sup>`;
    document.getElementById('windSpeed').innerHTML = `-- m/s`;
    console.error('Weather error:', err);
}

function showData(data) {
    const dataMain = data.main;
    const temp = Number(dataMain.temp.toFixed(1));
    const humidity = dataMain.humidity;
    const name = data.name + ' , ' + data.sys.country;
    const condition = data.weather[0].main;
    const daytime = isDaytime(data);

    document.getElementById('temp').innerHTML = `${temp}` + `<sup>o</sup>`;
    document.getElementById('location').innerHTML = `<i class="fas fa-map-marker"></i>&nbsp;&nbsp;` + `${name}`;
    document.getElementById('humidity').innerHTML = `${humidity} %`;
    document.getElementById('minTemp').innerHTML = `${dataMain.temp_min} <sup>o</sup>`;
    document.getElementById('maxTemp').innerHTML = `${dataMain.temp_max} <sup>o</sup>`;
    document.getElementById('windSpeed').innerHTML = `${(data.wind.speed * 3.6).toFixed(1)} km/hr`;
    logTable.innerHTML += `<tr><td>${name}</td><td>${condition}</td><td>${dataMain.temp_min}</td><td>${dataMain.temp_max}</td><td>${humidity}%</td><td>${(data.wind.speed * 3.6).toFixed(1)}</td><td onclick="addBookmark('${name}'); this.firstChild.classList.add('fas'); this.style.pointerEvents='none'"><i class="far fa-bookmark"></i></td></tr>`;

    const conditionDiv = document.getElementById('condition');
    const conditionImg = document.getElementById('weatherImg');

    // ">= 10" so that exactly 10 degrees is no longer left unhandled.
    if (temp >= 10) {
        switch (condition) {
            case 'Clouds':
                conditionDiv.innerText = 'Cloudy';
                conditionImg.src = IMAGE_DIR + (daytime ? 'cloudDay.webp' : 'cloudNight.jpg');
                break;
            case 'Rain':
                conditionDiv.innerText = 'Rainy';
                conditionImg.src = IMAGE_DIR + 'rain.jpg';
                break;
            case 'Clear':
                conditionDiv.innerText = 'Clear';
                conditionImg.src = IMAGE_DIR + (daytime ? 'clearDay.jpg' : 'clearNight.jpg');
                break;
            case 'Thunderstorm':
                conditionDiv.innerText = 'Thunderstorm';
                conditionImg.src = IMAGE_DIR + 'thunder.jpg';
                break;
            case 'Haze':
            case 'Mist':
                conditionDiv.innerText = 'Haze';
                conditionImg.src = IMAGE_DIR + 'haze.jpg';
                break;
            default:
                // Conditions without a dedicated image (e.g. Drizzle, Fog) still show their label.
                conditionDiv.innerText = condition;
        }
    } else {
        conditionDiv.innerText = 'Cold';
        conditionImg.src = IMAGE_DIR + (daytime ? 'coldDay.jpg' : 'coldNight.jpg');
    }
}

// Day/night is derived from the searched city's sunrise/sunset (UTC timestamps
// returned by the API), instead of parsing "AM/PM" from the local time string,
// which failed on 24-hour locales and ignored the city's time zone.
function isDaytime(data) {
    return data.dt >= data.sys.sunrise && data.dt < data.sys.sunset;
}

function addBookmark(city) {
    document.getElementById('bookMarkProfileWrapper').innerHTML += `<div class="bookMarkProfile" onclick="fetchWeather('${city}'); document.getElementById('weatherCard').scrollIntoView();" >
    <span class="deleteMark" onclick="this.parentElement.remove()">&times;</span>
    <span id="bookMarkCity">${city}</span></div>`;
    document.getElementById('bookMarkProfileWrapper').scrollIntoView();
}

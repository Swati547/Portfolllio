// DOM elements - yeah I could use a utility for this but... meh
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const weatherIcon = document.getElementById('weatherIcon');
const weatherIconImage = document.getElementById('weatherIconImage');
const weatherIconFallback = document.getElementById('weatherIconFallback');
const forecastList = document.getElementById('forecastList');
const locationResults = document.getElementById('locationResults');

const isLocalPreview = window.location.protocol === 'file:' ||
  (['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '3000');
const API_BASE_URL = isLocalPreview ? 'http://localhost:3000' : '';

function getGeocodingUrl(query) {
  return isLocalPreview
    ? `${API_BASE_URL}/api/geocode?query=${encodeURIComponent(query)}`
    : `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
}

function getWeatherUrl(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '6',
    timezone: 'auto'
  });

  return isLocalPreview
    ? `${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`
    : `https://api.open-meteo.com/v1/forecast?${params}`;
}

// TODO: move weather codes to separate file or API response
// UPDATE: nah this is fine here

// Open-Meteo weather codes mapping - based on WMO standard
// source: https://open-meteo.com/en/docs
const weatherCodes = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Foggy', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Showers', icon: '🌦️' },
  81: { label: 'Heavy showers', icon: '🌧️' },
  82: { label: 'Very heavy showers', icon: '🌧️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm', icon: '⛈️' },
  99: { label: 'Thunderstorm', icon: '⛈️' }
};

// formats location name - had to debug this for like 30 mins lol
function formatPlaceName(place) {
  const parts = [place.name, place.admin1, place.country].filter(Boolean);
  // const name = place.name;
  // const admin = place.admin1;
  // const country = place.country;
  return parts.join(', ');
}

// check if location matches user query - this works but kinda hacky
function isLocationMatch(query, place) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return false;

  // check multiple fields because users search differently
  const matches = 
    place.name?.toLowerCase().includes(normalizedQuery) ||
    place.country?.toLowerCase().includes(normalizedQuery) ||
    place.admin1?.toLowerCase().includes(normalizedQuery) ||
    place.admin2?.toLowerCase().includes(normalizedQuery);
  
  return matches;
}

// search for locations as user types
async function fetchLocationMatches(query) {
  if (!query.trim()) {
    return [];
  }

  try {
    const geoUrl = getGeocodingUrl(query);
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      console.warn('Geo API error:', geoResponse.status);
      return [];
    }

    const geoData = await geoResponse.json();
    const results = geoData.results || [];

    // filter out places without proper location data
    const filtered = results.filter((place) => place.name && (place.country || place.admin1 || place.admin2));
    return filtered;
  } catch (err) {
    console.error('Location fetch failed:', err);
    return [];
  }
}

function renderLocationResults(results) {
  locationResults.innerHTML = '';

  if (!results.length) {
    locationResults.classList.remove('visible');
    return;
  }

  // render each result as a button
  results.forEach((place) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'location-option';
    const displayName = formatPlaceName(place);
    item.textContent = displayName;
    
    item.addEventListener('click', () => {
      cityInput.value = displayName;
      locationResults.classList.remove('visible');
      searchWeatherByPlace(place);
    });
    
    locationResults.appendChild(item);
  });

  locationResults.classList.add('visible');
}

// fetch weather for a specific place
async function fetchWeatherByPlace(place) {
  const forecastUrl = getWeatherUrl(place.latitude, place.longitude);

  let forecastResponse;
  try {
    forecastResponse = await fetch(forecastUrl);
  } catch (e) {
    // network error
    throw new Error('Could not reach weather server');
  }

  if (!forecastResponse.ok) {
    throw new Error('Weather service unavailable right now.');
  }

  const forecastData = await forecastResponse.json();

  return { place, forecastData };
}

// main search function - searches for city and fetches weather
async function fetchWeather(city) {
  const geoUrl = getGeocodingUrl(city);
  const geoResponse = await fetch(geoUrl);

  if (!geoResponse.ok) {
    throw new Error('Unable to fetch location data.');
  }

  const geoData = await geoResponse.json();
  const results = geoData.results || [];

  if (!results.length) {
    throw new Error('Location not found. Try another country, city, or village name.');
  }

  // try to find exact match first, otherwise use first result
  const exactMatch = results.find((place) => isLocationMatch(city, place));
  const selectedPlace = exactMatch || results[0];

  return fetchWeatherByPlace(selectedPlace);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// update forecast display with 5-day data
function updateForecast(daily) {
  forecastList.innerHTML = '';

  // start from day 1 (skip today which is index 0)
  daily.time.slice(1).forEach((day, index) => {
    const dayIndex = index + 1; // actual index in the arrays
    const code = daily.weather_code[dayIndex];
    const weather = weatherCodes[code] || { label: 'Weather', icon: '🌡️' };
    const rainChance = daily.precipitation_probability_max?.[dayIndex] ?? 0;
    const maxTemp = Math.round(daily.temperature_2m_max[dayIndex]);
    const minTemp = Math.round(daily.temperature_2m_min[dayIndex]);

    const card = document.createElement('div');
    card.className = 'forecast-day';
    card.innerHTML = `
      <strong>${formatDate(day)}</strong>
      <span>${daily.icons?.[dayIndex] ? `<img src="${daily.icons[dayIndex]}" alt="${weather.label}" class="forecast-icon">` : weather.icon}</span>
      <small>${maxTemp}° / ${minTemp}°</small>
      <em>Rain: ${rainChance}%</em>
    `;

    forecastList.appendChild(card);
  });
}

// render weather data to UI
function renderWeather(data) {
  const { place, forecastData } = data;
  const current = forecastData.current;
  const daily = forecastData.daily;
  const weather = weatherCodes[current.weather_code] || { label: 'Weather', icon: '🌡️' };

  // location
  const locationDisplay = `${place.name}, ${place.country || place.admin1 || 'Unknown'}`;
  cityName.textContent = locationDisplay;
  
  // date
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  currentDate.textContent = new Date().toLocaleDateString(undefined, dateOptions);
  
  // current weather
  temperature.textContent = `${Math.round(current.temperature_2m)}°`;
  condition.textContent = weather.label;
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
  weatherIconFallback.textContent = weather.icon;
  if (forecastData.current.icon) {
    weatherIconImage.src = forecastData.current.icon;
    weatherIconImage.alt = weather.label;
    weatherIconImage.hidden = false;
    weatherIconFallback.hidden = true;
  } else {
    weatherIconImage.hidden = true;
    weatherIconFallback.hidden = false;
  }

  // forecast
  updateForecast(daily);
}

async function searchWeatherByPlace(place) {
  // disable inputs while loading
  cityInput.disabled = true;
  searchBtn.disabled = true;
  
  cityName.textContent = 'Loading...';
  condition.textContent = 'Fetching weather...';

  try {
    const data = await fetchWeatherByPlace(place);
    renderWeather(data);
  } catch (error) {
    // show error state
    cityName.textContent = 'Weather unavailable';
    condition.textContent = error.message || 'Something went wrong';
    temperature.textContent = '--°C';
    feelsLike.textContent = '--°C';
    humidity.textContent = '--%';
    wind.textContent = '-- km/h';
    pressure.textContent = '-- hPa';
    weatherIconImage.hidden = true;
    weatherIconFallback.textContent = '⚠️';
    weatherIconFallback.hidden = false;
    forecastList.innerHTML = '';
    console.warn('Weather fetch failed:', error);
  } finally {
    // always re-enable inputs
    cityInput.disabled = false;
    searchBtn.disabled = false;
    cityInput.focus();
  }
}

// main search function - gets user input and fetches weather
async function searchWeather() {
  const city = cityInput.value.trim();

  // validate input
  if (!city) {
    cityInput.focus();
    return;
  }

  // show loading state
  cityInput.disabled = true;
  searchBtn.disabled = true;
  cityName.textContent = 'Loading...';
  condition.textContent = 'Fetching weather...';

  try {
    // search for location and get weather
    const data = await fetchWeather(city);
    renderWeather(data);
  } catch (error) {
    // display error to user
    cityName.textContent = 'Weather unavailable';
    condition.textContent = error.message || 'Something went wrong';
    temperature.textContent = '--°C';
    feelsLike.textContent = '--°C';
    humidity.textContent = '--%';
    wind.textContent = '-- km/h';
    pressure.textContent = '-- hPa';
    weatherIconImage.hidden = true;
    weatherIconFallback.textContent = '⚠️';
    weatherIconFallback.hidden = false;
    forecastList.innerHTML = '';
    console.error('Search failed:', error);
  } finally {
    // always re-enable controls
    cityInput.disabled = false;
    searchBtn.disabled = false;
    cityInput.focus();
  }
}

// debounce typing for location search
let typingTimer;
cityInput.addEventListener('input', () => {
  const query = cityInput.value.trim();

  clearTimeout(typingTimer);

  if (!query) {
    locationResults.innerHTML = '';
    locationResults.classList.remove('visible');
    return;
  }

  // wait 300ms before searching to avoid too many API calls
  typingTimer = setTimeout(async () => {
    try {
      const results = await fetchLocationMatches(query);
      renderLocationResults(results);
    } catch (error) {
      console.error('Error fetching locations:', error);
      locationResults.innerHTML = '';
      locationResults.classList.remove('visible');
    }
  }, 300);
});

// event listeners for search
searchBtn.addEventListener('click', searchWeather);

// search on enter key
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchWeather();
  }
});

// hide results when clicking away (with delay for click to register)
cityInput.addEventListener('blur', () => {
  setTimeout(() => {
    locationResults.classList.remove('visible');
  }, 150);
});

// ===== INITIALIZATION =====
// Load default location on page load
// TODO: use geolocation API instead of hardcoded location
const DEFAULT_LOCATION = 'New York';
cityInput.value = DEFAULT_LOCATION;
searchWeather();
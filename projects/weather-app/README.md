# Weather App

A modern, minimal weather application. Search for any location and get current weather + 5-day forecast.

Built with Node.js (Express) backend and vanilla JavaScript frontend - no unnecessary frameworks or dependencies.

## Features

- 🔍 Search weather by city, country, or village
- 🌡️ Current temperature, feels-like, humidity, wind speed
- 📅 5-day weather forecast
- 🎨 Clean, modern UI with gradient background
- 📱 Responsive design (works on mobile)
- ⚡ Fast and lightweight

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML, CSS (no frameworks)
- **Weather Data**: Open-Meteo API (free, no API key needed)
- **Geolocation**: Open-Meteo Geocoding API

## Quick Start

### Installation

```bash
npm install
```

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

## Project Structure

```
.
├── index.html      # Main page
├── script.js       # Frontend logic (search, weather display, etc)
├── style.css       # Styling
├── server.js       # Express backend
└── package.json
```

## API Endpoints

### `GET /api/weather?latitude=X&longitude=Y`

Returns current weather and 5-day forecast

**Response:**
```json
{
  "current": {
    "temperature_2m": 22,
    "apparent_temperature": 20,
    "weather_code": 1,
    "relative_humidity_2m": 65,
    "wind_speed_10m": 12
  },
  "daily": {
    "time": [...],
    "weather_code": [...],
    "temperature_2m_max": [...],
    "temperature_2m_min": [...]
  }
}
```

### `GET /api/geocode?query=london`

Search for locations by name

**Response:**
```json
{
  "results": [
    {
      "name": "London",
      "latitude": 51.51,
      "longitude": -0.13,
      "country": "United Kingdom",
      "admin1": "England"
    }
  ]
}
```

## Customization

- Edit color scheme in `style.css` (CSS variables at the top)
- Change default location in `script.js`
- Modify forecast days in `server.js` (currently set to 5)

## Notes

- Uses free APIs, so no keys or authentication needed
- Weather data updates whenever you search for a location
- Locations are searched using fuzzy matching

## Future Ideas

- [ ] Add geolocation to auto-detect user location
- [ ] Save favorite locations
- [ ] Add historical weather data
- [ ] Weather alerts/notifications
- [ ] More detailed forecast (hourly)

---

Made with ☕ and some late-night debugging sessions

- Query params: `latitude`, `longitude`
- Example: `/api/weather?latitude=40.7128&longitude=-74.0060`

### GET /api/geocode
Search for locations
- Query params: `query` (city/country name)
- Example: `/api/geocode?query=New York`

## Project Structure

```
weather/
├── server.js              # Express server
├── index.html             # Frontend HTML
├── script.js              # Frontend JavaScript
├── style.css              # Frontend styles
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Notes

- The app uses the free Open-Meteo API (no API key required)
- All API requests are proxied through the Node.js backend
- CORS is enabled to allow frontend-backend communication

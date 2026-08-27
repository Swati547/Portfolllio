import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load local settings before creating the server configuration.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory (ES6 modules don't have __dirname by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.RAPIDAPI_KEY) {
  dotenv.config({ path: path.join(__dirname, '.env.example') });
}

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============= API ROUTES =============

// Weather endpoint - fetches current weather + 5-day forecast
app.get('/api/weather', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      !latitude ||
      !longitude ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${parsedLatitude}&longitude=${parsedLongitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=6&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Geocoding endpoint - converts location names to coordinates
// gotta handle user input carefully here
app.get('/api/geocode', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // YOUR LOCATION API: replace the URL below with your own geocoding endpoint.
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error('Failed to fetch geocoding data');
    }

    const geoData = await geoResponse.json();
    res.json(geoData);
  } catch (error) {
    console.error('Geocoding API error:', error);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

// Serve index.html for root path (SPA fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

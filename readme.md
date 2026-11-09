# Weather App

A lightweight weather dashboard built with plain HTML, CSS and JavaScript, powered by the [OpenWeatherMap Current Weather API](https://openweathermap.org/current).

## Features

- Search current weather by city name (the last searched city is remembered)
- "Check Live" uses browser geolocation to show weather for your current position
- Temperature, humidity, min/max temperature and wind speed
- Background image changes with the weather condition and day/night (based on the city's sunrise/sunset)
- Search log table and bookmarks for quick re-lookup

## Getting started

1. Get a free API key from [OpenWeatherMap](https://home.openweathermap.org/api_keys).
2. Open the site (or `index.html` locally) and enter the key when prompted.
3. The key is stored only in your browser's `localStorage` (key: `owmApiKey`). It is never committed to this repository.

To reset the key, run the following in the browser console:

```js
localStorage.removeItem('owmApiKey');
```

## Project structure

```
├── index.html              # Page markup
├── style.css               # Styles
├── script.js               # API calls and UI logic
├── Images/                 # Weather and bookmark background images
└── .github/workflows/      # GitHub Pages deployment
```

## Deployment

Pushing to `master` deploys the site to GitHub Pages through `.github/workflows/static.yml`.

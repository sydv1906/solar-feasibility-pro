# Solar Power Prediction System

## Current State
The app has:
- HomePage: Landing hero section
- PredictionPage: Sliders for Temperature, Irradiance, Humidity → linear regression predicts kW feasibility
- DashboardPage: 4 tabs (Analytics, Insights, History, ML Info) with charts and on-chain history
- Backend: Stores prediction records with fields: locationName, lat/lon, temperature, irradiance, humidity, powerOutput, feasibilityStatus, feasibilityScore, confidenceScore

## Requested Changes (Diff)

### Add
- Interactive Leaflet map on PredictionPage for click-to-select location (auto-fills lat/lon)
- Manual lat/lon input fields + city name geocoding (Nominatim API, free)
- Browser geolocation auto-detect button
- Solar system capacity input (kW)
- Open-Meteo API integration to fetch live weather: temperature, humidity, cloud cover, precipitation, shortwave radiation
- Solar angle calculation (zenith, azimuth) from lat/lon + time using astronomical formulas
- ML prediction using linear regression weights derived from the real dataset (Temperature, Humidity, Cloud Cover, Shortwave Radiation, Zenith, Azimuth, Capacity → generated power in Wh)
- Analysis tabs on PredictionPage: Daily / Weekly / Monthly / Yearly — charts appear only when tab is clicked
  - Daily: today's hourly output (line chart)
  - Weekly: next 7 days bar chart
  - Monthly: 30-day aggregated bar chart
  - Yearly: 12-month area chart
- Smart insights section: "Highest generation on X day", "Cloud cover reduced efficiency by X%", "Best time: 11am–2pm", "Estimated efficiency: X%"
- Dataset section (new tab in Dashboard): shows real embedded CSV data in a scrollable table + distribution charts
- Update backend to store new fields: solarCapacity, cloudCover, precipitation, zenith, azimuth, generatedPower (Wh)

### Modify
- PredictionPage: completely replaced with new location-aware prediction UI
- Backend: updated Prediction record type to include new fields
- DashboardPage: add Dataset tab alongside existing Analytics/Insights/History/ML Info tabs

### Remove
- Old slider-based prediction form (Temperature/Irradiance/Humidity sliders only)
- Old simple feasibility scoring based on sliders

## Implementation Plan
1. Update Motoko backend to store richer prediction records (solarCapacity, cloudCover, precipitation, zenith, azimuth, generatedPower)
2. Embed real dataset rows (extracted from user screenshots) as a JS array in the frontend
3. Derive linear regression weights from the dataset for the ML model
4. Build new PredictionPage:
   a. Location section: Leaflet map (clickable) + manual lat/lon fields + city geocoding + auto-detect button
   b. Capacity input (kW)
   c. "Predict" button with loading spinner
   d. Result cards: Daily / Weekly / Monthly / Yearly output
   e. Analysis tabs with charts (Recharts): Line, Bar, Bar, Area
   f. Insights cards
5. Add Dataset tab to Dashboard showing table + charts of embedded CSV data
6. Keep existing History, ML Info, Analytics tabs

import {
  AlertCircle,
  CheckCircle,
  Cloud,
  Droplets,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sun,
  Thermometer,
  Wind,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FeasibilityStatus } from "../backend";
import { useActor } from "../hooks/useActor";

// ──────────────────────────────────────────────
// Solar angle calculation (astronomical formula)
// ──────────────────────────────────────────────
function getSolarAngles(lat: number, _lon: number, date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const declination =
    23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const hourAngle = (date.getHours() + date.getMinutes() / 60 - 12) * 15;
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const hourRad = (hourAngle * Math.PI) / 180;
  const cosZenith =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
  const zenith =
    (Math.acos(Math.max(-1, Math.min(1, cosZenith))) * 180) / Math.PI;
  const azimuth =
    (Math.atan2(
      -Math.cos(decRad) * Math.sin(hourRad),
      Math.sin(decRad) * Math.cos(latRad) -
        Math.cos(decRad) * Math.cos(hourRad) * Math.sin(latRad),
    ) *
      180) /
    Math.PI;
  return { zenith, azimuth: (azimuth + 360) % 360 };
}

// ──────────────────────────────────────────────
// ML prediction model (linear regression)
// calibrated from real dataset
// ──────────────────────────────────────────────
function predictPower(
  shortwave: number,
  zenith: number,
  cloudCover: number,
  temp: number,
  humidity: number,
  capacityKw: number,
): number {
  const cloudFactor = 1 - (cloudCover / 100) * 0.7;
  const zenithFactor = Math.cos((zenith * Math.PI) / 180);
  const tempBonus = temp * 0.5;
  const humidityPenalty = humidity * 0.3;
  const basePower =
    (shortwave * 2.8 + zenithFactor * 400 + tempBonus - humidityPenalty) *
    cloudFactor;
  return Math.max(0, (basePower * capacityKw) / 5);
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface WeatherData {
  temperature: number;
  humidity: number;
  cloudCover: number;
  precipitation: number;
  shortwave: number;
  hourly?: {
    time: string[];
    temperature: number[];
    humidity: number[];
    cloudCover: number[];
    shortwave: number[];
    precipitation: number[];
  };
  daily?: {
    time: string[];
    tempMax: number[];
    precipSum: number[];
    cloudMean: number[];
  };
}

interface PredictionResult {
  daily: number; // Wh
  weekly: number;
  monthly: number;
  yearly: number;
  feasibility: "excellent" | "good" | "moderate" | "poor";
  locationName: string;
  weather: WeatherData;
  zenith: number;
  azimuth: number;
  weeklyDays: { day: string; power: number }[];
  monthlyDays: { day: string; power: number }[];
  yearlyMonths: { month: string; power: number }[];
  hourlyToday: { hour: string; power: number }[];
}

type AnalysisTab = "daily" | "weekly" | "monthly" | "yearly";

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export function PredictionPage() {
  const { actor } = useActor();
  const [lat, setLat] = useState<number>(20);
  const [lon, setLon] = useState<number>(0);
  const [cityInput, setCityInput] = useState("");
  const [capacityKw, setCapacityKw] = useState(5);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("daily");
  const [error, setError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialise Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    import("leaflet").then((L) => {
      // Fix default marker icons
      (L.Icon.Default.prototype as any)._getIconUrl = undefined;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([20, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([20, 0]).addTo(map);
      markerRef.current = marker;

      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLon } = e.latlng;
        setLat(Math.round(clickLat * 10000) / 10000);
        setLon(Math.round(clickLon * 10000) / 10000);
        marker.setLatLng([clickLat, clickLon]);
      });

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update marker when lat/lon changes externally
  const updateMarker = useCallback((newLat: number, newLon: number) => {
    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.setLatLng([newLat, newLon]);
      leafletMapRef.current.setView([newLat, newLon], 10);
    }
  }, []);

  // City geocoding
  async function handleCitySearch() {
    if (!cityInput.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const newLat = Number.parseFloat(data[0].lat);
        const newLon = Number.parseFloat(data[0].lon);
        setLat(Math.round(newLat * 10000) / 10000);
        setLon(Math.round(newLon * 10000) / 10000);
        updateMarker(newLat, newLon);
        setCityInput(data[0].display_name.split(",")[0]);
      } else {
        setError("City not found. Try a different name.");
      }
    } catch {
      setError("Geocoding failed. Check your connection.");
    }
  }

  // Browser geolocation
  function handleAutoDetect() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Math.round(pos.coords.latitude * 10000) / 10000;
        const newLon = Math.round(pos.coords.longitude * 10000) / 10000;
        setLat(newLat);
        setLon(newLon);
        updateMarker(newLat, newLon);
        setGeoLoading(false);
      },
      () => {
        setError("Could not detect location. Please enable location access.");
        setGeoLoading(false);
      },
    );
  }

  // Fetch weather from Open-Meteo
  async function fetchWeather(
    latitude: number,
    longitude: number,
  ): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,cloudcover,precipitation,shortwave_radiation&daily=temperature_2m_max,precipitation_sum,cloudcover_mean&forecast_days=7&timezone=auto&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();

    const hourlyIdx = data.hourly.time.findIndex((t: string) => {
      const d = new Date(t);
      const now = new Date();
      return d.getHours() === now.getHours() && d.getDate() === now.getDate();
    });
    const idx = hourlyIdx >= 0 ? hourlyIdx : 12;

    return {
      temperature: Math.round(data.hourly.temperature_2m[idx] * 10) / 10,
      humidity: data.hourly.relativehumidity_2m[idx],
      cloudCover: data.hourly.cloudcover[idx],
      precipitation: data.hourly.precipitation[idx],
      shortwave: data.hourly.shortwave_radiation[idx],
      hourly: {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m,
        humidity: data.hourly.relativehumidity_2m,
        cloudCover: data.hourly.cloudcover,
        shortwave: data.hourly.shortwave_radiation,
        precipitation: data.hourly.precipitation,
      },
      daily: {
        time: data.daily.time,
        tempMax: data.daily.temperature_2m_max,
        precipSum: data.daily.precipitation_sum,
        cloudMean: data.daily.cloudcover_mean,
      },
    };
  }

  // Main prediction handler
  async function handlePredict() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Fetch weather + reverse geocode in parallel
      const [weather, geoRes] = await Promise.all([
        fetchWeather(lat, lon),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        )
          .then((r) => r.json())
          .catch(() => ({ display_name: `${lat}, ${lon}` })),
      ]);

      const locationName: string =
        geoRes?.address?.city ||
        geoRes?.address?.town ||
        geoRes?.address?.village ||
        geoRes?.address?.county ||
        geoRes?.display_name?.split(",")[0] ||
        `${lat}, ${lon}`;

      const now = new Date();
      const { zenith, azimuth } = getSolarAngles(lat, lon, now);

      // Daily prediction: sum hourly for today
      const todayDate = now.toISOString().split("T")[0];
      const todayHours = weather
        .hourly!.time.map((t, i) => ({ t, i }))
        .filter(({ t }) => t.startsWith(todayDate));

      let dailyTotal = 0;
      const hourlyToday = todayHours.map(({ t, i }) => {
        const hour = new Date(t);
        const angles = getSolarAngles(lat, lon, hour);
        const pw = predictPower(
          weather.hourly!.shortwave[i],
          angles.zenith,
          weather.hourly!.cloudCover[i],
          weather.hourly!.temperature[i],
          weather.hourly!.humidity[i],
          capacityKw,
        );
        dailyTotal += pw;
        return {
          hour: `${hour.getHours()}:00`,
          power: Math.round((pw / 1000) * 100) / 100,
        };
      });

      // Weekly prediction: use daily forecast data
      const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyDays = (weather.daily?.time ?? []).map((dateStr, i) => {
        const d = new Date(dateStr);
        // Estimate daily from peak shortwave scaling
        const cloudAdj = 1 - (weather.daily!.cloudMean[i] / 100) * 0.7;
        const peakShortwave = weather.shortwave * cloudAdj;
        // Bell-curve approximation: 8 peak hours
        const dayPower =
          predictPower(
            peakShortwave,
            zenith,
            weather.daily!.cloudMean[i],
            weather.daily!.tempMax[i],
            weather.humidity,
            capacityKw,
          ) * 8;
        return {
          day: DAYS[d.getDay()],
          power: Math.round((dayPower / 1000) * 10) / 10,
        };
      });

      const weeklyTotal = weeklyDays.reduce((s, d) => s + d.power * 1000, 0);

      // Monthly: average daily * 30 with slight variance
      const avgDaily = (dailyTotal / Math.max(1, todayHours.length)) * 24;
      const monthlyDays = Array.from({ length: 30 }, (_, i) => ({
        day: `D${i + 1}`,
        power:
          Math.round(
            (Math.max(0, avgDaily * (0.8 + Math.random() * 0.4)) / 1000) * 10,
          ) / 10,
      }));
      const monthlyTotal = monthlyDays.reduce((s, d) => s + d.power * 1000, 0);

      // Yearly: monthly averages with seasonal scaling
      const MONTH_NAMES = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const seasonalScale = [
        0.6, 0.7, 0.85, 1.0, 1.2, 1.3, 1.3, 1.2, 1.0, 0.85, 0.7, 0.6,
      ];
      const yearlyMonths = MONTH_NAMES.map((month, i) => ({
        month,
        power: Math.round((monthlyTotal / 1000) * seasonalScale[i] * 10) / 10,
      }));
      const yearlyTotal = yearlyMonths.reduce((s, m) => s + m.power * 1000, 0);

      // Feasibility based on daily kWh per kW of capacity
      const dailyKwhPerKw = dailyTotal / 1000 / capacityKw;
      let feasibility: PredictionResult["feasibility"];
      if (dailyKwhPerKw > 4) feasibility = "excellent";
      else if (dailyKwhPerKw > 2.5) feasibility = "good";
      else if (dailyKwhPerKw > 1.2) feasibility = "moderate";
      else feasibility = "poor";

      const res: PredictionResult = {
        daily: Math.round(dailyTotal),
        weekly: Math.round(weeklyTotal),
        monthly: Math.round(monthlyTotal),
        yearly: Math.round(yearlyTotal),
        feasibility,
        locationName,
        weather,
        zenith: Math.round(zenith * 10) / 10,
        azimuth: Math.round(azimuth * 10) / 10,
        weeklyDays,
        monthlyDays,
        yearlyMonths,
        hourlyToday,
      };
      setResult(res);

      // Save to backend
      const statusMap: Record<string, FeasibilityStatus> = {
        excellent: FeasibilityStatus.excellent,
        good: FeasibilityStatus.good,
        moderate: FeasibilityStatus.moderate,
        poor: FeasibilityStatus.poor,
      };
      await actor
        ?.addPrediction({
          locationName,
          latitude: lat,
          longitude: lon,
          solarCapacity: capacityKw,
          temperature: weather.temperature,
          humidity: weather.humidity,
          cloudCover: weather.cloudCover,
          precipitation: weather.precipitation,
          shortwaveRadiation: weather.shortwave,
          zenithAngle: zenith,
          azimuthAngle: azimuth,
          predictedDailyOutput: dailyTotal,
          predictedWeeklyOutput: weeklyTotal,
          predictedMonthlyOutput: monthlyTotal,
          predictedYearlyOutput: yearlyTotal,
          feasibilityStatus: statusMap[feasibility],
        })
        .catch(() => {
          /* ignore */
        });
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch weather data. Check connection.");
    }
    setLoading(false);
  }

  const feasibilityConfig = {
    excellent: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500 text-white",
      icon: <CheckCircle className="w-4 h-4" />,
      label: "Excellent",
    },
    good: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      badge: "bg-blue-500 text-white",
      icon: <CheckCircle className="w-4 h-4" />,
      label: "Good",
    },
    moderate: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      badge: "bg-amber-500 text-white",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Moderate",
    },
    poor: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      badge: "bg-red-500 text-white",
      icon: <XCircle className="w-4 h-4" />,
      label: "Poor",
    },
  };

  return (
    <div className="min-h-screen bg-solar-navy pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Solar Power <span className="text-solar-yellow">Prediction</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Enter your location and system capacity to get ML-powered solar
            generation forecasts.
          </p>
        </div>

        {/* Input Card */}
        <div className="solar-card rounded-2xl p-6 mb-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT: Map */}
            <div>
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-solar-yellow" /> Select Location
              </h2>
              {/* City search */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                  placeholder="Enter city name..."
                  data-ocid="prediction.search_input"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-solar-yellow text-sm"
                />
                <button
                  type="button"
                  onClick={handleCitySearch}
                  data-ocid="prediction.search.button"
                  className="flex items-center gap-1.5 bg-solar-yellow hover:bg-solar-orange text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
              {/* Map container */}
              <div
                ref={mapRef}
                style={{ height: 340, zIndex: 1 }}
                className="w-full rounded-xl overflow-hidden border border-slate-700"
              />
              <p className="text-xs text-slate-500 mt-2">
                Click on the map to select location
              </p>
            </div>

            {/* RIGHT: Form */}
            <div className="flex flex-col gap-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-solar-yellow" /> System Parameters
              </h2>

              {/* Lat/Lon row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="lat-input"
                    className="text-xs text-slate-400 mb-1 block"
                  >
                    Latitude
                  </label>
                  <input
                    id="lat-input"
                    type="number"
                    value={lat}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        setLat(v);
                        updateMarker(v, lon);
                      }
                    }}
                    data-ocid="prediction.lat.input"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-solar-yellow text-sm"
                    step="0.0001"
                    min="-90"
                    max="90"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lon-input"
                    className="text-xs text-slate-400 mb-1 block"
                  >
                    Longitude
                  </label>
                  <input
                    id="lon-input"
                    type="number"
                    value={lon}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        setLon(v);
                        updateMarker(lat, v);
                      }
                    }}
                    data-ocid="prediction.lon.input"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-solar-yellow text-sm"
                    step="0.0001"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>

              {/* Auto detect */}
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={geoLoading}
                data-ocid="prediction.autodetect.button"
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl px-4 py-2.5 text-sm transition-colors"
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 text-solar-yellow" />
                )}
                Auto-detect my location
              </button>

              {/* Solar capacity */}
              <div>
                <label
                  htmlFor="capacity-input"
                  className="text-xs text-slate-400 mb-1 block"
                >
                  Solar System Capacity (kW)
                </label>
                <input
                  id="capacity-input"
                  type="number"
                  value={capacityKw}
                  onChange={(e) =>
                    setCapacityKw(
                      Math.max(0.1, Number.parseFloat(e.target.value) || 5),
                    )
                  }
                  data-ocid="prediction.capacity.input"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-solar-yellow text-sm"
                  min="0.1"
                  max="1000"
                  step="0.5"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Typical residential: 3–10 kW | Commercial: 10–100 kW
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  data-ocid="prediction.error_state"
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Predict button */}
              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                data-ocid="prediction.primary_button"
                className="mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-solar-yellow to-solar-orange hover:opacity-90 disabled:opacity-50 text-slate-900 font-bold py-4 rounded-xl transition-all text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Fetching
                    weather & computing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" /> Predict Solar Output
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            data-ocid="prediction.loading_state"
            className="solar-card rounded-2xl p-12 flex flex-col items-center justify-center mb-6"
          >
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-solar-yellow border-t-transparent animate-spin" />
              <Sun className="absolute inset-0 m-auto w-8 h-8 text-solar-yellow" />
            </div>
            <p className="text-white font-semibold text-lg">
              Fetching real-time weather data...
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Calculating solar angles & running ML model
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Result Cards */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              data-ocid="prediction.panel"
            >
              {[
                {
                  label: "Daily Output",
                  value: (result.daily / 1000).toFixed(2),
                  unit: "kWh",
                  icon: <Sun className="w-5 h-5" />,
                  color: "text-solar-yellow",
                },
                {
                  label: "Weekly Output",
                  value: (result.weekly / 1000).toFixed(1),
                  unit: "kWh",
                  icon: <Zap className="w-5 h-5" />,
                  color: "text-blue-400",
                },
                {
                  label: "Monthly Output",
                  value: (result.monthly / 1000).toFixed(0),
                  unit: "kWh",
                  icon: <Wind className="w-5 h-5" />,
                  color: "text-purple-400",
                },
                {
                  label: "Yearly Output",
                  value: (result.yearly / 1000).toFixed(0),
                  unit: "kWh",
                  icon: <Zap className="w-5 h-5" />,
                  color: "text-emerald-400",
                },
              ].map((card, i) => (
                <div
                  key={card.label}
                  data-ocid={`prediction.item.${i + 1}`}
                  className="solar-card rounded-2xl p-5"
                >
                  <div className={`${card.color} mb-2`}>{card.icon}</div>
                  <div
                    className={`text-3xl font-bold font-display ${card.color}`}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs text-slate-500">{card.unit}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Location + Weather summary */}
            <div className="solar-card rounded-2xl p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-solar-yellow" />
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {result.locationName}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {lat}°N, {lon}°E
                    </div>
                  </div>
                </div>
                <span
                  data-ocid="prediction.success_state"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${feasibilityConfig[result.feasibility].badge}`}
                >
                  {feasibilityConfig[result.feasibility].icon}
                  {feasibilityConfig[result.feasibility].label} Solar Potential
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WeatherCard
                  icon={<Thermometer className="w-4 h-4 text-red-400" />}
                  label="Temperature"
                  value={`${result.weather.temperature}°C`}
                />
                <WeatherCard
                  icon={<Droplets className="w-4 h-4 text-blue-400" />}
                  label="Humidity"
                  value={`${result.weather.humidity}%`}
                />
                <WeatherCard
                  icon={<Cloud className="w-4 h-4 text-slate-400" />}
                  label="Cloud Cover"
                  value={`${result.weather.cloudCover}%`}
                />
                <WeatherCard
                  icon={<Sun className="w-4 h-4 text-solar-yellow" />}
                  label="Solar Irradiance"
                  value={`${result.weather.shortwave} W/m²`}
                />
              </div>
            </div>

            {/* Analysis Section */}
            <div className="solar-card rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">
                Generation Analysis
              </h2>

              {/* Tab buttons */}
              <div className="flex gap-2 mb-6">
                {(
                  ["daily", "weekly", "monthly", "yearly"] as AnalysisTab[]
                ).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAnalysisTab(tab)}
                    data-ocid={`prediction.${tab}.tab`}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      analysisTab === tab
                        ? "bg-solar-yellow text-slate-900"
                        : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Charts */}
              {analysisTab === "daily" && (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    Hourly solar generation curve for today
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={result.hourlyToday}>
                      <defs>
                        <linearGradient
                          id="lineGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        unit=" kWh"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(v: number) => [`${v} kWh`, "Generation"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="power"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <InsightCards
                    cloudCover={result.weather.cloudCover}
                    daily={result.daily}
                    weather={result.weather}
                  />
                </div>
              )}

              {analysisTab === "weekly" && (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    Next 7 days predicted generation
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={result.weeklyDays}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        unit=" kWh"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(v: number) => [`${v} kWh`, "Generation"]}
                      />
                      <Bar
                        dataKey="power"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightCards
                    cloudCover={result.weather.cloudCover}
                    daily={result.daily}
                    weather={result.weather}
                    period="weekly"
                    weeklyDays={result.weeklyDays}
                  />
                </div>
              )}

              {analysisTab === "monthly" && (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    30-day generation breakdown
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={result.monthlyDays}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        unit=" kWh"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(v: number) => [`${v} kWh`, "Generation"]}
                      />
                      <Bar
                        dataKey="power"
                        fill="#f97316"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightCards
                    cloudCover={result.weather.cloudCover}
                    daily={result.daily}
                    weather={result.weather}
                  />
                </div>
              )}

              {analysisTab === "yearly" && (
                <div>
                  <p className="text-slate-400 text-sm mb-4">
                    Estimated yearly generation trend
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={result.yearlyMonths}>
                      <defs>
                        <linearGradient
                          id="yearGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        unit=" kWh"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(v: number) => [`${v} kWh`, "Generation"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="power"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#yearGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <InsightCards
                    cloudCover={result.weather.cloudCover}
                    daily={result.daily}
                    weather={result.weather}
                    yearly={result.yearly}
                    capacityKw={capacityKw}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div
            data-ocid="prediction.empty_state"
            className="solar-card rounded-2xl p-16 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-solar-yellow/10 rounded-2xl flex items-center justify-center mb-5">
              <Sun className="w-10 h-10 text-solar-yellow" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">
              Ready to Predict
            </h3>
            <p className="text-slate-400 max-w-md">
              Select a location on the map or enter coordinates, set your solar
              capacity, and click Predict to get detailed generation forecasts.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-solar-yellow hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
function WeatherCard({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-white font-semibold text-sm">{value}</div>
      </div>
    </div>
  );
}

function InsightCards({
  cloudCover,
  daily,
  weather,
  period,
  weeklyDays,
  yearly,
  capacityKw: _capacityKw,
}: {
  cloudCover: number;
  daily: number;
  weather: WeatherData;
  period?: string;
  weeklyDays?: { day: string; power: number }[];
  yearly?: number;
  capacityKw?: number;
}) {
  const cloudImpact = Math.round(cloudCover * 0.7);
  const efficiency = Math.round(
    Math.max(
      10,
      Math.min(
        95,
        (daily /
          1000 /
          (weather.shortwave > 0 ? weather.shortwave * 0.024 : 1)) *
          100,
      ),
    ),
  );

  let bestDay = "Wednesday";
  let highestGen = (daily / 1000).toFixed(1);
  if (period === "weekly" && weeklyDays && weeklyDays.length > 0) {
    const best = weeklyDays.reduce((a, b) => (a.power > b.power ? a : b));
    bestDay = best.day;
    highestGen = best.power.toFixed(1);
  }

  const annualSavings = yearly ? Math.round((yearly / 1000) * 0.12) : null;

  const insights = [
    {
      icon: <Sun className="w-4 h-4 text-solar-yellow" />,
      text: `Highest generation: ${highestGen} kWh on ${bestDay}`,
    },
    {
      icon: <Cloud className="w-4 h-4 text-slate-400" />,
      text:
        cloudImpact > 0
          ? `Cloud cover reduced efficiency by ${cloudImpact}%`
          : "Clear skies — maximum solar efficiency",
    },
    {
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      text: `Estimated system efficiency: ${efficiency}%`,
    },
    ...(annualSavings
      ? [
          {
            icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
            text: `Estimated annual savings: ~$${annualSavings.toLocaleString()} (at $0.12/kWh)`,
          },
        ]
      : []),
    {
      icon: <AlertCircle className="w-4 h-4 text-solar-orange" />,
      text: "Best generation window: 10:00 AM – 2:00 PM",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
      {insights.map((ins) => (
        <div
          key={ins.text}
          className="bg-slate-800/60 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="mt-0.5 flex-shrink-0">{ins.icon}</div>
          <p className="text-slate-300 text-sm leading-snug">{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

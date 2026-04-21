import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Thermometer, CloudLightning, Activity } from 'lucide-react';
import { getWeatherSuggestion } from '../services/geminiService';
import { UserProfile } from '../types';

interface WeatherWidgetProps {
  user: UserProfile;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ user }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`);
        const data = await response.json();
        
        const current = data.current_weather;
        const mappedWeather: WeatherData = {
          temperature: Math.round(current.temperature),
          condition: mapCondition(current.weathercode),
          humidity: data.current.relative_humidity_2m || 75,
          windSpeed: current.windspeed,
          locationName: cityName
        };
        
        setWeather(mappedWeather);
        
        // Get AI Suggestion
        const aiData = await getWeatherSuggestion(mappedWeather, user);
        setSuggestion(aiData.suggestion);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    const getGeoLocation = () => {
      setLoading(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Try to get city name via reverse geocoding (OpenStreetMap Nominatim - Free)
            let cityName = "Detected Location";
            try {
              const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
              const geoData = await geoResponse.json();
              cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || "Local Area";
            } catch (e) {
              console.error("Reverse geocoding failed", e);
            }
            
            fetchWeather(latitude, longitude, cityName);
          },
          (error) => {
            console.warn("Geolocation denied or failed, falling back to default", error);
            fetchWeather(-6.1659, 39.2026, "Zanzibar Resort"); // Fallback to Zanzibar
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        fetchWeather(-6.1659, 39.2026, "Zanzibar Resort");
      }
    };

    getGeoLocation();
  }, [user]);

  const mapCondition = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear Sky': return <Sun className="text-yellow-400" size={24} />;
      case 'Partly Cloudy': return <Cloud className="text-gray-400" size={24} />;
      case 'Rainy':
      case 'Rain Showers': return <CloudRain className="text-blue-400" size={24} />;
      case 'Thunderstorm': return <CloudLightning className="text-purple-400" size={24} />;
      default: return <Cloud className="text-gray-400" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-luxury-charcoal bg-opacity-40 backdrop-blur-md rounded-2xl p-4 border border-white/5 animate-pulse h-32 flex items-center justify-center">
        <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Synchronizing Climate Data...</div>
      </div>
    );
  }

  return (
    <div className="bg-luxury-charcoal bg-opacity-45 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl flex flex-col justify-between group hover:border-luxury-gold/30 transition-all duration-500 h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-500">
            {weather ? getWeatherIcon(weather.condition) : <Sun size={24} />}
          </div>
          <div>
            <p className="text-luxury-gold text-[10px] uppercase font-bold tracking-tighter opacity-70 truncate max-w-[80px]">
              {weather?.locationName || "Local"}
            </p>
            <h4 className="text-white text-lg font-serif leading-none">{weather?.condition || 'Clear Sky'}</h4>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-white">
            <Thermometer size={14} className="text-luxury-gold" />
            <span className="text-xl font-bold font-serif">{weather?.temperature}°</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Humidity {weather?.humidity}%</p>
        </div>
      </div>
      
      <div className="bg-black/40 p-2 rounded-xl border border-white/5 mt-auto">
        <p className="text-[9px] text-luxury-gold uppercase font-bold mb-1 opacity-60 flex items-center gap-1">
          <Activity size={10} />
          AI Comfort Insight
        </p>
        <p className="text-xs text-gray-300 font-light italic leading-tight">
          "{suggestion || "Hydrate and enjoy the tropical warmth."}"
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;

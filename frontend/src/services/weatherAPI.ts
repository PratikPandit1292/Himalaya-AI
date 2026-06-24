import { apiFetch } from "./api";

export interface WeatherData {
  location: string;
  temp_c: number;
  feels_like: number;
  humidity: number;
  condition: string;
  wind_kmh: number;
  icon: string;
  source: "live" | "cache" | "mock";
}

export const weatherAPI = {
  getCurrentWeather: async (location: string): Promise<WeatherData> => {
    return apiFetch<WeatherData>(
      `/api/weather?location=${encodeURIComponent(location)}`
    );
  },
};

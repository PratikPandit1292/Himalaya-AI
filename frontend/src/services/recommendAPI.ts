import { apiFetch } from "./api";

export interface SearchResult {
  place_name: string;
  region: string;
  category: string;
  description: string;
  best_time: string;
  avg_cost: number;
  visit_duration_hours: number;
  altitude_m: number;
  popularity_score: number;
  similarity_score: number;
  similarity_pct: number;
}

export interface DateRecommendation {
  date: string;
  day_of_week: string;
  crowd_level: "Low" | "Medium" | "High";
  crowd_score: number;
  avg_temp_c: number;
  is_holiday: boolean;
  is_weekend: boolean;
}

export interface Circuit {
  id: number;
  name: string;
  emoji: string;
  description: string;
  avg_altitude_m: number;
  places: string[];
  place_count: number;
  avg_cost: number;
  avg_duration_hours: number;
  place_details: {
    place_name: string;
    region: string;
    category: string;
    altitude_m: number;
    avg_cost: number;
    popularity_score: number;
    best_time: string;
  }[];
}

export const recommendAPI = {
  search: (query: string, topK = 6) =>
    apiFetch<{ query: string; results: SearchResult[]; technique: string }>(
      `/api/recommend/search?q=${encodeURIComponent(query)}&top_k=${topK}`
    ),

  getBestDates: (destination: string) =>
    apiFetch<{
      destination: string;
      best_dates: DateRecommendation[];
      worst_dates: DateRecommendation[];
      crowd_distribution: Record<string, number>;
      recommendation: string;
      technique: string;
    }>(`/api/recommend/best-dates?destination=${encodeURIComponent(destination)}`),

  getCircuits: () =>
    apiFetch<{
      circuits: Record<string, Circuit>;
      technique: string;
      total_destinations: number;
    }>("/api/recommend/circuits"),
};

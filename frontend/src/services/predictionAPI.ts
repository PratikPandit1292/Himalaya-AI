import { apiFetch } from "./api";

export interface ShapFactor {
  factor: string;
  contribution: number;
}

export interface PredictionData {
  destination: string;
  date: string;
  crowd_level: "Low" | "Medium" | "High";
  crowd_emoji: string;
  weather: string;
  avg_temp: number;
  recommendation: string;
  travel_tips: string;
  shap_factors: ShapFactor[];
}

export const predictionAPI = {
  getPrediction: async (destination: string, date: string): Promise<PredictionData> => {
    return apiFetch<PredictionData>("/predict", {
      method: "POST",
      body: JSON.stringify({ destination, date }),
    });
  },
};

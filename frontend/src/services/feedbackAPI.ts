import { apiFetch, API_BASE_URL } from "./api";

export interface FeedbackPayload {
  destination: string;
  travel_date: string;
  predicted_crowd: string;
  actual_crowd?: string;
  accuracy_rating: number;
}

export const feedbackAPI = {
  submit: async (payload: FeedbackPayload): Promise<{ message: string; id: number }> => {
    return apiFetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getStats: async () => {
    return apiFetch<{ total_ratings: number; avg_rating: number | null; distribution: Record<string, number> }>(
      "/api/feedback/stats"
    );
  },
};

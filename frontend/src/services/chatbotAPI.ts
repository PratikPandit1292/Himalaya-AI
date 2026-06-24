import { apiFetch } from "./api";

export interface ChatResponse {
  response: string;
  powered_by?: "gemini" | "fallback";
}

export interface HistoryEntry {
  role: "user" | "bot";
  content: string;
}

export const chatbotAPI = {
  sendMessage: async (
    message: string,
    history: HistoryEntry[] = []
  ): Promise<ChatResponse> => {
    return apiFetch<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },
};


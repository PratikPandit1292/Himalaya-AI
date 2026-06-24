import { apiFetch } from "./api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  saveItinerary: async (token: string, data: any): Promise<{ message: string; id: number }> => {
    return apiFetch("/api/user/itineraries", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getSavedItineraries: async (token: string) => {
    return apiFetch<any[]>("/api/user/itineraries", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ── Local storage helpers ──────────────────────
export const getStoredToken = (): string | null =>
  localStorage.getItem("himalaya_token");

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem("himalaya_user");
  return raw ? JSON.parse(raw) : null;
};

export const storeAuth = (token: string, user: AuthUser) => {
  localStorage.setItem("himalaya_token", token);
  localStorage.setItem("himalaya_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("himalaya_token");
  localStorage.removeItem("himalaya_user");
};

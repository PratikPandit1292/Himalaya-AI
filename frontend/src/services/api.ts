import { getStoredToken, clearAuth } from "./authAPI";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (response.status === 401) {
    clearAuth();
    window.location.href = "/";
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
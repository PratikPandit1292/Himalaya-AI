/**
 * TripPlannerAPI.tsx
 * 
 * Helper module for integrating /plan-trip API with React frontend.
 * Handles requests, responses, error handling, and loading states.
 * 
 * Usage:
 *   const { itinerary, loading, error } = await tripPlannerAPI.planTrip({
 *     destination: "Sikkim",
 *     days: 3,
 *     budget: 30000,
 *     travel_style: "family"
 *   });
 */

export interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

export interface Activity {
  destination: string;
  timing: string;
  stay: string;
  estimated_cost: string;
  description: string;
}

export interface TripPlan {
  [day: string]: Activity[];
}

export interface TripResponse {
  plan: TripPlan;
  total_places: number;
  successfully_geocoded: number;
  failed_places: string[];
  total_distance_km: number;
  travel_tips: string;
  optimization_info: {
    total_clusters: number;
    places_per_day: number[];
    method: string;
  };
}

export interface ApiError {
  error: string;
  places_found?: number;
}

// Use import.meta.env for Vite (or default to localhost:5000 for development)
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

/**
 * Plan a trip with geographic optimization
 */
export async function planTrip(request: TripRequest): Promise<{
  success: boolean;
  data?: TripResponse;
  error?: string;
}> {
  try {
    // Validate input
    if (!request.destination?.trim()) {
      return { success: false, error: "Destination is required" };
    }

    if (request.days < 1 || request.days > 30) {
      return { success: false, error: "Days must be between 1 and 30" };
    }

    if (request.budget < 1000) {
      return { success: false, error: "Budget must be at least ₹1000" };
    }

    const validStyles = ["Snow & Scenic Route", "Relaxed & Local Experience", "Adventure & Trekking", "Cultural & Heritage"];
    if (!validStyles.includes(request.travel_style)) {
      return { success: false, error: "Invalid travel style" };
    }

    // Make API request
    const response = await fetch(`${API_BASE_URL}/plan-trip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ApiError;
      return {
        success: false,
        error: errorData.error || "Failed to generate itinerary"
      };
    }

    const data = (await response.json()) as TripResponse;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { success: false, error: message };
  }
}

/**
 * Get health status of the API
 */
export async function checkApiHealth(): Promise<{
  isHealthy: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return {
        isHealthy: true,
        message: "API is running"
      };
    }
  } catch (error) {
    // API not running
  }

  return {
    isHealthy: false,
    message: "API is not available"
  };
}

/**
 * Format itinerary for display
 */
export function formatItinerary(plan: TripPlan): {
  days: { day: string; activities: Activity[] }[];
} {
  return {
    days: Object.entries(plan).map(([day, activities]) => ({
      day,
      activities
    }))
  };
}

/**
 * Extract day number from day string (e.g., "Day 1" -> 1)
 */
export function getDayNumber(dayString: string): number {
  const match = dayString.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Calculate estimated daily cost
 */
export function calculateDailyCost(activities: Activity[]): {
  min: number;
  max: number;
  estimate: string;
} {
  let totalMin = 0;
  let totalMax = 0;

  activities.forEach((activity) => {
    // Parse cost strings like "₹250-500"
    const match = activity.estimated_cost.match(/₹(\d+)-?(\d*)/);
    if (match) {
      totalMin += parseInt(match[1]);
      totalMax += match[2] ? parseInt(match[2]) : parseInt(match[1]);
    }
  });

  return {
    min: totalMin,
    max: totalMax || totalMin,
    estimate: `₹${totalMin}-${totalMax || totalMin}`
  };
}

/**
 * Sort activities by timing
 */
export function sortActivitiesByTime(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const timeA = a.timing.split(" - ")[0]; // Get start time
    const timeB = b.timing.split(" - ")[0];
    return timeA.localeCompare(timeB);
  });
}

/**
 * Get travel style icon
 */
export function getTravelStyleIcon(
  style: string
): "MapPin" | "Heart" | "Mountain" | "Wallet" {
  switch (style) {
    case "adventure":
      return "Mountain";
    case "honeymoon":
      return "Heart";
    case "family":
      return "MapPin";
    case "budget":
    default:
      return "Wallet";
  }
}

/**
 * Get travel style label
 */
export function getTravelStyleLabel(style: string): string {
  const labels: Record<string, string> = {
    budget: "Budget Travel",
    family: "Family Vacation",
    adventure: "Adventure Seeker",
    honeymoon: "Honeymoon Package"
  };
  return labels[style] || style;
}

/**
 * Parse travel tips into sections
 */
export function parseTravelTips(
  tips: string
): { section: string; content: string }[] {
  // Split by sentences and group into logical sections
  const sentences = tips.split(/(?<=[.!?])\s+/);
  const sections = [];

  let currentSection = {
    section: "Travel Tips",
    content: ""
  };

  sentences.forEach((sentence, idx) => {
    if (sentence.includes("Best time") && idx > 0) {
      sections.push(currentSection);
      currentSection = { section: "Best Time to Visit", content: sentence };
    } else if (sentence.includes("Pack") && idx > 0) {
      sections.push(currentSection);
      currentSection = { section: "Packing Tips", content: sentence };
    } else if (sentence.includes("Local") && idx > 0) {
      sections.push(currentSection);
      currentSection = { section: "Local Guide", content: sentence };
    } else {
      currentSection.content += (currentSection.content ? " " : "") + sentence;
    }
  });

  if (currentSection.content) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ section: "Tips", content: tips }];
}

/**
 * Export itinerary to JSON
 */
export function exportItineraryAsJSON(
  itinerary: TripResponse,
  filename: string = "itinerary.json"
): void {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itinerary, null, 2))
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Export itinerary to CSV
 */
export function exportItineraryAsCSV(
  itinerary: TripResponse,
  filename: string = "itinerary.csv"
): void {
  let csv = "Day,Destination,Time,Cost,Description\n";

  Object.entries(itinerary.plan).forEach(([day, activities]) => {
    activities.forEach((activity) => {
      csv += `"${day}","${activity.destination}","${activity.timing}","${activity.estimated_cost}","${activity.description}"\n`;
    });
  });

  const element = document.createElement("a");
  element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Share itinerary via WhatsApp
 */
export function shareViWhatsApp(itinerary: TripResponse): void {
  let message = `🌍 Check out my optimized trip itinerary!\n\n`;
  message += `📍 Total Places: ${itinerary.total_places}\n`;
  message += `📏 Total Distance: ${itinerary.total_distance_km} km\n\n`;

  Object.entries(itinerary.plan).forEach(([day, activities]) => {
    message += `${day}:\n`;
    activities.forEach((activity) => {
      message += `  • ${activity.destination} (${activity.timing})\n`;
    });
    message += "\n";
  });

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
}

/**
 * Share itinerary via Email
 */
export function shareViaEmail(itinerary: TripResponse): void {
  let body = "Check out my optimized trip itinerary!\n\n";
  body += `Total Places: ${itinerary.total_places}\n`;
  body += `Total Distance: ${itinerary.total_distance_km} km\n\n`;

  Object.entries(itinerary.plan).forEach(([day, activities]) => {
    body += `${day}:\n`;
    activities.forEach((activity) => {
      body += `  • ${activity.destination} (${activity.timing}): ${activity.estimated_cost}\n`;
    });
    body += "\n";
  });

  window.location.href = `mailto:?subject=My Trip Itinerary&body=${encodeURIComponent(body)}`;
}

export default {
  planTrip,
  checkApiHealth,
  formatItinerary,
  getDayNumber,
  calculateDailyCost,
  sortActivitiesByTime,
  getTravelStyleIcon,
  getTravelStyleLabel,
  parseTravelTips,
  exportItineraryAsJSON,
  exportItineraryAsCSV,
  shareViWhatsApp,
  shareViaEmail
};

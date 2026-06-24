import { apiFetch } from "./api";

export interface Flight {
  airline: string;
  status: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
}

export interface FlightResponse {
  flight_schedule: Flight[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: string[];
  image: string;
}

export interface Itinerary {
  title: string;
  subtitle: string;
  coverImage: string;
  days: ItineraryDay[];
}

export const itineraryAPI = {
  generateSmartTrip: async (
  payload: GenerateTripRequest
): Promise<SmartItineraryResponse> => {

  return apiFetch<SmartItineraryResponse>(
    "/api/itinerary/generate",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
},
  getFlights: async (departure: string, arrival: string = "IXB"): Promise<FlightResponse> => {
    return apiFetch<FlightResponse>(`/api/flights?departure=${departure}&arrival=${arrival}`);
  },

  // Mock-fallback generator for itinerary optimization
  generateItinerary: async (style: "scenic" | "relaxation", duration: number = 5): Promise<Itinerary> => {
    try {
      return await apiFetch<Itinerary>(`/api/itinerary/optimize?style=${style}&days=${duration}`);
    } catch {
      // Return beautiful fallback mock itineraries if backend is unavailable
      const mockItineraries = {
        scenic: {
          title: "Honeymoon Scenic Escape",
          subtitle: "A breathtaking journey through high-altitude lakes and misty peaks.",
          coverImage: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
          days: [
            {
              day: 1,
              title: "Arrival in Gangtok",
              places: ["MG Marg", "Ridge Park", "Local Cafe"],
              image: "https://images.unsplash.com/photo-1626697556642-a84144360e22?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 2,
              title: "Tsomgo Lake & Nathula",
              places: ["Tsomgo Lake", "Nathula Pass", "Baba Mandir"],
              image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 3,
              title: "Ravangla Buddha Park",
              places: ["Buddha Park", "Temi Tea Gardens"],
              image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 4,
              title: "Namchi Sacred Sites",
              places: ["Char Dham", "Samdruptse"],
              image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 5,
              title: "Shopping & Departure",
              places: ["MG Marg Shopping", "Return Journey"],
              image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
            }
          ]
        },
        relaxation: {
          title: "Honeymoon Relaxation Retreat",
          subtitle: "Slow down, unwind, and soak in peaceful mountain vistas at your own pace.",
          coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
          days: [
            {
              day: 1,
              title: "Arrival at Resort",
              places: ["Hotel Check-in", "Spiritual Spa Sessions"],
              image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 2,
              title: "Leisure Walks in Gangtok",
              places: ["Gangtok Ropeway", "Hilltop Cafe Hopping"],
              image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 3,
              title: "Buddha Park Solitude",
              places: ["Buddha Park Meditation Gardens"],
              image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 4,
              title: "Pelling Misty Valley",
              places: ["Pelling Sky Walk", "Resort Relaxation"],
              image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=600&q=80"
            },
            {
              day: 5,
              title: "Souvenir Shopping & Departure",
              places: ["Lal Bazaar Shopping"],
              image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80"
            }
          ]
        }
      };

      return mockItineraries[style] || mockItineraries.scenic;
    }
  }
};

export interface GenerateTripRequest {
  source_city?: string;
  days: number;
  people: number;
  interests: string[];
  start_date?: string;
}

export interface SmartItineraryResponse {
  traveler_profile: string;
  estimated_cost: number;
  hidden_gem: any;
  itinerary: Record<string, any>;
  ai_narrative: string | null;
  ai_powered: boolean;
  travel_tip: string;
  trip_title?: string;
  trip_overview?: string;

  travel_route?: {
    recommended_mode: string;
    route: string;
    travel_time: string;
    travel_tip: string;
  };
}
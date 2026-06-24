const BASE_URL = "http://localhost:5000";

export async function getFlights(
  departure: string,
  arrival: string
) {

  try {

    const response = await fetch(
      `${BASE_URL}/api/flights?departure=${departure}&arrival=${arrival}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch flights");
    }

    return await response.json();

  } catch (error) {

    console.error("Flight API Error:", error);

    return {
      flight_schedule: []
    };
  }
}
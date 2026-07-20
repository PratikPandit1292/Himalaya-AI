from typing import TypedDict, List, Optional, Dict


class ItineraryAgentState(TypedDict):
    # ---- inputs ----
    days: int
    people: int
    interests: List[str]
    source_city: str
    start_date: Optional[str]  # "YYYY-MM-DD" or None

    # ---- retrieval ----
    retrieved_attractions: List[dict]
    retrieved_sources: List[str]

    # ---- draft itinerary ----
    profile: str
    travel_route: Optional[dict]
    draft_itinerary: Dict[str, dict]
    trip_title: Optional[str]
    trip_overview: Optional[str]
    used_llm: bool

    # ---- crowd-check loop (only runs when start_date is given) ----
    day_dates: Dict[str, str]
    crowd_checks: Dict[str, dict]
    days_to_revise: List[str]
    crowd_advisories: Dict[str, dict]

    # ---- output ----
    final_result: dict
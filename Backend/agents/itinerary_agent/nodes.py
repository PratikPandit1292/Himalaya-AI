"""
NODES for the itinerary agent.

Reuses the exact same predict_trip() tool as agents/crowd_advisor, and
the exact same RAG retriever the chatbot now uses - so this agent shares
its "senses" (retrieval + crowd prediction) with the rest of the app
instead of re-implementing them.

Flow (see graph.py for the diagram):
  retrieve -> draft -> map_dates -> (start_date given?) check_crowd -> (High days?) revise -> finalize
                                    (no start_date) -------------------------------------> finalize
"""

from datetime import datetime, timedelta

from langchain_groq import ChatGroq

from rag.retriever import retrieve_attractions
from ml.tourism_predictor import predict_trip
from services.itinerary_service import (
    create_traveler_profile,
    generate_travel_route,
    generate_llm_itinerary,
    generate_smart_itinerary,
    estimate_trip_cost,
    get_travel_tip,
    get_tip_for_place,
    get_narrative,
    load_attractions,
)
from agents.itinerary_agent.state import ItineraryAgentState

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.4)

# Each attraction "region" maps to the nearest checkpoint the crowd
# model actually knows how to predict for (ml/tourism_predictor.py's
# ALTITUDES dict only covers 11 specific spots, not all 63 attractions).
REGION_TO_CHECKPOINT = {
    "Gangtok": "Gangtok",
    "East": "Tsomgo Lake",
    "South": "Namchi",
    "West": "Pelling",
    "North": "Lachung",
}

# Same window used by agents/crowd_advisor - days out (each direction)
# to check for a better date.
DATE_OFFSETS_TO_TRY = [1, 2, 3, 7, -1, -2, -3, -7]

def format_12h(dt):
    """Cross-platform 12-hour time formatter (Windows' strftime doesn't
    support the %-I flag that Unix does, so this is done manually)."""
    hour = dt.hour % 12
    if hour == 0:
        hour = 12
    period = "AM" if dt.hour < 12 else "PM"
    return f"{hour}:{dt.minute:02d} {period}"

TRAVEL_BUFFER_MINUTES = 30

def build_schedule_narrative(places, start_hour=8):
    """Turns a day's list of places into a flowing, time-based itinerary
    paragraph - e.g. 'Start your day at X around 8:00 AM ... then head
    to Y around 9:30 AM ...' - instead of a bare list of place names."""
    if not places:
        return ""

    current = datetime(2000, 1, 1, start_hour, 0)
    sentences = []
    total_cost = 0

    for i, place in enumerate(places):
        name = place.get("place_name", "your next stop")
        duration = float(place.get("visit_duration_hours") or 1.5)
        desc = (place.get("description") or "").strip()
        cost = place.get("avg_cost") or 0
        total_cost += cost
        time_str = format_12h(current)

        if len(places) == 1:
            lead = f"Spend your day at {name}"
        elif i == 0:
            lead = f"Start your day at {name}"
        elif i == len(places) - 1:
            lead = f"Finally, wrap up at {name}"
        else:
            lead = f"From there, head to {name}"

        sentence = f"{lead} around {time_str}"
        if desc:
            sentence += f" — {desc}"
        sentence += f" (about {duration:g} hr, ~Rs.{cost})."
        sentences.append(sentence)

        current = current + timedelta(hours=duration, minutes=TRAVEL_BUFFER_MINUTES)

    sentences.append(f"Today's stops come to roughly Rs.{total_cost} in entry costs.")
    return " ".join(sentences)


def retrieve_node(state: ItineraryAgentState) -> dict:
    """Tool: RAG-retrieve the attractions most relevant to this
    traveler's interests, instead of loading the entire attractions.csv
    or just taking the top-30-by-popularity slice."""
    interests = state["interests"]
    query = (
        f"Sikkim attractions for a trip focused on: {', '.join(interests)}"
        if interests else "Popular well-rated attractions across Sikkim"
    )
    k = min(max(state["days"] * 5, 15), 45)
    records = retrieve_attractions(query, k=k)

    if not records:
        # Safety net - if retrieval somehow returns nothing, fall back
        # to the full dataset rather than generating an empty itinerary.
        records = load_attractions().to_dict(orient="records")

    print(f"\n[RAG] Retrieved {len(records)} attractions for interests: {interests}")
    return {
        "retrieved_attractions": records,
        "retrieved_sources": [r.get("place_name") for r in records],
    }


def draft_node(state: ItineraryAgentState) -> dict:
    """Agent: generates the first draft of the itinerary, grounded in
    the RAG-retrieved attractions (falls back to the existing
    rule-based generator if the LLM call fails, same safety net as
    before)."""
    profile = create_traveler_profile(state["interests"])
    travel_route = generate_travel_route(state["source_city"])

    attractions_context = [
        {
            "place_name": r.get("place_name"),
            "region": r.get("region"),
            "category": r.get("category"),
            "description": r.get("description"),
            "best_time": r.get("best_time"),
            "avg_cost": r.get("avg_cost"),
        }
        for r in state["retrieved_attractions"]
    ]

    llm_result, used_llm = generate_llm_itinerary(
        state["days"], state["people"], state["interests"],
        state["source_city"], attractions_context=attractions_context,
    )

    if used_llm and llm_result:
        itinerary = llm_result.get("itinerary", {})
        trip_title = llm_result.get("trip_title")
        trip_overview = llm_result.get("trip_overview")
    else:
        itinerary = generate_smart_itinerary(state["days"], state["interests"])
        trip_title = None
        trip_overview = get_narrative(profile)

    return {
        "profile": profile,
        "travel_route": travel_route,
        "draft_itinerary": itinerary,
        "trip_title": trip_title,
        "trip_overview": trip_overview,
        "used_llm": used_llm,
    }


def map_dates_node(state: ItineraryAgentState) -> dict:
    """Works out the calendar date for each day of the itinerary, if
    the traveler gave a start date."""
    if not state.get("start_date"):
        return {"day_dates": {}}

    base = datetime.strptime(state["start_date"], "%Y-%m-%d")
    day_dates = {}
    for i, day_name in enumerate(state["draft_itinerary"].keys()):
        day_dates[day_name] = (base + timedelta(days=i)).strftime("%Y-%m-%d")
    return {"day_dates": day_dates}


def should_check_crowd(state: ItineraryAgentState) -> str:
    """Conditional edge: only bother crowd-checking if we actually
    have a start date to check dates against."""
    return "check_crowd" if state.get("day_dates") else "finalize"


def check_crowd_node(state: ItineraryAgentState) -> dict:
    """Tool: runs the SAME crowd predictor used by the crowd_advisor
    agent, once per day of the itinerary, checking whether that day's
    dominant region is headed for a High-crowd date."""
    crowd_checks = {}
    days_to_revise = []

    print("\n[Crowd Check] Checking crowd levels for each day of the itinerary...")

    for day_name, day_data in state["draft_itinerary"].items():
        date_str = state["day_dates"].get(day_name)
        if not date_str:
            continue

        region = day_data.get("region", "Gangtok")
        checkpoint = REGION_TO_CHECKPOINT.get(region, "Gangtok")

        try:
            result = predict_trip(checkpoint, date_str)
            crowd_checks[day_name] = {"checkpoint": checkpoint, "date": date_str, **result}
            if result["crowd_level"] == "High":
                days_to_revise.append(day_name)
                print(f"   [HIGH] {day_name} ({checkpoint}, {date_str})")
            else:
                print(f"   [OK] {day_name} ({checkpoint}, {date_str}): {result['crowd_level']}")
        except Exception as e:
            print(f"   (skipped crowd check for {day_name}/{checkpoint}: {e})")
            continue

    return {"crowd_checks": crowd_checks, "days_to_revise": days_to_revise}


def should_revise(state: ItineraryAgentState) -> str:
    """Conditional edge: only bother searching for better dates on
    days that actually came back High."""
    return "revise" if state.get("days_to_revise") else "finalize"


def revise_node(state: ItineraryAgentState) -> dict:
    """Tool + agent: for each High-crowd day, checks nearby dates for
    that same checkpoint (same loop pattern as crowd_advisor's
    search_alternatives_node) and, if a better date exists, has the
    LLM write a short advisory note for that day - rather than
    silently rewriting the traveler's fixed day-by-day sequence."""
    advisories = {}

    for day_name in state["days_to_revise"]:
        check = state["crowd_checks"][day_name]
        checkpoint = check["checkpoint"]
        base_date = datetime.strptime(check["date"], "%Y-%m-%d")

        tried = []
        for offset in DATE_OFFSETS_TO_TRY:
            alt_date = (base_date + timedelta(days=offset)).strftime("%Y-%m-%d")
            try:
                result = predict_trip(checkpoint, alt_date)
                tried.append({"date": alt_date, "offset": offset, **result})
            except Exception:
                continue

        crowd_rank = {"Low": 0, "Medium": 1, "High": 2}
        better = [t for t in tried if t["crowd_level"] != "High"]
        better.sort(key=lambda t: (crowd_rank[t["crowd_level"]], abs(t["offset"])))
        best = better[0] if better else None

        if best:
            prompt = f"""A traveler's itinerary has {day_name} scheduled at {checkpoint}
on {check['date']}, which is predicted to be High crowd.

A nearby date, {best['date']}, is predicted to be {best['crowd_level']} crowd instead.

Write ONE short sentence (max 25 words) advising the traveler, in a
friendly practical tone, that they could shift this day to {best['date']}
to avoid the crowds."""
        else:
            prompt = f"""A traveler's itinerary has {day_name} scheduled at {checkpoint}
on {check['date']}, which is predicted to be High crowd. No better nearby
date was found within a week either way.

Write ONE short sentence (max 25 words) giving a practical tip for
coping with the crowd that day (e.g. arriving early), in a friendly tone."""

        try:
            response = llm.invoke(prompt)
            note = response.content.strip()
        except Exception as e:
            note = "This is a busier day - consider arriving early to beat the crowds."
            print(f"   (advisory LLM call failed for {day_name}: {e})")

        advisories[day_name] = {
            "note": note,
            "predicted_crowd": check["crowd_level"],
            "better_date": best["date"] if best else None,
        }
        print(f"   [Advisory] {day_name}: {note}")

    return {"crowd_advisories": advisories}


def finalize_node(state: ItineraryAgentState) -> dict:
    """Assembles the final response in the same shape the rest of the
    app already expects from generate_complete_itinerary(), plus the
    new crowd-awareness fields and a full narrative schedule per day."""
    itinerary = state["draft_itinerary"]

    attraction_lookup = {
        r.get("place_name"): r for r in state.get("retrieved_attractions", [])
    }

    advisories = state.get("crowd_advisories", {})
    checks = state.get("crowd_checks", {})
    for day_name, day_data in itinerary.items():
        if day_name in checks:
            day_data["predicted_crowd_level"] = checks[day_name]["crowd_level"]
        if day_name in advisories:
            day_data["crowd_advisory"] = advisories[day_name]["note"]
            day_data["better_date_suggestion"] = advisories[day_name]["better_date"]

        enriched_places = []
        for place in day_data.get("places", []):
            name = place.get("place_name", "")
            full = attraction_lookup.get(name, {})
            enriched = {**full, **place}
            if not enriched.get("tip"):
                enriched["tip"] = get_tip_for_place(name)
            enriched_places.append(enriched)

        day_data["places"] = enriched_places
        day_data["schedule_narrative"] = build_schedule_narrative(enriched_places)

    all_places = []
    for day_data in itinerary.values():
        all_places.extend(day_data.get("places", []))

    estimated_cost = estimate_trip_cost(
        days=state["days"], people=state["people"], attractions=all_places
    )

    df = load_attractions()
    hidden_pool = df[
        (df["category"].isin(state["interests"]))
        & (df["popularity_score"] <= 70)
    ]
    hidden_gem = hidden_pool.sample(1).iloc[0].to_dict() if len(hidden_pool) > 0 else None

    result = {
        "traveler_profile": state["profile"],
        "travel_route": state["travel_route"],
        "estimated_cost": estimated_cost,
        "hidden_gem": hidden_gem,
        "travel_tip": get_travel_tip(state["interests"]),
        "trip_title": state.get("trip_title"),
        "trip_overview": state.get("trip_overview"),
        "ai_narrative": state.get("trip_overview"),
        "ai_powered": state.get("used_llm", False),
        "itinerary": itinerary,
        "start_date": state.get("start_date"),
        "people": state["people"],
        "rag_sources": state.get("retrieved_sources", []),
        "crowd_checked": bool(state.get("crowd_checks")),
    }
    return {"final_result": result}
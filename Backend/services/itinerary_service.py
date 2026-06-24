import pandas as pd
from pathlib import Path
import math
import os
import json
import random
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

DATASET_PATH = Path("datasets/tourism/attractions.csv")


def load_attractions():
    return pd.read_csv(DATASET_PATH)


# ============================================================
# TRAVELER PROFILES
# ============================================================

def create_traveler_profile(interests):
    interests = [i.lower() for i in interests]
    if "nature" in interests and "photography" in interests:
        return "Nature Photographer"
    elif "adventure" in interests and "photography" in interests:
        return "Adventure Explorer"
    elif "nature" in interests and "adventure" in interests:
        return "Himalayan Adventurer"
    elif "spiritual" in interests and "culture" in interests:
        return "Cultural Pilgrim"
    elif "family" in interests:
        return "Family Traveler"
    elif "photography" in interests:
        return "Travel Photographer"
    elif "adventure" in interests:
        return "Adventure Seeker"
    elif "spiritual" in interests:
        return "Spiritual Wanderer"
    else:
        return "Himalayan Explorer"


# ============================================================
# RICH AI-QUALITY NARRATIVES (no API needed)
# ============================================================

NARRATIVES = {
    "Nature Photographer": [
        "Sikkim unfolds before your lens like a living canvas — misty valleys, high-altitude lakes and rhododendron forests that shift colour with every hour of light. This itinerary is crafted to place you at the best vantage points at golden hour and dawn. Pack your wide-angle lens and prepare for a journey that will fill multiple memory cards.",
        "From the sweeping panoramas of Gangtok's ridgelines to the mirror-still surface of Tsomgo Lake at dawn, your camera will never rest. This nature photography journey threads together Sikkim's most photogenic landscapes across its five regions, ensuring you capture both the grandeur of the peaks and the intimacy of monastery courtyards.",
    ],
    "Himalayan Adventurer": [
        "Sikkim is one of the last frontiers of the Eastern Himalayas — a landscape that rewards the bold. Your adventure itinerary combines high-altitude passes, trekking base camps and remote valley drives that most tourists never reach. Expect altitude, adrenaline and vistas that redefine your sense of scale.",
        "This itinerary pushes beyond the comfortable to deliver raw Himalayan experiences — border-adjacent passes, ancient yak-herding trails and valleys where mobile signals vanish. Built for travellers who measure a great day by elevation gained, not kilometres covered.",
    ],
    "Cultural Pilgrim": [
        "Sikkim carries centuries of Buddhist tradition in its monasteries, prayer flags and living festivals. This itinerary threads together the state's most significant spiritual sites — from the grand Rumtek Monastery to hillside temples with unbroken views of Kanchenjunga. Come with an open mind and leave with a fuller heart.",
        "Few corners of the Himalayas hold as much living culture as Sikkim. Your journey moves through ancient monasteries, Tibetan heritage museums and sacred viewpoints, connecting the dots between a culture that has peacefully merged Buddhist, Hindu and indigenous traditions over eight centuries.",
    ],
    "Family Traveler": [
        "Sikkim is one of India's safest and most family-friendly mountain destinations — clean air, gentle trails, cable car rides and wildlife parks that delight children and adults equally. This itinerary balances excitement with comfort, mixing easy nature walks with cultural highlights that spark curiosity in travellers of all ages.",
        "From Gangtok's friendly streets and the Rope Way aerial views to the colourful prayer flags of mountain monasteries, Sikkim offers family memories that last a lifetime. This itinerary keeps pacing comfortable, accommodation accessible and experiences engaging for every member of your group.",
    ],
    "Adventure Explorer": [
        "Sikkim's terrain is a playground for those who seek it — glacial lakes at 3,700 metres, mountain passes above 4,000 metres and trekking routes that cross from subtropical forests to alpine meadows in a single day. Your adventure-focused itinerary makes the most of every altitude gain.",
        "This is Sikkim for the explorer in you — high passes, remote monasteries accessible only by winding mountain roads, and landscapes that remind you exactly why the Himalayas hold a mythical place in every traveller's imagination.",
    ],
    "Travel Photographer": [
        "Every corner of Sikkim holds a photograph — the prayer flags against snow-capped peaks, the orange robes of monks in morning light, the emerald terraces that cascade down impossible hillsides. This itinerary is timed and routed to give you the light, the access and the silence that great images demand.",
        "Sikkim rewards patient photographers with scenes of extraordinary beauty. This route moves you through the state's most photogenic destinations at the right time of day — golden hour at the viewpoints, early morning at the monasteries, midday at the high-altitude lakes where light dances on still water.",
    ],
    "Spiritual Wanderer": [
        "Sikkim is blessed ground — literally so in the Buddhist tradition. Ancient monasteries perch on ridgelines, sacred lakes reflect snow peaks, and the air at altitude carries a stillness that quiets the mind effortlessly. This itinerary is your pilgrimage through one of India's most spiritually alive landscapes.",
        "From the incense-scented halls of Rumtek to the windswept temples overlooking Kanchenjunga, this journey invites you to slow down, breathe the mountain air and experience the profound peace that Sikkim's spiritual sites offer to those who approach with reverence.",
    ],
    "Himalayan Explorer": [
        "Sikkim is a state of superlatives — India's least populous, most organic, most biodverse and arguably most beautiful. Compact yet endlessly varied, it rewards the curious traveller with something new around every mountain bend. This itinerary covers its best highlights across five distinct regions.",
        "Tucked between Nepal, Tibet and Bhutan, Sikkim is the Himalayan journey that surprises even seasoned travellers. This itinerary moves you through its capital, its high passes, its monasteries and its wilderness — a complete portrait of one of India's most extraordinary destinations.",
    ],
}

# Per-place insider tips
PLACE_TIPS = {
    "MG Marg":                         "Visit on weekday evenings for a relaxed atmosphere — weekends bring crowds. The street food at the north end is excellent.",
    "Ridge Park":                       "Arrive at sunrise for unobstructed Kanchenjunga views before the morning haze builds. Bring a jacket — it's cooler than the town.",
    "Ganesh Tok":                       "The small temple is open from 7am. Arrive early to find parking and beat the tour groups that arrive mid-morning.",
    "Hanuman Tok":                      "Midweek mornings are peaceful here. The army maintains the area — be respectful of the military presence around the viewpoint.",
    "Tashi View Point":                 "Pre-dawn (before 6am) gives the clearest Kanchenjunga views on clear days. October–December offers the best visibility.",
    "Enchey Monastery":                 "Visit during the annual Chaam dance festival (December–January) for a once-a-year cultural spectacle.",
    "Rumtek Monastery":                 "Photography is permitted in the courtyard but not inside the main prayer hall. The back garden offers the best architecture shots.",
    "Banjhakri Falls":                  "The falls are most dramatic in the post-monsoon season (September–October) when water volume is highest.",
    "Namgyal Institute of Tibetology":  "Allow 90 minutes minimum — the collection of thangkas and Buddhist manuscripts is more extensive than expected. Audio guides available.",
    "Tsomgo Lake":                      "Arrive before 10am — by midday tourist vehicles fill the only road. The lake sometimes freezes in January, creating a stunning ice sheet.",
    "Nathula Pass":                     "Indian nationals only (Aadhaar/Passport required). Book the pass permit in Gangtok a day ahead — limited daily slots.",
    "Baba Harbhajan Singh Temple":      "This temple is deeply sacred to the Indian Army. Dress conservatively and speak quietly. The story of Baba Harbhajan is extraordinary — ask a local.",
    "Gurudongmar Lake":                 "At 17,800 ft, acclimatise properly — spend at least one night in Lachen before attempting this drive. Carry warm layers even in summer.",
    "Seven Sisters Waterfall":          "Best viewed immediately after the monsoon (August–September). The roadside viewpoint gives the best framing.",
    "Yumthang Valley":                  "The rhododendron bloom peaks in mid-April. Visit before 9am to see the valley before tour vehicles arrive in numbers.",
    "Zero Point":                       "Weather at Zero Point changes in minutes — carry waterproof gear. The drive from Lachung is itself one of Sikkim's great scenic routes.",
    "Ravangla":                         "The Buddha Park at dawn is magical — almost no visitors at 6am and the light on the 130-ft statue is extraordinary.",
    "Namchi":                           "The Siddheshwar Dham complex is vast — allow at least 3 hours. The cable car (when operational) offers panoramic valley views.",
    "Temi Tea Garden":                  "Arrange a guided walk through the tea rows in the morning mist. The factory tour explains the entire Orthodox tea process.",
    "Pelling":                          "The glass skywalk at Skywalk Park is weather dependent — call ahead. Sunrise views of Kanchenjunga from Pelling are among the best in Sikkim.",
    "Khecheopalri Lake":                "Remove footwear before approaching the lakeshore — it is considered sacred. Boats are permitted; the silence here is profound.",
    "Yuksom":                           "The base camp for Goecha La trek — even non-trekkers can walk the first 3km of trail for stunning forest scenery.",
    "Zuluk":                            "One of Sikkim's most scenic drives — the zigzag roads and Silk Route history make it special. Requires Inner Line Permit.",
    "Lachung":                          "A quiet, traditional Lepcha village. Staying overnight here (vs. day-tripping) means you experience the valley at its most peaceful.",
    "Lachen":                           "At 8,838 ft, this village is your base for Gurudongmar. Arrive early afternoon to acclimatise before the high-altitude drive next day.",
}

REGION_THEMES_POOL = {
    "Gangtok": [
        "Capital City & Viewpoint Trail",
        "Monasteries & Mountain Panoramas",
        "Gangtok Culture & Heritage Walk",
        "Sunrise Viewpoints & Sacred Sites",
    ],
    "East": [
        "High Altitude Lakes & Mountain Passes",
        "Tsomgo & the Himalayan Frontier",
        "Indo-China Border Landscapes",
        "Alpine Lakes & Army Heritage",
    ],
    "South": [
        "Monasteries, Tea Gardens & Scenic Villages",
        "Buddha Statues & Valley Views",
        "Heritage Towns & Sacred Forests",
        "South Sikkim Cultural Corridor",
    ],
    "West": [
        "Kanchenjunga Viewpoints & Hidden Valleys",
        "Trekking Base Camps & Sacred Lakes",
        "Pelling & the Western Wilderness",
        "Forest Trails & Mountain Serenity",
    ],
    "North": [
        "Remote Valleys & Alpine Wilderness",
        "Yumthang & Zero Point Expedition",
        "North Sikkim Frontier Drive",
        "High-Altitude Villages & Glacial Valleys",
    ],
}

DAY_SUMMARIES = {
    "Gangtok": [
        "Explore the vibrant capital city and its iconic ridgeline viewpoints with sweeping Himalayan panoramas.",
        "Wander through ancient monasteries and lively markets in the heart of Gangtok.",
        "A day of cultural depth and mountain vistas in Sikkim's welcoming capital.",
    ],
    "East": [
        "Drive to breathtaking high-altitude lakes and stand at the edge of the Indo-China border.",
        "One of Sikkim's most dramatic days — glacial lakes, mountain passes and military heritage.",
        "Experience the raw grandeur of Eastern Sikkim's alpine landscape.",
    ],
    "South": [
        "Meander through tea gardens, sacred forests and impressive Buddha statues in the gentle south.",
        "A culturally rich day through Southern Sikkim's monasteries and scenic hilltop towns.",
        "Rolling hills, aromatic tea estates and ancient pilgrimage sites define this southern chapter.",
    ],
    "West": [
        "Stand face-to-face with Kanchenjunga and explore sacred lakes surrounded by forest.",
        "The west rewards adventurers with spectacular views and the serenity of hidden valleys.",
        "Trekking country begins here — a day of wilderness, reflection and mountain grandeur.",
    ],
    "North": [
        "Journey into the remote north — high-altitude valleys, yak pastures and glacier-fed rivers.",
        "The most dramatic landscapes in Sikkim await in the high north, near the Tibetan plateau.",
        "Few tourists reach this far — your reward is complete solitude and towering alpine scenery.",
    ],
}

TRAVEL_TIPS = {
    "adventure":  "Start all high-altitude drives before 8am to avoid afternoon cloud cover and road congestion. Carry warm layers regardless of season — temperatures at passes drop sharply.",
    "nature":     "Wildlife is most active at dawn and dusk. Carry binoculars for bird-watching in the forest zones, and a zoom lens for distant Kanchenjunga sightings.",
    "photography":"Golden hour in Sikkim (6–8am and 4–6pm) delivers the best light for both landscapes and monastery portraits. Cloud conditions change rapidly — always keep your camera accessible.",
    "spiritual":  "Most monasteries observe silence between noon and 3pm. Dress conservatively (covered shoulders and knees) and remove footwear before entering prayer halls.",
    "culture":    "Carry small denomination notes for donation boxes at temples and permits at border areas. Learning a few Sikkimese or Tibetan phrases goes a long way with locals.",
    "family":     "Book accommodations in advance in peak season (Oct–Dec, April–May). Keep children hydrated at altitude and plan rest periods in the afternoon. Gangtok's ropeway is a crowd-pleaser.",
    "default":    "Carry cash — ATMs become sparse beyond Gangtok. Check Inner Line Permit requirements for Nathula, Gurudongmar, and Zuluk before your trip."
}


def get_narrative(profile):
    pool = NARRATIVES.get(profile, NARRATIVES["Himalayan Explorer"])
    return pool[0]  # deterministic for now


def get_tip_for_place(place_name):
    return PLACE_TIPS.get(
        place_name,
        "Visit early in the morning for the best experience and to avoid crowds."
    )


def get_travel_tip(interests):
    for interest in [i.lower() for i in interests]:
        if interest in TRAVEL_TIPS:
            return TRAVEL_TIPS[interest]
    return TRAVEL_TIPS["default"]


# ============================================================
# COST & HIDDEN GEM
# ============================================================

def estimate_trip_cost(days, people, attractions):
    attraction_cost = sum(place.get("avg_cost", 0) for place in attractions)
    hotel_cost = days * 2500
    food_cost = days * people * 800
    transport_cost = days * 1000
    return int(attraction_cost + hotel_cost + food_cost + transport_cost)


# ============================================================
# UPGRADE 1: LLM-Powered Itinerary via Google Gemini
# Falls back gracefully to rich rule-based generator
# ============================================================

def generate_llm_itinerary(days, people, interests, source_city="", start_date=None):

    try:

        df = load_attractions()

        filtered = df[df["category"].isin(interests)]

        if len(filtered) == 0:
            filtered = df.copy()

        filtered = filtered.sort_values(
            by="popularity_score",
            ascending=False
        ).head(30)

        attractions_context = filtered[
            [
                "place_name",
                "region",
                "category",
                "description",
                "best_time",
                "avg_cost"
            ]
        ].to_dict(orient="records")

        prompt = f"""
You are an expert Sikkim travel planner.

Traveler Details:
- Source City: {source_city}
- Days: {days}
- People: {people}
- Interests: {', '.join(interests)}

Available Attractions:
{json.dumps(attractions_context, indent=2)}

Create a detailed itinerary.

Generate a premium travel-package style title.

The title should sound like a commercial travel package,
not a generic itinerary.

Good examples:

"Romance in the Clouds"
"Hidden Valleys Photography Expedition"
"High Passes & Himalayan Wonders"
"The Ultimate Sikkim Discovery"
"Mystic Monasteries & Mountain Views"

Return ONLY valid JSON:

{{
    "trip_title":"Unique travel package title",

    "trip_overview":"Write a luxurious and inspiring travel overview.

    Mention:
    - Source city
    - Travel style
    - Main highlights
    - What makes this trip memorable

    Keep it under 80 words.",

    "itinerary": {{
        "Day 1": {{
            "region":"...",
            "theme":"...",
            "day_summary":"...",
            "places":[]
        }}
    }}
}}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4096
        )

        text = response.choices[0].message.content.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "")

        if text.startswith("```"):
            text = text.replace("```", "")

        if text.endswith("```"):
            text = text[:-3]

        result = json.loads(text.strip())

        return result, True

    except Exception as e:
        print("[GROQ ITINERARY ERROR]", e)
        return None, False

# ============================================================
# RICH RULE-BASED GENERATOR (AI-quality output, no API needed)
# ============================================================

def generate_smart_itinerary(days, interests):
    df = load_attractions()
    filtered = df[df["category"].isin(interests)]

    if len(filtered) == 0:
        filtered = df.copy()

    filtered = filtered.sort_values(by="popularity_score", ascending=False)

    region_order = ["Gangtok", "East", "South", "West", "North"]
    all_places_ordered = []
    for region in region_order:
        region_places = filtered[filtered["region"] == region].to_dict(orient="records")
        all_places_ordered.extend(region_places)

    remaining = filtered[~filtered["region"].isin(region_order)].to_dict(orient="records")
    all_places_ordered.extend(remaining)

    if not all_places_ordered:
        return {}

    PLACES_PER_DAY = 3
    total_slots = days * PLACES_PER_DAY
    pool = []
    while len(pool) < total_slots:
        pool.extend(all_places_ordered)
    pool = pool[:total_slots]

    # Track which theme index per region we've used
    theme_counters = {r: 0 for r in region_order}

    itinerary = {}
    for day_num in range(1, days + 1):
        start = (day_num - 1) * PLACES_PER_DAY
        day_places = pool[start:start + PLACES_PER_DAY]

        # Enrich each place with insider tip
        enriched_places = []
        for p in day_places:
            p_copy = dict(p)
            p_copy["tip"] = get_tip_for_place(p_copy.get("place_name", ""))
            enriched_places.append(p_copy)

        # Dominant region
        regions_in_day = [p.get("region", "Sikkim") for p in enriched_places]
        dominant_region = max(set(regions_in_day), key=regions_in_day.count)

        # Pick themed label
        theme_pool = REGION_THEMES_POOL.get(
            dominant_region,
            ["Exploration & Discovery"]
        )
        idx = theme_counters.get(dominant_region, 0) % len(theme_pool)
        theme = theme_pool[idx]
        theme_counters[dominant_region] = idx + 1

        # Override first and last day
        if day_num == 1:
            theme = "Arrival & First Impressions"
        elif day_num == days:
            theme = "Final Highlights & Departure Day"

        # Day summary
        summary_pool = DAY_SUMMARIES.get(dominant_region, ["A wonderful day of exploration in Sikkim."])
        summary = summary_pool[min(theme_counters.get(dominant_region, 0) - 1, len(summary_pool) - 1)]

        itinerary[f"Day {day_num}"] = {
            "region": dominant_region,
            "theme": theme,
            "day_summary": summary,
            "places": enriched_places,
        }

    return itinerary


def generate_travel_route(source_city, destination="Gangtok"):

    if not source_city:
        return None

    try:

        prompt = f"""
A traveler is visiting {destination} from {source_city}.

Determine:

1. Best transport mode
2. Realistic route
3. Approximate travel duration
4. One useful travel tip

Return ONLY valid JSON:

{{
    "recommended_mode":"",
    "route":"",
    "travel_time":"",
    "travel_tip":""
}}
Use realistic travel times and routes based on the source city.
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Return only valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=500
        )

        text = response.choices[0].message.content.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "")

        if text.startswith("```"):
            text = text.replace("```", "")

        if text.endswith("```"):
            text = text[:-3]

        return json.loads(text.strip())

    except Exception as e:
        print("[TRAVEL ROUTE ERROR]", e)
        return None



# ============================================================
# MAIN ENTRY POINT
# ============================================================





def generate_complete_itinerary(days, people, interests, source_city="",start_date=None):
    trip_title = None
    trip_overview = None
    profile = create_traveler_profile(interests)
    travel_route = generate_travel_route(source_city)

    # Try Gemini first
    llm_result, used_llm = generate_llm_itinerary(days, people, interests, source_city, start_date=None)

    if used_llm and llm_result:
        print("===== LLM RESULT =====")
        print(json.dumps(llm_result, indent=2))
        itinerary = llm_result.get("itinerary", {})
        trip_title = llm_result.get("trip_title")
        trip_overview = llm_result.get("trip_overview")
        ai_narrative = trip_overview

        # Ensure every place has a tip even from LLM output
        for day_name, day_data in itinerary.items():

            print("DAY:", day_name)
            print("DATA:", day_data)

            for place in day_data.get("places", []):

                print("PLACE:", place)
                print("TYPE:", type(place))

                if isinstance(place, dict):

                    if not place.get("tip"):
                        place["tip"] = get_tip_for_place(
                            place.get("place_name", "")
                    )
    else:
        # Rich rule-based fallback
        itinerary = generate_smart_itinerary(days, interests)
        ai_narrative = get_narrative(profile)
        used_llm = False

    # Collect all places for cost estimation
    all_places = []
    for day_data in itinerary.values():
        all_places.extend(day_data.get("places", []))

    estimated_cost = estimate_trip_cost(days=days, people=people, attractions=all_places)

    # Hidden gem (lowest popularity score among visited places)
    # ============================================================
# HIDDEN GEM RECOMMENDATION
# ============================================================

    df = load_attractions()

    hidden_pool = df[
        (df["category"].isin(interests))
        & (df["popularity_score"] <= 70)
    ]

    if len(hidden_pool) > 0:
        hidden_gem = hidden_pool.sample(1).iloc[0].to_dict()
    else:
        hidden_gem = None

    return {
        "traveler_profile": profile,
        "travel_route": travel_route,
        "estimated_cost": estimated_cost,
        "hidden_gem": hidden_gem,
        "travel_tip": get_travel_tip(interests),
        "trip_title": trip_title,
        "trip_overview": trip_overview,
        "ai_narrative": ai_narrative,
        "ai_powered": used_llm,
        "itinerary": itinerary,
        "start_date": start_date,
        "people": people,
    }
"""
NODES for the crowd advisor agent.

Two are TOOLS (no LLM, they just call your existing predict_trip()):
  - predict_node
  - search_alternatives_node

Two are AGENTS (they use an LLM to reason/write):
  - narrate_node
  - finalize_node

This is the same split used in the trip planner project: tools fetch
data, agents reason about it.
"""

from datetime import datetime, timedelta
from langchain_groq import ChatGroq
from ml.tourism_predictor import predict_trip
from agents.crowd_advisor.state import CrowdAdvisorState

# Uses the same Groq model your existing AI Travel Assistant already uses.
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.4)

# How many days out (in each direction) to check for a better date.
DATE_OFFSETS_TO_TRY = [1, 2, 3, 7, -1, -2, -3, -7]


def predict_node(state: CrowdAdvisorState) -> dict:
    """Tool: runs your existing ML pipeline for the requested date."""
    result = predict_trip(state["destination"], state["date"])
    return {"prediction": result}


def narrate_node(state: CrowdAdvisorState) -> dict:
    """Agent: turns the SHAP factors into a plain-language explanation."""
    pred = state["prediction"]
    factors_text = ", ".join(
        f"{f['factor']} ({f['contribution']}%)" for f in pred["shap_factors"]
    )

    prompt = f"""A traveler is asking about visiting {state['destination']} on {state['date']}.

Prediction: {pred['crowd_level']} crowd expected.
Weather: {pred['weather']}, average temperature {pred['avg_temp']}°C.
The main factors driving this crowd prediction, in order of importance: {factors_text}

Write a short (2-3 sentence) plain-language explanation of WHY the crowd
level is what it is, using the factors above. Be specific and natural,
not a list - write it like a knowledgeable local giving advice."""

    print(f"\n🗣️  Narrating prediction for {state['destination']} on {state['date']}...")
    response = llm.invoke(prompt)
    return {"narration": response.content}


def should_search_alternatives(state: CrowdAdvisorState) -> str:
    """Conditional edge: only bother searching for a better date if
    the crowd level is actually High. No point suggesting alternatives
    for a date that's already Low or Medium."""
    if state["prediction"]["crowd_level"] == "High":
        return "search"
    return "finalize"


def search_alternatives_node(state: CrowdAdvisorState) -> dict:
    """Tool: calls predict_trip() again for several nearby dates,
    looking for one with a better (non-High) crowd level. This is the
    genuinely agentic part - the same tool gets called multiple times
    in a loop, and the results get compared before deciding what to do."""
    base_date = datetime.strptime(state["date"], "%Y-%m-%d")
    tried = []

    print(f"\n🔎 Crowd is High - checking nearby dates for {state['destination']}...")

    for offset in DATE_OFFSETS_TO_TRY:
        alt_date = (base_date + timedelta(days=offset)).strftime("%Y-%m-%d")
        try:
            result = predict_trip(state["destination"], alt_date)
            tried.append({"date": alt_date, "offset": offset, **result})
        except Exception as e:
            # Some dates might fail (e.g. outside the model's known range) -
            # skip them rather than crashing the whole graph.
            print(f"   (skipped {alt_date}: {e})")
            continue

    # Prefer Low over Medium, and prefer dates closer to the original.
    crowd_rank = {"Low": 0, "Medium": 1, "High": 2}
    better_options = [t for t in tried if t["crowd_level"] != "High"]
    better_options.sort(key=lambda t: (crowd_rank[t["crowd_level"]], abs(t["offset"])))

    best = better_options[0] if better_options else None
    if best:
        print(f"   -> Found a better date: {best['date']} ({best['crowd_level']})")
    else:
        print("   -> No better nearby date found.")

    return {"alternatives_tried": tried, "best_alternative": best}


def finalize_node(state: CrowdAdvisorState) -> dict:
    """Agent: combines the narration and (if found) the alternative
    date into one final, natural-language recommendation."""
    if state.get("best_alternative"):
        alt = state["best_alternative"]
        prompt = f"""Original explanation for the traveler:
{state['narration']}

A better nearby date was found: {alt['date']} ({alt['crowd_level']} crowd,
{alt['weather']}, {alt['avg_temp']}°C).

Write a short final recommendation (3-4 sentences) that includes the
original explanation AND clearly recommends the better date instead,
with a one-line reason why it's better."""
    else:
        prompt = f"""Original explanation for the traveler:
{state['narration']}

No better nearby date was found within a week either way. Write a short
final recommendation (2-3 sentences) that includes the explanation and
honestly tells the traveler this is one of the busier times to visit,
with a practical tip (e.g. arrive early, book ahead) rather than a
date change."""

    print("\n✍️  Finalizing recommendation...")
    response = llm.invoke(prompt)
    return {"final_recommendation": response.content}
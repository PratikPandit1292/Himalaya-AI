import os
import requests
from datetime import datetime
from openai import OpenAI
from rag.retriever import retrieve_context

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# ── System prompt - now takes RETRIEVED context, not the whole dataset ──
SYSTEM_PROMPT = """
You are SikkimAI, an expert travel planner and tourism consultant for Sikkim.

IMPORTANT RULES:

- Never introduce yourself repeatedly.
- Never ask the user what they want if their request is already clear.
- Directly answer the user's question.
- If the user asks for an itinerary, generate the itinerary immediately.
- If the user asks for recommendations, provide recommendations immediately.
- Be specific and practical.

For itinerary requests:
- Create day-wise plans.
- Include morning, afternoon and evening activities.
- Suggest nearby attractions together.
- Mention approximate budget.
- Mention travel tips.

For honeymoon trips:
- Prioritize scenic places, viewpoints, monasteries, lakes, cafes and romantic experiences.
- Recommend comfortable hotels and sunset viewpoints.

Today's date: {today}
Current season in Sikkim: {season}

Relevant attractions retrieved for this specific question (this is NOT the
full database - only the places most relevant to what the user just asked):
{retrieved_context}

Only use the retrieved attractions above as your factual source for places,
costs, altitude, and best-time info. If the retrieved list doesn't cover
what the user asked, say so honestly rather than inventing details.

Keep responses well structured using markdown.
"""


def _get_season() -> str:
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "Winter (cold, possible snow at high altitudes, clear skies)"
    elif month in [3, 4, 5]:
        return "Spring (rhododendrons blooming, excellent visibility, pre-monsoon)"
    elif month in [6, 7, 8, 9]:
        return "Monsoon (heavy rain, lush green, some roads may close)"
    else:
        return "Autumn (post-monsoon, crystal clear skies, best trekking season)"


def _call_groq(messages, retrieved_context: str):

    try:

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT.format(
                        retrieved_context=retrieved_context,
                        today=datetime.now().strftime("%B %d, %Y"),
                        season=_get_season()
                    )
                }
            ] + messages,
            temperature=0.7,
            max_tokens=1024
        )

        return response.choices[0].message.content

    except Exception as e:
        print("GROQ ERROR:", e)
        return None

FALLBACK_RESPONSES = {}
def _smart_fallback(message: str) -> str:
    msg_lower = message.lower()

    for keyword, response in FALLBACK_RESPONSES.items():
        if keyword in msg_lower:
            return response

    # Generic fallback
    return (
        "I'm your Sikkim travel assistant! I can help with:\n\n"
        "- 🗺️ **Destination recommendations** — What to see, where to go\n"
        "- 📅 **Itinerary planning** — Day-by-day trip plans\n"
        "- 📋 **Permits & regulations** — Nathula, Gurudongmar, Zuluk\n"
        "- 🌤️ **Weather & best time** — Season-by-season breakdown\n"
        "- 💰 **Budget planning** — Costs, transport, accommodation\n"
        "- 🥾 **Trekking** — Routes, difficulty, guides\n\n"
        "What would you like to know about Sikkim? 🏔️"
    )


def get_chat_response(message: str, history: list) -> tuple[str, str]:
    original_message = message

    if "itinerary" in message.lower() or "trip" in message.lower():
        message = f"""
            Generate a complete travel itinerary.

            User Request:
            {message}

                Provide:
- Traveler profile
- Day wise itinerary
- Estimated budget
- Travel tips
"""
    """
    Returns (response_text, powered_by).
    Tries Groq (grounded with retrieved context) first, falls back to rule-based.
    """
    # RAG step: retrieve only the attractions relevant to THIS message,
    # instead of stuffing every attraction in the dataset into the prompt.
    retrieved_context, sources = retrieve_context(original_message, k=5)
    if sources:
        print(f"[RAG] Retrieved for \"{original_message[:60]}\": {sources}")

    # Build conversation with history (note: the previous version appended
    # the current message once per history item, duplicating it several
    # times - fixed here to append it exactly once, after the history).
    messages = []
    for h in history[-8:]:
        role = h.get("role", "user")
        content = h.get("content", "")
        messages.append({
            "role": "user" if role == "user" else "assistant",
            "content": content
        })
    messages.append({"role": "user", "content": message})

    groq_response = _call_groq(messages, retrieved_context)

    if groq_response:
        return groq_response, "groq+rag"

    # Smart fallback
    return _smart_fallback(message), "fallback"
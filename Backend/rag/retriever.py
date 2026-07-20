"""
Query-time retrieval. This is the piece that turns "dump the whole CSV
into every prompt" into actual RAG: given the user's message, fetch only
the handful of attractions that are semantically relevant, and hand back
a short context block plus the list of sources used.

Usage (from chat_service.py):

    from rag.retriever import retrieve_context

    context_text, sources = retrieve_context(user_message, k=5)
"""

from rag.build_index import build_index, DATASET_PATH
import pandas as pd

_collection = None  # lazy-loaded singleton, so we don't reopen the DB per-request


def _get_collection():
    global _collection
    if _collection is None:
        # build_index() is a no-op if the index already exists on disk,
        # so this is cheap after the first call.
        _collection = build_index(force=False)
    return _collection


def retrieve_context(query: str, k: int = 5) -> tuple[str, list[str]]:
    """
    Returns (context_text, source_place_names).

    context_text is ready to drop straight into an LLM prompt.
    source_place_names lets the caller show "based on: X, Y, Z" if wanted.
    """
    collection = _get_collection()

    results = collection.query(query_texts=[query], n_results=k)

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    if not docs:
        return "No matching attractions found in the database.", []

    context_lines = []
    sources = []
    for doc, meta in zip(docs, metadatas):
        context_lines.append(f"- {doc}")
        sources.append(meta.get("place_name", "Unknown"))

    context_text = "\n".join(context_lines)
    return context_text, sources

def retrieve_attractions(query: str, k: int = 15) -> list[dict]:
    """
    Like retrieve_context(), but returns full structured attraction
    records (every column from attractions.csv) instead of a prompt-
    ready text blob. Used by the itinerary agent, which needs
    structured fields (avg_cost, popularity_score, etc.) to build the
    day-by-day plan and cost estimate - not just text for prompting.
    """
    collection = _get_collection()
    results = collection.query(query_texts=[query], n_results=k)
    metadatas = results.get("metadatas", [[]])[0]
    names = [m.get("place_name") for m in metadatas if m.get("place_name")]

    if not names:
        return []

    df = pd.read_csv(DATASET_PATH)
    matched = df[df["place_name"].isin(names)].copy()

    order = {name: i for i, name in enumerate(names)}
    matched["_relevance_order"] = matched["place_name"].map(order)
    matched = matched.sort_values("_relevance_order").drop(columns="_relevance_order")

    return matched.to_dict(orient="records")
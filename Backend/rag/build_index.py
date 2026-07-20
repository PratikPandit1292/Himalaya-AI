"""
Builds a persistent Chroma vector index out of the attractions dataset.

Why this exists:
Previously, chat_service.py loaded the ENTIRE attractions.csv into the
LLM's system prompt on every single message. That's not retrieval - it's
just stuffing everything into context and hoping the model finds what
matters. It works only because the dataset is small (~60 rows) and gets
worse (slower, pricier, noisier) the more places/permits/treks you add.

This module instead:
  1. Turns each attraction row into one retrievable "document" (a rich
     text blob + structured metadata).
  2. Embeds each document and stores it in a persistent Chroma collection
     on disk (Backend/rag/chroma_store/).
  3. Only needs to be re-run when the underlying dataset changes.

Run directly to (re)build the index:
    python -m rag.build_index
"""

from pathlib import Path
import pandas as pd
import chromadb

DATASET_PATH = Path(__file__).resolve().parent.parent / "datasets" / "tourism" / "attractions.csv"
STORE_PATH = Path(__file__).resolve().parent / "chroma_store"
COLLECTION_NAME = "sikkim_attractions"


def _row_to_document(row: pd.Series) -> str:
    """
    Turns one CSV row into a natural-language chunk that embeds well.
    Plain sentences retrieve much better than raw JSON/CSV fields, because
    the embedding model was trained on natural text, not data structures.
    """
    return (
        f"{row['place_name']} is a {row['category'].lower()} attraction in "
        f"{row['region']} district, about {row['distance_from_gangtok_km']} km "
        f"from Gangtok, at an altitude of {row['altitude_m']}m. "
        f"{row['description']} "
        f"A typical visit takes about {row['visit_duration_hours']} hours and "
        f"costs around Rs.{row['avg_cost']}. "
        f"Best time to visit: {row['best_time']}. "
        f"Popularity score: {row['popularity_score']}/100."
    )


def build_index(force: bool = False) -> chromadb.Collection:
    """
    Builds (or loads, if it already exists) the persistent Chroma
    collection. Pass force=True to wipe and rebuild from scratch
    (e.g. after editing attractions.csv).
    """
    STORE_PATH.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(STORE_PATH))

    if force:
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass  # collection didn't exist yet - fine

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # If it's already populated and we're not forcing a rebuild, reuse it.
    if collection.count() > 0 and not force:
        print(f"[RAG] Index already built ({collection.count()} docs). Skipping.")
        return collection

    df = pd.read_csv(DATASET_PATH)

    documents, metadatas, ids = [], [], []
    for i, row in df.iterrows():
        documents.append(_row_to_document(row))
        metadatas.append({
            "place_name": row["place_name"],
            "region": row["region"],
            "category": row["category"],
            "altitude_m": int(row["altitude_m"]),
            "avg_cost": int(row["avg_cost"]),
            "best_time": row["best_time"],
        })
        ids.append(f"attraction-{i}")

    collection.add(documents=documents, metadatas=metadatas, ids=ids)
    print(f"[RAG] Indexed {len(documents)} attractions into '{COLLECTION_NAME}'.")
    return collection


if __name__ == "__main__":
    build_index(force=True)
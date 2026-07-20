"""
STATE = the shared data that flows through this small agent.

This mirrors the same pattern from the trip planner project: every node
reads this dict and returns the fields it wants to update.
"""

from typing import TypedDict, List, Optional


class CrowdAdvisorState(TypedDict):
    # ---- inputs ----
    destination: str
    date: str  # "YYYY-MM-DD"

    # ---- filled in as the graph runs ----
    prediction: dict            # raw output of predict_trip() for the requested date
    narration: str               # plain-language explanation of the SHAP factors
    alternatives_tried: List[dict]  # every nearby date checked, with its result
    best_alternative: Optional[dict]  # the best nearby date found, or None
    final_recommendation: str    # the final message shown to the user
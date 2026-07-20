"""
GRAPH = wires the itinerary agent's nodes into a flowchart.

Flow:

    retrieve -> draft -> map_dates --+
                                      |
                     (no start_date) | (start_date given)
                                      v
                                 check_crowd
                                      |
                        (no High days)|(High days found)
                                      v
                                   revise
                                      |
                                      v
                                  finalize
                                      |
                                     END

retrieve/draft always run. check_crowd only runs if the traveler gave a
start_date (no point crowd-checking dates that don't exist). revise only
runs for days that actually came back High - this mirrors the exact same
conditional-branching pattern used in agents/crowd_advisor, just applied
per-day across a multi-day trip instead of once for a single date.
"""

from langgraph.graph import StateGraph, END
from agents.itinerary_agent.state import ItineraryAgentState
from agents.itinerary_agent.nodes import (
    retrieve_node,
    draft_node,
    map_dates_node,
    should_check_crowd,
    check_crowd_node,
    should_revise,
    revise_node,
    finalize_node,
)


def build_itinerary_agent_graph():
    graph = StateGraph(ItineraryAgentState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("draft", draft_node)
    graph.add_node("map_dates", map_dates_node)
    graph.add_node("check_crowd", check_crowd_node)
    graph.add_node("revise", revise_node)
    graph.add_node("finalize", finalize_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "draft")
    graph.add_edge("draft", "map_dates")

    graph.add_conditional_edges(
        "map_dates",
        should_check_crowd,
        {"check_crowd": "check_crowd", "finalize": "finalize"},
    )

    graph.add_conditional_edges(
        "check_crowd",
        should_revise,
        {"revise": "revise", "finalize": "finalize"},
    )

    graph.add_edge("revise", "finalize")
    graph.add_edge("finalize", END)

    return graph.compile()


def run_itinerary_agent(days, people, interests, source_city="", start_date=None) -> dict:
    """Entry point used by the controller - builds and runs the graph
    once per request, the same way build_crowd_advisor_graph() is used
    in advisor_controller.py."""
    app = build_itinerary_agent_graph()
    result = app.invoke({
        "days": days,
        "people": people,
        "interests": interests,
        "source_city": source_city,
        "start_date": start_date,
    })
    return result["final_result"]
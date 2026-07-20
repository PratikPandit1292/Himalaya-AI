"""
GRAPH = wires the nodes into a flowchart.

Flow:

    predict --> narrate --+
                           |
            (crowd = High) |  (crowd = Low/Medium)
                           v                    |
                  search_alternatives           |
                           |                    |
                           +------> finalize <--+
                                       |
                                      END

Only the "High crowd" path detours through search_alternatives - a
Low or Medium prediction skips straight to finalize, since there's no
need to hunt for a better date if this one is already fine.
"""

from langgraph.graph import StateGraph, END
from agents.crowd_advisor.state import CrowdAdvisorState
from agents.crowd_advisor.nodes import (
    predict_node,
    narrate_node,
    should_search_alternatives,
    search_alternatives_node,
    finalize_node,
)


def build_crowd_advisor_graph():
    graph = StateGraph(CrowdAdvisorState)

    graph.add_node("predict", predict_node)
    graph.add_node("narrate", narrate_node)
    graph.add_node("search_alternatives", search_alternatives_node)
    graph.add_node("finalize", finalize_node)

    graph.set_entry_point("predict")
    graph.add_edge("predict", "narrate")

    graph.add_conditional_edges(
        "narrate",
        should_search_alternatives,
        {
            "search": "search_alternatives",
            "finalize": "finalize",
        },
    )

    graph.add_edge("search_alternatives", "finalize")
    graph.add_edge("finalize", END)

    return graph.compile()
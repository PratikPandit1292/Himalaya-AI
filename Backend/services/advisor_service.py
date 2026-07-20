from agents.crowd_advisor.graph import build_crowd_advisor_graph

_graph = build_crowd_advisor_graph()  # built once, reused across requests


def get_smart_advice(destination, date):
    initial_state = {
        "destination": destination,
        "date": date,
        "prediction": {},
        "narration": "",
        "alternatives_tried": [],
        "best_alternative": None,
        "final_recommendation": "",
    }
    return _graph.invoke(initial_state)
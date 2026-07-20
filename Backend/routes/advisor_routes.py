from flask import Blueprint
from controllers.advisor_controller import smart_predict

advisor_bp = Blueprint(
    "advisor",
    __name__
)

advisor_bp.route(
    "/predict/smart",
    methods=["POST"]
)(smart_predict)
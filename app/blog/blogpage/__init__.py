from flask import Blueprint
from flask_restx import Api


blueprint_name = "blogpage"
bp = Blueprint(blueprint_name, __name__, template_folder="templates/", static_folder="static/")
api = Api(bp)


from . import routes

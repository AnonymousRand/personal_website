from flask import render_template

from app.main import bp


@bp.get("/")
def index():
    return render_template("main/index.html")


@bp.get("/legal-rubbish")
def legal():
    return render_template("main/legal.html")

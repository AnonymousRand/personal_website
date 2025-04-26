import sqlalchemy as sa
from flask import jsonify, redirect, render_template, url_for

from app import db
from app.forms import *
from app.models import *
from config import Config


def inject_forms():
    return dict(login_form=LoginForm())


# for navbar
def inject_blogpages():
    blogpages = db.session.query(Blogpage).order_by(Blogpage.ordering).all()
    return dict(blogpages=blogpages)


def handle_general_http_error(e):
    # meow :3
    return redirect(f"https://http.cat/{e.code}")

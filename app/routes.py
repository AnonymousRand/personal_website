from flask import jsonify, redirect, request, url_for

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


def get_url_for(*args, **kwargs):
    """
    Get `url_for()` from externally-linked JS.

    Set `const`s in inline template JS where `url_for()` is callable from Jinja normally, but use this when URLs need to
    be dynamically built during JS runtime.

    Usage: `/url-for?endpoint=[endpoint]&arg1=[...]&...`
    """

    return jsonify(url=url_for(**request.args, _external=True))

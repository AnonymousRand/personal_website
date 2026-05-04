from functools import wraps

from flask import jsonify, redirect, request, url_for

from app import db
from app.models import *
from app.utils import ContentType


def get_post(post_id: int, post: Post | None = None) -> Post | None:
    """
    Fetch the post with id `post_id` from the DB. However, if the `post` parameter is not `None`, return that instead.
    (This is for convenience and DB query efficiency when chaining together multiple decorators on a route, for example,
    and we don't know a priori if the decorator that sets the `post` kwarg has already been called.)
    """

    if post is not None:
        return post
    return db.session.get(Post, post_id)


@ContentType.resolve_depending_on_req_method()
def on_nonexistent_post(content_type: ContentType):
    match content_type:
        case ContentType.HTML:
            return redirect(url_for(
                f"{request.blueprint}.get_posts",
                flash_msg=utils.encode_uri_component("That post doesn't exist :/"),
                _external=True
            ))
        case ContentType.JSON:
            return jsonify(
                redir_url=url_for(f"{request.blueprint}.get_posts", _external=True), 
                flash_msg="That post doesn't exist :/"
            )
        case _:
            return "app/blog/blogpage/utils.py: `on_nonexistent_post()` somehow reached end of switch statement", 500


def redirs_to_index_after_login():
    """
    If redirecting to a view function decorated by this via the `next` parameter after logging in, instead redirect to
    the GET endpoint for the blog's index.
    """

    def inner_decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            if request.args.get("is_redir_after_login"):
                return redirect(url_for("blog.get_posts", _external=True))
            return func(*args, **kwargs)
        return wrapped
    return inner_decorator

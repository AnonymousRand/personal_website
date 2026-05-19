import sqlalchemy as sa
from flask import jsonify, redirect, request, url_for
from flask_login import current_user

import app.blog.utils as blog_utils
import app.utils as utils
from app import db
from app.blog import bp
from app.models import *
from app.utils import ContentType


@bp.get("/")
def index():
    query_string = ""
    # preserve query string
    if request.query_string.decode() != "":
        query_string = "?" + request.query_string.decode()
    return redirect(url_for(f"blog.1.get_posts", _external=True) + query_string)


# for more permanent links that don't change if a post changes title/moves between blogs
# (MySQL also does not change id on delete)
@bp.get("/<int:post_id>")
def post_by_id(post_id):
    post = blog_utils.get_post(post_id)
    if post is None:
        return blog_utils.on_nonexistent_post(ContentType.HTML)

    # don't allow unlisted posts to be accessed this way to prevent brute-force enumeration of post IDs
    if post.blogpage.is_login_required and not current_user.is_authenticated:
        result = utils.custom_unauthorized(ContentType.HTML)
        if result:
            return result
    return redirect(url_for(
        f"blog.{post.blogpage_id}.get_post", post_id=post_id, post_sanitized_title=post.sanitized_title, _external=True
    ))


@bp.get("/get-posts-with-unread-comments")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@blog_utils.redirs_to_index_after_login()
def get_posts_with_unread_comments(*args, **kwargs):
    posts_with_unread_comments = {}
    posts = db.session.query(Post).all()
    for post in posts:
        unread_comment_count = post.get_unread_comment_count()
        if unread_comment_count > 0:
            posts_with_unread_comments[post.title] = {
                "unread_comment_count": unread_comment_count,
                "url": url_for("blog.post_by_id", post_id=post.id, _external=True)
            }
    return jsonify(posts_with_unread_comments)


@bp.get("/favicon.ico")
def favicon():
    return redirect(url_for("static", filename="images/favicon.ico"))

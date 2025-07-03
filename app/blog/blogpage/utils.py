from __future__ import annotations

import imghdr
import markdown
import os
import re
import shutil
from functools import wraps

from flask import current_app, jsonify, redirect, request, url_for
from werkzeug.utils import escape, secure_filename

import app.utils as utils
from app import db
from app.models import *
from app.utils import ContentType


def require_login_if_restricted_bp():
    """
    Enforces login to access private blogpages.

    Use before every view function potentially accessing private blogpages!!!
    """

    def inner_decorator(func):
        @wraps(func)
        def wrapped(content_type: ContentType, *args, **kwargs):
            blogpage = db.session.get(Blogpage, get_blogpage_id())
            if blogpage is None:
                match content_type:
                    case ContentType.HTML:
                        return redirect(url_for(
                            f"main.index",
                            flash_msg=utils.encode_uri_component("That blogpage doesn't exist :/"),
                            _external=True
                        ))
                    case ContentType.JSON:
                        return jsonify(
                            redir_url=url_for(f"{request.blueprint}.get_posts", _external=True), 
                            flash_msg="That post doesn't exist :/"
                        )
                    case _:
                        return ("app/blog/blogpage/utils.py: `require_login_if_restricted_bp()` reached end of switch "
                                "statement"), 500

            if blogpage.is_login_required:
                result = utils.custom_unauthorized(content_type)
                if result:
                    return result

            return func(content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


def require_valid_post():
    """
    Makes sure URL points to a post that exists, and if so, fetches the post from the db and passes it to its inner
    function as a parameter for later use.
    """

    def inner_decorator(func):
        @wraps(func)
        def wrapped(content_type: ContentType, *args, **kwargs):
            blogpage_id = get_blogpage_id()
            # Flask view functions seem to turn `args` into `kwargs`, and I'm not complaining
            post = get_post(kwargs.get("post"), kwargs.get("post_sanitized_title"), blogpage_id)
            if post is None:
                return nonexistent_post(content_type)
            # also return `post` in addition since functions with these decorators probably need `post` anyway
            return func(post=post, content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


def require_valid_comment():
    def inner_decorator(func):
        @wraps(func)
        def wrapped(content_type: ContentType, comment_id: str, *args, **kwargs):
            comment = db.session.get(Comment, comment_id)
            if comment is None:
                return jsonify(success=True, flash_msg=f"That comment doesn't exist :/")
            return func(comment=comment, comment_id=comment_id, content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


def redir_to_post_after_login():
    """
    If redirecting to a view function decorated by this via the `next` parameter after logging in, instead redirect to
    the GET endpoint for the current post.

    Important: this decorator must be applied after the `post` or `post_sanitized_title` parameters are set (i.e.
    after `@require_valid_post`).
    """

    def inner_decorator(func):
        @wraps(func)
        def wrapped(content_type: ContentType, *args, **kwargs):
            post = get_post(kwargs.get("post"), kwargs.get("post_sanitized_title"), get_blogpage_id())
            if post is None:
                return nonexistent_post(content_type)
            if request.args.get("is_redir_after_login"):
                # here it's always `redirect()` aka HTML content type because this view function must've been called
                # by JS changing `window.location.href` after successful login + seeing `redir_url` JSON key from
                # `login()` view func. `window.location.href` change is always just the same as a `redirect()` via
                # GET an HTML page, as we typically do on loading a new page.
                return redirect(url_for("blog.post_by_id", post_id=post.id, _external=True))
            return func(content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


@ContentType.resolve_depending_on_req_method()
def nonexistent_post(content_type: ContentType):
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
            return "app/blog/blogpage/utils.py: `nonexistent_post()` reached end of switch statement", 500


def upload_files(files: list[werkzeug.datastructures.FileStorage], files_base_path: str) -> str:
    try:
        for file in files:
            if file.filename == "":
                continue
            filename = file.filename

            # validate file type
            file_ext = os.path.splitext(filename)[1]
            if file_ext == ".jpg":                      # `imghdr.what()` in `validate_img()` returns `jpg` as `jpeg`
                file_ext = ".jpeg"
            # `imghdr` can't check SVG; trustable since admin-only ig
            invalid = file_ext not in current_app.config["FILE_UPLOAD_EXTS"] \
                      or (
                          file_ext in current_app.config["FILE_UPLOAD_EXTS_CAN_VALIDATE"]
                          and file_ext != validate_img(file.stream)
                      )
            if invalid:
                return "Invalid file. If it's another heic im gonna lose my mind i swear to god i hate"

            # sanitize filename and upload
            sanitized_filename = sanitize_filename(filename)
            if sanitized_filename == "":
                return f"File name {filename} did not survive sanitization."
            final_path = os.path.join(files_base_path, sanitized_filename)
            os.makedirs(files_base_path, exist_ok=True) # make image directory if it doesn't exist
            file.save(final_path)                       # this can replace existing images
    except Exception as e:
        print(e)
        return f"File upload exception"
    return ""


def delete_dir_if_empty(path: str) -> None:
    if os.path.exists(path) and os.path.isdir(path) and len(os.listdir(path)) == 0:
        shutil.rmtree(path)


def get_blogpage_id() -> int:
    """
    Gets blogpage id from `request.blueprint`.
    """

    return int(request.blueprint.split('.')[-1])


def get_files_base_path(post: Post) -> str:
    return os.path.join(
        current_app.root_path, current_app.config["ROOT_TO_BLOGPAGE_STATIC"],
        str(post.blogpage_id), "images", str(post.id)
    )


def get_post(post: Post, post_sanitized_title: str, blogpage_id: int) -> Post:
    """
    Gets post from URL, making sure it's valid and matches the whole URL.
    """

    if post is not None:
        return post
    return db.session.query(Post).filter_by(sanitized_title=post_sanitized_title, blogpage_id=blogpage_id).first()


def sanitize_filename(filename: str) -> str:
    filename = escape(secure_filename(filename))
    # for Markdown parsing
    filename = filename.replace("(", "").replace(")", "")
    return filename


def validate_img(img) -> str:
    header = img.read(512)
    img.seek(0)
    format = imghdr.what(None, header)
    if not format:
        return ""
    return f".{format}"

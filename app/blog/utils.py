from functools import wraps

from flask import redirect, request, url_for


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

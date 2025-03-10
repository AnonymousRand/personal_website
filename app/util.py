import re
import urllib.parse as parse
from enum import Enum
from functools import wraps

from flask import current_app, jsonify, redirect, request, url_for
from flask_login import current_user


class ContentType(Enum):
    HTML = "text/html"
    JSON = "application/json"
    DEPENDS_ON_REQ_METHOD = "`text/html` if GET, else `application/json`"

    @classmethod
    def resolve_depending_on_req_method(cls):
        """
        Resolves `ContentType.DEPENDS_ON_REQ_METHOD` by checking the current request method.
        """

        def inner_decorator(func):
            @wraps(func)
            def wrapped(content_type: cls, *args, **kwargs):
                if content_type == cls.DEPENDS_ON_REQ_METHOD:
                    content_type = cls.HTML if request.method == "GET" else cls.JSON
                return func(content_type=content_type, *args, **kwargs)
            return wrapped
        return inner_decorator


def require_login():
    """
    Same functionality as `custom_unauthorized()`, but as a decorator.

    Usage:
        ```
        @bp.route(...)
        @util.require_login(...)
        def view_func():
            pass
        ```
    """

    def inner_decorator(func):
        @wraps(func)
        def wrapped(content_type: ContentType, *args, **kwargs):
            result = custom_unauthorized(content_type)
            if result:
                return result
            return func(content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


@ContentType.resolve_depending_on_req_method()
def custom_unauthorized(content_type: ContentType):
    """
    Makes sure `current_user` is authenticated. If not:
        - `Content-Type: text/html`: redirects to login page (GET using Flask's `redirect()`)
        - `Content-Type: application/json`: returns `relogin` key in JSON response which is universally handled by
          my `fetchWrapper()` and triggers a modal log in. This prevents redirects as in the earlier case, which
          can cause loss of form data etc.
    In addition, these use *absolute* URLs unlike Flask-Login's built-in `unauthorized()`, which is essential
    because I have subdomains.

    Usage:
        ```
        result = util.custom_unauthorized(...)
        if result:
            return result
        ```

    Args:
        content_type: specifies the `Content-Type` of the expected server response from the view function
    """

    if not current_user.is_authenticated:
        match content_type:
            case ContentType.HTML:
                return redirect(url_for(
                    current_app.config["LOGIN_VIEW"],
                    flash_msg=encode_uri_component("please log in ^^"),
                    next=encode_uri_component(request.url),
                    _external=True)
                )
            case ContentType.JSON:
                return jsonify(relogin=True)
            case _:
                return "app/util.py: `custom_unauthorized()` reached end of switch statement", 500
    return None


def set_content_type(content_type: ContentType):
    def inner_decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            return func(content_type=content_type, *args, **kwargs)
        return wrapped
    return inner_decorator


def encode_uri_component(s: str) -> str:
    """
    Mimics JavaScript's `encodeURIComponent()`.
    """

    return parse.quote(s, safe="~!*()'")


def decode_uri_component(s: str) -> str:
    """
    Mimics JavaScript's `decodeURIComponent()`.
    """

    return parse.unquote(s)

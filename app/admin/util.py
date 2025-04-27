from __future__ import annotations

import imghdr
import os
import shutil

from flask import current_app, jsonify, redirect, request, url_for
from werkzeug.utils import escape, secure_filename


def upload_files(files: list[werkzeug.datastructures.FileStorage], files_base_path: str) -> str:
    try:
        for img in files:
            if img.filename == "":
                continue

            filename = sanitize_filename(img.filename)
            if filename == "":
                return "File name was deleted by sanitization."

            file_ext = os.path.splitext(filename)[1]
            if file_ext == ".jpg":                      # `imghdr.what()` in `validate_img()` returns `jpg` as `jpeg`
                file_ext = ".jpeg"
            # `imghdr` can't check SVG; trustable since admin-only ig
            invalid = file_ext not in current_app.config["FILE_UPLOAD_EXTS"] \
                    or (
                        file_ext in current_app.config["FILE_UPLOAD_EXTS_CAN_VALIDATE"]
                        and file_ext != validate_img(img.stream)
                    )
            if invalid:
                return "Invalid img. If it's another heic im gonna lose my mind i swear to god i hate"

            path = os.path.join(files_base_path, filename)
            os.makedirs(files_base_path, exist_ok=True) # make image directory if it doesn't exist
            img.save(path)                              # this can replace existing images
    except Exception as e:
        return f"File upload exception"
    return ""


def validate_img(img) -> str:
    header = img.read(512)
    img.seek(0)
    format = imghdr.what(None, header)
    if not format:
        return ""
    return f".{format}"


def delete_dir_if_empty(path: str) -> None:
    if os.path.exists(path) and os.path.isdir(path) and len(os.listdir(path)) == 0:
        shutil.rmtree(path)


def get_files_base_path(post: Post) -> str:
    return os.path.join(
        current_app.root_path, current_app.config["ROOT_TO_BLOGPAGE_STATIC"],
        str(post.blogpage_id), "images", str(post.id)
    )


def sanitize_filename(filename: str) -> str:
    filename = escape(secure_filename(filename))
    filename = filename.replace("(", "").replace(")", "") # for Markdown parsing
    return filename


def redir_depending_on_req_method(redir_endpt: str, flash_msg: str=""):
    match request.method:
        case "GET":
            redir_url = ""
            if flash_msg != "":
                redir_url = url_for(redir_endpt, flash_msg=flash_msg, _external=True)
            else:
                redir_url = url_for(redir_endpt, _external=True)
            return redirect(redir_url)
        case "POST":
            kwargs = {"redir_url": url_for(redir_endpt, _external=True)}
            if flash_msg != "":
                kwargs["flash_msg"] = flash_msg
            return jsonify(**kwargs)
        case _:
            return "app/util.py: `redir_depending_on_req_method()` reached end of switch statement", 500

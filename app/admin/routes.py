import tldextract

import sqlalchemy as sa
from flask import current_app, jsonify, render_template, request, session, url_for
from flask_login import current_user, login_user, logout_user

import app.utils as utils
from app import db
from app.admin import bp
from app.admin.forms import *
from app.forms import *
from app.models import *
from app.utils import ContentType


@bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if current_user.is_authenticated:
        logout_user()

    if request.method == "GET":
        return render_template("admin/form_base.html", title="Login", prompt="meow :3", form=form)
    elif request.method == "POST":
        if not form.validate():
            return jsonify(submission_errors=form.errors)

        user = db.session.scalar(sa.select(User).where(User.username == "admin"))
        # check admin password
        if user is None or not user.check_password(request.form.get("password")):
            # display in submission errors section instead of flash
            return jsonify(submission_errors={"password": ["No, the password is not \"solarwinds123\"."]})

        # `remember=False`, so session expires on both browser close (if it isn't running in background)
        # and on `PERMANENT_SESSION_LIFETIME` timeout (`session.permanent = True` only also makes sure cookie is deleted
        # upon this timeout instead of just invalidated by Flask; check readme for more details)
        login_user(user, remember=False)
        session.permanent = True

        # if modal login, we are done
        if request.form.get("is_modal") == "true":
            return jsonify(success=True, flash_msg="The universe is at your fingertips…")

        # if not modal login, then try to redirect back to previous page
        next_url = utils.decode_uri_component(request.args.get("next", url_for("admin.choose_action", _external=True)))
        next_url_extracted = tldextract.extract(next_url)
        # make sure we can only redirect within the same domain
        if f"{next_url_extracted.domain}.{next_url_extracted.suffix}" == current_app.config["SERVER_NAME"]:
            # when we do the redir back after logging in, we need to let our server know that it is a post-login
            # redir, so if we were trying to redir back to an API endpoint or something instead of a typical
            # webpage, we can handle it properly
            #
            # the `is_redir_after_login` key takes the following path:
            #     `login()` view func (here) adds to response JSON ->
            #     `doAjaxBaseResponse()` handles response JSON and adds to params of url being redirected to ->
            #     view func of url being redirected to handles this
            return jsonify(success=True, redir_url=next_url, is_redir_after_login=True)

        return jsonify(
            success=True, redir_url=url_for("admin.choose_action", flash_msg="please no hack :3", _external=True)
        )


@bp.route("/logout", methods=["POST"])
def logout():
    if current_user.is_authenticated:
        logout_user()
    return jsonify(
        redir_url=url_for(current_app.config["AFTER_LOGOUT_ENDPOINT"], _external=True), flash_msg="Mischief managed."
    )


@bp.route("/choose-action", methods=["GET", "POST"])
@utils.set_content_type(ContentType.DEPENDS_ON_REQ_METHOD)
@utils.require_login()
def choose_action(*args, **kwargs):
    form = ChooseActionForm()

    if request.method == "GET":
        return render_template("admin/form_base.html", title="Choose action", prompt="UwU what's this? :3", form=form)
    elif request.method == "POST":
        if not form.validate():
            return jsonify(submission_errors=form.errors)
        action = request.form.get("action")
        redir_url = ""
        match action:
            case "create":
                redir_url = url_for("blog.1.create_post_form", _external=True)
            case "edit":
                redir_url = url_for("admin.search_posts", _external=True)
            case "change_admin_password":
                redir_url = url_for("admin.change_admin_password", _external=True)
            case _:
                return jsonify(flash_msg="please no hack :3")
        return jsonify(redir_url=redir_url)


@bp.route("/search-posts", methods=["GET", "POST"])
@utils.set_content_type(ContentType.DEPENDS_ON_REQ_METHOD)
@utils.require_login()
def search_posts(*args, **kwargs):
    form = SearchBlogpostForm()

    if request.method == "GET":
        return render_template("admin/form_base.html", title="Search Posts", prompt="Search posts", form=form)
    elif request.method == "POST":
        if not form.validate():
            return jsonify(submission_errors=form.errors)

        post_id = request.form.get("post")
        if post_id is None:
            return jsonify(flash_msg="thanks for choosing nothing, now i will stare at you")
        post = db.session.get(Post, post_id)
        if post is None:
            return jsonify(flash_msg="That post doesn't exist :/")
        return jsonify(redir_url=url_for(
            f"blog.{post.blogpage_id}.edit_post_form", post_sanitized_title=post.sanitized_title, _external=True
        ))


@bp.route("/change-admin-password", methods=["GET", "POST"])
@utils.set_content_type(ContentType.DEPENDS_ON_REQ_METHOD)
@utils.require_login()
def change_admin_password(*args, **kwargs):
    form = ChangeAdminPasswordForm()

    if request.method == "GET":
        return render_template(
            "admin/form_base.html", title="Change admin password",
            prompt="Don't make it \"solarwinds123\" or else my incorrect password message won't wor", form=form
        )
    elif request.method == "POST":
        if not form.validate():
            return jsonify(submission_errors=form.errors)

        user = db.session.scalar(sa.select(User).where(User.username == "admin"))
        # check old password
        if user is None or not user.check_password(request.form.get("old_password")):
            return jsonify(submission_errors={
                "old_password": ["Incorrect password, imposter spotted"]
            })
        # check new passwords are identical
        if request.form.get("new_password_1") != request.form.get("new_password_2"):
            return jsonify(submission_errors={
                "new_password_1": ["Passwords do not match."],
                "new_password_2": ["Passwords do not match."]
            })
        
        user.set_password(request.form.get("new_password_1"))
        db.session.commit()
        return jsonify(
            redir_url=url_for("main.index", _external=True),
            flash_msg="Your password has been changed! Here's some randomart: ඞ" # this works!?
        )

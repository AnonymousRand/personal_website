from flask_wtf import FlaskForm
from wtforms import PasswordField, RadioField, SubmitField
from wtforms_sqlalchemy.fields import QuerySelectField
from wtforms.validators import InputRequired, Length

from app import db
from app.models import *
from config import Config


class LoginForm(FlaskForm):
    password = PasswordField(
        "pawssword :3",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    login_form_submit = SubmitField("submit")


class ChooseActionForm(FlaskForm):
    action = RadioField(
        "actions", choices=[
            ("create", "create post"),
            ("edit", "edit/delete post"),
            ("change_admin_password", "change admin pawssword")
        ],
        validators=[InputRequired()]
    )
    choose_action_form_submit = SubmitField("submit")


class SearchBlogpostForm(FlaskForm):
    post = QuerySelectField(
        "post", validators=[InputRequired()],
        query_factory=lambda: db.session.query(Post).order_by(Post.title), get_label="title"
    )
    search_blogpost_form_submit = SubmitField("submit")


class ChangeAdminPasswordForm(FlaskForm):
    old_password = PasswordField(
        "old pawssword",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    new_password_1 = PasswordField(
        "new pawssword",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    new_password_2 = PasswordField(
        "repeat new pawssword",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    change_admin_password_submit = SubmitField("submit")

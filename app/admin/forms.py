from flask_wtf import FlaskForm
from wtforms import PasswordField, RadioField, SubmitField
from wtforms_sqlalchemy.fields import QuerySelectField
from wtforms.validators import InputRequired, Length

from app import db
from app.models import *
from config import Config


class LoginForm(FlaskForm):
    password = PasswordField(
        "Password", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    login_form_submit = SubmitField("Submit")


class ChooseActionForm(FlaskForm):
    action = RadioField(
        "Actions", choices=[
            ("create", "Create post"),
            ("edit", "Edit/delete post"),
            ("change_admin_password", "Change admin password")
        ],
        validators=[InputRequired()]
    )
    choose_action_form_submit = SubmitField("Submit")


class SearchBlogpostForm(FlaskForm):
    post = QuerySelectField(
        "Post", validators=[InputRequired()],
        query_factory=lambda: db.session.query(Post).order_by(Post.title), get_label="title"
    )
    search_blogpost_form_submit = SubmitField("Submit")


class ChangeAdminPasswordForm(FlaskForm):
    old_password = PasswordField(
        "Old password", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    new_password_1 = PasswordField(
        "New password", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    new_password_2 = PasswordField(
        "Repeat new password", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )
    change_admin_password_submit = SubmitField("Submit")

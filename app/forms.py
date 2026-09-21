from flask_wtf import FlaskForm
from wtforms import HiddenField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length

from config import Config


class LoginForm(FlaskForm):
    is_modal = HiddenField(default="no")

    password = PasswordField(
        "pawssword :3",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["USER_PASSWORD_MAX_LEN"])]
    )

    login_form_submit = SubmitField("submit")

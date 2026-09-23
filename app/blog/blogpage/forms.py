import os

from flask_wtf import FlaskForm
from wtforms import (
    BooleanField, HiddenField, MultipleFileField, SelectField,
    SelectMultipleField, StringField, SubmitField, TextAreaField
)
from wtforms.validators import InputRequired, Length

import app.blog.blogpage.utils as bp_utils
from app import db
from app.models import *
from config import Config


class BlogpostBaseForm(FlaskForm):
    blogpage_id = SelectField("blog", coerce=int, validators=[InputRequired()])
    title = StringField(
        "title", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["POST_TITLE_MAX_LEN"])]
    )
    subtitle = StringField(
        "subtitle", validators=[Length(max=Config.DB_CONFIGS["POST_SUBTITLE_MAX_LEN"])]
    )
    content = TextAreaField(
        "content (markdown, latex supported)",
        validators=[Length(max=Config.DB_CONFIGS["POST_CONTENT_MAX_LEN"])]
    )
    files = MultipleFileField(f"upload files (supported: {', '.join(Config.FILE_UPLOAD_EXTS)})")
    cancel_file_uploads = SubmitField("clear files to upload", render_kw={"type": "button"})

    # custom constructor which automatically dynamically generates necessary form data at runtime
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # dynamically generate `blogpage_id`'s choices
        blogpages = db.session.query(Blogpage).order_by(Blogpage.ordering).all()
        self.blogpage_id.choices = [
            (blogpage.id, blogpage.name) for blogpage in blogpages if blogpage.is_writeable
        ]


class CreateBlogpostForm(BlogpostBaseForm):
    create_blogpost_form_submit = SubmitField("submit")


class EditBlogpostForm(BlogpostBaseForm):
    delete_files = SelectMultipleField("delete files")
    delete_unused_files = BooleanField("delete unused files")
    update_updated_timestamp = BooleanField("update updated timestamp")
    save_blogpost = SubmitField("save")
    edit_blogpost_form_submit = SubmitField("submit")

    def __init__(self, *args, post, **kwargs):
        super().__init__(*args, **kwargs)
        # dynamically generate `delete_files`'s choices
        files_base_path = bp_utils.get_files_base_path(post)
        files_choices = []
        if os.path.exists(files_base_path) and os.path.isdir(files_base_path):
            for f in os.listdir(files_base_path):
                if os.path.isfile(os.path.join(files_base_path, f)) and not f.startswith("."):
                    files_choices.append((f, f))
            files_choices.sort(key=lambda t: t[0])
        self.delete_files.choices = files_choices


class AddCommentForm(FlaskForm):
    parent = HiddenField(default=None)
    author = StringField(
        "display name",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["COMMENT_AUTHOR_MAX_LEN"])]
    )
    content = TextAreaField(
        "comment",
        validators=[InputRequired(), Length(max=Config.DB_CONFIGS["COMMENT_CONTENT_MAX_LEN"])]
    )
    add_comment_form_submit = SubmitField("submit")


class EditCommentForm(AddCommentForm):
    cancel_edit_comment = SubmitField("cancel", render_kw={"type": "button"})

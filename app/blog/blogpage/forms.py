from flask_wtf import FlaskForm
from wtforms import (
    BooleanField, HiddenField, MultipleFileField, SelectField,
    SelectMultipleField, StringField, SubmitField, TextAreaField
)
from wtforms.validators import InputRequired, Length

from config import Config


class BlogpostBaseForm(FlaskForm):
    blogpage_id = SelectField("Blog", coerce=int, validators=[InputRequired()])
    title = StringField("Title", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["POST_TITLE_MAXLEN"])])
    subtitle = StringField("Subtitle", validators=[Length(max=Config.DB_CONFIGS["POST_SUBTITLE_MAXLEN"])])
    content = TextAreaField(
        "Content (Markdown, LaTeX supported)", validators=[Length(max=Config.DB_CONFIGS["POST_CONTENT_MAXLEN"])]
    )
    files = MultipleFileField(f"Upload files (supported formats: {', '.join(Config.FILE_UPLOAD_EXTS)})")
    cancel_file_uploads = SubmitField("Clear files to upload", render_kw={"type": "button"})


class CreateBlogpostForm(BlogpostBaseForm):
    create_blogpost_form_submit = SubmitField("Submit")


class EditBlogpostForm(BlogpostBaseForm):
    delete_files = SelectMultipleField("Delete files")
    cancel_delete_files = SubmitField("Clear files to delete", render_kw={"type": "button"})
    delete_unused_files = BooleanField("Delete unused files")
    update_updated_timestamp = BooleanField("Update updated timestamp")
    remove_updated_timestamp = BooleanField("Remove updated timestamp")
    edit_blogpost_form_submit = SubmitField("Submit")


class AddCommentForm(FlaskForm):
    parent = HiddenField(default=None)
    author = StringField("Name",validators=[InputRequired(), Length(max=Config.DB_CONFIGS["COMMENT_AUTHOR_MAXLEN"])])
    content = TextAreaField(
        "Comment", validators=[InputRequired(), Length(max=Config.DB_CONFIGS["COMMENT_CONTENT_MAXLEN"])]
    )
    add_comment_form_submit = SubmitField("Submit")


class ReplyCommentBtn(FlaskForm):
    reply_comment = SubmitField("Reply")


class EditCommentBtn(FlaskForm):
    edit_comment = SubmitField("Edit")


class DeleteCommentBtn(FlaskForm):
    delete_comment = SubmitField("Delete")

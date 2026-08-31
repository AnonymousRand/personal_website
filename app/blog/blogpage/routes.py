import bleach
import glob
import image_titles
import markdown
import os
import shutil

import markdown_environments
import sqlalchemy as sa
import sqlalchemy.orm as so
import sqlalchemy.sql.functions as sa_func
from flask import current_app, jsonify, render_template, redirect, request, send_from_directory, url_for
from flask_login import current_user
from markdown.extensions import attr_list, fenced_code, footnotes, md_in_html, tables, toc

import app.blog.blogpage.utils as bp_utils
import app.blog.utils as blog_utils
import app.utils as utils
from app import db
from app.blog.blogpage import bp
from app.blog.blogpage.forms import *
from app.models import *
from app.utils import ContentType


@bp.context_processor
def inject_blogpage_from_db():
    blogpage = db.session.query(Blogpage).filter_by(id=bp_utils.get_blogpage_id()).first()
    return dict(blogpage=blogpage, blogpage_id=blogpage.id)


####################################################################################################
# Posts
####################################################################################################


@bp.get("/")
@utils.set_content_type(ContentType.HTML)
@bp_utils.require_login_if_restricted_bp()
def get_posts(*args, **kwargs):
    page_num = request.args.get("page", 1, type=int) # should automatically redirect non-int to page 1
    blogpage_id = bp_utils.get_blogpage_id()
    blogpage = db.session.get(Blogpage, blogpage_id)
    if blogpage is None:
        return "ok im actually impressed how did you do that"

    posts = None
    if blogpage.is_all_posts:
        posts = db.paginate(
            db.session.query(Post).join(Post.blogpage).filter_by(is_login_required=False, is_published=True)
                    .order_by(sa_func.coalesce(Post.updated_timestamp, Post.timestamp).desc()),
            page=page_num, per_page=current_app.config["POSTS_PER_PAGE"], error_out=False
        )
    else:
        posts = db.paginate(
            db.session.query(Post).filter_by(blogpage_id=blogpage_id) \
                    .order_by(sa_func.coalesce(Post.updated_timestamp, Post.timestamp).desc()),
            page=page_num, per_page=current_app.config["POSTS_PER_PAGE"], error_out=False
        )
    if posts is None:
        return "ok im actually impressed how did you do that"

    next_page_url = url_for(f"blog.{blogpage_id}.get_posts", page=posts.next_num, _external=True) if posts.has_next \
            else None
    prev_page_url = url_for(f"blog.{blogpage_id}.get_posts", page=posts.prev_num, _external=True) if posts.has_prev \
            else None

    return render_template(
        "blog/blogpage/index.html", posts=posts, total_pages=posts.pages, page_num=page_num,
        prev_page_url=prev_page_url, next_page_url=next_page_url
    )


# private posts, unlike blogpages, are still accessible by link (like YouTube's "unlisted")
# hence the lack of `@require_login_if_restricted_bp()`
# however, if they are being accessed by a public user, we require they provide the full sanitized title in the link
# to prevent brute-force enumeration of post IDs and make being unlisted at least somewhat meaningful
@bp.get("/<int:post_id>/", defaults={"post_sanitized_title": ""})
@bp.get("/<int:post_id>/<string:post_sanitized_title>")
@utils.set_content_type(ContentType.HTML)
@bp_utils.require_valid_post()
def get_post(post, post_id, post_sanitized_title, *args, **kwargs): # `post` param is from `@require_valid_post()`
    # only use `post_id` to determine what post to get (in case titles change), but if `post_sanitized_title`
    # given in request doesn't match that of the post with id `post_id`, redirect to the correct URL
    if post_sanitized_title != post.sanitized_title:
        # enforce providing full sanitized title for non-admin, unlisted accesses
        if post.blogpage.is_login_required and not current_user.is_authenticated:
            result = utils.custom_unauthorized(ContentType.HTML)
            if result:
                return result
        return redirect(url_for(
            f"{request.blueprint}.get_post", post_id=post_id,
            post_sanitized_title=post.sanitized_title, _external=True
        ))

    # render Markdown for post
    content_md = None
    if post.content:
        def generate_anchors(value, separator):
            value = (separator.join(value.split())).lower()
            value = value.replace(".", "-")
            value = re.sub(f"[^A-Za-z0-9{separator}]", "", value)
            return value

        content_md = markdown.Markdown(extensions=[
            # officially supported/included extensions
            attr_list.AttrListExtension(),
            fenced_code.FencedCodeExtension(),
            footnotes.FootnoteExtension(SUPERSCRIPT_TEXT="[{}]"),
            md_in_html.MarkdownInHtmlExtension(),
            tables.TableExtension(),
            toc.TocExtension(
                marker="", permalink="\uf470", permalink_class="heading-link link-target-self",
                permalink_title="", slugify=generate_anchors, toc_depth=2
            ),
            # other extensions
            image_titles.ImageTitleExtension(), # images use `alt` text as `title` too
            markdown_environments.CaptionedFigureExtension(
                html_class="md-captioned-figure", caption_html_class="md-captioned-figure__caption"
            ),
            markdown_environments.CitedBlockquoteExtension(
                html_class="md-cited-blockquote", citation_html_class="md-cited-blockquote__citation"
            ),
            markdown_environments.DivExtension(
                types={
                    "textbox": {"html_class": "md-textbox last-child-no-mb border--2px border--lightgray"}
                }
            ),
            markdown_environments.DropdownExtension(
                types = {
                    "dropdown": {"html_class": "border--2px border--lightgray dimgray"}
                },
                html_class="md-dropdown",
                summary_html_class="md-dropdown__summary last-child-no-mb",
                content_html_class="md-dropdown__content last-child-no-mb"
            ),
            markdown_environments.ThmsExtension(
                div_config={
                    "types": {
                        "coro": {
                            "thm_type": "Corollary",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        "coro_thm": {
                            "thm_type": "Corollary",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--custom-orange"
                        },
                        "coro_impt": {
                            "thm_type": "Corollary",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--6px border--colorful"
                        },
                        "defn": {
                            "thm_type": "Definition",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--custom-green"
                        },
                        r"defn\\\*": {
                            "thm_type": "Definition",
                            "html_class": "md-textbox last-child-no-mb border--4px border--custom-green"
                        },
                        "ex": {
                            "thm_type": "Example",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "dimgray"
                        },
                        r"ex\\\*": {
                            "thm_type": "Example"
                        },
                        "lem": {
                            "thm_type": "Lemma",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        "notat": {
                            "thm_type": "Notation",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        r"notat\\\*": {
                            "thm_type": "Notation",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        "prop": {
                            "thm_type": "Proposition",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        r"prop\\\*": {
                            "thm_type": "Proposition",
                            "html_class": "md-textbox last-child-no-mb border--4px border--lightgray"
                        },
                        "thm": {
                            "thm_type": "Theorem",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--4px border--custom-orange"
                        },
                        r"thm\\\*": {
                            "thm_type": "Theorem",
                            "html_class": "md-textbox last-child-no-mb border--4px border--custom-orange"
                        },
                        "thm_impt": {
                            "thm_type": "Theorem",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-textbox last-child-no-mb border--6px border--colorful"
                        }
                    }
                },
                dropdown_config={
                    "types": {
                        "bonus_content": {
                            "thm_type": "Bonus Content",
                            "html_class": "border--2px border--lightgray dimgray"
                        },
                        "exer": {
                            "thm_type": "Exercise",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "md-exer border--2px border--lightgray dimgray"
                        },
                        r"exer\\\*": {
                            "thm_type": "Exercise",
                            "html_class": "md-exer border--2px border--lightgray dimgray"
                        },
                        "pf": {
                            "thm_type": "Proof",
                            "thm_name_overrides_thm_heading": True,
                            "html_class": "md-pf dropdown--default-open border--2px border--lightgray dimgray"
                        },
                        "rmk": {
                            "thm_type": "Remark",
                            "thm_counter_incr": "0,0,1",
                            "html_class": "border--2px border--lightgray dimgray"
                        },
                        r"rmk\\\*": {
                            "thm_type": "Remark",
                            "html_class": "border--2px border--lightgray dimgray"
                        }
                    },
                    "html_class": "md-dropdown",
                    "summary_html_class": "md-dropdown__summary last-child-no-mb",
                    "content_html_class": "md-dropdown__content last-child-no-mb"
                },
                thm_heading_config={
                    "html_id_prefix": "thms-",
                    "html_class": "md-thm-heading",
                    "emph_html_class": "md-thm-heading__emph"
                }
            )
        ])
        post.content = content_md.convert(post.content)

    add_comment_form = AddCommentForm()
    posts_in_curr_bp = db.session.query(Post).filter_by(blogpage_id=post.blogpage_id)
    curr_coalesced_timestamp = post.updated_timestamp if post.updated_timestamp is not None else post.timestamp
    prev_post = posts_in_curr_bp.filter(
        sa_func.coalesce(Post.updated_timestamp, Post.timestamp) < curr_coalesced_timestamp
    ).order_by(sa_func.coalesce(Post.updated_timestamp, Post.timestamp).desc()).first()
    next_post = posts_in_curr_bp.filter(
        sa_func.coalesce(Post.updated_timestamp, Post.timestamp) > curr_coalesced_timestamp
    ).order_by(sa_func.coalesce(Post.updated_timestamp, Post.timestamp)).first()
    return render_template(
        "blog/blogpage/post.html", post=post, prev_post=prev_post, next_post=next_post,
        toc_tokens=content_md.toc_tokens if content_md is not None else None, add_comment_form=add_comment_form
    )


@bp.get("/create")
@utils.set_content_type(ContentType.HTML)
@utils.require_login()
def create_post_form(*args, **kwargs):
    form = CreateBlogpostForm()

    # automatically populate blogpage form field to current blogpage if possible
    blogpage_id = bp_utils.get_blogpage_id()
    if blogpage_id is None:
        return "ok im actually impressed how did you do that"
    blogpage = db.session.get(Blogpage, blogpage_id)
    # also create initially in corresponding backrooms blogpage by default
    if blogpage.backrooms_blogpage_id:
        blogpage_id = blogpage.backrooms_blogpage_id
        blogpage = db.session.get(Blogpage, blogpage_id)
        if blogpage is None:
            return "your database is bwoken >~<"
    if blogpage.is_writeable:
        form.blogpage_id.data = blogpage_id

    return render_template(
        "blog/blogpage/form_base.html", title="Create post", prompt="Create post", form=form,
        action=url_for(f"blog.{blogpage_id}.create_post", _external=True), method="POST"
    )


@bp.post("/")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
def create_post(*args, **kwargs):
    form = CreateBlogpostForm(request.form)
    if not form.validate():
        return jsonify(submission_errors=form.errors)

    # create post in db
    post = Post(
        blogpage_id=request.form.get("blogpage_id"), title=request.form.get("title"),
        subtitle=request.form.get("subtitle"), content=request.form.get("content")
    )
    post.sanitize_title()
    err = post.validate_titles_and_flush(should_add_to_db=True)
    if err:
        return jsonify(flash_msg=err)
    post.add_timestamps(should_update_updated_timestamp=False)

    # upload files if any
    files_base_path = bp_utils.get_files_base_path(post)
    err = bp_utils.upload_files(request.files.getlist("files"), files_base_path)
    if err:
        return jsonify(flash_msg=err)

    db.session.commit() # only commit at very end in case error happened above
    return jsonify(
        redir_url=url_for(
            f"blog.{post.blogpage_id}.get_post", post_id=post.id,
            post_sanitized_title=post.sanitized_title, _external=True
        ),
        flash_msg="post created :3"
    )                   # view completed post


@bp.get("/<int:post_id>/edit")
@utils.set_content_type(ContentType.HTML)
@utils.require_login()
@bp_utils.require_valid_post()
def edit_post_form(post, post_id, *args, **kwargs):
    # pre-populate form fields with existing post content
    form = EditBlogpostForm(post=post, obj=post)
    blogpage_id = bp_utils.get_blogpage_id()
    return render_template(
        "blog/blogpage/form_base.html", title=f"Edit Post: {post.title}", prompt="Edit post", form=form,
        action=url_for(f"blog.{blogpage_id}.edit_post", post_id=post_id, _external=True),
        method="PUT"
    )


@bp.put("/<int:post_id>")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
def edit_post(post, post_id, *args, **kwargs):
    form = EditBlogpostForm(request.form, post=post)
    if not form.validate():
        return jsonify(submission_errors=form.errors)

    # edit post in db
    old_blogpage_id = post.blogpage_id
    files_base_path = bp_utils.get_files_base_path(post) # need to be before `blogpage_id` changes
    post.blogpage_id = request.form.get("blogpage_id")
    post.title = request.form.get("title")
    post.subtitle = request.form.get("subtitle")
    post.content = request.form.get("content")
    
    post.sanitize_title()
    err = post.validate_titles_and_flush(should_add_to_db=False)
    if err:
        return jsonify(flash_msg=err)
    post.add_timestamps(
        should_update_updated_timestamp=request.form.get("update_updated_timestamp"),
        old_blogpage_id=old_blogpage_id
    )

    # delete files if any
    deleted_files_list = []
    try:
        for file_name in request.form.getlist("delete_files"):
            file_path = os.path.join(files_base_path, file_name)
            if os.path.exists(file_path):
                os.remove(file_path)
                deleted_files_list.append(file_name)
        bp_utils.delete_dir_if_empty(files_base_path)
    except Exception as e:
        return jsonify(flash_msg=f"File delete exception: {e}")

    # delete unused files if applicable
    if request.form.get("delete_unused_files") and os.path.exists(files_base_path):
        try:
            file_names = os.listdir(files_base_path)
            for file_name in file_names:
                file_basename, file_ext = os.path.splitext(file_name)
                should_delete = False
                # `if` condition also checks for Markdown syntax around file name to ensure
                # that we are not catching a proper substring of a longer file name
                if file_ext in current_app.config["FILE_UPLOAD_EXTS_IN_TEXT"]:
                    # if `file_name` is a type that should appear in the post text (e.g. images),
                    # remove it if it doesn't
                    if f"](files/{file_name})" not in post.content:
                        should_delete = True
                else:
                    # else if `file` is a type that doesn't appear in the post text (e.g. .xcf),
                    # remove it if its extension-less file name doesn't appear in the post text 
                    # (requires such files to exactly match their respective image's file name)
                    # also requires no periods in file basename!
                    if f"](files/{file_basename}." not in post.content:
                        should_delete = True
                if should_delete:
                    os.remove(os.path.join(files_base_path, file_name))
                    deleted_files_list.append(file_name)
            bp_utils.delete_dir_if_empty(files_base_path)
        except Exception as e:
            return jsonify(flash_msg=f"File delete unused exception: {e}")
    
    # upload files if any (after deletes)
    err = bp_utils.upload_files(request.files.getlist("files"), files_base_path)
    if err:
        return jsonify(flash_msg=err)
    
    # move files if moving blogpost (after finishing all uploads/deletes)
    if post.blogpage_id != old_blogpage_id:
        if os.path.exists(files_base_path):
            try:
                new_files_base_path = bp_utils.get_files_base_path(post)
                shutil.move(files_base_path, new_files_base_path)
            except Exception as e:
                return jsonify(flash_msg=f"File move exception: {e}")

    # commit changes to db
    db.session.commit()
    flash_msg = "post updated :3"
    if deleted_files_list:
        flash_msg += f" (deleted {len(deleted_files_list)} file(s):"
        for file_name in deleted_files_list:
            flash_msg += f" {file_name},"
        flash_msg = flash_msg[:-1] + ")"
    if "save_blogpost" in request.form:
        return jsonify(flash_msg=flash_msg)
    else:
        return jsonify(
            redir_url=url_for(
                f"blog.{post.blogpage_id}.get_post", post_id=post_id,
                post_sanitized_title=post.sanitized_title, _external=True
            ),
            flash_msg=flash_msg
        ) # view updated post if using "submit" and not "save" button


@bp.delete("/<int:post_id>")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
def delete_post(post, post_id, *args, **kwargs):
    # delete post from db
    db.session.delete(post)

    # delete files directory
    files_base_path = bp_utils.get_files_base_path(post)
    try:
        if os.path.exists(files_base_path) and os.path.isdir(files_base_path):
            shutil.rmtree(files_base_path)
    except Exception as e:
        return jsonify(flash_msg=f"Directory delete exception: {e}")

    db.session.commit()
    return jsonify(
        redir_url=url_for(f"blog.{post.blogpage_id}.get_posts", _external=True),
        flash_msg="post deleted :3"
    )


####################################################################################################
# Comments
####################################################################################################


@bp.get("/<int:post_id>/comments")
@utils.set_content_type(ContentType.JSON)
@bp_utils.require_valid_post()
@bp_utils.redir_to_post_after_login()
def get_comments(post, post_id, *args, **kwargs):
    def sanitize_comment_html(s: str) -> str:
        """
        Sanitize Markdown for comments (XSS etc.).
        """

        # Bleach is considered deprecated because html5lib is, but both seem to still be mostly active
        # and there doesn't seem to be great alternatives at the moment
        s = bleach.clean(
            s,
            tags=[
                "abbr", "acronym", "b", "blockquote", "br", "center", "code", "details", "div", "em", "h1", "h2", "h3",
                "i", "li", "p", "pre", "ol", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td",
                "th", "thead", "tr", "ul"
            ],
            attributes=[
                "class", "colspan", "data-align-bottom", "data-align-center", "data-align-right", "data-align-top",
                "data-col-width", "height", "rowspan", "title", "width"
            ]
        )
        return s

    # get comments from db and render Markdown
    comments_query = post.comments.select().order_by(Comment.timestamp.desc())
    comments = db.session.scalars(comments_query).all()

    for comment in comments:
        if comment.author == current_app.config["VERIFIED_AUTHOR"]:
            comment.content = markdown.markdown(comment.content, extensions=["extra", "image_titles"])
        else:
            comment.content = markdown.markdown(comment.content, extensions=["extra"])
            comment.content = sanitize_comment_html(comment.content)
 
    add_comment_form = AddCommentForm()
    return jsonify(html=render_template(
        "blog/blogpage/post_comments.html", post=post, comments=comments, add_comment_form=add_comment_form
    ))


@bp.post("/<int:post_id>/comments")
@utils.set_content_type(ContentType.JSON)
@bp_utils.require_login_if_restricted_bp()
@bp_utils.require_valid_post()
@bp_utils.redir_to_post_after_login()
def add_comment(post, post_id, *args, **kwargs):
    form = AddCommentForm(request.form)
    if not form.validate():
        return jsonify(submission_errors=form.errors)

    # make sure non-admin users can't masquerade as verified author
    author = request.form.get("author")
    is_verified_author = author.strip() == current_app.config["VERIFIED_AUTHOR"]
    if is_verified_author and not current_user.is_authenticated:
        return jsonify(submission_errors={"author": ["$8 isn't going to buy you a verified checkmark here."]})

    # add comment to db
    # make sure my own comments aren't unread when I add them, cause duh
    comment = Comment(author=author, content=request.form.get("content"), post=post, is_unread=not is_verified_author)
    with db.session.no_autoflush: # otherwise there's a warning
        if not comment.insert_comment(post, db.session.get(Comment, request.form.get("parent"))):
            return jsonify(flash_msg="please no hack :3")
    db.session.add(comment)
    db.session.commit()
    return jsonify(success=True, flash_msg="comment added :3")


@bp.get("/<int:post_id>/comments/<int:comment_id>/edit")
@utils.set_content_type(ContentType.JSON)
@utils.require_login() # only admins can edit comments, since there's no other user account system
@bp_utils.require_valid_post()
@bp_utils.require_valid_comment()
@bp_utils.redir_to_post_after_login()
def edit_comment_form(post, post_id, comment, comment_id, *args, **kwargs):
    # pre-populate form fields with existing comment content; leave out `parent` since that should not be changeable
    form = EditCommentForm(obj=comment)
    return jsonify(html=render_template("blog/blogpage/post_comment_edit_form.html", form=form, comment=comment))


@bp.put("/<int:post_id>/comments/<int:comment_id>")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
@bp_utils.require_valid_comment()
@bp_utils.redir_to_post_after_login()
def edit_comment(post, post_id, comment, comment_id, *args, **kwargs):
    form = EditCommentForm(request.form)
    if not form.validate():
        return jsonify(submission_errors=form.errors)

    # edit comment in db
    comment.author = request.form.get("author")
    comment.content = request.form.get("content")
    db.session.commit()
    return jsonify(success=True, flash_msg="comment updated :3")


@bp.delete("/<int:post_id>/comments/<int:comment_id>")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
@bp_utils.require_valid_comment()
@bp_utils.redir_to_post_after_login()
def delete_comment(post, post_id, comment, comment_id, *args, **kwargs):
    # delete comment and its descendants from db
    descendants = comment.get_descendants(post)
    if not comment.remove_comment(post):
        return jsonify(flash_msg="please no hack :3")
    for descendant in descendants:
        db.session.delete(descendant)
    db.session.delete(comment)
    db.session.commit()
    return jsonify(success=True, flash_msg="literally 1984 :3")


@bp.post("/<int:post_id>/comments/mark-as-read")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
@bp_utils.redir_to_post_after_login()
def mark_comments_as_read(post, post_id, *args, **kwargs):
    # mark comments under current post as read in db
    unread_comments_query = post.comments.select().filter_by(is_unread=True)
    unread_comments = db.session.scalars(unread_comments_query).all()
    for comment in unread_comments:
        comment.is_unread=False
    db.session.commit()
    return jsonify(success=True)


@bp.get("/<int:post_id>/comments/get-count")
@utils.set_content_type(ContentType.JSON)
@bp_utils.require_valid_post()
@bp_utils.redir_to_post_after_login()
def get_comment_count(post, post_id, *args, **kwargs):
    return jsonify(count=post.get_comment_count())


@bp.get("/<int:post_id>/comments/get-unread-count")
@utils.set_content_type(ContentType.JSON)
@utils.require_login()
@bp_utils.require_valid_post()
@bp_utils.redir_to_post_after_login()
def get_unread_comment_count(post, post_id, *args, **kwargs):
    return jsonify(count=post.get_unread_comment_count())


####################################################################################################
# Files
####################################################################################################


# alternate, less cumbersome endpoint than the default static endpoint for post files
@bp.get("/<int:post_id>/files/<string:file_name>")
@utils.set_content_type(ContentType.HTML)
@bp_utils.require_valid_post()
def get_file(post, post_id, file_name, *args, **kwargs):
    return send_from_directory(
        f"{current_app.config['ROOT_TO_BLOGPAGE_STATIC']}/{post.blogpage_id}/files/{post_id}", file_name
    )

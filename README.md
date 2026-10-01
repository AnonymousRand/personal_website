# janky flask personal website™

## setup if i brick another machine

1. set up docker, MySQL, and nginx on host machine
    - MySQL data directory should be in the bind-mounted directory specified in [deployment/docker/compose.yaml](deployment/docker/compose.yaml)
    - recover database data from backups
    - make sure default key for ssh and for github pushing has no passcode if planning to use automatic db/image backup scripts. (no hack pwease 0~0)
2. `git clone`
    - make sure all files and folders in the entire project are owned by the user that docker runs its containers as (see [deployment/systemd_reference/personal_website.service](deployment/systemd_reference/personal_website.service))
3. install packages:
    - install python modules from [requirements.txt](requirements.txt) by running `pip install -r requirements.txt` (ideally within a virtualenv)
    - install js modules from [app/static/package.json](app/static/package.json) by running `npm install` in the [app/static/](app/static/) directory
4. add back gitignored files:
    - `.env`: randomly generated `SECRET_KEY` and SQLAlchemy `DATABASE_URL` for connecting to MySQL from host
        - `DATABASE_URL` should be something like `mysql+pymysql://[db username]:[db password]@[hostname]:[port]/[database name]?charset=utf8mb4`
    - `deployment/docker/flask/envs/.env`: same as `.env` but with `DATABASE_URL` modified to connect to the MySQL docker container (i.e. the `hostname` part of the url is the name of the MySQL container *service* in [deployment/docker/compose.yaml](deployment/docker/compose.yaml), in this case `mysql`)
    - `deployment/docker/mysql/envs/.mysqlenv`: nothing yet (no environment variables if bind-mounting existing MySQL data directory)
    - `deployment/backup_scripts/db_backup_config.sh`: set the variables referenced in [deployment/backup_scripts/db_backup.sh](deployment/backup_scripts/db_backup.sh)
    - `app/static/css/custom_bootstrap.css` and `app/static/css/custom_bootstrap.css.map`: run `npm compile_bootstrap` from within the [app/static/](app/static/) folder
5. navigate to [deployment/docker/](deployment/docker/) and run `deploy.sh` (or use a `systemd` service, for example [deployment/systemd_reference/personal_website.service](deployment/systemd_reference/personal_website.service))

## blog writer (aka me) notes

### markdown syntax and custom syntax

- make sure to check out the documentation for python-markdown's [official extensions](https://python-markdown.github.io/extensions/)
    - check source code for extensions available (particularly [app/blog/blogpage/markdown_config.py](app/blog/blogpage/markdown_config.py)
- raw html (including with attributes!) will be rendered, which is useful for additional styling or in environments where markdown equivalents may not always work (footnotes, tables, blockquotes etc.). examples:
    - `<span></span>` with pretty much any custom css styling you want (or with existing styling classes, once CSP is able to block inline `style` attributes)
    - `<pre><code></code></pre>` with `<br>` newlines for multiline code blocks in a table, as raw newlines would interfere with the table syntax
    - `<small></small>` for small text
    - `<p></p>` for paragraphs and line breaks (note: not supported in footnotes; use `<br><br>` instead)
        - e.g. lists, which have had the space between it and the previous paragraph removed by default
    - `<br>` for line breaks that aren't new paragraphs and don't leave extra space, like between lines in a stanza, and `<br>` surrounded by two empty lines for more space than a normal paragraph, like between stanzas
- tables:
    - uses [markdown tables](https://www.tablesgenerator.com/markdown_tables) with "Compact mode" and "Line breaks as \<br\>" checked
    - for merged cells, use the [attribute lists](https://python-markdown.github.io/extensions/attr_list/) extension to set `colspan`. to keep valid table syntax, put `<span></span> {: hidden }` in cells that have been merged into other ones.
    - to specify column `width` attributes (in html, not css) for example with attribute lists, either specify in pixels or percentages. pixels are absolute while percentages are relative to the width of the table. if percentages are used, or if no width specified at all, table will have `min-width: 100%` of parent div.

### other notes

- use `debugTestSelfLinks()` in the browser console to test for dead self-links on the current page

## dev notes to compensate for possibly scuffed code :3

### IMPORTANT

keep up-to-date:
- [.gitignore](.gitignore)
- [config.py](config.py)
- server-side access control
- readme
- backup scripts in [deployment/backup_scripts/](deployment/backup_scripts/)
- cloudflare WAF rules etc.

### deployment maintenance

- sync/keep up-to-date according to comments and common sense:
    - [deployment/docker/compose.yaml](deployment/docker/compose.yaml)
    - dockerfiles
    - docker entrypoint scripts
    - docker environment variables
    - `deployment/backup_scripts/db_backup_config.sh` configs
    - backup scripts
    - `systemd` services
- to connect to the MySQL instance running in docker from the host:
    - make sure the MySQL port (default 3306) is exposed from docker and there is a `.env` file on the host with `DATABASE_URL` pointing to `localhost`
    - use `mysql --protocol=tcp` to connect so it doesn't try to use a unix socket; make sure to use the MySQL user that has `%` as its host (because that means it can connect from any host, whereas `localhost` would mean that it can only connect from within the docker container)
- to edit database schema:
    - edit [app/models.py](app/models.py) on the host
        - IMPORTANT: currently MySQL-specific!!!
    - run `flask db migrate` on the host in the python venv; this requires MySQL connectivity from the host
    - CHECK MIGRATION SCRIPT IN [migrations/versions/](migrations/versions/)!!!
        - if renaming columns, you will probably have to edit the alembic script in [migrations/versions/](migrations/versions/) to use `alter_column()`! `existing_type` is a required argument:
        
            ```
            batch_op.alter_column(column_name='[]', new_column_name='[]', existing_type=[])
            ```

            reference [migrations/versions/79665802aa08_rename_blogpage_title_and_subtitle_to_.py](migrations/versions/79665802aa08_rename_blogpage_title_and_subtitle_to_.py) for examples.

        - if changing `unique` constraint, you will need

            ```
            batch_op.create_unique_constraint("[constraint_name]", ['[column_name]'])
            ```

            and

            ```
            batch_op.drop_constraint("[constraint_name]", type_='unique')
            ```
    - tun `flask db upgrade` on the host in the python venv or restart the docker containers

### access control notes

- assume the user can reach all endpoints, so **access-control must be perfect server-side**
    - use the functions defined in [app/utils.py](app/utils.py) for access control
- it doesn't matter as much if client-side is lax on updating hidden html links etc. on session expiry. this is good because my client-side is an absolute dumpster fire :3

### adding new blogpages

- add to database (reference current database entries)
    - add a developer/backrooms blogpage too with its `blogpage_id` being the negative of the public one
    - `blogpage_id` is always an integer except for the commented cases in [config.py](config.py), where they must be strings to avoid confusion with negative values and list/dictionary accessing
- update [config.py](config.py):
    - update `BLOGPAGE_ID_URL_PREFIXES` with the same paths that you gave the new blogpage and its developer blogpage in the database; this is used for blueprint initialization (we can't access database before app context is fully created)
- create new static directories for it in [app/blog/static/blogpage/](app/blog/static/blogpage/) from the [template](app/blog/static/blogpage/blogpage_template/), and update other static directory names if necessary
    - remember that since html templates are the same for every blogpage, things like font or background image customizations must be done through static files like css, which are imported individually per blogpage
    - if overriding default background image, change `backgroundImgOverrideName` in a file `app/blog/static/blogpage/[blueprint]/js/override_background_img.js`

### changing blogpage IDs/blogpage static paths

- change the static directories, obviously
- update paths in [config.py](config.py)
- update static paths for all linked js/css in templates

### adding new forms

- GET forms:
    - these should NOT modify server-side state!
    - usage guidelines:
        - do NOT implement a csrf token hidden field to avoid leaking token in the url (per owasp guidelines). this means that we shouldn't use the `boostrap_wtf.quick_form()` macro for GET forms!
    - refer to [app/blog/static/blogpage/js/goto_page_form.js](app/blog/static/blogpage/js/goto_page_form.js) and its associated [app/blog/templates/blog/blogpage/inde.html](app/blog/templates/blog/blogpage/index.html) for an example of a GET form
- POST forms:
    - all other forms
    - usage guidelines:
        - must be ajax, using `fetchWrapper()` in [app/static/js/util_ajax.js](app/static/js/util_ajax.js) and sending `FormData` (since the csrf error handling is designed only for `FormData`). see `doAjaxResponseBase()` in the same file for documentation on the basic, always-supported json keys that the backend can return.
    - refer to [app/static/js/util_session.js](app/static/js/util_session.js), [app/static/js/main_form_submit.js](app/static/js/main_form_submit.js), and [app/blog/static/blogpage/js/post_comments.js](app/blog/static/blogpage/js/post_comments.js) for examples of POST forms
- always add html classes `auth-true`/`auth-false` (for showing/hiding elements) when needed

### other notes

- `url_for()` to a blueprint (trusted destination!) should always be used with `_external=True` in both html templates and flask to simplify the cross-origin nature of having a blog subdomain
- try not to modify any of the `forms.py`s, as some js might rely on hardcoded values of the form fields (i don't do frontend >~<)

## cookie explanation from empirical observations and devtools

comparing flask's built-in session cookie with `PERMANENT_SESSION_LIFETIME` config vs. flask-login's remember me cookie with `REMEMBER_COOKIE_DURATION` config:

- `session.permanent` does not actually affect if a cookie is invalidated by `PERMANENT_SESSION_LIFETIME`; cookies will *always* adhere to this lifetime (including the non-signed-in, default cookie for storing flask's `session`): `session.permanent=False` means the session cookie is invalidated by flask but not deleted when this lifetime is up, while `session.permanent=True` actually gives it an expiration time.
- `remember` from flask-login only affects how the cookies are handled when the browser is closed (although it seems many browsers nowadays will persist even session (non-remembered) cookies as well on close).

|  | session cookie stored in: | remember cookie stored in: | `PERMANENT_SESSION_LIFETIME` effect on session cookie | `REMEMBER_COOKIE_DURATION` effect on remember cookie | user experience when `PERMANENT_SESSION_LIFETIME` reached | user experience when `REMEMBER_COOKIE_DURATION` reached |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `session.permanent=False, remember=False` | memory (non-persistent) | - | [invalidated by flask](https://stackoverflow.com/a/55055558) ([docs](https://flask.palletsprojects.com/en/3.0.x/config/#PERMANENT_SESSION_LIFETIME)) | - | logged out | - |
| `session.permanent=False, remember=True` | memory (non-persistent) | disk (persistent) | invalidated by flask | expires & is deleted | logged out | logged out if browser closed |
| `session.permanent=True, remember=False` | disk (persistent) | - | expires & is deleted | - | logged out | - |
| `session.permanent=True, remember=True` | disk (persistent) | disk (persistent) | expires & is deleted | expires & is deleted | logged out | logged out if browser closed |

import re

import image_titles
import markdown_environments
from markdown.extensions import attr_list, fenced_code, footnotes, md_in_html, tables, toc


def _generate_toc_anchors(value, separator):
    value = (separator.join(value.split())).lower()
    value = value.replace(".", "-")
    value = re.sub(f"[^A-Za-z0-9{separator}]", "", value)
    return value


POST_EXTS = [
    # officially supported/included extensions
    attr_list.AttrListExtension(),
    fenced_code.FencedCodeExtension(),
    footnotes.FootnoteExtension(SUPERSCRIPT_TEXT="[{}]"),
    md_in_html.MarkdownInHtmlExtension(),
    tables.TableExtension(),
    toc.TocExtension(
        marker="", permalink="\uf470", permalink_class="heading-link link-target-self",
        permalink_title="", slugify=_generate_toc_anchors, toc_depth=2
    ),

    # other extensions
    image_titles.ImageTitleExtension(), # images use `alt` text as `title` too

    markdown_environments.DropdownExtension(
        types={
            "dropdown": {
                "html_class": "border--2px border--lightgray dimgray"
            }
        },
        html_class="md-dropdown",
        summary_html_class="md-dropdown__summary last-child-no-mb",
        content_html_class="md-dropdown__content last-child-no-mb"
    ),

    markdown_environments.NestedEnvExtension(
        types={
            "captioned_figure": {
                "html_tag": "figure",
                "html_class": "md-captioned-figure",
                "inner": "caption",
                "inner_html_tag": "figcaption",
                "inner_html_class": "md-captioned-figure__caption",
                "inner_pos": "end"
            },
            "cited_blockquote": {
                "html_tag": "blockquote",
                "html_class": "md-cited-blockquote",
                "inner": "citation",
                "inner_html_tag": "cite",
                "inner_html_class": "md-cited-blockquote__citation",
                "inner_pos": "end_outside"
            },
            "cmd_line": {
                "html_tag": "div",
                "html_class": (
                    "md-cmd-line code-box inline-code-block last-child-no-mb"
                ),
                "inner": "cmd",
                "inner_html_tag": "div",
                "inner_html_class": "md-cmd-line__cmd",
                "inner_pos": "start"
            }
        }
    ),

    markdown_environments.ThmsExtension(
        div_config={
            "types": {
                "coro": {
                    "thm_type": "Corollary",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },
                "coro_thm": {
                    "thm_type": "Corollary",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--custom-orange"
                    )
                },
                "coro_impt": {
                    "thm_type": "Corollary",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--6px border--colorful"
                    )
                },

                "defn": {
                    "thm_type": "Definition",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--custom-green"
                    )
                },
                r"defn\\\*": {
                    "thm_type": "Definition",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--custom-green"
                    )
                },

                "ex": {
                    "thm_type": "Example",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "dimgray"
                    )
                },
                r"ex\\\*": {
                    "thm_type": "Example"
                },

                "lem": {
                    "thm_type": "Lemma",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },

                "notat": {
                    "thm_type": "Notation",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },
                r"notat\\\*": {
                    "thm_type": "Notation",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },

                "prop": {
                    "thm_type": "Proposition",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },
                r"prop\\\*": {
                    "thm_type": "Proposition",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--lightgray"
                    )
                },

                "thm": {
                    "thm_type": "Theorem",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--custom-orange"
                    )
                },
                r"thm\\\*": {
                    "thm_type": "Theorem",
                    "html_class": (
                        "md-textbox last-child-no-mb border--4px border--custom-orange"
                    )
                },
                "thm_impt": {
                    "thm_type": "Theorem",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-textbox last-child-no-mb border--6px border--colorful"
                    )
                }
            }
        },

        dropdown_config={
            "types": {
                "bonus_content": {
                    "thm_type": "Bonus Content",
                    "html_class": (
                        "border--2px border--lightgray dimgray"
                    )
                },

                "exer": {
                    "thm_type": "Exercise",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "md-exer border--2px border--lightgray dimgray"
                    )
                },
                r"exer\\\*": {
                    "thm_type": "Exercise",
                    "html_class": (
                        "md-exer border--2px border--lightgray dimgray"
                    )
                },

                "pf": {
                    "thm_type": "Proof",
                    "thm_name_overrides_thm_heading": True,
                    "html_class": (
                        "md-pf dropdown--default-open border--2px border--lightgray dimgray"
                    )
                },

                "rmk": {
                    "thm_type": "Remark",
                    "thm_counter_incr": "0,0,1",
                    "html_class": (
                        "border--2px border--lightgray dimgray"
                    )
                },
                r"rmk\\\*": {
                    "thm_type": "Remark",
                    "html_class": (
                        "border--2px border--lightgray dimgray"
                    )
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
];


COMMENT_EXTS = [
    attr_list.AttrListExtension(),
    fenced_code.FencedCodeExtension(),
    md_in_html.MarkdownInHtmlExtension(),
    tables.TableExtension()
];


COMMENT_EXTS_VERIFIED = [
    attr_list.AttrListExtension(),
    fenced_code.FencedCodeExtension(),
    footnotes.FootnoteExtension(SUPERSCRIPT_TEXT="[{}]"),
    md_in_html.MarkdownInHtmlExtension(),
    tables.TableExtension(),

    image_titles.ImageTitleExtension()
];

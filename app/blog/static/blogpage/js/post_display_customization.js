function addCommentSyntaxGuideTooltip() {
    $("#leave-a-comment #content-field label").first()
            .append(" (mouse over to show formatting options)")
            .attr("data-bs-toggle", "tooltip")
            .attr("data-bs-custom-class", "comment-tooltip")
            .attr("data-bs-html", "true")
            .attr(
                "data-bs-title",
                "markdown:" +
                  "<ul>" +
                    "<li>python-markdown with <code>attr_list</code>, <code>fenced_code</code>, " +
                        "<code>md_in_html</code>, <code>tables</code> extensions</li>" +
                    "<li>plaintext links only, no images or footnotes</li>" +
                  "</ul>" +
                "latex (mathjax):" +
                  "<ul>" +
                    "<li>escape anything that is also narkdown: <code>\\(</code>, " +
                        "<code>\\)</code>, <code>\\{</code>, <code>\\\\</code>, <code>\*</code> " +
                        "etc.</li>" +
                    "<li>my custom macros are available if you can find them :3" +
                  "</ul>"
            );
    refreshTooltips("#leave-a-comment");
}

function tweakFootnotes() {
    // turn footnotes into `<details>`
    const jqFootnotes = $("#post__content").find(".footnote");
    if (jqFootnotes.length > 0) {
        // the singular bothers me
        jqFootnotes.addClass("footnotes");
        jqFootnotes.removeClass("footnote");
        jqFootnotes.wrap('<details id="footnotes__wrapper" class="footnotes__wrapper"></details>')
        jqFootnotes.before("<summary>footnotes</summary>");
    }

    // footnotes collapsible opens if footnote link clicked on and the collapsible is closed
    $(".footnote-ref").on("click", function() {
        $("#footnotes__wrapper").attr("open", "");
    });
}

addCommentSyntaxGuideTooltip();
tweakFootnotes();
// for making sure TOC is vertically centered
document.documentElement.style.setProperty(
    "--toc-heading-outer-height", `${$("#toc__heading").outerHeight()}px`
);

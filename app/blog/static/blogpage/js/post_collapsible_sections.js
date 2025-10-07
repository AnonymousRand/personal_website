$("#post__content h2").each(function() {
    $(this).nextUntil("#post__content h2, #footnotes__wrapper, #post__end").addBack().wrapAll('<details class="post__collapsible-section"></details>');
    $(this).wrap('<summary></summary>');
});

$(document).ready(function() {
    $(".post__collapsible-section").on("toggle", function(e) {
        if (e.target.open) {
            renderMathJaxNode(e.target);
            applyStylesNode(e.target);
        }
    });
});

let canExpandPostCollapsibleSections = true;

const postScrollObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting && canExpandPostCollapsibleSections) {
            entry.target.closest(".post__collapsible-section").setAttribute("open", "");
        }
    });
});

$("#post__content h2").each(function() {
    $(this).nextUntil("#post__content h2, #footnotes__wrapper, #post__end").addBack().wrapAll('<details class="post__collapsible-section"></details>');
    $(this).wrap('<summary></summary>');
});

$(".post__collapsible-section").on("toggle", function(e) {
    if (e.target.open) {
        renderMathJaxNode(e.target);
        applyStylesNode(e.target);
    }
});

// automatically expand collapsible sections when on screen
$(".post__collapsible-section").each(function() {
    postScrollObserver.observe($(this).get(0));
    $(this).find("p").each(function() {
        postScrollObserver.observe($(this).get(0));
    });
});

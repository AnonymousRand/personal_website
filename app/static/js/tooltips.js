function refreshTooltips(selector) {
    const nodeBase = document.querySelector(selector);
    if (!nodeBase) {
        return;
    }

    const tooltipTriggerList = nodeBase.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
    );
}

async function genFootnoteTooltips(selector) {
    const jqBase = $(selector);
    if (jqBase.length === 0) {
        return;
    }
    const REMOVE_BACKREF_RE = /<a class=["&quot;]+?footnote-backref[\S\s]*?<\/a>/;
    const MATCH_MATHJAX_RE = /<mjx-container[\S\s]*?<\/mjx-container>/g;

    // i think this returns nodes as we still have to wrap each entry back in `$()` for jquery
    const nodeFootnoteRefs = jqBase.find(".footnote-ref");
    // we use for loop instead of jquery `each()` so that the await halts `refreshTooltips()` too
    for (const nodeFootnoteRef of nodeFootnoteRefs) {
        const jqFootnoteRef = $(nodeFootnoteRef);
        jqFootnoteRef.attr("data-bs-toggle", "tooltip").attr("data-bs-html", "true");
        const nodeFootnote = document.getElementById(jqFootnoteRef.attr("href").replace("#", ""));
        let tooltipContents = nodeFootnote.innerHTML.replace(REMOVE_BACKREF_RE, "");

        // replace serialized mathml html with its corresponding original latex
        // to render with `MathJax.typeset()` on mouseover
        // the `await` is necessary as otherwise this code seems to run before mathjax starts up
        await MathJax.startup.promise;
        const mathItems = MathJax.startup.document.getMathItemsWithin(nodeFootnote);
        const matches = tooltipContents.match(MATCH_MATHJAX_RE);
        if (matches != null) {
            for (let i = 0; i < matches.length; i++) {
                let match = matches[i];
                tooltipContents = tooltipContents.replace(match, `\\(${mathItems[i].math}\\)`);
            }
        }

        jqFootnoteRef.attr("data-bs-title", tooltipContents);
    }

    refreshTooltips(selector);
}

$(document).ready(function() {
    // must wait until `$(document).ready()` to make sure mathjax has been loaded
    genFootnoteTooltips("body");
});

// rerender tooltips on show
$(document).on("inserted.bs.tooltip", function(e) {
    renderMathJax(".tooltip");
    applyStyles(".tooltip");
});

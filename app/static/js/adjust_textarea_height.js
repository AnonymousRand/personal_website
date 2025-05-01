function adjustTextareaHeight(nodeTextarea, initial) {
    const MAX_HEIGHT = $(window).height() * 0.6;

    // `scrollHeight` is real content height, `offsetHeight` is visual height that must be adjusted to `scrollheight`
    // don't change if increasing from above MAX_HEIGHT
    // hard to catch decreasing to above MAX_HEIGHT because scrollHeight is not updated until `height` is 0
    // but scroll snap on deleting text is minimal since MAX_HEIGHT makes textarea be mostly on screen
    if ((
            nodeTextarea.offsetHeight === nodeTextarea.scrollHeight
            || (nodeTextarea.scrollHeight > nodeTextarea.offsetHeight && nodeTextarea.offsetHeight >= MAX_HEIGHT)
        )
        && !initial
    ) {
        return;
    }

    nodeTextarea.style.height = "0";
    // clamp size between 7rem (roughly 4 rows) and 60vh
    let height_px = Math.max(
        7 * parseFloat(getComputedStyle(document.documentElement).fontSize),
        Math.min(MAX_HEIGHT, nodeTextarea.scrollHeight)
    );
    nodeTextarea.style.height = `${height_px + 1.5}px`; // + 1.5 to hide scrollbar
}

$(document).ready(function() {
    $("textarea").each(function() {
        adjustTextareaHeight($(this).get(0), true);
    });

    $("textarea").on("input", function(e) {
        adjustTextareaHeight(e.target, false);
    });
});

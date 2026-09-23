const HORIZ_SCROLL_DIV_HTML = '<div class="scroll-overflow-x"></div>';
const HORIZ_SCROLL_DIV_HTML_FULL_WIDTH = '<div class="scroll-overflow-x" width="full"></div>';

/**
 * Add code to an existing function/merges two functions.
 *
 * Preconditions:
 *     - The two functions must have the same params.
 *
 * Usage:
 *     ```
 *     func1 = addToFunc(func1, func2);
 *     ```
 */
function addToFunc(funcBase, funcToAdd) {
    return function() {
        funcBase.apply(this, arguments);
        funcToAdd.apply(this, arguments);
    };
}

function confirmWrapper(inner) {
    return function() {
        if (!confirm("mouse aim check :3")) {
            return false;
        }
        inner.apply(this, arguments);
    };
}

/**
 * For debugging: prints out dead self-links on current page.
 */
function debugTestSelfLinks() {
    $("a").each(function() {
        let dest = $(this).attr("href");
        // don't test footnotes since they have special syntax and will always be marked as dead
        if (dest && dest.startsWith("#") && !dest.startsWith("#fn")) {
            if ($(dest).length === 0) {
                 console.log(dest);
            }
        }
    });
}

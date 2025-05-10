function adjustTextareaHeight(nodeTextarea) {
    // otherwise the next calculation won't work when decreasing, since `scrollHeight` will remain large
    nodeTextarea.style.height = "0px";
    // + ~1.5px needed for scrollbar to not show (below max height)
    nodeTextarea.style.height = `${nodeTextarea.scrollHeight + 1.5}px`;
}

$(document).ready(function() {
    $("textarea").each(function() {
        adjustTextareaHeight($(this).get(0));
    });
});

// no `$(document).ready()` listener attachment since things may be reloaded async
$(document).on("input", "textarea", function(e) {
    adjustTextareaHeight(e.target);
});

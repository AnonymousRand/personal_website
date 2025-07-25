let flashMsgTimeoutId;

function flashMsg(msg) {
    clearTimeout(flashMsgTimeoutId);
    $("#flash__text").text(msg); // `text()` by itself is XSS-safe
    $("#flash").removeAttr("hidden");
    flashMsgTimeoutId = setTimeout(function() {
        $("#flash").alert("close");
    }, 10000);
}

function flashMsgFromQueryStr() {
    let urlParams = new URLSearchParams(window.location.search);
    let flash = urlParams.get("flash_msg");
    if (flash) {
        flashMsg(decodeURIComponent(flash));
    }
}

$(document).ready(flashMsgFromQueryStr);

/**
 * Regenerates flash element on dismiss so we can flash again.
 * We do this instead of changing close button behavior to preserve the fade animation.
 */
$(document).on("close.bs.alert", "#flash", function(e) {
    const nodeDuplicateFlash = e.target.cloneNode(true);
    nodeDuplicateFlash.setAttribute("hidden", "");
    document.getElementById("flash__wrapper").append(nodeDuplicateFlash);
});

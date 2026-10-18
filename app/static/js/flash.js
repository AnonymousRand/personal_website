let flashMsgTimeoutId;

function flashMsg(msg, impt = false) {
    clearTimeout(flashMsgTimeoutId);
    jqFlash = $("#flash");
    // non-important flashes cannot override active `impt` ones
    if (impt) {
        jqFlash.addClass("impt-flash");
    } else if (jqFlash.hasClass("impt-flash")) {
        return;
    }

    $("#flash__text").text(msg); // `text()` by itself is xss-safe
    jqFlash.removeAttr("hidden");
    $("#flash__wrapper").css("z-index", "9999");
    flashMsgTimeoutId = setTimeout(function() {
        jqFlash.alert("close");
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
 * regenerate flash element on dismiss so we can flash again.
 * we do this instead of changing close button behavior to preserve the fade animation.
 */
$(document).on("close.bs.alert", "#flash", function(e) {
    const nodeDuplicateFlash = e.target.cloneNode(true);
    nodeDuplicateFlash.setAttribute("hidden", "");
    nodeDuplicateFlash.classList.remove("impt-flash");
    document.getElementById("flash__wrapper").append(nodeDuplicateFlash);
});

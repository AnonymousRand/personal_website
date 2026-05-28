let jqSillyModeSwitch = null;

function enableSillyMode(isVoluntary) {
    document.body.classList.add("silly-mode");

    if (jqSillyModeSwitch && jqSillyModeSwitch.length > 0 && !jqSillyModeSwitch.prop("checked")) {
        jqSillyModeSwitch.prop("checked", true);
    }
    if (isVoluntary) {
        localStorage.setItem("sillyMode", "true");
    }
}

function disableSillyMode(isVoluntary) {
    document.body.classList.remove("silly-mode");

    if (jqSillyModeSwitch && jqSillyModeSwitch.length > 0 && jqSillyModeSwitch.prop("checked")) {
        jqSillyModeSwitch.prop("checked", false);
    }
    if (isVoluntary) {
        localStorage.setItem("sillyMode", "false");
    }
}

$(document).ready(function() {
    jqSillyModeSwitch = $("#silly-mode-switch");

    if (localStorage.getItem("sillyMode") === "true") {
        enableSillyMode(false);
    }

    // not triggered by `prop()`; detects manual change in switch state and activates/deactivates silly mode
    jqSillyModeSwitch.on("change", function(e) {
        if (e.target.checked) {
            enableSillyMode(true);
        } else {
            disableSillyMode(true);
        }
    });
});

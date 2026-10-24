let isDarkMode = false;

let onDarkModeChange = function(enabled) {};

// out here so it's immediately applied on js load instead of at `$(document).ready()`
let jqDarkModeSwitch = null;
if (localStorage.getItem("darkMode") === "true") {
    enableDarkMode(false);
} else if (localStorage.getItem("darkMode") === null
    && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
{
    // defaults to system setting
    enableDarkMode(false);
}

function enableDarkMode(isVoluntary) {
    isDarkMode = true;
    document.getElementById("dark-theme-css").disabled = false;
    document.getElementById("extra-dark-mode-css").disabled = false;

    if (jqDarkModeSwitch && jqDarkModeSwitch.length > 0 && !jqDarkModeSwitch.prop("checked")) {
        jqDarkModeSwitch.prop("checked", true);
    }
    if (isVoluntary) {
        localStorage.setItem("darkMode", "true");
    }
    // only call after `$(document).ready()` in case we need to modify DOM elements
    if (jQuery.isReady) {
        onDarkModeChange(true);
    }
}

function disableDarkMode(isVoluntary) {
    isDarkMode = false;
    document.getElementById("dark-theme-css").disabled = true;
    document.getElementById("extra-dark-mode-css").disabled = true;

    if (jqDarkModeSwitch && jqDarkModeSwitch.length > 0 && jqDarkModeSwitch.prop("checked")) {
        jqDarkModeSwitch.prop("checked", false);
    }
    if (isVoluntary) {
        localStorage.setItem("darkMode", "false");
    }
    if (jQuery.isReady) {
        onDarkModeChange(false);
    }
}

$(document).ready(async function() {
    jqDarkModeSwitch = $("#dark-mode-switch");

    // if set to dark mode on js load, make sure to sync switch state once the switch loads in
    // also make sure `onDarkModeChange()` is called once everything is loaded
    if (isDarkMode) {
        jqDarkModeSwitch.prop("checked", true);
        onDarkModeChange(true);
    } else {
        jqDarkModeSwitch.prop("checked", false);
        onDarkModeChange(false);
    }

    // if defaulting to system setting, detect change in system setting
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(e) {
        if (localStorage.getItem("darkMode") === null) {
            let newColorScheme = e.matches ? "dark" : "light";
            if (e.matches) {
                enableDarkMode(false);
            } else {
                disableDarkMode(false);
            }
        }
    });

    jqDarkModeSwitch.on("change", function(e) {
        if (e.target.checked) {
            enableDarkMode(true);
        } else {
            disableDarkMode(true);
        }
    });
});

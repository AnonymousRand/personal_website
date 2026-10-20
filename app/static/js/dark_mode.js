const DARKREADER_OPTIONS = {
    contrast: 130
};

let darkReaderFixes = {
    // css selectors for elements that are not automatically inverted by darkreader
    // (images, svg icons etc.)
    invert: [
        ".dark-mode-manual"
    ]
}

DarkReader.setFetchMethod(window.fetch); // solves cors issue

let onDarkModeChange = function(enabled) {};

// out here so it's immediately applied on js load instead of at `$(document).ready()`
let jqDarkModeSwitch = null;
if (localStorage.getItem("darkMode") === "true") {
    enableDarkMode(false);
} else if (
    localStorage.getItem("darkMode") === null
    && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    // defaults to system setting
    enableDarkMode(false);
}

function enableDarkMode(isVoluntary) {
    DarkReader.enable(DARKREADER_OPTIONS, darkReaderFixes);

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
    DarkReader.disable();

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
    if (DarkReader.isEnabled()) {
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

    // not triggered by `prop()`; detects manual change in switch state and
    // activates/deactivates darkreader
    jqDarkModeSwitch.on("change", function(e) {
        if (e.target.checked) {
            enableDarkMode(true);
        } else {
            disableDarkMode(true);
        }
    });

    // only do this here instead of on top-level since we can't use await on top level for fetch,
    // and top-level promises mean the dark reader fixes variable isn't initialized in time
    await addDarkModeCssFixes();
});

async function addDarkModeCssFixes() {
    // we don't use javascript module to import the css here as that makes the top-level
    // variables and functions inaccessible to other traditional scripts 3:
    const darkReaderCssFixes = await fetch(`${BASE_STATIC_URL}theme/css/darkreader_fixes.css`);
    const darkReaderCssFixesText = await darkReaderCssFixes.text();

    // the reason i don't just append this as an inline stylesheet is because i think only
    // adding it as a darkreader css fix will prevent it from being flipped again by darkreader
    darkReaderFixes.css = darkReaderCssFixesText;
    if (DarkReader.isEnabled()) {
        // have to re-enable with the new fixes since this loads later after darkreader
        // has already activated, due to the fetch
        // we only enable darkreader without fixes at the beginning to avoid a bright flash
        DarkReader.enable(DARKREADER_OPTIONS, darkReaderFixes);
    }
}

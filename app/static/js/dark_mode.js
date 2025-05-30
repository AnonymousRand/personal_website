const DARKREADER_OPTIONS = {
    contrast: 130
};
const DARKREADER_FIXES = {
    // CSS selectors for elements that are not automatically inverted by DarkReader (images, SVG icons etc.)
    invert: [
        ".dark-mode-manual"
    ],
    // CSS to apply when dark mode is on, e.g. remapping colors
    css: `
        :root {
            /*
            --darkreader-border--custom-blue-light: #ffaa00;
            --darkreader-border--custom-pink-deep-xxlight: #ff1919;
            */
            --darkreader-border--custom-blue: var(--custom-blue);
            --darkreader-border--custom-blue-light: var(--custom-blue-light);
            --darkreader-border--custom-green: var(--custom-green);
            --darkreader-border--custom-orange: var(--custom-orange);
            --darkreader-border--custom-orange-light: var(--custom-orange-light);
            --darkreader-border--custom-orange-deep: var(--custom-orange-deep);
            --darkreader-border--custom-pink-light: var(--custom-pink-light);
            --darkreader-border--custom-pink-deep-xlight: var(--custom-pink-deep-xlight);
            --darkreader-border--custom-pink-deep-xxlight: var(--custom-pink-deep-xxlight);

            --darkreader-bg--custom-blue: var(--custom-blue);
            --darkreader-bg--custom-blue-xlight: var(--custom-blue-xlight);
            --darkreader-bg--custom-blue-xxlight: var(--custom-blue-light);
            --darkreader-bg--custom-green: var(--custom-green);
            --darkreader-bg--custom-green-light: var(--custom-green-light);
            --darkreader-bg--custom-green-xlight: var(--custom-green-light);
            --darkreader-bg--custom-orange: var(--custom-orange);
            --darkreader-bg--custom-orange-light: var(--custom-orange-light);
            --darkreader-bg--custom-orange-shallow-light: var(--custom-orange-shallow-light);
            --darkreader-bg--custom-orange-shallow-xlight: var(--custom-orange-light);
            --darkreader-bg--custom-pink-light: var(--custom-pink-light);
            --darkreader-bg--custom-pink-deep-xxxlight: var(--custom-pink-xlight);

            --darkreader-text--custom-blue-deep: var(--custom-blue-deep-light);
            --darkreader-text--custom-blue-xdeep: var(--custom-blue-deep);
        }

        /* for specificity */
        @layer god-i-hate-css {
            option:active, .dropdown-item:hover, .dropdown-item:active {
                color: var(--bs-body-color) !important;
            }

            pre code.code-block-outside-table {
                border-color: gray !important;
            }

            .border--lightgray {
                border-color: gray !important;
            }

            .btn--custom-orange-light {
                color: black !important;
            }

            .btn-link--custom-pink-deep-xlight {
                color: var(--custom-pink-deep-xlight) !important;
            }

            .btn-link--custom-pink-deep-xlight:hover {
                color: var(--custom-pink-deep-light) !important;
            }

            .cell--top-header, .cell--left-header {
                background-color: #242424 !important;
            }

            .link--custom-green-deep-xdark {
                text-decoration-color: var(--darkreader-text--custom-green-deep-dark) !important;
                color: var(--darkreader-text--custom-green-deep-dark) !important;
            }

            .link--custom-orange-xdeep {
                text-decoration-color: var(--darkreader-text--custom-orange-deep) !important;
                color: var(--darkreader-text--custom-orange-deep) !important;
            }
            
            .spoiler {
                background-color: dimgray !important;
            }

            .spoiler:hover {
                background-color: transparent !important;
            }
        }
    `
}

DarkReader.setFetchMethod(window.fetch); // solves CORS issue

let onDarkModeChange = function(enabled) {};

// out here so it's immediately applied on JS load instead of at `$(document).ready()`
let jqSwitchDarkMode = null;
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
    DarkReader.enable(DARKREADER_OPTIONS, DARKREADER_FIXES);

    if (jqSwitchDarkMode && jqSwitchDarkMode.length > 0 && !jqSwitchDarkMode.prop("checked")) {
        jqSwitchDarkMode.prop("checked", true);
    }
    if (isVoluntary) {
        localStorage.setItem("darkMode", "true");
    }
    // only call after `$(document).ready()` in case we need to modify DOM elements
    if (jquery.isReady) {
        onDarkModeChange(true);
    }
}

function disableDarkMode(isVoluntary) {
    DarkReader.disable();

    if (jqSwitchDarkMode && jqSwitchDarkMode.length > 0 && jqSwitchDarkMode.prop("checked")) {
        jqSwitchDarkMode.prop("checked", false);
    }
    if (isVoluntary) {
        localStorage.setItem("darkMode", "false");
    }
    if (jquery.isReady) {
        onDarkModeChange(false);
    }
}

$(document).ready(function() {
    jqSwitchDarkMode = $("#switch--dark-mode");

    // if set to dark mode on JS load, make sure to sync switch state once the switch loads in
    // also make sure `onDarkModeChange()` is called once everything is loaded
    if (DarkReader.isEnabled()) {
        jqSwitchDarkMode.prop("checked", true);
        onDarkModeChange(true);
    } else {
        jqSwitchDarkMode.prop("checked", false);
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

    // not triggered by `prop()`; detects manual change in switch state and activates/deactivates DarkReader
    jqSwitchDarkMode.on("change", function(e) {
        if (e.target.checked) {
            enableDarkMode(true);
        } else {
            disableDarkMode(true);
        }
    });
});

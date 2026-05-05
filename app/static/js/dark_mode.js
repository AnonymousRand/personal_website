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
            --darkreader-border--bs-border-color: gray;
            --darkreader-border--bs-border-color-translucent: gray;
            --darkreader-border--bs-dropdown-border-color: gray;
            --darkreader-border--custom-blue: var(-custom-blue); /* used in form */
            --darkreader-border--custom-blue-xlight: var(--custom-blue-xlight);
            --darkreader-border--custom-green: var(--custom-green); /* used in form */
            --darkreader-border--custom-orange: var(--custom-orange); /* used in form */
            --darkreader-border--custom-orange-light: var(--custom-orange-light);
            --darkreader-border--custom-pink-light: var(--custom-pink-light); /* used in form */
            --darkreader-border--dimgray: lightgray;
            --darkreader-border--gray: gray;
            --darkreader-border--lightgray: gray;

            --darkreader-bg--custom-blue: var(--custom-blue); /* used in form */
            --darkreader-bg--custom-blue-xxlight: var(--custom-blue-deep-xlight); /* used in menu */
            --darkreader-bg--custom-green: var(--custom-green); /* used in form */
            --darkreader-bg--custom-green-light: var(--custom-green-light);
            --darkreader-bg--custom-green-xlight: var(--custom-green-light);
            --darkreader-bg--custom-orange: var(--custom-orange); /* used in form */
            --darkreader-bg--custom-orange-light: var(--custom-orange-light); /* used in menu */
            --darkreader-bg--custom-orange-shallow-light: var(--custom-orange-shallow-light);
            --darkreader-bg--custom-orange-shallow-xlight: var(--custom-orange-light);
            --darkreader-bg--custom-pink-light: var(--custom-pink-light); /* used in form */
            --darkreader-bg--custom-pink-shallow-xxxxlight: var(--custom-pink-xshallow-xxlight); /* used in menu */

            --darkreader-text--custom-blue-deep: var(--custom-blue);
            --darkreader-text--custom-blue-deep-dark: var(--custom-blue-light);
            --darkreader-text--custom-blue-xdeep: var(--custom-blue-deep-light);
            --darkreader-text--custom-blue-xxdeep: var(--custom-blue-deep-xlight);
            --darkreader-text--custom-green-deep-xdark: var(--custom-green);
            --darkreader-text--custom-green-deep-xxdark: var(--custom-green-light);
            --darkreader-text--custom-orange-xdeep: var(--custom-orange-light);
            --darkreader-text--custom-orange-xxdeep: var(--custom-orange-xlight);
            --darkreader-text--custom-pink-shallow: var(--custom-pink-xshallow-xxlight);
            --darkreader-text--custom-pink-shallow-light: var(--custom-pink-xshallow-xxlight);
            --darkreader-text--custom-pink-shallow-xlight: var(--custom-pink-xshallow-xlight);
            --darkreader-text--custom-pink-shallow-xxlight: var(--custom-pink-xshallow-light);
            --darkreader-text--black: var(--black-darkmode);
            --darkreader-text--blue: var(--blue-darkmode);
            --darkreader-text--dimgray: var(--dimgray-darkmode);
            --darkreader-text--dimmergray: var(--dimmergray-darkmode);
            --darkreader-text--gray: var(--gray-darkmode);
            --darkreader-text--red: var(--red-darkmode);

            /* turn blue links into green actually on dark mode since it's cooler, but green doesn't show up well normally in light mode */
            --darkreader-text--default-link-color: var(--default-link-color-darkmode);
            --darkreader-text--default-link-hover-color: var(--default-link-color-hover-darkmode);
            --darkreader-text--default-link-disabled-color: var(--default-link-color-disabled-darkmode);
        }

        /* layer for specificity */
        @layer css-makes-me-want-to-stick-my-head-in-a-blender {
            hr {
                opacity: 0.6 !important;
            }

            option:active, .dropdown-item:hover, .dropdown-item:active {
                color: var(--bs-body-color) !important;
            }

            .btn--custom-orange-light {
                color: black !important;
            }

            .cell--top-header, .cell--left-header {
                background-color: #242424 !important;
            }

            .redacted {
                background-color: var(--darkreader-text--bs-body-color, #ffffff) !important;
                color: var(--darkreader-text--bs-body-color, #ffffff) !important;
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
    if (jQuery.isReady) {
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
    if (jQuery.isReady) {
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

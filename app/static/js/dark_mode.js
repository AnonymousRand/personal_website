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
    const darkModeCss = await fetch(`${BASE_STATIC_URL}css/dark_theme.css`);
    const darkModeCssText = await darkModeCss.text();
    const darkModeSheet = new CSSStyleSheet();
    await darkModeSheet.replace(darkModeCssText);
    const darkModeRules = darkModeSheet.cssRules;
    let darkModeVars;
    for (const rule of darkModeRules) {
        if (rule.selectorText === ":root") {
            darkModeVars = rule.style;
            break;
        }
    }

    // this is rather stupid, but it allows us to make `light_theme.css` and `dark_theme.css`
    // standalone and general (instead of being darkreader-specific), e.g. so that it is easier to
    // change and so that other non-darkreader sites like my forgejo can pull the theme files too
    // also the reason i don't just append this as an inline stylesheet is because i think only
    // this will prevent it from being flipped again by darkreader
    const darkReaderFixCss = `
        :root {
            /******************************************************************/
            /* theme */

            --darkreader-bg--default-bg:
                ${darkModeVars.getPropertyValue("--default-bg")};
            --darkreader-text--default-fg:
                ${darkModeVars.getPropertyValue("--default-fg")};
            --darkreader-text--lighter-fg:
                ${darkModeVars.getPropertyValue("--lighter-fg")};

            --darkreader-border--accent-border:
                ${darkModeVars.getPropertyValue("--accent-border")};
            --darkreader-bg--accent-bg:
                ${darkModeVars.getPropertyValue("--accent-bg")};
            --darkreader-text--accent-fg:
                ${darkModeVars.getPropertyValue("--accent-fg")};
            --darkreader-border--accent-hover-border:
                ${darkModeVars.getPropertyValue("--accent-hover-border")};
            --darkreader-bg--accent-hover-bg:
                ${darkModeVars.getPropertyValue("--accent-hover-bg")};
            --darkreader-bg--accent-active-bg:
                ${darkModeVars.getPropertyValue("--accent-active-bg")};
            --darkreader-bg--strong-accent-bg:
                ${darkModeVars.getPropertyValue("--strong-accent-bg")};
            --darkreader-text--strong-accent-fg:
                ${darkModeVars.getPropertyValue("--strong-accent-fg")};

            --darkreader-border--border--blue:
                ${darkModeVars.getPropertyValue("--border--blue")};
            --darkreader-border--border--blue-xlight:
                ${darkModeVars.getPropertyValue("--border--blue-xlight")};
            --darkreader-border--border--blue-xxlight:
                ${darkModeVars.getPropertyValue("--border--blue-xxlight")};
            --darkreader-border--border--green:
                ${darkModeVars.getPropertyValue("--border--green")};
            --darkreader-border--border--green-light:
                ${darkModeVars.getPropertyValue("--border--green-light")};
            --darkreader-border--border--orange:
                ${darkModeVars.getPropertyValue("--border--orange")};
            --darkreader-border--border--orange-xlight:
                ${darkModeVars.getPropertyValue("--border--orange-xlight")};
            --darkreader-border--border--orange-shallow-light:
                ${darkModeVars.getPropertyValue("--border--orange-shallow-light")};
            --darkreader-border--border--orange-deep:
                ${darkModeVars.getPropertyValue("--border--orange-deep")};
            --darkreader-border--border--pink-light:
                ${darkModeVars.getPropertyValue("--border--pink-light")};
            --darkreader-border--border--pink-xxxxlight:
                ${darkModeVars.getPropertyValue("--border--pink-xxxxlight")};
            --darkreader-border--border--pink-xxlight:
                ${darkModeVars.getPropertyValue("--border--pink-xxlight")};
            --darkreader-border--border--pink-xxxxlight:
                ${darkModeVars.getPropertyValue("--border--pink-xxxxlight")};
            --darkreader-border--border--gray-dark:
                ${darkModeVars.getPropertyValue("--border--gray-dark")};
            --darkreader-border--border--gray:
                ${darkModeVars.getPropertyValue("--border--gray")};
            --darkreader-border--border--gray-xxlight:
                ${darkModeVars.getPropertyValue("--border--gray-xxlight")};

            --darkreader-bg--bg--blue:
                ${darkModeVars.getPropertyValue("--bg--blue")};
            --darkreader-bg--bg--blue-xxlight:
                ${darkModeVars.getPropertyValue("--bg--blue-xxlight")};
            --darkreader-bg--bg--green:
                ${darkModeVars.getPropertyValue("--bg--green")};
            --darkreader-bg--bg--green-light:
                ${darkModeVars.getPropertyValue("--bg--green-light")};
            --darkreader-bg--bg--orange:
                ${darkModeVars.getPropertyValue("--bg--orange")};
            --darkreader-bg--bg--orange-xlight:
                ${darkModeVars.getPropertyValue("--bg--orange-xlight")};
            --darkreader-bg--bg--orange-shallow-light:
                ${darkModeVars.getPropertyValue("--bg--orange-shallow-light")};
            --darkreader-bg--bg--orange-shallow-xlight:
                ${darkModeVars.getPropertyValue("--bg--cusom-orange-shallow-xlight")};
            --darkreader-bg--bg--pink-xlight:
                ${darkModeVars.getPropertyValue("--bg--pink-xlight")};
            --darkreader-bg--bg--pink-xxxlight:
                ${darkModeVars.getPropertyValue("--bg--pink-xxxlight")};
            --darkreader-bg--bg--pink-xxxxxxlight:
                ${darkModeVars.getPropertyValue("--bg--pink-xxxxxxlight")};
            --darkreader-bg--bg--pink-xshallow-xxlight:
                ${darkModeVars.getPropertyValue("--bg--pink-xshallow-xxlight")};
            --darkreader-bg--bg--whitesmoke:
                ${darkModeVars.getPropertyValue("--bg--whitesmoke")};

            --darkreader-text--text--blue-deep:
                ${darkModeVars.getPropertyValue("--text--blue-deep")};
            --darkreader-text--text--blue-deep-dark:
                ${darkModeVars.getPropertyValue("--text--blue-deep-dark")};
            --darkreader-text--text--blue-xdeep:
                ${darkModeVars.getPropertyValue("--text--blue-xdeep")};
            --darkreader-text--text--blue-xxdeep:
                ${darkModeVars.getPropertyValue("--text--blue-xxdeep")};
            --darkreader-text--text--green-deep-dark:
                ${darkModeVars.getPropertyValue("--text--green-deep-dark")};
            --darkreader-text--text--green-deep-xdark:
                ${darkModeVars.getPropertyValue("--text--green-deep-xdark")};
            --darkreader-text--text--green-deep-xxdark:
                ${darkModeVars.getPropertyValue("--text--green-deep-xxdark")};
            --darkreader-text--text--orange-deep:
                ${darkModeVars.getPropertyValue("--text--orange-deep")};
            --darkreader-text--text--orange-xxdeep:
                ${darkModeVars.getPropertyValue("--text--orange-xxdeep")};
            --darkreader-text--text--orange-xxxdeep:
                ${darkModeVars.getPropertyValue("--text--orange-xxxdeep")};
            --darkreader-text--text--pink-light:
                ${darkModeVars.getPropertyValue("--text--pink-light")};
            --darkreader-text--text--pink-xlight:
                ${darkModeVars.getPropertyValue("--text--pink-xlight")};
            --darkreader-text--text--pink-shallow:
                ${darkModeVars.getPropertyValue("--text--pink-shallow")};
            --darkreader-text--text--pink-light:
                ${darkModeVars.getPropertyValue("--text--pink-light")};
            --darkreader-text--text--pink-xlight:
                ${darkModeVars.getPropertyValue("--text--pink-xlight")};
            --darkreader-text--text--pink-xxlight:
                ${darkModeVars.getPropertyValue("--text--pink-xxlight")};
            --darkreader-text--text--black:
                ${darkModeVars.getPropertyValue("--text--black")};
            --darkreader-text--text--gray-xxdark:
                ${darkModeVars.getPropertyValue("--text--gray-xxdark")};
            --darkreader-text--text--gray-dark:
                ${darkModeVars.getPropertyValue("--text--gray-dark")};
            --darkreader-text--text--gray:
                ${darkModeVars.getPropertyValue("--text--gray")};
            --darkreader-text--text--white:
                ${darkModeVars.getPropertyValue("--text--white")};
            --darkreader-text--text--red:
                ${darkModeVars.getPropertyValue("--text--red")};
            --darkreader-text--text--blue:
                ${darkModeVars.getPropertyValue("--text--blue")};

            --darkreader-text--link-color:
                ${darkModeVars.getPropertyValue("--link-color")};
            --darkreader-text--link-hover-color:
                ${darkModeVars.getPropertyValue("--link-hover-color")};
            --darkreader-text--link-disabled-color:
                ${darkModeVars.getPropertyValue("--link-disabled-color")};

            --darkreader-text--code-color:
                ${darkModeVars.getPropertyValue("--code-color")};

            --darkreader-border--default-border-color:
                ${darkModeVars.getPropertyValue("--default-border-color")};
            --darkreader-border--translucent-border-color:
                ${darkModeVars.getPropertyValue("--translucent-border-color")};
            --darkreader-border--dropdown-border-color:
                ${darkModeVars.getPropertyValue("--dropdown-border-color")};

            --darkreader-bg--switch-unchecked-bg-color:
                ${darkModeVars.getPropertyValue("--switch-unchecked-bg-color")};

            /******************************************************************/
            /* bootstrap tweaks */

            --darkreader-bg--bs-body-bg:
                var(--darkreader-bg--default-bg);
            --darkreader-text--bs-body-color:
                var(--darkreader-text--default-fg);

            --darkreader-border--bs-border-color:
                var(--darkreader-border--default-border-color);
            --darkreader-border--bs-border-color-translucent:
                var(--darkreader-border--translucent-border-color);
            --darkreader-border--bs-dropdown-border-color:
                var(--darkreader-border--dropdown-border-color);
        }

        /* layer for specificity */
        @layer css-makes-me-want-to-stick-my-head-in-a-blender {
            hr {
                opacity: 0.6 !important;
            }

            option:active,
            .dropdown-item:hover,
            .dropdown-item:active {
                /* don't change! */
                color: var(--default-fg) !important;
            }

            /* since \`border-image\` doesn't seem to be changed by darkreader */
            .border--colorful {
                border-image: conic-gradient(
                    var(--darkreader-border--border--orange-xlight) 62.5deg,
                    var(--darkreader-border--border--green-light) 85deg,
                    var(--darkreader-border--border--green-light) 95deg,
                    var(--darkreader-border--border--blue-xxlight) 112.5deg,
                    var(--darkreader-border--border--blue-xxlight) 242.5deg,
                    var(--darkreader-border--border--pink-xxlight) 260deg,
                    var(--darkreader-border--border--pink-xxlight) 280deg,
                    var(--darkreader-border--border--orange-xlight) 312.5deg
                ) 1 !important;
            }

            /*
            .cell--top-header,
            .cell--left-header {
                background-color: #242424 !important;
            }
            */

            /* change dark mode switch to moon icon */
            /* (using global url here since css is now inline, so relative url is weird) */
            .form-switch .dark-mode-switch:checked {
                background-image: url("${BASE_STATIC_URL}files/moon.svg") !important;
            }

            .form-switch .silly-mode-switch {
                background-image: url("${BASE_STATIC_URL}files/colon_3_dark.svg") !important;
            }

            .form-switch .silly-mode-switch:checked {
                background-image: url("${BASE_STATIC_URL}files/colon_3_silly_dark.svg") !important;
            }

            .redacted {
                background-color: ${darkModeVars.getPropertyValue("--default-fg")} !important;
                color: ${darkModeVars.getPropertyValue("--default-fg")} !important;
            }

            .spoiler {
                background-color: gray-dark !important;
            }

            .spoiler:hover {
                background-color: transparent !important;
            }
        }
    `
    darkReaderFixes.css = darkReaderFixCss;
    if (DarkReader.isEnabled()) {
        // have to re-enable with the new fixes since this loads later after darkreader has already
        // activated; we only enable darkreader without fixes at the beginning to avoid bright flash
        DarkReader.enable(DARKREADER_OPTIONS, darkReaderFixes);
    }
}

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

            --darkreader-border--border--custom-blue:
                ${darkModeVars.getPropertyValue("--border--custom-blue")};
            --darkreader-border--border--custom-blue-xlight:
                ${darkModeVars.getPropertyValue("--border--custom-blue-xlight")};
            --darkreader-border--border--custom-blue-xxlight:
                ${darkModeVars.getPropertyValue("--border--custom-blue-xxlight")};
            --darkreader-border--border--custom-green:
                ${darkModeVars.getPropertyValue("--border--custom-green")};
            --darkreader-border--border--custom-green-light:
                ${darkModeVars.getPropertyValue("--border--custom-green-light")};
            --darkreader-border--border--custom-orange:
                ${darkModeVars.getPropertyValue("--border--custom-orange")};
            --darkreader-border--border--custom-orange-light:
                ${darkModeVars.getPropertyValue("--border--custom-orange-light")};
            --darkreader-border--border--custom-orange-shallow-light:
                ${darkModeVars.getPropertyValue("--border--custom-orange-shallow-light")};
            --darkreader-border--border--custom-orange-deep:
                ${darkModeVars.getPropertyValue("--border--custom-orange-deep")};
            --darkreader-border--border--custom-pink-light:
                ${darkModeVars.getPropertyValue("--border--custom-pink-light")};
            --darkreader-border--border--custom-pink-xlight:
                ${darkModeVars.getPropertyValue("--border--custom-pink-xlight")};
            --darkreader-border--border--custom-pink-xxlight:
                ${darkModeVars.getPropertyValue("--border--custom-pink-xxlight")};
            --darkreader-border--border--custom-pink-shallow-xlight:
                ${darkModeVars.getPropertyValue("--border--custom-pink-shallow-xlight")};
            --darkreader-border--border--dimgray:
                ${darkModeVars.getPropertyValue("--border--dimgray")};
            --darkreader-border--border--gray:
                ${darkModeVars.getPropertyValue("--border--gray")};
            --darkreader-border--border--lightgray:
                ${darkModeVars.getPropertyValue("--border--lightgray")};

            --darkreader-bg--bg--custom-blue:
                ${darkModeVars.getPropertyValue("--bg--custom-blue")};
            --darkreader-bg--bg--custom-blue-xxlight:
                ${darkModeVars.getPropertyValue("--bg--custom-blue-xxlight")};
            --darkreader-bg--bg--custom-green:
                ${darkModeVars.getPropertyValue("--bg--custom-green")};
            --darkreader-bg--bg--custom-green-light:
                ${darkModeVars.getPropertyValue("--bg--custom-green-light")};
            --darkreader-bg--bg--custom-orange:
                ${darkModeVars.getPropertyValue("--bg--custom-orange")};
            --darkreader-bg--bg--custom-orange-light:
                ${darkModeVars.getPropertyValue("--bg--custom-orange-light")};
            --darkreader-bg--bg--custom-orange-shallow-light:
                ${darkModeVars.getPropertyValue("--bg--custom-orange-shallow-light")};
            --darkreader-bg--bg--custom-orange-shallow-xlight:
                ${darkModeVars.getPropertyValue("--bg--cusom-orange-shallow-xlight")};
            --darkreader-bg--bg--custom-pink-xlight:
                ${darkModeVars.getPropertyValue("--bg--custom-pink-xlight")};
            --darkreader-bg--bg--custom-pink-shallow-xxxlight:
                ${darkModeVars.getPropertyValue("--bg--custom-pink-shallow-xxxlight")};
            --darkreader-bg--bg--custom-pink-shallow-xxxxlight:
                ${darkModeVars.getPropertyValue("--bg--custom-pink-shallow-xxxxlight")};
            --darkreader-bg--bg--custom-pink-xshallow-xxlight:
                ${darkModeVars.getPropertyValue("--bg--custom-pink-xshallow-xxlight")};
            --darkreader-bg--bg--whitesmoke:
                ${darkModeVars.getPropertyValue("--bg--whitesmoke")};

            --darkreader-text--text--custom-blue-deep:
                ${darkModeVars.getPropertyValue("--text--custom-blue-deep")};
            --darkreader-text--text--custom-blue-deep-dark:
                ${darkModeVars.getPropertyValue("--text--custom-blue-deep-dark")};
            --darkreader-text--text--custom-blue-xdeep:
                ${darkModeVars.getPropertyValue("--text--custom-blue-xdeep")};
            --darkreader-text--text--custom-blue-xxdeep:
                ${darkModeVars.getPropertyValue("--text--custom-blue-xxdeep")};
            --darkreader-text--text--custom-green-deep-dark:
                ${darkModeVars.getPropertyValue("--text--custom-green-deep-dark")};
            --darkreader-text--text--custom-green-deep-xdark:
                ${darkModeVars.getPropertyValue("--text--custom-green-deep-xdark")};
            --darkreader-text--text--custom-green-deep-xxdark:
                ${darkModeVars.getPropertyValue("--text--custom-green-deep-xxdark")};
            --darkreader-text--text--custom-orange-deep:
                ${darkModeVars.getPropertyValue("--text--custom-orange-deep")};
            --darkreader-text--text--custom-orange-xdeep:
                ${darkModeVars.getPropertyValue("--text--custom-orange-xdeep")};
            --darkreader-text--text--custom-orange-xxdeep:
                ${darkModeVars.getPropertyValue("--text--custom-orange-xxdeep")};
            --darkreader-text--text--custom-pink-light:
                ${darkModeVars.getPropertyValue("--text--custom-pink-light")};
            --darkreader-text--text--custom-pink-xlight:
                ${darkModeVars.getPropertyValue("--text--custom-pink-xlight")};
            --darkreader-text--text--custom-pink-shallow:
                ${darkModeVars.getPropertyValue("--text--custom-pink-shallow")};
            --darkreader-text--text--custom-pink-shallow-light:
                ${darkModeVars.getPropertyValue("--text--custom-pink-shallow-light")};
            --darkreader-text--text--custom-pink-shallow-xlight:
                ${darkModeVars.getPropertyValue("--text--custom-pink-shallow-xlight")};
            --darkreader-text--text--custom-pink-shallow-xxlight:
                ${darkModeVars.getPropertyValue("--text--custom-pink-shallow-xxlight")};
            --darkreader-text--text--black:
                ${darkModeVars.getPropertyValue("--text--black")};
            --darkreader-text--text--dimmergray:
                ${darkModeVars.getPropertyValue("--text--dimmergray")};
            --darkreader-text--text--dimgray:
                ${darkModeVars.getPropertyValue("--text--dimgray")};
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
                    var(--darkreader-border--border--custom-orange-light) 62.5deg,
                    var(--darkreader-border--border--custom-green-light) 85deg,
                    var(--darkreader-border--border--custom-green-light) 95deg,
                    var(--darkreader-border--border--custom-blue-xxlight) 112.5deg,
                    var(--darkreader-border--border--custom-blue-xxlight) 242.5deg,
                    var(--darkreader-border--border--custom-pink-xxlight) 260deg,
                    var(--darkreader-border--border--custom-pink-xxlight) 280deg,
                    var(--darkreader-border--border--custom-orange-light) 312.5deg
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
                background-color: dimgray !important;
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

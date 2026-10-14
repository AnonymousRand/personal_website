function applyStyles(selector) {
    const jqBase = $(selector);
    if (jqBase.length === 0) {
        return;
    }

    // tables and non-table code blocks scroll horizontally on overflow
    jqBase.find("table").wrap(HORIZ_SCROLL_DIV_HTML);
    jqBase.find("pre:not(table pre, .inline-code-block *) code").each(function() {
        $(this).wrap(HORIZ_SCROLL_DIV_HTML);
        // also syntax highlight bordered code blocks
        hljs.highlightElement($(this).get(0));
    });

    // open default open dropdowns
    $("details.dropdown--default-open").attr("open", "");
}

const colorChoices = {
    blue: {
        menuHighlight: "--bg--custom-blue-xxlight",
        form: {
            accent: "--bg--custom-blue",
            border: "--border--custom-blue",
            boxShadow: "color-mix(in srgb, var(--border--custom-blue) 25%, transparent)"
        },
        flashBorder: "--border--custom-blue-xlight",
        selection: "--bg--custom-blue-xxlight"
    },
    green: {
        menuHighlight: "--bg--custom-green-light",
        form: {
            accent: "--bg--custom-green",
            border: "--border--custom-green",
            boxShadow: "color-mix(in srgb, var(--border--custom-green) 50%, transparent)"
        },
        flashBorder: "--border--custom-green",
        selection: "--bg--custom-green-light"
    },
    orange: {
        menuHighlight: "--bg--custom-orange-shallow-light",
        form: {
            accent: "--bg--custom-orange",
            border: "--border--custom-orange",
            boxShadow: "color-mix(in srgb, var(--border--custom-orange) 40%, transparent)"
        },
        flashBorder: "--border--custom-orange-light",
        selection: "--bg--custom-orange-shallow-light"
    },
    pink: {
        menuHighlight: "--bg--custom-pink-shallow-xxxxlight",
        form: {
            accent: "--bg--custom-pink-light",
            border: "--border--custom-pink-light",
            boxShadow: "color-mix(in srgb, var(--border--custom-pink-light) 50%, transparent)"
        },
        flashBorder: "--border--custom-pink-light",
        selection: "--bg--custom-pink-shallow-xxxxlight"
    }
};

function randomizeColors() {
    const rand = Math.floor(Math.random() * Object.keys(colorChoices).length);
    const color = Object.keys(colorChoices)[rand];
    const colorChoice = colorChoices[color];
    // can't use `css()` here since it doesn't support `!important`, which is needed sometimes
    $("body").append(`
        <style>
            ::selection {
                background-color: var(${colorChoice.selection});
            }

            :is(select, input:not([type="button"], [type="submit"]), textarea):is(:hover, :focus) {
                box-shadow: 0 0 0 0.25rem ${colorChoice.form.boxShadow} !important;
                border-color: var(${colorChoice.form.border}) !important;
            }

            /* probably won't work yet, maybe in the future though :( */
            input.is([type="checkbox"], [type="radio"]) {
                accent-color: var(${colorChoice.form.accent}) !important;
            }

            option:active, .dropdown-item:hover, .dropdown-item:active {
                background-color: var(${colorChoice.menuHighlight}) !important;
                color: var(--body-fg) !important;
            }

            .flash {
                border-color: var(${colorChoice.flashBorder});
            }
        </style>
    `);
}

function reloadBackgroundImg() {
    if (backgroundImgUrl !== "") {
        $("#background-img").css("background-image", `url(${backgroundImgUrl})`);
    } else {
        $("#background-img").css("background-image", `url(${DEFAULT_BACKGROUND_IMG_URL})`);
    }
}

randomizeColors();
reloadBackgroundImg();
applyStyles("body");
// makes sure that navigating to a url fragment doesn't hide it in the sticky navbar
document.documentElement.style.setProperty(
    "--navbar-outer-height", `${$("#navbar").outerHeight()}px`
);

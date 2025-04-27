function applyGlobalStyles(baseSelector) {
    const jQBase = $(baseSelector);
    if (jQBase.length === 0) {
        return;
    }

    // tables and non-table code blocks scroll horizontally on overflow
    jQBase.find("table").wrap(HORIZ_SCOLL_DIV_HTML);
    jQBase.find("pre").each(function() {
        if ($(this).parents("table").length === 0) {
            $(this).wrap(HORIZ_SCOLL_DIV_HTML);
        }
    });

    applySyntaxHighlighting(baseSelector);
}

function applySyntaxHighlighting(baseSelector) {
    $(baseSelector).find("pre code").each(function() {
        if ($(this).parents("table").length === 0) {
            hljs.highlightElement($(this).get(0));
            $(this).addClass("code-block-outside-table");
        }
    });
}

const colorChoices = {
    blue: {
        menuHighlight: "--custom-blue-xlight",
        form: {
            accent: "--custom-blue",
            border: "--custom-blue",
            boxShadow: "color-mix(in srgb, var(--custom-blue) 25%, transparent)"
        },
        flashBorder: "--custom-blue-light",
        selection: "--custom-blue-xlight"
    },
    green: {
        menuHighlight: "--custom-green-light",
        form: {
            accent: "--custom-green",
            border: "--custom-green",
            boxShadow: "color-mix(in srgb, var(--custom-green) 50%, transparent)"
        },
        flashBorder: "--custom-green",
        selection: "--custom-green-light"
    },
    orange: {
        menuHighlight: "--custom-orange-shallow-light",
        form: {
            accent: "--custom-orange",
            border: "--custom-orange",
            boxShadow: "color-mix(in srgb, var(--custom-orange) 40%, transparent)"
        },
        flashBorder: "--custom-orange-light",
        selection: "--custom-orange-shallow-light"
    },
    pink: {
        menuHighlight: "--custom-pink-deep-xxxlight",
        form: {
            accent: "--custom-pink-light",
            border: "--custom-pink-light",
            boxShadow: "color-mix(in srgb, var(--custom-pink-light) 50%, transparent)"
        },
        flashBorder: "--custom-pink-light",
        selection: "--custom-pink-deep-xxxlight"
    }
};

function randomizeColors() {
    const color = Object.keys(colorChoices)[Math.floor(Math.random() * Object.keys(colorChoices).length)];
    const colorChoice = colorChoices[color];
    // can't use `css()` here since it doesn't support `!important`, which is needed sometimes
    $("body").append(`
        <style>
            #flash {
                border-color: var(${colorChoice.flashBorder});
            }

            ::selection {
                background-color: var(${colorChoice.selection});
            }

            :is(select, input:not([type="button"], [type="submit"]), textarea):focus {
                box-shadow: 0 0 0 0.25rem ${colorChoice.form.boxShadow} !important;
                border-color: var(${colorChoice.form.border}) !important;
            }

            .dropdown-item:hover, .dropdown-item:active {
                background-color: var(${colorChoice.menuHighlight});
                color: var(--bs-body-color);
            }
            
            /* probably won't work yet, maybe in the future though :( */
            input.is([type="checkbox"], [type="radio"]) {
                accent-color: var(${colorChoice.form.accent}) !important;
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
applyGlobalStyles("body");
reloadBackgroundImg();
// for making sure navigating to a URL fragment doesn't hide it in the sticky navbar
document.documentElement.style.setProperty("--navbar-outer-height", `${$("#navbar").outerHeight()}px`);
// open default open dropdowns
$("details.dropdown--default-open").attr("open", "");

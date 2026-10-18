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
        menuHighlight: "---blue-xxlight",
        form: {
            accent: "---blue",
            border: "---blue",
            boxShadow: "color-mix(in srgb, var(---blue) 25%, transparent)"
        },
        flashBorder: "---blue-xlight",
        selection: "---blue-xxlight"
    },
    green: {
        menuHighlight: "---green-light",
        form: {
            accent: "---green",
            border: "---green",
            boxShadow: "color-mix(in srgb, var(---green) 50%, transparent)"
        },
        flashBorder: "---green",
        selection: "---green-light"
    },
    orange: {
        menuHighlight: "---orange-shallow-light",
        form: {
            accent: "---orange",
            border: "---orange",
            boxShadow: "color-mix(in srgb, var(---orange) 40%, transparent)"
        },
        flashBorder: "---orange-xlight",
        selection: "---orange-shallow-light"
    },
    pink: {
        menuHighlight: "---pink-xxxxxxlight",
        form: {
            accent: "---pink-xxxxlight",
            border: "---pink-xxxxlight",
            boxShadow: "color-mix(in srgb, var(---pink-xxxxlight) 50%, transparent)"
        },
        flashBorder: "---pink-xxxxlight",
        selection: "---pink-xxxxxxlight"
    }
};

function randomizeColors() {
    const rand = Math.floor(Math.random() * Object.keys(colorChoices).length);
    const color = Object.keys(colorChoices)[rand];
    const colorChoice = colorChoices[color];
    // can't use `css()` here since it doesn't support `!important`, which is needed sometimes
    $("body").append(`
        <style>
            :root {
              --bs-box-shadow: 0 0.5rem 1rem var(${colorChoice.form.boxShadow});
              --bs-focus-ring-color: var(${colorChoice.form.border});
            }

            ::selection {
              background-color: var(${colorChoice.selection});
            }

            /*
            :is(select, input:not([type="button"], [type="submit"]), textarea):is(:hover, :focus) {
              box-shadow: 0 0 0 0.25rem ${colorChoice.form.boxShadow} !important;
              border-color: var(${colorChoice.form.border}) !important;
            }

            .form-check-input:checked {
              border-color: var(${colorChoice.form.border}) !important;
              background-color: var(${colorChoice.form.accent}) !important;
            }
            */

            option:active, .dropdown-item:hover, .dropdown-item:active {
              background-color: var(${colorChoice.menuHighlight}) !important;
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
    "---navbar-outer-height", `${$("#navbar").outerHeight()}px`
);

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
        menuHighlight: "---color-blue-xxlight-bg",
        inputAccent: "---color-blue-bg",
        inputBorder: "---color-blue-border",
        focusRing: "rgb(from var(---color-blue-border) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---color-blue-xlight-border",
        selection: "---color-blue-xxlight-bg"
    },
    green: {
        menuHighlight: "---color-green-light-bg",
        inputAccent: "---color-green-bg",
        inputBorder: "---color-green-border",
        focusRing: "rgb(from var(---color-green-border) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---color-green-border",
        selection: "---color-green-light-bg"
    },
    orange: {
        menuHighlight: "---color-orange-shallow-light-bg",
        inputAccent: "---color-orange-bg",
        inputBorder: "---color-orange-border",
        focusRing: "rgb(from var(---color-orange-border) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---color-orange-xlight-border",
        selection: "---color-orange-shallow-light-bg"
    },
    pink: {
        menuHighlight: "---color-pink-xxxxxxlight-bg",
        inputAccent: "---color-pink-xxxxlight-bg",
        inputBorder: "---color-pink-xxxxlight-border",
        focusRing: "rgb(from var(---color-pink-xxxxlight-border) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---color-pink-xxxxlight-border",
        selection: "---color-pink-xxxxxxlight-bg"
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
              --bs-box-shadow: 0 0.5rem 1rem ${colorChoice.focusRing};
              --bs-box-shadow-sm: 0 0.125rem 0.25rem ${colorChoice.focusRing};
              --bs-box-shadow-lg: 0 1rem 3rem ${colorChoice.focusRing};
              --bs-box-shadow-inset: inset 1px 2px ${colorChoice.focusRing};

              --bs-focus-ring-color: var(${colorChoice.inputBorder});
            }

            ::selection {
              background-color: var(${colorChoice.selection});
            }

            /*
            :is(select, input:not([type="button"], [type="submit"]), textarea):is(:hover, :focus) {
              box-shadow: 0 0 0 0.25rem ${colorChoice.focusRing} !important;
              border-color: var(${colorChoice.inputBorder}) !important;
            }

            .form-check-input:checked {
              border-color: var(${colorChoice.inputBorder}) !important;
              background-color: var(${colorChoice.inputAccent}) !important;
            }
            */

            option:active, .dropdown-item:hover, .dropdown-item:active {
              background-color: var(${colorChoice.menuHighlight}) !important;
            }

            .flash {
              --bs-alert-border-color: var(${colorChoice.flashBorder});
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

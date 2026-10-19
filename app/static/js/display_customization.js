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
        menuHighlight: "---blue-xxlight-bg",
        inputAccent: "---blue-bg",
        inputBorder: "---blue-border-color",
        focusRing: "rgb(from var(---blue-border-color) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---blue-xlight-border-color",
        selection: "---blue-xxlight-bg"
    },
    green: {
        menuHighlight: "---green-light-bg",
        inputAccent: "---green-bg",
        inputBorder: "---green-border-color",
        focusRing: "rgb(from var(---green-border-color) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---green-border-color",
        selection: "---green-light-bg"
    },
    orange: {
        menuHighlight: "---orange-shallow-light-bg",
        inputAccent: "---orange-bg",
        inputBorder: "---orange-border-color",
        focusRing: "rgb(from var(---orange-border-color) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---orange-xlight-border-color",
        selection: "---orange-shallow-light-bg"
    },
    pink: {
        menuHighlight: "---pink-xxxxxxlight-bg",
        inputAccent: "---pink-xxxxlight-bg",
        inputBorder: "---pink-xxxxlight-border-color",
        focusRing: "rgb(from var(---pink-xxxxlight-border-color) r g b / var(--bs-focus-ring-opacity))",
        flashBorder: "---pink-xxxxlight-border-color",
        selection: "---pink-xxxxxxlight-bg"
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

function applyInterpolatingCss () {
    $("body").append(`
        <style>
          .navbar {

          }
        </style>
    `);
}

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
        inputAccent:   "---color-blue-bg",
        inputBorder:   "---color-blue-border",
        focusRing:     "rgb(from var(---color-blue-border) r g b / var(--bs-focus-ring-opacity))",
        alertBorder:   "---color-blue-xlight-border",
        // `slice()` to remove leading hashtag, as that has to be encoded in the svg
        flashCloseBtn: fetchCssColorVar("---color-blue-xlight-border").slice(1),
        selection:     "---color-blue-xxlight-bg"
    },

    green: {
        menuHighlight: "---color-green-light-bg",
        inputAccent:   "---color-green-bg",
        inputBorder:   "---color-green-border",
        focusRing:     "rgb(from var(---color-green-border) r g b / var(--bs-focus-ring-opacity))",
        alertBorder:   "---color-green-border",
        flashCloseBtn: fetchCssColorVar("---color-green-border").slice(1),
        selection:     "---color-green-light-bg"
    },

    orange: {
        menuHighlight: "---color-orange-shallow-light-bg",
        inputAccent:   "---color-orange-bg",
        inputBorder:   "---color-orange-border",
        focusRing:     "rgb(from var(---color-orange-border) r g b / var(--bs-focus-ring-opacity))",
        alertBorder:   "---color-orange-xlight-border",
        flashCloseBtn: fetchCssColorVar("---color-orange-xlight-border").slice(1),
        selection:     "---color-orange-shallow-light-bg"
    },

    pink: {
        menuHighlight: "---color-pink-xxxxxxlight-bg",
        inputAccent:   "---color-pink-xxxxlight-bg",
        inputBorder:   "---color-pink-xxxxlight-border",
        focusRing:     "rgb(from var(---color-pink-xxxxlight-border) r g b / var(--bs-focus-ring-opacity))",
        alertBorder:   "---color-pink-xxxxlight-border",
        flashCloseBtn: fetchCssColorVar("---color-pink-xxxxlight-border").slice(1),
        selection:     "---color-pink-xxxxxxlight-bg"
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

          /* needed still since they otherwise use colors set at scss compile time, not in css */
          :is(.form-control, .form-select):is(:focus, :focus-visible),
          .form-check-input:checked {
            box-shadow: 0 0 0 0.25rem ${colorChoice.focusRing} !important;
            border-color: var(${colorChoice.inputBorder}) !important;
          }

          option:is(:hover, :active),
          .dropdown-item:is(:hover, :active) {
            --bs-dropdown-link-hover-bg: var(${colorChoice.menuHighlight});
            --bs-dropdown-link-active-bg: var(${colorChoice.menuHighlight});
            background-color: var(${colorChoice.menuHighlight}) !important;
          }

          .alert {
            --bs-alert-border-color: var(${colorChoice.alertBorder});
          }

          .flash .btn-close {
            --bs-btn-close-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23${colorChoice.flashCloseBtn}'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
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

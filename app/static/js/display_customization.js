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
        menuHighlightBg: "---color-blue-xxlight-bg",
        inputBorder:     "---color-blue-border",
        alertBorder:     "---color-blue-xlight-border",
        // `slice()` to remove leading hashtag, as that has to be encoded in the svg
        selectionBg:     "---color-blue-xxlight-bg"
    },

    green: {
        menuHighlightBg: "---color-green-light-bg",
        inputBorder:     "---color-green-border",
        alertBorder:     "---color-green-border",
        selectionBg:     "---color-green-light-bg"
    },

    orange: {
        menuHighlightBg: "---color-orange-shallow-light-bg",
        inputBorder:     "---color-orange-border",
        alertBorder:     "---color-orange-xlight-border",
        selectionBg:     "---color-orange-shallow-light-bg"
    },

    pink: {
        menuHighlightBg: "---color-pink-xxxxxxlight-bg",
        inputBorder:     "---color-pink-xxxxlight-border",
        alertBorder:     "---color-pink-xxxxlight-border",
        selectionBg:     "---color-pink-xxxxxxlight-bg"
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
            --color-menu-highlight-bg: var(${colorChoice.menuHighlightBg});
            --color-input-border:      var(${colorChoice.inputBorder});

            --bs-focus-ring-color:
              rgb(from var(--color-input-border) r g b / var(--bs-focus-ring-opacity));

            --bs-box-shadow: 0 0.5rem 1rem var(--bs-focus-ring-color);
            --bs-box-shadow-sm: 0 0.125rem 0.25rem var(--bs-focus-ring-color);
            --bs-box-shadow-lg: 0 1rem 3rem var(--bs-focus-ring-color);
            --bs-box-shadow-inset: inset 1px 2px var(--bs-focus-ring-color);
          }

          ::selection {
            background-color: var(${colorChoice.selectionBg});
          }

          .alert {
            --bs-alert-border-color: var(${colorChoice.alertBorder});
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

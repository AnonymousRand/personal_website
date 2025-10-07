onDarkModeChange = addToFunc(onDarkModeChange, function(enabled) {
    const jqFooterIconGitHub = $("#footer__github-icon");
    if (jqFooterIconGitHub.length === 0) {
        return;
    }

    if (enabled) {
        jqFooterIconGitHub.attr("src", ICON_GITHUB_DARK_URL);
    } else {
        jqFooterIconGitHub.attr("src", ICON_GITHUB_LIGHT_URL);
    }
});

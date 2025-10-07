function onUrlFragmentNavigate(urlFragment) {
    const jqTarget = $(urlFragment);
    if (jqTarget.length === 0) {
        return;
    }

    const jqParentCollapsible = jqTarget.parents("details");
    if (jqParentCollapsible.length > 0) {
        jqParentCollapsible.attr("open", "");
    }
    // may need to manually correct scrolling position
    jqTarget.get(0).scrollIntoView();
}

$(document).ready(function() {
    $("#copy-permanent-link-btn").on("click", function() {
        navigator.clipboard.writeText(PERMANENT_LINK_URL);
        flashMsg(`Link copied: ${PERMANENT_LINK_URL}`);
    });

    $("#delete-post-btn").on("click", confirmWrapper(async function(e) {
        e.preventDefault();
        const respJson = await fetchWrapper({url: DELETE_POST_URL, method: "DELETE"});
        doAjaxBaseResponse(respJson);
    }));

    $(".heading-link").on("click", function(e) {
        let url = PERMANENT_LINK_URL + e.target.getAttribute("href");
        navigator.clipboard.writeText(url);
        flashMsg(`Link copied: ${url}`);
    });

    // open necessary collapsible if navigated to URL fragment on page load
    if (document.location.hash !== "") {
        onUrlFragmentNavigate(document.location.hash);
    }
});

// open necessary collapsible if navigated to URL fragment
$(window).on("hashchange", function() {
    onUrlFragmentNavigate(document.location.hash);
});

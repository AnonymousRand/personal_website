let scrollToNodeTimer;

// from https://github.com/w3c/csswg-drafts/issues/3744#issuecomment-2451949981; allow callback on `scrollIntoView()` finish
// so we can halt expansion of collapsible post sections until URL fragment scroll done
// to avoid messing up layout and causing scroll to end up in wrong place
// basically refresh a timer every time a scroll event is detected, and only call callback when timer finishes
function scrollToNodeWithCallback(node, callback) {
    const eventListenerCb = function() {
        clearTimeout(scrollToNodeTimer);
        scrollToNodeTimer = setTimeout(timerCb, 100);
    };
    const timerCb = function() {
        callback();
        document.removeEventListener("scroll", eventListenerCb);
    };
  
    scrollToNodeTimer = setTimeout(timerCb, 100);
    document.addEventListener("scroll", eventListenerCb);
    node.scrollIntoView();
};

function onUrlFragmentNavigate(urlFragment) {
    const jqTarget = $(urlFragment);
    if (jqTarget.length === 0) {
        return;
    }

    canExpandPostCollapsibleSections = false;
    const jqParentCollapsible = jqTarget.parents("details");
    if (jqParentCollapsible.length > 0) {
        jqParentCollapsible.attr("open", "");
    }
    // may need to manually correct scrolling position
    scrollToNodeWithCallback(jqTarget.get(0), function() {
        canExpandPostCollapsibleSections = true;
    });
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

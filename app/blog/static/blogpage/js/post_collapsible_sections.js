let canExpandPostCollapsibleSections = false;
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
    const jqTarget = $(urlFragment); // using JQuery selector since `querySelector()` doesn't allow `id`s starting with number
    if (jqTarget.length === 0) {
        return;
    }

    const nodeTarget = jqTarget.get(0);
    const jqParentDetails = $(nodeTarget).parents("details"); // yes, I know this isn't just collapsible sections
    if (jqParentDetails.length > 0) {
        let shouldOpen = true;
        // don't allow opening collapsible sections while scrolling to target to not shift layout and cause scroll to be wrong
        canExpandPostCollapsibleSections = false;
        // don't open collapsible if target is visible in `<summary>` portion of a collapsible that isn't a post collapsible section
        // (e.g. exercises dropdowns)
        jqParentDetails.each(function() {
            if (
                !jqParentDetails.is(".post__collapsible-section")
                && $.contains($(this).find("summary").first().get(0), nodeTarget)
            ) {
                shouldOpen = false;
                return false; // breaks out of `each()`
            }
        });
        if (shouldOpen) {
            jqParentDetails.attr("open", "");
        }
    }
    // may need to manually correct scrolling position
    // also wait until scroll finisehd to process opening collapsible sections
    // so we don't shift layout and cause scroll to be wrong
    scrollToNodeWithCallback(nodeTarget, function() {
        canExpandPostCollapsibleSections = true;
    });
}

// wrap all post `<h2>`s in a collapsible section
$("#post__content h2").each(function() {
    $(this).nextUntil("#post__content h2, #footnotes__wrapper, #post__end").addBack().wrapAll('<details class="post__collapsible-section"></details>');
    $(this).wrap('<summary></summary>');
});

// render MathJax and apply custom styling inside post collapsible sections on open
$(".post__collapsible-section").on("toggle", function(e) {
    if (e.target.open) {
        renderMathJaxNode(e.target);
        applyStylesNode(e.target);
    }
});

// open necessary collapsible if navigated to URL fragment
$(window).on("hashchange", function() {
    onUrlFragmentNavigate(document.location.hash);
});

$(document).ready(function() {
    // open necessary collapsibles if navigated to URL fragment on page load
    if (document.location.hash !== "") {
        onUrlFragmentNavigate(document.location.hash);
    }

    // automatically expand collapsible sections when on screen by attaching intersection observers
    const postScrollObserver = new IntersectionObserver(function(entries) {
        for (entry of entries) {
            if (entry.isIntersecting && canExpandPostCollapsibleSections) {
                entry.target.closest(".post__collapsible-section").setAttribute("open", "");
            }
        }
    }, {
        rootMargin: `-${window.getComputedStyle(document.body).getPropertyValue("--navbar-outer-height")} 0px 0px 0px`,
        threshold: "0.5"
    });
    $(".post__collapsible-section").each(function() {
        postScrollObserver.observe($(this).get(0));
    });
});

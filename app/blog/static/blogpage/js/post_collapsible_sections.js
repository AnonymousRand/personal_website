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
    const nodeTarget = document.querySelector(urlFragment);
    if (nodeTarget === null) {
        return;
    }

    canExpandPostCollapsibleSections = false;
    const jqParentDetails = $(nodeTarget).parents("details"); // yes, I know this isn't just collapsible sections
    if (jqParentDetails.length > 0) {
        // don't open collapsible if target is visible in `<summary>` portion
        let shouldOpen = true;
        jqParentDetails.each(function() {
            if ($.contains($(this).find("summary").first().get(0), nodeTarget)) {
                shouldOpen = false;
                return false; // breaks out of `each()`
            }
        });
        if (shouldOpen) {
            jqParentDetails.attr("open", "");
        }
    }
    // may need to manually correct scrolling position
    scrollToNodeWithCallback(nodeTarget, function() {
        canExpandPostCollapsibleSections = true;
    });
}

const postScrollObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting && canExpandPostCollapsibleSections) {
            entry.target.closest(".post__collapsible-section").setAttribute("open", "");
        }
    });
});

$("#post__content h2").each(function() {
    $(this).nextUntil("#post__content h2, #footnotes__wrapper, #post__end").addBack().wrapAll('<details class="post__collapsible-section"></details>');
    $(this).wrap('<summary></summary>');
});

$(".post__collapsible-section").on("toggle", function(e) {
    if (e.target.open) {
        renderMathJaxNode(e.target);
        applyStylesNode(e.target);
    }
});

// automatically expand collapsible sections when on screen
$(".post__collapsible-section").each(function() {
    postScrollObserver.observe($(this).get(0));
    $(this).find("p").each(function() {
        postScrollObserver.observe($(this).get(0));
    });
});

// open necessary collapsible if navigated to URL fragment
$(window).on("hashchange", function() {
    onUrlFragmentNavigate(document.location.hash);
});

$(document).ready(function() {
    // open necessary collapsible if navigated to URL fragment on page load
    if (document.location.hash !== "") {
        onUrlFragmentNavigate(document.location.hash);
    } else {
        canExpandPostCollapsibleSections = true;
    }
});

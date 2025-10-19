window.MathJax = {
    tex: {
        // custom macros from my notes (or all the ones MathJax supports, at least)
        macros: {
            arccot: "\\operatorname{arccot}",
            arccsc: "\\operatorname{arccsc}",
            arcsec: "\\operatorname{arcsec}",
            Aut: "\\operatorname{Aut}",
            blue: ["\\textcolor{blue}{#1}", 1],
            C: "\\mathbb{C}",
            charac: "\\operatorname{char}",
            comma: ",\\ ",
            ceil: ["\\left\\lceil #1 \\right\\rceil", 1],
            codom: ["\\operatorname{codom}"],
            coloneq: ["\\mathrel{≔}"],
            comb: ["{}^{#1}C_{#2}", 2],
            combv: ["\\begin{pmatrix} #1 \\\\ #2 \\end{pmatrix}", 2],
            ddx: ["\\frac{\\mathrm{d}}{\\mathrm{d} #1}", 1],
            dist: "\\operatorname{dist}",
            dom: "\\operatorname{dom}",
            dx: ["\\,\\mathrm{d} #1", 1],
            dydx: ["\\frac{\\mathrm{d} #1}{\\mathrm{d} #2}", 2],
            eqcolon: ["\\mathrel{≕}"],
            ev: "\\operatorname{ev}",
            F: "\\mathbb{F}",
            Fix: "\\operatorname{Fix}",
            floor: ["\\left\\lfloor #1 \\right\\rfloor", 1],
            Frac: "\\operatorname{Frac}",
            from: "\\leftarrow",
            ftc: ["\\left[#3\\right]_{#1}^{#2}", 3],
            Gal: "\\operatorname{Gal}",
            generator: ["\\langle #1 \\rangle", 1],
            GL: "\\operatorname{GL}",
            Hom: "\\operatorname{Hom}",
            id: "\\operatorname{id}",
            im: "\\operatorname{im}",
            innprod: ["\\langle #1 \\rangle", 1],
            lcm: "\\operatorname{lcm}",
            M: "\\operatorname{M}",
            Maps: "\\operatorname{Maps}",
            mapsfrom: "\\leftarrow\\!\\shortmid",
            mult: "\\operatorname{mult}",
            N: "\\mathbb{N}",
            nequiv: "\\not\\equiv",
            niff: "\\centernot\\iff",
            nimplies: "\\mathrel{\\rlap{\\hskip .5em/}}\\Longrightarrow",
            nul: "\\operatorname{nul}",
            nullity: "\\operatorname{nullity}",
            Orb: "\\operatorname{Orb}",
            perm: ["{}^{#1}P_{#2}", 2],
            pfpxpy: ["\\frac{\\partial^2 #1}{\\partial #2 \\partial #3}", 3],
            powerset: "\\mathcal{P}",
            ppx: ["\\frac{\\partial}{\\partial #1}", 1],
            ppxpy: ["\\frac{\\partial^2}{\\partial #1 \\partial #2}", 2],
            preim: "\\operatorname{preim}",
            pypx: ["\\frac{\\partial #1}{\\partial #2}", 2],
            Q: "\\mathbb{Q}",
            quats: "\\mathbb{H}",
            R: "\\mathbb{R}",
            rank: "\\operatorname{rank}",
            red: ["\\textcolor{red}{#1}", 1],
            restriction: "\\vert",
            sgn: "\\operatorname{sgn}",
            SL: "\\operatorname{SL}",
            spann: "\\operatorname{span}",
            Stab: "\\operatorname{Stab}",
            suchthat: "\\,\\vert\\,",
            suchthatlr: "\\,\\middle\\vert\\,",
            Sym: "\\operatorname{Sym}",
            tobij: "\\leftrightarrow",
            toinc: "\\hookrightarrow",
            toinj: "\\rightarrowtail",
            toiso: "\\xrightarrow{\\sim}",
            tosur: "\\twoheadrightarrow",
            trdeg: "\\operatorname{trdeg}",
            Z: "\\mathbb{Z}"
        }
    },
    startup: {
        // render nothing at first since this can be very slow on huge posts
        typeset: false
    },
    options: {
        enableEnrichment: false
    }
};

let isScrollingToUrlFrag = true;
let mathJaxUrlFragScrollRenderQueue = new Map();
let scrollToNodeTimer;

function renderMathJax(selectorOrNode) {
    MathJax.typesetClear([selectorOrNode]); // otherwise index size errros
    MathJax.typeset([selectorOrNode]);

    // make `\[\]` LaTeX blocks scroll horizontally on overflow
    const jqNode = $(selectorOrNode);
    jqNode.find("mjx-math[style='margin-left: 0px; margin-right: 0px;']").each(function() {
        if ($(this).parent(".scroll-overflow-x").length === 0) {
            $(this).wrap(HORIZ_SCROLL_DIV_HTML);
        }
    });
    // for `\tag{}`ed equations
    jqNode.find("mjx-math[width='full']").each(function() {
        if ($(this).parent(".scroll-overflow-x").length === 0) {
            $(this).parent("mjx-container").css("min-width", ""); // otherwise text just overflows
            $(this).wrap(HORIZ_SCROLL_DIV_HTML_FULL_WIDTH);
        }
    });
}

// from https://github.com/w3c/csswg-drafts/issues/3744#issuecomment-2451949981; allow callback on `scrollIntoView()` finish
// so we can halt detection of MathJax to render until URL fragment scroll is done to avoid lag spike
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

function onUrlFragNavigate(urlFrag) {
    const jqTarget = $(urlFrag); // using JQuery selector since `querySelector()` doesn't allow `id`s starting with number
    if (jqTarget.length === 0) {
        isScrollingToUrlFrag = false;
        return;
    }
    // wait until scroll finished to render MathJax
    isScrollingToUrlFrag = true;
    scrollToNodeWithCallback(jqTarget.get(0), function() {
        isScrollingToUrlFrag = false;
        // render queued elements that are still on screen at the end of the scroll, and then clear the queue
        for (const [k, v] of mathJaxUrlFragScrollRenderQueue) {
            if (v === true) {
                renderMathJax(k);
            }
        }
        mathJaxUrlFragScrollRenderQueue.clear();
    });
}

// for when URL fragment is navigated to after page load (e.g. TOC clicked)
$(window).on("hashchange", function(e) {
    e.preventDefault();
    onUrlFragNavigate(document.location.hash);
});

$(document).ready(function() {
    // for when URL fragment is navigated to as part of initially loaded URL
    if (document.location.hash !== "") {
        onUrlFragNavigate(document.location.hash);
    } else {
        isScrollingToUrlFrag = false;
    }

    // MathJax only renders when in view (so huge mathy posts don't crash phones)
    const intersectionObserver = new IntersectionObserver(function(entries) {
        for (entry of entries) {
            if (entry.isIntersecting) {
                if (!isScrollingToUrlFrag) {
                    renderMathJax(entry.target);
                } else {
                    // if currently scrolling to a URL fragment, don't render everything we scroll past just yet;
                    // add to a queue instead and wait until scroll finished to see which elements are still on screen
                    // (need to do this since intersection observer fires on visible elements at the end of the scroll
                    // a bit before the scroll ends, so without this queue, we can't detect them after setting
                    // `isScrollingToUrlFrag` after the scroll ends)
                    mathJaxUrlFragScrollRenderQueue.set(entry.target, true);
                }
            } else {
                // if currently scrolling to a URL fragment and an element previously detected on screen
                // during the same scroll leaves the screen, then unmark it for rendering
                if (isScrollingToUrlFrag && mathJaxUrlFragScrollRenderQueue.get(entry.target) === true) {
                    mathJaxUrlFragScrollRenderQueue.set(entry.target, false);
                }
            }
        }
    }, {rootMargin: "50% 0% 50% 0%"});
    const nodesToObserve = document.querySelectorAll("#post__content > *, #post__toc");
    nodesToObserve.forEach(function(node) {
        intersectionObserver.observe(node);
    });
});

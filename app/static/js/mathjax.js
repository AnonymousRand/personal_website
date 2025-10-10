function renderMathJaxSelector(selector) {
    const jqBase = $(selector);
    if (jqBase.length === 0) {
        return;
    }
    MathJax.typesetPromise([selector]);
}

function renderMathJaxNode(node) {
    const jqBase = $(node);
    if (jqBase.length === 0) {
        return;
    }
    MathJax.typesetPromise([node]);
}

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
            mapsfrom: "\\mathrel{\\style{display:inline-block; transform:scale(-1,1);}{\\mapsto}}",
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
            textand: "\\text{ and }",
            textor: "\\text{ or }",
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
    }
};

$(document).ready(function() {
    // make `\[\]` LaTeX blocks scroll horizontally on overflow
    $("mjx-math[style='margin-left: 0px; margin-right: 0px;']").wrap(HORIZ_SCROLL_DIV_HTML);
    // for `\tag{}`ed equations
    $("mjx-math[width='full']").each(function() {
        $(this).parent("mjx-container").css("min-width", ""); // otherwise text just overflows
        $(this).wrap(HORIZ_SCROLL_DIV_HTML_FULL_WIDTH);
    });

    // MathJax only renders when in view
    const intersectionObserver = new IntersectionObserver(function(entries) {
        for (entry of entries) {
            if (entry.isIntersecting) {
                MathJax.typesetPromise([entry.target]);
            }
        }
    });
    const nodesToObserve = document.querySelectorAll("#post__content > *");
    nodesToObserve.forEach(function(node) {
        intersectionObserver.observe(node);
    });
});

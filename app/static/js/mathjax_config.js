let onMathJaxTypeset = function(baseSelector) {
    const jqBase = $(baseSelector);
    if (jqBase.length === 0) {
        return;
    }

    // make `\[\]` LaTeX blocks scroll horizontally on overflow
    jqBase.find("mjx-math[style='margin-left: 0px; margin-right: 0px;']").wrap(HORIZ_SCOLL_DIV_HTML);
    // for `\tag{}`ed equations
    jqBase.find("mjx-math[width='full']").each(function() {
        $(this).parent("mjx-container").css("min-width", ""); // otherwise text just overflows
        $(this).wrap(HORIZ_SCOLL_DIV_HTML_FULL_WIDTH);
    });
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
            Hom: "\\operatorname{Hom}",
            id: "\\operatorname{id}",
            im: "\\operatorname{im}",
            innprod: ["\\langle #1 \\rangle", 1],
            lcm: "\\operatorname{lcm}",
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
        ready: function() {
            MathJax.startup.defaultReady();
            MathJax.startup.promise.then(function() {
                onMathJaxTypeset("body");
            });
        }
    }
};

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

    // use `link-target-self` class to override default behavior of `target="_blank"` for links on post pages
    // for links where you can't override `target` attribute in the HTML itself (e.g. dynamically generated links)
    $(".link-target-self").on("click", function(e) {
        e.target.setAttribute("target", "_self");
    });
});

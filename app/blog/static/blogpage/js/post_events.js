$(document).ready(function() {
    $("#copy-permanent-link-btn").on("click", function() {
        navigator.clipboard.writeText(PERMANENT_LINK_URL);
        customFlash(`Link copied: ${PERMANENT_LINK_URL}`);
    });

    $("#delete-post-btn").on("click", confirmWrapper(async function(e) {
        e.preventDefault();
        const respJson = await fetchWrapper({url: DELETE_POST_URL, method: "DELETE"});
        doAjaxBaseResponse(respJson);
    }));

    $(".heading-link").on("click", function(e) {
        let url = PERMANENT_LINK_URL + e.target.getAttribute("href");
        navigator.clipboard.writeText(url);
        customFlash(`Link copied: ${url}`);
    });
});

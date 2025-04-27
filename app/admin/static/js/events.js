$(document).ready(function() {
    $("#cancel_file_uploads-input").on("click", function() {
        $("#files-input").val("");
    });

    $("#cancel_delete_files-input").on("click", function() {
        $("#delete_files-input").val("");
    });

    $("#delete_post-input").on("click", confirmBtn(async function(e) {
        const respJson = await fetchWrapper(window.location.href, {method: "DELETE"});
        doAjaxResponseForm(respJson, e);
    }));
});

// use Ajax and `FormData` for all main form submissions for async error handling and stuff
$(document).ready(function() {
    $(".main-form").on("submit", async function(e) {
        e.preventDefault();
      
        const form = e.target;
        let formData = new FormData(form);
        let formAction = form.getAttribute("action");
        if (!formAction) {
            formAction = window.location.href;
        }
        const respJson = await fetchWrapper(
            formAction, {method: form.getAttribute("method"), body: formData}
        );
        doAjaxFormResponse(respJson, e);
    });
});

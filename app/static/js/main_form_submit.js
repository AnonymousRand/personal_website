// use Ajax and `FormData` for all main form submissions for async error handling and stuff
$(document).ready(function() {
    $(".main-form").on("submit", async function(e) {
        e.preventDefault();
      
        const form = e.target;
        // pass `e.originalEvent.submitter` to add `name=value` of submit button to form
        let formData = new FormData(form, e.originalEvent.submitter);
        let formAction = form.getAttribute("action");
        if (!formAction) {
            formAction = window.location.href;
        }
        const respJson = await fetchWrapper({url: formAction, method: form.getAttribute("method"), body: formData});
        doAjaxFormResponse(respJson, e);
    });
});

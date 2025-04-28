// use Ajax and `FormData` for all form submissions for async error handling and stuff
$(document).ready(function() {
    $("#main-form").on("submit", async function(e) {
        e.preventDefault();
      
        const form = e.target;
        let formData = new FormData(form);
        const respJson = await fetchWrapper(
            form.getAttribute("action"), {method: form.getAttribute("method"), body: formData}
        );
        doAjaxResponseForm(respJson, e);
    });
});

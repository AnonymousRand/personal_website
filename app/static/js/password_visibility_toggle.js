function togglePasswordVisibility(inputId, toggleId) {
    const jqInput = $(`#${inputId}`);

    if (jqInput.attr("type") === "password") {
        jqInput.attr("type", "text");
        setEyeWithoutSlash(toggleId);
    } else {
        jqInput.attr("type", "password");
        setEyeWithSlash(toggleId);
    }
}

function setEyeWithSlash(toggleId) {
    const jqToggle = $(`#${toggleId}`);
    jqToggle.removeClass("bi-eye");
    jqToggle.addClass("bi-eye-slash");
}

function setEyeWithoutSlash(toggleId) {
    const jqToggle = $(`#${toggleId}`);
    jqToggle.removeClass("bi-eye-slash");
    jqToggle.addClass("bi-eye");
}

$(document).ready(function() {
    $(".toggle-password-visibility").on("click", function(e) {
        const jqToggle = $(e.target);
        togglePasswordVisibility(jqToggle.attr("data-target"), jqToggle.attr("id"));
    });
});

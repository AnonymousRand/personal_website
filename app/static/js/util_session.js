const IS_USER_AUTHENTICATED = async function() {
    const respJson = await fetchWrapper({url: GET_SESSION_STATUS_URL, method: "GET"});
    return respJson.is_logged_in;
};

let onSamePageLogin = function() {
    $("#login-modal").modal("hide");
    $(".show-when-logged-out").attr("hidden", "");
    $(".show-when-logged-in").removeAttr("hidden");
};

// this can't do anything to prevent users from just closing the modal
// my principle is that letting an expired session simply continue viewing a restricted page with no ability to
// interact (since it will always ask for modal and not do anything) is not a huge deal
// (if I forgot to log out at public computer or something then we have a LOT of other problems)
function showLoginModal() {
    flashMsg("please log in :3");
    $("#login-modal").modal("show");
}

$(document).ready(function() {
    $("#login-modal__form").on("submit", async function(e) {
        e.preventDefault();

        let formData = new FormData(e.target);
        const respJson = await fetchWrapper({url: LOGIN_URL, method: "POST", body: formData});
        doAjaxFormResponse(respJson, e);

        if (respJson.success) {
            onSamePageLogin();
        }
    });

    $("#logout-link").on("click", confirmWrapper(async function(e) {
        e.preventDefault();
        const respJson = await fetchWrapper({url: LOGOUT_URL, method: "POST"});
    }));

    const jqModalLogin = $("#login-modal");
    // differentiate modal vs. non-modal logins for redirecting back
    jqModalLogin.find("#is_modal").val("true");

    $("#login-modal").on("show.bs.modal", function(e) {
        if (window.location.href.startsWith(LOGIN_URL)) {
            e.preventDefault();
            flashMsg("You're already on the login page, you doofus.");
        }
    });

    jqModalLogin.on("shown.bs.modal", function(e) {
        $(e.target).find("#password-input").focus();
    });

    // wipe contents and toggle password visibility off on hide
    jqModalLogin.on("hidden.bs.modal", function(e) {
        const jqInputPassword = $(e.target).find("#password-input");
        jqInputPassword.val("");
        if (jqInputPassword.attr("type") !== "password") {
            togglePasswordVisibility(jqInputPassword.attr("id"), "password-show");
        }
    });
});

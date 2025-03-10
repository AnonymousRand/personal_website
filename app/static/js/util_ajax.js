async function fetchWrapper(baseUrl, options, params=null) {
    if (!options) {
        options = {};
    }
    if (!options.headers) {
        options.headers = {};
    }
    options.headers["X-CSRFToken"] = csrfToken;
    options.headers["Accept"] = "application/json";
    options.credentials = "include";
    options.mode = "cors";

    let urlWithParams = new URL(baseUrl);
    if (params) {
        for (let key in params) {
            urlWithParams.searchParams.append(key, encodeURIComponent(params[key]));
        }
    }

    const resp = await fetch(urlWithParams, options);
    const respText = await resp.text();
    let respJson = null;
    try {
        respJson = JSON.parse(respText);
    } catch (e) {
        respJson = null;
    }

    // no error; base response
    if (resp.ok && respJson !== null) {
        // catch `relogin` key and make sure Ajax response doesn't continue to proceed
        if (respJson.relogin) {
            relogin();
            return {errorStatus: 401, hasHandledError: false};
        }

        doAjaxResponseBase(respJson);
        return respJson;
    }

    // some error occurred
    let hasHandledError = true;
    switch(resp.status) {
        case 429:
            customFlash("Please slow down :3");
            break;
        case 499:
            // CSRF token expiry; refresh CSRF token and resend the request if this is the case
            let newToken = respJson.new_csrf_token;
            reloadCSRF(newToken);

            // resend request with updated CSRF token in FormData (header refresh handled by recursive call)
            if (options.body && options.body instanceof FormData) {
                options.body.set("csrf_token", csrfToken);
            }
            return fetchWrapper(baseUrl, options, params);
            break;
        default:
            hasHandledError = false;
    }

    return {errorStatus: resp.status, hasHandledError: hasHandledError}
}

/**
 * Always-supported JSON keys:
 *     - `relogin`
 *     - `redir_url`
 *     - `flash_msg`
 *     - `is_redir_after_login`
 */
function doAjaxResponseBase(respJson) {
    if (respJson.redir_url) {
        let newUrl = new URL(decodeURIComponent(respJson.redir_url));

        // flash message after page load by appending message to URL as custom `flash_msg` param
        if (respJson.flash_msg) {
            newUrl.searchParams.append("flash_msg", encodeURIComponent(respJson.flash_msg));
        }
        if (respJson.is_redir_after_login) {
            newUrl.searchParams.append("is_redir_after_login", true);
        }

        window.location.href = newUrl;
    } else {
        // async flash message
        if (respJson.flash_msg) {
            customFlash(respJson.flash_msg);
        }
    }
}

function doAjaxResponseForm(respJson, submitEvent) {
    if (!respJson.redir_url && respJson.submission_errors) { 
        let errors = respJson.submission_errors;
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const jQField = $(submitEvent.target).find(`#${fieldName}-field`)
            jQField.find(`#${fieldName}-input`).addClass("is-invalid");
            jQField.find(".invalid-feedback").text(fieldErrors[0]);
        }
    }
}

function reloadCSRF(newToken) {
    csrfToken = newToken;
    $("input[name='csrf_token']").val(csrfToken); // reload hidden form fields
}

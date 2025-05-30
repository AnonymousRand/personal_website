async function fetchWrapper({url, method, body=null, params={}}) {
    let urlWithParams = new URL(url);
    for (const key in params) {
        urlWithParams.searchParams.append(key, encodeURIComponent(params[key]));
    }

    let options = {headers: {}};
    options.headers["X-CSRFToken"] = csrfToken;
    options.headers["Accept"] = "application/json";
    options.credentials = "include";
    options.mode = "cors";
    options.method = method;
    if (body) {
        options.body = body;
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
        // catch `needs_login` key and make sure Ajax response doesn't continue to proceed
        if (respJson.needs_login) {
            showLoginModal();
            return {errorStatus: 401, hasHandledError: false};
        }

        doAjaxBaseResponse(respJson);
        return respJson;
    }

    // some error occurred
    let hasHandledError = true;
    switch(resp.status) {
        case 429:
            flashMessage("please slow down :3");
            break;
        default:
            hasHandledError = false;
    }

    return {errorStatus: resp.status, hasHandledError: hasHandledError}
}

/**
 * Always-supported JSON keys:
 *     - `needs_login`
 *     - `redir_url`
 *     - `flash_msg`
 *     - `is_redir_after_login`
 */
function doAjaxBaseResponse(respJson) {
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
            flashMessage(respJson.flash_msg);
        }
    }
}

function doAjaxFormResponse(respJson, submitEvent) {
    if (!respJson.redir_url && respJson.submission_errors) { 
        let errors = respJson.submission_errors;
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const jqField = $(submitEvent.target).find(`#${fieldName}-field`)
            jqField.find(`#${fieldName}-input`).addClass("is-invalid");
            jqField.find(".invalid-feedback").text(fieldErrors[0]);
        }
    }
}

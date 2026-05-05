const jqIconBell = $("#unread-comments-notif-btn-icon");

// when logging in via modal on a `blog.` page/opening a `blog.` page as admin, check for notifications
onSamePageLogin = addToFunc(onSamePageLogin, function() {
    updateUnreadComments();
});

$(document).ready(async function() {
    if (await IS_USER_AUTHENTICATED()) {
        updateUnreadComments();
    }
});

async function updateUnreadComments() {
    let notifCount = await updateUnreadCommentsDropdown();
    if (notifCount > 0) {
        setBellWithNotif(notifCount);
    } else {
        setBellWithoutNotif();
    }
}

function setBellWithNotif(notifCount) {
    jqIconBell.removeClass("bi-bell");
    jqIconBell.addClass("bi-bell-fill");
    if (orgTitle !== null) {
        document.title = `(${notifCount}) ` + orgTitle;
    }
}

function setBellWithoutNotif() {
    jqIconBell.removeClass("bi-bell-fill");
    jqIconBell.addClass("bi-bell");
    if (orgTitle !== null) {
        document.title = orgTitle;
    }
}

async function updateUnreadCommentsDropdown() {
    const jqDropdownUnreadComments = $("#unread-comments-dropdown");

    // get posts with unread comments
    jqDropdownUnreadComments.html('<span class="dropdown-item">loading…</span>');
    const resp = await fetchWrapper({url: GET_POSTS_WITH_UNREAD_COMMENTS_URL, method: "GET"});
    if (resp.errorStatus) {
        jqDropdownUnreadComments.html('<span class="dropdown-item">unable to load posts :/</span>');
        return -1;
    }

    let postCount = Object.keys(resp).length;
    if (postCount === 0) {
        jqDropdownUnreadComments.html('<span class="dropdown-item">nothing here :P</span>');
        return 0;
    }

    let html = "";
    for (const [postTitle, v] of Object.entries(resp)) {
        html += `<a class="dropdown-item" href="${v.url}#comments">` +
                `<span class="custom-pink-shallow-light">(${v.unread_comment_count})</span> ` +
                `${postTitle}` +
                "</a>";
    }
    jqDropdownUnreadComments.html(html);
    return postCount;
}

let orgTitle = null;
$(document).ready(function() {
    orgTitle = document.title;

    // refresh notifications on click
    $("#unread-comments-notif-btn").on("click", function() {
        updateUnreadComments();
    });
});

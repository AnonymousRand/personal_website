// set this to `true` when in active maintenance!
const IS_IN_MAINTENANCE = false;

$(document).ready(async function() {
    if (IS_IN_MAINTENANCE
        && sessionStorage.getItem("hasSeenMaintenanceBanner") === null
        && !(await IS_USER_AUTHENTICATED()))
    {
        sessionStorage.setItem("hasSeenMaintenanceBanner", "true");
        flashMsg(
            "this website is currently undergoing maintenance, so things might look weird "
                + "or not work for now >_< thank you for your understanding ^^",
            true
        );
    }
});

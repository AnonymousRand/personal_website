$(document).ready(function() {
    // remove invalid input highlighting and error message when user inputs into field
    $(".form-control").on("input", function() {
        if ($(this).hasClass("is-invalid")) {
            $(this).removeClass("is-invalid");
            $(this).siblings(".invalid-feedback").text("");
        }
    });

    $("#meow-btn").on("click", function() {
        let rand = Math.random();
        let meowText;
        if (rand < 0.04) {
            meowText = "꒰ 𓂂• ⩊ •𓈒꒱";
        } else if (rand < 0.08) {
            meowText = "ฅ^>⩊<^ ฅ";
        } else if (rand < 0.12) {
            meowText = "♡ ₍^. .^₎Ⳋ";
        } else if (rand < 0.16) {
            meowText = "nya >⩊<";
        } else if (rand < 0.2) {
            meowText = "rawr >:333";
        } else {
            meowText = "meow :3";
        }
        flashMsg(meowText);
    });
});

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
        /* the first ones on here are the ones in the page footers :3 */
        if (rand < 0.03) {
            meowText = "꒰ 𓂂• ⩊ •𓈒꒱";
        } else if (rand < 0.06) {
            meowText = "ฅ^>⩊<^ ฅ";
        } else if (rand < 0.09) {
            meowText = "♡ ₍^. .^₎Ⳋ";
        } else if (rand < 0.12) {
            meowText = "≽^•⩊•^≼ ₊˚⊹♡";
        } else if (rand < 0.15) {
            meowText = "^>⩊<^";
        } else if (rand < 0.18) {
            meowText = "₊˚⊹♡ ᓚ₍ ^. .^₎";
        } else if (rand < 0.21) {
            meowText = "nya >⩊<";
        } else if (rand < 0.24) {
            meowText = "rawr >:333";
        } else {
            meowText = "meow :3";
        }
        flashMsg(meowText);
    });
});

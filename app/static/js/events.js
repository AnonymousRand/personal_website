$(document).ready(function() {
    // remove invalid input highlighting and error message when user inputs into field
    $(".form-control").on("input", function() {
        if ($(this).hasClass("is-invalid")) {
            $(this).removeClass("is-invalid");
            $(this).siblings(".invalid-feedback").text("");
        }
    });

    $("#meow-btn").on("click", function() {
        let meowText = Math.floor(Math.random() * 10) < 1 ? "rawr :333" : "meow :3";
        flashMsg(meowText);
    });
});

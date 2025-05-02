$(document).ready(function() {
    $("#hide-meow-button").on("mouseenter", function() {
        $("#meow-btn").addClass("invisible");
    });

    $("#hide-meow-button").on("mouseleave", function() {
        $("#meow-btn").removeClass("invisible");
    });
});

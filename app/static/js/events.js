$(document).ready(function() {
    $("#meow-btn").on("click", function() {
        let meow = Math.floor(Math.random() * 10) < 1 ? "rawr :333" : "meow :3";
        flashMessage(meow);
    });
});

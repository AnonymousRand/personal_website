function confirmWrapper(inner) {
    return function() {
        if (!confirm("mouse aim check :3")) {
            return false;
        }
        inner.apply(this, arguments);
    };
}

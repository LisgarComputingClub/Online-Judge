// Request comments when connected
socket.on("connect", function () {
    socket.emit("comments-request", {
        type: "problem",
        pid: pid
    });
});

// Recieve comments
socket.on("comments-response", function (data) {
    // Clear comments
    $("#comments-list").empty();
    // Add each comment to the list
    data.forEach(function (val, index, arr) {
        // Add a list item
        $("#comments-list").append('<a class="list-group-item"><h4 class="list-group-item-heading"><span class="comment-author">' + val.author + '</span> said</h4><p class="list-group-item-text">' + val.content + '</p></a>');
    });
});
if (connected) {
    socket.emit("comments-request", {
        type: type,
        pid: pid
    });    
}

// Request comments when connected
socket.on("connect", function () {
    socket.emit("comments-request", {
        type: type,
        pid: pid
    });
});

// =============
// Load comments
// =============

// Recieve comments
socket.on("comments-response", function (data) {
    // Comments are loaded
    commentsLoaded = true;
    // Clear comments
    $("#comments-list").empty();
    // Sort the array by date
    data.sort(function (a, b) {
        a = new Date(a.creationDate);
        b = new Date(b.creationDate);
        return a > b ? -1 : a < b ? 1 : 0;
    });
    // Add each comment to the list
    data.forEach(function (val, index, arr) {
        // Make a formatted date and time
        val.creationDate = new Date(val.creationDate);
        // Add a list item
        $("#comments-list").append('<li class="list-group-item"><h4 class="list-group-item-heading"><span class="comment-author"><a href="/profile?username=' + val.author + '">' + val.author + '</a></span> said on ' + val.creationDate.toLocaleDateString() + ' at ' + val.creationDate.toLocaleTimeString() + '</h4><p class="list-group-item-text">' + val.content + '</p></li>');
    });
});

// Ensure comments are loaded
var commentsLoaded = false;

function checkCommentsLoaded() {
    if (!commentsLoaded) {
        // Request comments
        socket.emit("comments-request", {
            type: type,
            pid: pid
        });
        // Set a timeout to check if comments are loaded again
        setTimeout(function () {
            checkCommentsLoaded();
        });
    }
}

// Set a timeout to check if comments are loaded
setTimeout(function () {
    checkCommentsLoaded();
});

// Start the error hidden
$("#comment-error").hide();

// ===============
// Submit comments
// ===============

// Get comment submissions
$("#comment-submit-button").click(function () {
    // Remove an error message if there is one
    $("#comment-error").hide();
    // Make an ajax request
    $.post("/comment", {
        contentType: type,
        contentId: pid,
        content: $("#comment-form").val()
    })
        .done(function (msg) {
            // Reload comments
            socket.emit("comments-request", {
                type: type,
                pid: pid
            });
        })
        .fail(function (xhr, textStatus, errorThrown) {
            // Alert the user of an error
            $("#comment-error").show();
        });
});
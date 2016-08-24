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
        var newComment = '<li class="list-group-item"><h4 class="list-group-item-heading"><span class="comment-author"><a href="/profile?username=' + val.author + '">' + val.author + '</a></span> said on ' + val.creationDate.toLocaleDateString() + ' at ' + val.creationDate.toLocaleTimeString();
        if (val.author == username) {
            newComment += ' <button data-id="' + val._id + '" id="comment-delete-button" class="btn btn-success pull-right">Delete</button>';
            newComment += ' <button data-id="' + val._id + '" id="comment-edit-button" class="btn btn-success pull-right">Edit</button>';
        }
        newComment += '</h4><div style="overflow: auto;" data-id="' + val._id + '"><p class="list-group-item-text">' + val.content + '</p></div></li>';
        $("#comments-list").append(newComment);
    });
});

socket.on("comment-delete-response", function(data) {
    if (data === false) {
        alert("Something went wrong, comment not deleted");
    }
    // Reload comments
    socket.emit("comments-request", {
        type: type,
        pid: pid
    });
});

socket.on("comment-edit-response", function(data) {
    if (data === false) {
        alert("Something went wrong, comment not edited");
    }
    // Reload comments
    socket.emit("comments-request", {
        type: type,
        pid: pid
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

$(document).on('click', '#comment-edit-button', function() {
   var d = $("div[data-id*=" + $(this).data("id") + "]");
   d.html('<textarea data-default="' + $("div[data-id*=" + $(this).data("id") + "] p:first").text() + '"id="comment-form" class="form-control">' + $("div[data-id*=" + $(this).data("id") + "] p:first").text() + '</textarea><br><button id="edit-cancel-button" class="btn btn-success pull-right">Cancel</button><button id="edit-save-button" data-id="' + $(this).data("id") + '" class="btn btn-success pull-right">Save</button>');
});

$(document).on('click', '#comment-delete-button', function() {
    socket.emit("comment-delete-request", $(this).data("id"));
});

$(document).on('click', '#edit-cancel-button', function() {
    $(this).parent().html('<p class="list-group-item-text">' + $(this).parent().children().eq(0).data("default") + '</p>');
});

$(document).on('click', '#edit-save-button', function() {
    var newText = $(this).parent().children().eq(0).val();
    socket.emit('comment-edit-request', {
        id: $(this).data("id"),
        text: newText
    });
    $(this).parent().html('<p class="list-group-item-text">' + newText + '</p>');
});

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
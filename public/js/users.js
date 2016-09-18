// List options
var options = {
    valueNames: ["username", "name", "school", "points", { attr: "href", name: "namelink" }, { attr: "href", name: "usernamelink" }]
};

// Initialize the list
var userList = new List("users-table-wrapper", options);

// Request the list of users when connected
socket.on("connect", function() {
    socket.emit("users-request");
});

// Get the list of users
socket.on("users-response", function(userArr) {
    // Remove everything already in table
    userList.clear();
    // Insert it into the table
    userArr.forEach(function(val, index, arr) {
        userList.add({ username: val.username, name: val.name, usernamelink: "/profile?username=" + val.username, namelink: "/profile?username=" + val.username, school: (val.school) ? val.school : "", points: val.points});
    });
    // Loop through table rows turning names into links
    $("#users-table-tbody > tr > td.username.usernamelink").each(function() {
        $(this).html('<a href="' + $(this).attr("href") + '">' + $(this).text() + "</a>");
    });
    $("#users-table-tbody > tr > td.name.namelink").each(function() {
        $(this).html('<a href="' + $(this).attr("href") + '">' + $(this).text() + "</a>");
    });
});

// Set beginning sort
userList.sort("points", { order: "desc" });

// Search help popover

// Enable the popover
$("#search-box").popover();

// Hide the popover when the user types in the search box
$("#search-box").keyup(function() {
    $("#search-box").popover("hide");
});
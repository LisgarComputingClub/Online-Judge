// Request profile data when the socket connects
socket.on("connect", function() {
    socket.emit("profile-request", username);
});

// Get the profile data
socket.on("profile-response", function(data) {
    console.log(data);
    // Fill in the profile info
    $("#profile-name").text(data.name);
    $("#profile-points").text(data.grader.points + " points")
    if(data.grader.age) {
        $("#profile-age").text(data.grader.age);
    } else {
        $("#profile-age").text("not set");
    }
    if(data.grader.school) {
        $("#profile-school").text(data.grader.school);
    } else {
        $("#profile-school").text("not set");
    }
    if(data.grader.website) {
        $("#profile-website").text(data.grader.website);
    } else {
        $("#profile-website").text("not set");
    }
    if(data.grader.bio) {
        $("#profile-bio").text(data.grader.bio);
    } else {
        $("#profile-bio").text("not set");
    }
    $("#solved-problems-header").append('   <span class="badge">' + data.grader.problemsSolved.length + '</span>');
    if(data.grader.problemsSolved.length > 0) {
        $("#solved-problems").append('<ul id="solved-problems-list">')
        data.grader.problemsSolved.forEach(function(val, index, arr) {
            $("#solved-problems-list").append('<li><a href="/problem?pid=' + val.pid + '">' + val.name + '</a></li>');
        });
        $("#solved-problems").append("</ul>");
    } else {
        $("#solved-problems").append('<p class="info">This user hasn\'t solved any problems.');
    }
});
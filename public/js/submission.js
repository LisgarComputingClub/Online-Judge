if (connected) {
	socket.emit("submission-request", sid);
}

socket.on("connect", function() {
	socket.emit("submission-request", sid);
});

socket.on("submission-response", function(data) {
	if (data == "unauth") {
		$("#submission-name").html("Submission " + sid);
		$("#submission-info").html("You are not authorized to view this submission");
		$("#submission-text").html("You may only view your own submissions, or submissions to problems which you have fully solved.");
	} else {
		$("#submission-name").html("Submission " + sid);
		$("#submission-info").html("Submitted by " + data.author + " on " + data.creation);
		$("#submission-text").html("<pre>" + data.code.replace("<", "&lt;").replace(">", "&gt;") + "</pre>");
	}
});
// List options
var options = {
    valueNames: ["name", "points", "partial", "languages", { attr: "href", name: "link" }]
};

// Initialize the list
var problemList = new List("problems-table-wrapper", options);

// Request the list of problems when connected
socket.on("connect", function() {
    socket.emit("problems-request");
});

// Get the list of problems
socket.on("problems-response", function(problemArr) {
    // Remove everything already in table
    problemList.clear();
    // Insert it into the table
    problemArr.forEach(function(val, index, arr) {
        problemList.add({ name: val.name, link: "/problem?pid=" + val.pid, points: val.points, partial: val.partial, languages: convertLanguages(val.languages).join(", ")});
    });
    // Loop through table rows turning names into links
    $("#problems-table-tbody > tr > td.name.link").each(function() {
        $(this).html('<a href="' + $(this).attr("href") + '">' + $(this).text() + "</a>");
    });
});

// Set beginning sort
problemList.sort("points", { order: "desc" });

// Toggle carets
$("#problems-list-thead-name").click(function() {
    // Hide the other caret
    $("#problems-list-thead-points").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-top glyphicon-triangle-bottom");
    // Toggle the other caret
    $("#problems-list-thead-points").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});

$("#problems-list-thead-points").click(function() {
    // Hide the other caret
    $("#problems-list-thead-name").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
    // Toggle the other caret
    $("#problems-list-thead-name").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});

// HackerRank's languages list
var hrLanguages = { "languages": { "names": { "c": "C", "cpp": "C++", "java": "Java", "csharp": "C#", "php": "PHP", "ruby": "Ruby", "python": "Python 2", "perl": "Perl", "haskell": "Haskell", "clojure": "Clojure", "scala": "Scala", "bash": "Bash", "lua": "Lua", "erlang": "Erlang", "javascript": "Javascript", "go": "Go", "d": "D", "ocaml": "OCaml", "pascal": "Pascal", "sbcl": "Common Lisp (SBCL)", "python3": "Python 3", "groovy": "Groovy", "objectivec": "Objective-C", "fsharp": "F#", "cobol": "COBOL", "visualbasic": "VB.NET", "lolcode": "LOLCODE", "smalltalk": "Smalltalk", "tcl": "Tcl", "whitespace": "Whitespace", "tsql": "T-SQL", "java8": "Java 8", "db2": "DB2", "octave": "Octave", "r": "R", "xquery": "XQuery", "racket": "Racket", "rust": "Rust", "fortran": "Fortran", "swift": "Swift", "oracle": "Oracle", "mysql": "MySQL" }, "codes": { "c": 1, "cpp": 2, "java": 3, "python": 5, "perl": 6, "php": 7, "ruby": 8, "csharp": 9, "mysql": 10, "oracle": 11, "haskell": 12, "clojure": 13, "bash": 14, "scala": 15, "erlang": 16, "lua": 18, "javascript": 20, "go": 21, "d": 22, "ocaml": 23, "r": 24, "pascal": 25, "sbcl": 26, "python3": 30, "groovy": 31, "objectivec": 32, "fsharp": 33, "cobol": 36, "visualbasic": 37, "lolcode": 38, "smalltalk": 39, "tcl": 40, "whitespace": 41, "tsql": 42, "java8": 43, "db2": 44, "octave": 46, "xquery": 48, "racket": 49, "rust": 50, "swift": 51, "fortran": 54 } } };

// Converts languages list into a nice formatted one
function convertLanguages(languages) {
    languages.forEach(function (val, index, arr) {
        arr[index] = hrLanguages.languages.names[val];
    });
    return languages;
}

// Help popover

// Enable the popover
$("#search-box").popover();

// Hide the popover when the user types in the search box
$("#search-box").keyup(function() {
    $("#search-box").popover("hide");
});
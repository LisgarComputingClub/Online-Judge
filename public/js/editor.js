// Request problem data when connected
socket.on("connect", function () {
    socket.emit("problem-request", pid);
});

// Get submission status
socket.on("submission-status", function (data) {
    switch (data) {
        case "received":
            $("#submission-status").text("Looking up problem in database...");
            break;
        case "found":
            $("#submission-status").text("Evaluating code...");
            break;
        case "evaluated":
            $("#submission-status").text("Results:");
            break;
        default:
            console.log("Unknown submission status.");
            break;
    }
});

// Display code results
socket.on("submission-results", function (data) {
    var results = data.results;
    var message = data.message;
    var time = data.time;

    if (results[0].substr(0, 4) == "solu") {
        $("div.modal-body").append('<div class="result-wrong">' + results[0].trunc(80) + '</div>');
    } else {
        // Create the list of results
        $("div.modal-body").append('<ul id="results-list">');

        // Add results to the list
        results.forEach(function (val, index, arr) {
            if (val === true) {
                $("#results-list").append("<li>[" + time[index] + "s] <div class=\"result-correct\">Correct</div></li>");
            } else if (val) {
                //System error; SIGSEV, SIGABRT, compile error, etc.
                $("#results-list").append("<li><div class=\"result-err\">" + (message[index] + ": " + val).trunc(80) + "</div></li>");
            } else if (message[index] == "Terminated due to timeout") {
                $("#results-list").append("<li>[" + time[index] + "s] <div class=\"result-tle\">Time Limit Exceeded</div></li>");
            } else if (message[index] == "Segmentation Fault") {
                $("#results-list").append("<li>[" + time[index] + "s] <div class=\"result-err\">Segmentation Fault</div></li>");
            } else {
                $("#results-list").append("<li>[" + time[index] + "s] <div class=\"result-wrong\">Wrong Answer</div></li>");
            }
        });

        // End the list
        $("div.modal-body").append("</ul>");
    }

    // Add a close button
    $("div.modal-content").append('<div id="result-footer" class="modal-footer"><button id="results-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>');
});

// Get the problem data
socket.on("problem-response", function (problem) {
    // Fill in problem info
    $("#problem-name-edit").text(problem.name).editable();
    simplemde.value(problem.statement);
    $("#problem-info").text(problem.points + " points, " + ((problem.partial) ? "" : "no ") + " partials. Allowed languages: " + convertLanguages(problem.languages).join(", "));
    languages = problem.languages;

    // Fill the languages dropdown
    for (var key in hrLanguages.languages.names) {
        if (hrLanguages.languages.names.hasOwnProperty(key)) {
            // Check if this language is allowed
            if (languages[0] == undefined || languages.indexOf(hrLanguages.languages.names[key]) > -1) {
                dropdown.push({
                    name: hrLanguages.languages.names[key],
                    code: hrLanguages.languages.codes[key],
                    lang: getKeyByValue(hrLanguages.languages.names, hrLanguages.languages.names[key])
                });
            }
        }
    }

    // Sort the dropdown
    dropdown.sort(function (a, b) { return (a.lang > b.lang) ? 1 : ((b.lang > a.lang) ? -1 : 0); });

    // Fill the dropdown
    dropdown.forEach(function (val, index, arr) {
        $("#lang-dropdown-list").append('<li><a class="set-lang noselect" data-target="#" data-name="' + val.name + '" data-lang="' + val.lang + '" data-code="' + val.code + '">' + val.name + '</a></li>');
    });

    // Remove the loading item
    $("#lang-dropdown-list li").first().remove();

    // Set the current language
    curLang = dropdown[0];

    // Set the editor language
    editor.getSession().setMode("ace/mode/" + dropdown[0].lang);

    // Set the dropdown button text
    $("#lang-button").html(dropdown[0].name + ' <span class="caret"></span>');

    // Retrigger MathJax
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
});

// Dropdown languages
var dropdown = [];

// Current language
var curLang;

// Problem editor
var editor = ace.edit("editor");
ace.require("ace/ext/language_tools");

// Preferences
editor.setOptions({
    useWrapMode: true,
    highlightActiveLine: true,
    showPrintMargin: false,
    theme: 'ace/theme/cobalt',
    mode: 'ace/mode/javascript',
    basicBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

// Change language
$(document).on("click", ".set-lang", function (event) {
    // Set the current language
    curLang = {
        name: $(this).data("name"),
        code: $(this).data("code"),
        lang: $(this).data("lang")
    };

    // Set the editor language
    editor.getSession().setMode("ace/mode/" + $(this).data("name"));

    // Set the dropdown button text
    $("#lang-button").html($(this).data("name") + ' <span class="caret"></span>');
});

// Submit code
$("#submit-button").click(function () {
    // Open the submission modal
    $("#result-modal").modal({
        backdrop: false,
        keyboard: false
    });

    // Create the code object
    var code = {
        code: editor.getValue(),
        lang: curLang.code,
        pid: pid
    };

    // Send the submission to the server
    socket.emit("code-submission", code);
});

// Fires when the results modal closes
$('#result-modal').on("hidden.bs.modal", function (event) {
    // Clear the results modal
    $("#submission-status").text("Sending code to server...");
    $("#results-list").remove();
    $("#result-footer").remove();
});

// Fires when the page has loaded
$(document).ready(function () {
    // Sort the list of languages
    hrLanguages.languages.names = sortObj(hrLanguages.languages.names, "value");
    
    // Add list of languages
    var count = 0;
    for (key in hrLanguages.languages.names) {
        // Selector for current column
        let selector;
        if (count < 14) {
            selector = "#allowed-languages-left";
        } else if (count < 28) {
            selector = "#allowed-languages-centre";
        } else {
            selector = "#allowed-languages-right";
        }

        // Add the language
        $(selector).append('<div class="checkbox"><label><input class="allowed-languages-checkbox" type="checkbox" data-toggle="toggle" data-code="' + key + '"> ' + hrLanguages.languages.names[key] + '</label></div>');

        // Increase the count
        count++;
    }

    // Turn the checkboxes into toggles
    $(".allowed-languages-checkbox").bootstrapToggle();

    // Enable the controls
    $(".allowed-languages-control-button").prop("disabled", false);
});

// Select all and none allowed languages
$("#allowed-languages-control-select-all").click(function () {
    $(".allowed-languages-checkbox").bootstrapToggle("on");
});

$("#allowed-languages-control-select-none").click(function () {
    $(".allowed-languages-checkbox").bootstrapToggle("off");
});

// Functions

// Converts languages list into a nice formatted one
function convertLanguages(languages) {
    languages.forEach(function (val, index, arr) {
        arr[index] = hrLanguages.languages.names[val];
    });
    return languages;
}

// Get a key for a value
function getKeyByValue(obj, value) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop] === value)
                return prop;
        }
    }
}

// Other

String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
};

// Sort an object
function sortObj(obj, type, caseSensitive) {
    var temp_array = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (!caseSensitive) {
                key = (key['toLowerCase'] ? key.toLowerCase() : key);
            }
            temp_array.push(key);
        }
    }
    if (typeof type === 'function') {
        temp_array.sort(type);
    } else if (type === 'value') {
        temp_array.sort(function (a, b) {
            var x = obj[a];
            var y = obj[b];
            if (!caseSensitive) {
                x = (x['toLowerCase'] ? x.toLowerCase() : x);
                y = (y['toLowerCase'] ? y.toLowerCase() : y);
            }
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    } else {
        temp_array.sort();
    }
    var temp_obj = {};
    for (var i = 0; i < temp_array.length; i++) {
        temp_obj[temp_array[i]] = obj[temp_array[i]];
    }
    return temp_obj;
};

// HackerRank's languages list
var hrLanguages = { "languages": { "names": { "c": "C", "cpp": "C++", "java": "Java", "csharp": "C#", "php": "PHP", "ruby": "Ruby", "python": "Python 2", "perl": "Perl", "haskell": "Haskell", "clojure": "Clojure", "scala": "Scala", "bash": "Bash", "lua": "Lua", "erlang": "Erlang", "javascript": "Javascript", "go": "Go", "d": "D", "ocaml": "OCaml", "pascal": "Pascal", "sbcl": "Common Lisp (SBCL)", "python3": "Python 3", "groovy": "Groovy", "objectivec": "Objective-C", "fsharp": "F#", "cobol": "COBOL", "visualbasic": "VB.NET", "lolcode": "LOLCODE", "smalltalk": "Smalltalk", "tcl": "Tcl", "whitespace": "Whitespace", "tsql": "T-SQL", "java8": "Java 8", "db2": "DB2", "octave": "Octave", "r": "R", "xquery": "XQuery", "racket": "Racket", "rust": "Rust", "fortran": "Fortran", "swift": "Swift", "oracle": "Oracle", "mysql": "MySQL" }, "codes": { "c": 1, "cpp": 2, "java": 3, "python": 5, "perl": 6, "php": 7, "ruby": 8, "csharp": 9, "mysql": 10, "oracle": 11, "haskell": 12, "clojure": 13, "bash": 14, "scala": 15, "erlang": 16, "lua": 18, "javascript": 20, "go": 21, "d": 22, "ocaml": 23, "r": 24, "pascal": 25, "sbcl": 26, "python3": 30, "groovy": 31, "objectivec": 32, "fsharp": 33, "cobol": 36, "visualbasic": 37, "lolcode": 38, "smalltalk": 39, "tcl": 40, "whitespace": 41, "tsql": 42, "java8": 43, "db2": 44, "octave": 46, "xquery": 48, "racket": 49, "rust": 50, "swift": 51, "fortran": 54 } } };
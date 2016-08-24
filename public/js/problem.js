if (connected) {
    socket.emit("problem-request", pid);
}

// Request problem data when connected
socket.on("connect", function () {
    socket.emit("problem-request", pid);
});

// Get submission status
socket.on("submission-status", function(data) {
    if (typeof data == "number") {
        for (var i = 0; i < data; i++) {
            $("#results-list").append("<li id=\"test-result-" + i.toString()  + "\">Case " + i.toString() + "</li>");
        }
    } else {
        switch(data) {
            case "received":
                $("#submission-status").text("Looking up problem in database...");
                break;
            case "found":
                $("#submission-status").text("Evaluating code...");
                break;
            case "evaluated":
                $("#submission-status").text("Results:");

                // Create the list of results
                $("div.modal-body").append('<ul id="results-list">');
                // End the list
                $("div.modal-body").append("</ul>");
        
                // Add a close button
                $("div.modal-content").append('<div id="result-footer" class="modal-footer"><button id="results-button" type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>');
                break;
            default:
                console.log("Unknown submission status.");
                break;
        }
    }
});

// Display code results
socket.on("submission-results", function(data) {
    var result = data.results[0];
    console.log(result);
    if (typeof result == "string" && result.substr(0, 4) == "solu") {
        $("div.modal-body").append('<div class="result-wrong">' + result.trunc(80) + '</div>');
    } else {

        var message = data.message[0];
        var time = data.time[0];
        // Add results to the list
        if (result === true) {
            $("#test-result-" + data.casen.toString()).html("<li>[" + time + "s] <div class=\"result-correct\">Correct</div></li>");
        } else if (result) {
                //System error; SIGSEV, SIGABRT, compile error, etc.
                $("#test-result-" + data.casen.toString()).html("<li><div class=\"result-err\">" + (message + ": " + val).trunc(80) + "</div></li>");
        } else if (message == "Terminated due to timeout") {
                $("#test-result-" + data.casen.toString()).html("<li>[" + time + "s] <div class=\"result-tle\">Time Limit Exceeded</div></li>");
        } else if (message == "Segmentation Fault") {
                $("#test-result-" + data.casen.toString()).html("<li>[" + time + "s] <div class=\"result-err\">Segmentation Fault</div></li>");
        } else {
                $("#test-result-" + data.casen.toString()).html("<li>[" + time + "s] <div class=\"result-wrong\">Wrong Answer</div></li>");
        }
    }
});

// Get the problem data
socket.on("problem-response", function (problem) {
    // Fill in problem info
    $("#problem-name").text(problem.name);
    $("#problem-statement").html(marked(problem.statement));
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

    if (editor != undefined) {
        // Set the editor language
        editor.getSession().setMode("ace/mode/" + curLang.lang);

        // Set the dropdown button text
        $("#lang-button").html(curLang.name + ' <span class="caret"></span>');
    }
    // Retrigger MathJax
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
});

// Dropdown languages
var dropdown = [];

// Current language
var curLang;
var editor;

$.getScript('//cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ace.js',function(){
  $.getScript('//cdnjs.cloudflare.com/ajax/libs/ace/1.2.4/ext-language_tools.js',function(){
  
        ace.require("ace/ext/language_tools");
        editor = ace.edit("editor");
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

        if (curLang != undefined) {
            // Set the editor language
          //  editor.getSession().setMode("ace/mode/" + curLang.mode);
            //alert(curLang.lang);
            // Set the dropdown button text
            $("#lang-button").html(curLang.name + ' <span class="caret"></span>');
        }
    });
});

// Change language
$(document).on("click", ".set-lang", function (event) {
    if (editor != undefined) {
        // Set the current language
        curLang = {
            name: $(this).data("name"),
            code: $(this).data("code"),
            lang: $(this).data("lang")
        };
        console.log(curLang);
        // Set the editor language
        editor.getSession().setMode("ace/mode/" + $(this).data("lang"));

        // Set the dropdown button text
        $("#lang-button").html($(this).data("name") + ' <span class="caret"></span>');
    }
});

// Submit code
$("#submit-button").click(function() {
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
$('#result-modal').on("hidden.bs.modal", function(event) {
    // Clear the results modal
    $("#submission-status").text("Sending code to server...");
    $("#results-list").remove();
    $("#result-footer").remove();
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

String.prototype.trunc = 
      function(n){
          return this.substr(0,n-1)+(this.length>n?'&hellip;':'');
      };

// HackerRank's languages list
var hrLanguages = { "languages": { "names": { "c": "C", "cpp": "C++", "java": "Java", "csharp": "C#", "php": "PHP", "ruby": "Ruby", "python": "Python 2", "perl": "Perl", "haskell": "Haskell", "clojure": "Clojure", "scala": "Scala", "bash": "Bash", "lua": "Lua", "erlang": "Erlang", "javascript": "Javascript", "go": "Go", "d": "D", "ocaml": "OCaml", "pascal": "Pascal", "sbcl": "Common Lisp (SBCL)", "python3": "Python 3", "groovy": "Groovy", "objectivec": "Objective-C", "fsharp": "F#", "cobol": "COBOL", "visualbasic": "VB.NET", "lolcode": "LOLCODE", "smalltalk": "Smalltalk", "tcl": "Tcl", "whitespace": "Whitespace", "tsql": "T-SQL", "java8": "Java 8", "db2": "DB2", "octave": "Octave", "r": "R", "xquery": "XQuery", "racket": "Racket", "rust": "Rust", "fortran": "Fortran", "swift": "Swift", "oracle": "Oracle", "mysql": "MySQL" }, "codes": { "c": 1, "cpp": 2, "java": 3, "python": 5, "perl": 6, "php": 7, "ruby": 8, "csharp": 9, "mysql": 10, "oracle": 11, "haskell": 12, "clojure": 13, "bash": 14, "scala": 15, "erlang": 16, "lua": 18, "javascript": 20, "go": 21, "d": 22, "ocaml": 23, "r": 24, "pascal": 25, "sbcl": 26, "python3": 30, "groovy": 31, "objectivec": 32, "fsharp": 33, "cobol": 36, "visualbasic": 37, "lolcode": 38, "smalltalk": 39, "tcl": 40, "whitespace": 41, "tsql": 42, "java8": 43, "db2": 44, "octave": 46, "xquery": 48, "racket": 49, "rust": 50, "swift": 51, "fortran": 54 } } };
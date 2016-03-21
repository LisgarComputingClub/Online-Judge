var editor = ace.edit(editor);
editor.setTheme("/js/ace/theme/github");
editor.getSession().setMode("/js/ace/mode/c");
$(function() {
	$('.dropdown-toggle').dropdown();
	$('#set-lang-c').click(function() {
		editor.getSession().setMode("/js/ace/mode/c");
	});
	$('#set-lang-c++').click(function() {

	});
	$('#set-lang-ruby').click(function() {
		editor.getSession().setMode("/js/ace/mode/ruby");
	});
});
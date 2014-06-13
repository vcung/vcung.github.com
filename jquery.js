$(function() {


$("#about_link").on('click', function() {

    $("#contact").hide();
    $("#resume").hide();
	$("#home").show();
});
$("#resume_link").click(function() {
    $("#home").hide();
    $("#contact").hide();
	$("#resume").show();
	
   });

$("#contact_link").on('click', function() {
	$("#home").hide()
    $("#resume").hide();
	$("#contact").show();
});

});




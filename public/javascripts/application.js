// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
jQuery(document).ready(function(){

jQuery("#menu td div").mouseenter(
  function () {
	jQuery(this).animate({
		backgroundColor:"#be0000",
    }, 500 );
});

jQuery("#menu td div").mouseleave(function() {
	jQuery(this).animate({
		backgroundColor:"#fff",
    }, 50 );
});

});
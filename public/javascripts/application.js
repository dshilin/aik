// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
jQuery(document).ready(function(){

jQuery(".ddsmoothmenu ul li a").mouseenter(
  function () {
	jQuery(this).animate({
		backgroundColor:"#be0000",
    }, 500 );
});

jQuery(".ddsmoothmenu ul li a").mouseleave(function() {
	jQuery(this).animate({
		backgroundColor:"#848484",
    }, 50 );
});

});
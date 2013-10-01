// This code checks to see if you are online. Additionally, it will
// read from your XML public feed if you are in development mode 
// (if you comment out the AdobeLibraryAPI.js library),
// so that you have results while testing.
$(document).ready(function() {
	function init(isAPIAvailable) {
		
		// Check to see if there is an internet connection.
		$.ajax({
			type: "POST",
			datatype: "xml",
			// NOTE: the accountId is critical to getting the correct folio library. 
			// You will need to modify this accordingly for your new application.
			url: "http://lighthouse.adobe.com/dps/v2_library_store_templates/fulfillment_proxy.php?accountId=78e854ef3b4342d8a49f3fc51a898fb0",
			data: "",
			success: function(xhresp,stat) {
				// Set a flag for the API availability in the ADOBE namespace.
				ADOBE.isAPIAvailable = isAPIAvailable;
				
				loadOnline(isAPIAvailable,$(xhresp).find("issue"));
				
			},
			
			// Display the offline messaging if unable to connect.
			error: function() {
				$("body").html('');
				$("body").append("<div id='imageContainer'><img id='bgImage' src='Offline.gif'></div>");
			}
		});
	}

	// To test on the desktop remove the JavaScript include for AdobeLibraryAPI.js in index.html. this will cause adobeDPS to be undefined
	if (typeof adobeDPS == "undefined"){ // Call init() immediately. This will be the case for dev on the desktop.
		init(false); 
		$(window).trigger('hashchange');
	}
	else{								// API is available so wait for adobeDPS.initializationComplete.
		
		adobeDPS.initializationComplete.addOnce(function(){ 
			init(true);
			$(window).trigger('hashchange');
		 });
	}
	$('.filterbutton').bind('touchstart click', function(e) {
		if ($(e.target).hasClass('filterbutton')){
			$('#banner').css('background-image','url(\''+$(this).data('banner')+'\')');        	
			$('.filterbutton').removeClass('hovering');
			$(this).addClass('hovering');

			$('#deploystatusbanner').removeClass();
			$('#deploystatusbanner').addClass($(this).data('deploystatus'));
			ADOBE.FolioFilter=$(this).data('filter');
			ADOBE.liveFolios.filter(ADOBE.FolioFilter).render();
		}
		e.preventDefault()    
	});
	$('.tophover').bind('touchstart click', function(e) {
		$('.filters').toggleClass('hovering');
		if (!$('.filters').hasClass('hovering')) $('.filterbutton').removeClass('hovering');		e.preventDefault();
	});
	$('.subcat').bind('touchstart click',function(e){    	
		ADOBE.FolioFilter=$(this).parent().parent().data('filter')+'|'+$(this).text();        
		ADOBE.liveFolios.filter(ADOBE.FolioFilter).render();
        //$('#menubtn').text($(this).text());
        $('.hovering').removeClass('hovering');
        $('.filters').addClass('hovering');
        $(this).addClass('hovering');
        e.preventDefault();
    });
});


function togglePage(pageRef) {
	switch(pageRef){

		case "it":
			$("link[href*='iPadmain-it.css']").attr({"disabled":false});
			$("link[href*='iPadmain-health.css']").attr({"disabled":true});
			$("link[href*='iPadmain-home.css']").attr({"disabled":true});
			ADOBE.FolioFilter='Adobe';
			ADOBE.liveFolios.filter(ADOBE.FolioFilter).render();
			break;

		case "health":
			$("link[href*='iPadmain-it.css']").attr({"disabled":true});
			$("link[href*='iPadmain-health.css']").attr({"disabled":false});
			$("link[href*='iPadmain-home.css']").attr({"disabled":true});
			ADOBE.FolioFilter='Creative';
			ADOBE.liveFolios.filter(ADOBE.FolioFilter).render();
			break;

		case "#":
		default:
			$("link[href*='iPadmain-it.css']").attr({"disabled":true});
			$("link[href*='iPadmain-health.css']").attr({"disabled":true});
			$("link[href*='iPadmain-home.css']").attr({"disabled":false});
			ADOBE.FolioFilter='';
			ADOBE.liveFolios.filter(ADOBE.FolioFilter).render();
			break;
		
	}

}

$(window).bind( 'hashchange', function(e) {
	togglePage(e.fragment);
	});


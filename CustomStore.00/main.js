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
	}
	else{								// API is available so wait for adobeDPS.initializationComplete.
		
		adobeDPS.initializationComplete.addOnce(function(){ init(true) });
	}
});






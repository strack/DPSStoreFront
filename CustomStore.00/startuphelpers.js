
var ADOBE = ADOBE || {};

function displog(txt){
	var curtxt = $('#displog').text();
	curtxt +=txt + "---     ";
	$('#displog').text(curtxt);
}


function loadOnline(isAPIAvailable,xdoc){


	// Instantiate the Renderer...
	ADOBE.liveFolios = new ADOBE.Folios('#folios');
	// Set the filter on the renderer, if needed...
	ADOBE.liveFolios.filter(ADOBE.FolioFilter);
	// Instantiate the controller...
	ADOBE.liveController = new ADOBE.DPSController();
	// Initialize the controller (pass the renderer)
	ADOBE.liveController.init(ADOBE.liveFolios,xdoc);

	if (!isAPIAvailable) return;
	// TODO: Add a listener for when folios are added. This does not correspond to when
	// a new folio is pushed rather when the viewer is aware of new folios.
	
}



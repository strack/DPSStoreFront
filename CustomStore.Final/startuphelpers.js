
var ADOBE = ADOBE || {};

function loadOnline(isAPIAvailable,xdoc){

	// instantiate the folios section...
	ADOBE.liveFolios = new ADOBE.Folios('#folios');
	ADOBE.liveFolios.filter(ADOBE.FolioFilter);
	ADOBE.liveController = new ADOBE.DPSController();
	// call the controller to populate
	ADOBE.liveController.init(ADOBE.liveFolios,xdoc);

	if (!isAPIAvailable) return;
	// Add a listener for when folios are added. This does not correspond to when
	// a new folio is pushed rather when the viewer is aware of new folios.
	adobeDPS.libraryService.folioMap.addedSignal.add(function(folios) {
		for (var i = 0; i < folios.length; i++) {
			ADOBE.liveController.addFolio(folios[i]);

		}
	});
}



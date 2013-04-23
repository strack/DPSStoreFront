/*

Steps to creating a custom storefront:
1- Set up the user / application
2- find your application ID: 
3- build your folio(s) and publish them, with the proper filter ID.
4- Build our custom storefront HTML template / text offline
5- Build our custom application / test online
6- cleanup (removing external source links)
7- deploy


*/


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



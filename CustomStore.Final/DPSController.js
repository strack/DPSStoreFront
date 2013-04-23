var ADOBE = ADOBE || {};

ADOBE.DPSController = function(){
	var foliolist = [];
	var currentRenderer;
	var currentData =[];


	function broker(){
		return foliolist;
	}

	broker.init = function(_r,xdoc)
	{
		
		if (!arguments.length) _r = new ADOBE.Folios('#folios');
		

		broker.renderer(_r);
		
		if (ADOBE.isAPIAvailable){
			
			broker.onlineLoad();
		}
		else{
			
			broker.offlineLoad(xdoc)
		}

		return broker;
	};

	broker.renderer = function(_r){
		
		if (!arguments.length) return currentRenderer;
		currentRenderer = _r;
		return broker;
	};

	broker.offlineLoad = function(xdoc){

		// prep each returned XML Node individually via JQuery's .each...
		xdoc.each(function(){

			// prep the individual data item.
			var datItem = ADOBE.datumFromXML(this);

			// check to see that we got a value back. if we did, push it. push it real good.
			if (datItem) currentData.push(datItem);
		});

		broker.update();
		return broker;
	};

	broker.onlineLoad = function(){

		
		var list = adobeDPS.libraryService.folioMap.sort(function (a, b) {
			if (a.publicationDate < b.publicationDate)
				return 1;
			else if (a.publicationDate > b.publicationDate)
				return -1;
			else
				return 0;
		});

		broker.folios(list);

		return broker;
	};

	broker.update = function(){
		
		
		if (currentRenderer && currentData.length)
		{
			currentRenderer.render(currentData);
		}

		return broker;
	};

	broker.addFolio = function(folio,silent){

		
		
		
		if (foliolist) foliolist.push(folio);
		var datItem = ADOBE.datumFromDPS(folio);

		var transaction = folio.getPreviewImage(287, 250, false);
		
		// we need to add the previewImageURL logic, which is asynchronous
		// we do that here by checking to see if the image download is complete, and then updating the folioData if so.
		transaction.completedSignal.addOnce(function(transaction) {
			if (transaction.state == adobeDPS.transactionManager.transactionStates.FINISHED) {
				var tfolio = broker.folioData(transaction.folio.id);
				tfolio.previewImageURL = transaction.previewImageURL;
				broker.updateFolioData(tfolio,true);
				//$('#ppane-'+transaction.folio.id).css('background-image','url('+transaction.previewImageURL+')');
			}
		});
		if (datItem) currentData.push(datItem);

		// same thing here, we only need to update if the filter matches or is absent.
		if (!silent && (ADOBE.FolioFilter.length==0 || folio.filter == ADOBE.FolioFilter)){
			broker.update();
		}

		// we now want to hook up changes/updates to the folio.
		datItem.updatedSignal.add(broker.updatedSignalHandler,datItem);

		return broker;
	};

	broker.folios = function (_f){

		
		if (!arguments.length) return foliolist;

		if (_f && _f.length){
			foliolist = [];
			currentData = [];
			for (var i in _f)
			{
				
				broker.addFolio(_f[i],true);

			}

			broker.update();
		}
		return broker;
	};

	broker.updateFolioData = function(folio,refresh){
		for (var i = 0; i < currentData.length; i++)
		{
			if (currentData[i].id === folio.id)
			{
				currentData[i] = folio;
			}
		}

		// There is no reason to refresh if the folio isn't going to be displayed anyway
		// Such is the case if the FolioFilter doesn't match the folio.filter
		if (refresh &&(ADOBE.FolioFilter.length==0 || folio.filter == ADOBE.FolioFilter)) {

			broker.update();
		}
		return broker;
	};

	broker.folioData = function(_id){
		return _.find(currentData, function(d){
			return d.id == _id;
		});
	};

	broker.folio = function(_id){
		return _.find(foliolist, function(d){
			return d.id == _id;
		});
	};

	broker.openFolio = function(f_id){

		try{
			var curfolio = broker.folio(f_id);

			if (!curfolio) return;

			var state = curfolio.state;

			if (state == adobeDPS.libraryService.folioStates.PURCHASABLE) {
				curfolio.purchase();
			} else if (state == adobeDPS.libraryService.folioStates.INSTALLED || curfolio.isViewable) {
				curfolio.view();
			} else if (state == adobeDPS.libraryService.folioStates.ENTITLED) {
				curfolio.download();
			}
		}
		catch (err)
		{

		}
	};

	broker.updatedSignalHandler = function(properties){

		
		
		// // If there is a current transaction then start tracking it.
		if ((properties.indexOf("state") > -1 || properties.indexOf("currentTransactions") > -1) && this.currentTransactions.length > 0){
			

		// 	// If there's a state change, we're going to update the folio badge
		// 	if (properties.indexOf("state" > -1)){
		// 		var tfolio = broker.folioData(this.id);
		// 		if (tfolio.state !== this.state){  // we check to see if the there's a state change. if not, move on.

		// 			tfolio.state = this.state;
		// 			broker.updateFolioData(tfolio,true);
		// 	}
		// }

		if (properties.indexOf("currentTransactions" > -1)){
			if (this.isTrackingTransaction) //we don't want to set up listeners multiple times, so we set a flag here
				return;
			
			var transaction;
			for (var i = 0; i < this.currentTransactions.length; i++) {
				transaction = this.currentTransactions[i];
				if (transaction.isFolioStateChangingTransaction()) {
            			// found one, so break and attach to this one
            			break;
            		} 
            		else {
            				// null out transaction since we didn't find a traceable one
            				transaction = null;
            			}
            		}

            		if (!transaction) return; // if there's no transaction, we're going to abort




            		// We don't want every transaction, just the downloads, etc.
            		var transactionType = transaction.jsonClassName;
            		if (transactionType != "DownloadTransaction" &&
            			transactionType != "UpdateTransaction" &&
            			transactionType != "PurchaseTransaction" &&
            			transactionType != "ArchiveTransaction" &&
            			transactionType != "ViewTransaction") {
            			return;
            	}


            		// Check if the transaction is active yet
            		if (transaction.state == adobeDPS.transactionManager.transactionStates.INITALIZED) {
						// This transaction is not yet started, but most likely soon will
						// so setup a callback for when the transaction starts
						transaction.stateChangedSignal.addOnce(broker.trackTransaction, this);
						return;
					}

					//set isTracking flag to true, so that we don't get multiple listeners:
					this.isTrackingTransaction = true;


					// now, if the type is download or update, we're going to start listening to the transaction stream
					if (transactionType == "DownloadTransaction" || transactionType == "UpdateTransaction") {
						transaction.stateChangedSignal.add(broker.download_stateChangedSignalHandler, this);
						transaction.progressSignal.add(broker.download_progressSignalHandler, this);
						transaction.completedSignal.add(broker.download_completedSignalHandler, this);
						

					} 
					else {
						// Add a callback for the transaction.
						transaction.completedSignal.addOnce(function() {
							this.isTrackingTransaction = false;
						}, this);
					}




				}

			}
		}


	// Downloads are automatically paused if another one is initiated so watch for changes with this callback.
	broker.download_stateChangedSignalHandler = function(transaction) {
		if (transaction.state == adobeDPS.transactionManager.transactionStates.FAILED) {
			broker.download_completedSignalHandler(transaction);
			broker.update();
		} else if (transaction.state == adobeDPS.transactionManager.transactionStates.PAUSED) {
			this.state = -100;
			broker.updateFolioData(this,true);
		} 
	}

	// Updates the progress bar for downloads and updates.
	broker.download_progressSignalHandler = function(transaction) {
		this.progress = transaction.progress;
		broker.updateFolioData(this,true);
	};

	// Handler for when a download or update completes.
	broker.download_completedSignalHandler = function(transaction) {
		transaction.stateChangedSignal.remove(broker.download_stateChangedSignalHandler, this);
		transaction.progressSignal.remove(broker.download_progressSignalHandler, this);
		transaction.completedSignal.remove(broker.download_completedSignalHandler, this);

		this.isTrackingTransaction = false;
		broker.updateFolioData(this,true);
	}

	return broker;
};





/*// Sort the folios descending.
		var list = adobeDPS.libraryService.folioMap.sort(function (a, b) {
			if (a.publicationDate < b.publicationDate)
				return 1;
			else if (a.publicationDate > b.publicationDate)
				return -1;
			else
				return 0;
		});
		// list is an associative array so put them in a regular array.
		for (var i in list) {
			var folio = list[i];
			addFolio(folio);
		}
		// Add a listener for when folios are added. This does not correspond to when
		// a new folio is pushed rather when the viewer is aware of new folios.
		adobeDPS.libraryService.folioMap.addedSignal.add(function(folios) {
			for (var i = 0; i < folios.length; i++) {
				addFolio(folios[i]);
			}
		}, this);*/
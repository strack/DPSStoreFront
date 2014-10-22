var ADOBE = ADOBE || {};

ADOBE.datumFromDPS = function(ditem){

/* If we want to do any special manipulation to the incoming data, this is where we would do it.
	For now, we have nothing to change, so all we do is set the item's progress to 0, as an initializaiton
	Then we move on */

	ditem.progress = 0;

	return ditem;
}

/*	The datumFromXML function takes the incoming XML feed from lighthouse, and shims it
	to look like the actual data feed coming from the AdobeLibraryAPI. 
*/
ADOBE.datumFromXML = function(xitem){

	// we check to make sure we have some data, otherwise we'll just return null.
	var xnode = $(xitem);
	if (!xnode) return null;
	
	// initialize the data
	var datItem = {};

	//set all the attributes...
	datItem.id = xnode.attr('id');
	datItem.productId = xnode.attr('productId');
	datItem.formatVersion = xnode.attr('formatVersion');
	datItem.targetViewer = xnode.attr('targetViewer');
	datItem.hasSections = xnode.attr('hasSections');
	datItem.version = xnode.attr('version');

	// set all the child nodes as attributes...

	// Set the filter, if it exists
	var attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'filter';
	});
	datItem.filter = attributeNode? attributeNode.textContent : '';
	

	// Set the portrait and landscape urls
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'libraryPreviewUrl';
	});
	datItem.previewImageURL = attributeNode? attributeNode.textContent+ '/portrait' : '#';
	datItem.landscapePreview = attributeNode? attributeNode.textContent+'/landscape': "#";
	

	// Set the title
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'magazineTitle';
	});
	datItem.title = attributeNode ? attributeNode.textContent : 'future folios...';
	

	// Set the issueNumber
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'issueNumber';
	});
	datItem.issueNumber = attributeNode? attributeNode.textContent : '';
	

	// Set the publicationDate
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'publicationDate';
	});
	datItem.publicationDate = attributeNode? attributeNode.textContent : '';
	

	// Set the description
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'description';
	});
	datItem.description = attributeNode? attributeNode.textContent : '';
	

	// Set the manifestXRef
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'manifestXRef';
	});
	datItem.manifestXRef = attributeNode? attributeNode.textContent : '';
	

	// Set the state
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'state';
	});
	datItem.state = attributeNode? attributeNode.textContent : '';



	// if we have a valid item (check the id) return it, otherwise return null.
	return (datItem.id ? datItem: null);

};


//Code to handle the various displays of status, e.g. 'download...', 'open...', 'downloading...', 'installing...' etc.
ADOBE.StatusText = function(statusCode)
{
	if (!arguments.length) return 'UNAVAILABLE';

	switch (statusCode){

		case 100:
			return 'PURCHASE';
		case 200:
        case 'production':
			return 'DOWNLOAD';
		case 101:
			return 'PURCHASING...';
		case 201:
			return 'DOWNLOADING...';
		case 400:
		case 401:
			return 'INSTALLING...';
		case 1000:
			return 'OPEN';
		case -100:
			return 'PAUSED...';
		case 0:
		case 50:
		default:
			return 'Code: ' + statusCode;
	}
};


//determines whether the progress bar is visible, based on the status code.
ADOBE.ProgressBarVisible = function(statusCode)
{
	if (!arguments.length) return false;

	switch (statusCode){
		case 201:
		case 401:
			return true;
			break;

		case 200:
		default:
			return false;
			break;
	}
};

// returns a color based on the state (for buttons)
ADOBE.StateColor = function(statusCode)
{
	if (!arguments.length) return false;

	switch (statusCode){
		case 1000:
			return 'rgba(238,153,51,1)'; //orange - downloaded and installed
		case 201:
		case 401:
			return 'rgba(170,34,187,0.75)'; //purple - downloading/installing
		case 200:
		default:
			return 'rgba(119,170,204,0.75)'; //light blue - available for download
	}
};
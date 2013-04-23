var ADOBE = ADOBE || {};

//  This is the filter you want to apply to all of your folios. It corresponds to the productId in Folio Producer
ADOBE.FolioFilter = '';


function displog(txt){
	var curtxt = $('#displog').text();
	curtxt +=txt + "---     ";
	$('#displog').text(curtxt);
}


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
    
	// To test on the desktop remove the JavaScript include for AdobeLibraryAPI.js.
	if (typeof adobeDPS == "undefined"){ // Call init() immediately. This will be the case for dev on the desktop.
		displog("shim");
		displog("shim");
		displog("shim");
		displog("shim");
		displog("shim");
		init(false); 
	}
	else{								// API is available so wait for adobeDPS.initializationComplete.
		
		adobeDPS.initializationComplete.addOnce(function(){ init(true) });
	}
});


// This is the main rendering object. You will use this to render Folios in the storefront
// This is a closure object, so multiple instances can be used, if you want to expand to have multiple filters on the same page.
ADOBE.Folios = function(e){

var element; // this is the DOM element that will be rendered by this instance of Folios
var foliodata; // this is a placeholder for the folio data
var foliofilter; // this is a placeholder for the filter we'll used on a data source


// here we set a default DOM element to cling on to, should e be null.
// if e is not null, we will use D3 Selectors to get the proper element.
if (e == null)
	{
		elmnt = d3.select('#folios');
		
	}
	else if (typeof e === "string")
	{
		elmnt = d3.select(e);
	}
	else
	{
		elmnt = e;
	}

	function folios()
	{
		return elmnt;
	}

	folios.filter = function(_f){
		if (!arguments.length) return foliofilter;  // if nothing was passed, caller wants to know what the current filter is.
		foliofilter = _f; // set the current filter
		return folios; // return folios (closure)
	}

	// data can be set here, without rendering.
	folios.data = function(_d){
		if (!arguments.length) return foliodata;  // if nothing was passed, caller wants the current data set.
		foliodata = _d; // set the current data set;
		return folios;  // return folios (closure);
	};

	// The main rendering code
	folios.render = function (_d){
		// If data was passed, we want to update that.
		if (arguments.length) this.data(_d);

		// If we don't have data or a selected element at this point, we shouldn't render.
		if (!elmnt || !foliodata) return;

		// If a filter exists, we'll use it against the data entered. If it doesn't, we will instead display everything we can.
		var filteredCards = (foliofilter&&foliofilter.length ? _.where(foliodata, {filter:foliofilter}) : foliodata);
		
		// we now need to iterate really quick, and set "more..." flags where appropriate:
		_.each(filteredCards, function(d,i){
			d.moreFlag = (i<filteredCards.length-1);
		});

		//We make the initial D3 query, combining the data and elements.
		var folioCards = elmnt.selectAll("div.folioCard").data(filteredCards);

		// create new cards, and call addFolioContent
		var newCards = folioCards.enter()
		.append('div')
		.classed('folioCard',true)
		.call(addFolioContent);

		// for existing Cards, call updateFolioContent
		var existingCards = folioCards
		.call(updateFolioContent);

		// for dead Cards, fade out and remove
		folioCards.exit()
		.transition()
		.duration(500)
		.style("opacity",0)
		.remove();





		return folios;// return folios (closure)
	}

	addFolioContent = function(sel,d,i)
	{
		// we add the ID
		sel.attr('id',function(d){return d.id;});

		// we now set the class .moreFolios if there's more content to come.
		sel.classed('moreFolios', function(d){return d.moreFlag;});

		
		//we create the preview pane, and set the background picture
		var ppane = sel
		.append('div')
		.classed('previewPane',true)
		.attr('id',function(d){
			return 'ppane-' + d.id;
		})
		.style('background-image',function(d){
			return "url('"+ d.previewImageURL + "')";
		});

		// we add the title div
		sel
		.append('div')
		.classed('folioTitle',true)
		.text(function(d){
			return d.title;
		});

		
		ppane
		.append('div')
		.classed('thumbTitle',true);
		


		ppane  //we add the background and progress bar itself (display:none in css to start)
		.append('div')
		.classed('progressBarBG',true)
		.classed('progressVisible', function(d){return ADOBE.ProgressBarVisible(d.state);}) //set visibility on the progress bar
		.attr('data-status', function(d){return d.state||'0';})
		.append('div')
		.classed('progressBar',true)
		.style('width', function(d){
			return (d.progress? d.progress+'%':'0%');
		});


		sel
		.append('div')
		.classed('folioDescription',true)
		.text(function(d){return d.description;});

		//we add the status title to preview pane
		sel.append('div')
		.classed('statusTitle',true)
		.style('background-color',function(d){
			return ADOBE.StateColor(d.state);
		})
		.attr('data-status' ,function(d){return d.state||'0';})
		.text(function(d){
			return ADOBE.StatusText(d.state);
		})
		.attr('data-folioID',function(d){return '#'+d.id;})
		.on('click',function(e){
			
			ADOBE.liveController.openFolio(e.id);
		});


		
		//We now hook up all the click events, touch events, etc - for just a bit of animation.
		/*.on('mousedown',function(e){
			$($(this).data('folioid')).toggleClass('clicky',true);
		}).on('touchstart',function(e){
			$($(this).data('folioid')).toggleClass('clicky',true);
		}).on('mouseout',function(e){
			$($(this).data('folioid')).toggleClass('clicky',false);
		}).on('click',function(e){
			
			ADOBE.liveController.openFolio(e.id);
		}).on('mouseup',function(e){
			$($(this).data('folioid')).toggleClass('clicky',false);
		}).on('touchend',function(e){
			$($(this).data('folioid')).toggleClass('clicky',false);
		}).on('touchcancel',function(e){
			$($(this).data('folioid')).toggleClass('clicky',false);
		}).on('touchleave',function(e){
			$($(this).data('folioid')).toggleClass('clicky',false);
		});*/
	}

	updateFolioContent = function(sel,d,i)
	{

		// we update the ID
		sel.attr('id',function(d){return d.id;});

		// we now set the class .moreFolios if there's more content to come.
		sel.classed('moreFolios', function(d){return d.moreFlag;});

		// we update the title div
		sel.select('div.folioTitle')
		.text(function(d){
			return d.title;
		});


		// we set the bg picture for the preview pane
		var ppane = sel.select('div.previewPane')
		.style('background-image',function(d){
			return "url('"+ d.previewImageURL + "')";
		});

		//we add the status title to preview pane
		sel.select('div.statusTitle')
		.attr('data-status' ,function(d){return d.state||'0';})
		.style('background-color',function(d){
			return ADOBE.StateColor(d.state);
		})
		.text(function(d){
			return ADOBE.StatusText(d.state);
		})
		.attr('data-folioID',function(d){return '#'+d.id;});


		ppane.select('div.progressBarBG')  
		.classed('progressVisible', function(d){return ADOBE.ProgressBarVisible(d.state);}) //set visibility on the progress bar
		.attr('data-status', function(d){return d.state||'0';})
		.select('div.progressBar')
		.style('width', function(d){
			return (d.progress? d.progress+'%':'0%');
		});


		sel
		.select('div.folioDescription')
		.text(function(d){return d.description;});
	}

	return folios;


};


ADOBE.datumFromDPS = function(ditem){
	/*var datItem = {};
	datItem.id = ditem.id;
	datItem.productId = ditem.productId;
	datItem.formatVersion = ditem.isCompatible;
	datItem.targetViewer = ditem.targetDimensions;
	datItem.hasSections = ditem.hasSections;
	datItem.version = ditem.folioNumber;
	datItem.filter = ditem.filter;
	datItem.title = ditem.title;
	datItem.issueNumber = ditem.folioNumber;
	datItem.publicationDate = ditem.publicationDate;
	datItem.description = ditem.description;
	datItem.state = ditem.state;
	datItem.progress = 0;
	datItem.previewImageURL = ditem.previewImageURL;
	

	//TODO: add pictureURL logic


	// if we have a valid item (check the id) return it, otherwise return null.
	return (datItem.id ? datItem: null);

	*/
	ditem.progress = 0;

	return ditem;
}


ADOBE.datumFromXML = function(xitem){

	var xnode = $(xitem);
	if (!xnode) return null;
	
	var datItem = {};

	//set all the attributes...
	datItem.id = xnode.attr('id');
	datItem.productId = xnode.attr('productId');
	datItem.formatVersion = xnode.attr('formatVersion');
	datItem.targetViewer = xnode.attr('targetViewer');
	datItem.hasSections = xnode.attr('hasSections');
	datItem.version = xnode.attr('version');

	// set all the child nodes as attributes...
	var attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'filter';
	});
	datItem.filter = attributeNode? attributeNode.textContent : '';
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'libraryPreviewUrl';
	});
	datItem.previewImageURL = attributeNode? attributeNode.textContent+ '/portrait' : '#';
	datItem.landscapePreview = attributeNode? attributeNode.textContent+'/landscape': "#";
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'magazineTitle';
	});
	datItem.title = attributeNode ? attributeNode.textContent : 'future folios...';
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'issueNumber';
	});
	datItem.issueNumber = attributeNode? attributeNode.textContent : '';
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'publicationDate';
	});
	datItem.publicationDate = attributeNode? attributeNode.textContent : '';
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'description';
	});
	datItem.description = attributeNode? attributeNode.textContent : '';
	attributeNode = _.find(xnode.children(),function(n){
		return n.nodeName == 'manifestXRef';
	});
	datItem.manifestXRef = attributeNode? attributeNode.textContent : '';
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
			return 'rgba(238,153,51,1)'; //orange
		case 201:
		case 401:
			return 'rgba(170,34,187,0.75)'; //purple
		case 200:
		default:
			return 'rgba(119,170,204,0.75)'; //light blue
	}
};
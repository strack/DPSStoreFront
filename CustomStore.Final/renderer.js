var ADOBE = ADOBE || {};

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
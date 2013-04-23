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

	// data can be set here, without rendering.
	folios.data = function(_d){
		if (!arguments.length) return foliodata;  // if nothing was passed, caller wants the current data set.
		foliodata = _d; // set the current data set;
		return folios;  // return folios (closure);
	};

	// The main rendering code
	folios.render = function (_d){

		//TODO: Initial Text Render (dial tone)




		return folios;// return folios (closure)
	}

	

	

	folios.filter = function(_f){
		if (!arguments.length) return foliofilter;  // if nothing was passed, caller wants to know what the current filter is.
		foliofilter = _f; // set the current filter
		return folios; // return folios (closure)
	}

	return folios;


};
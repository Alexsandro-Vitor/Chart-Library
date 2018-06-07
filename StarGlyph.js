/**
 * Class that represents a Star Glyph.
 * @extends Chart
 */
class StarGlyph extends Chart {
	/**
	 * @constructor
	 * @param {d3.selection} container - The tag in which the chart will be inserted.
	 * @param {string} id - The id of the chart tag.
	 * @param {Object} position - The position of the chart.
	 * @param {number} position.x - The X coordinate of the chart.
	 * @param {number} position.y - The Y coordinate of the chart.
	 * @param {(number|Object)} margins - The margins of the chart. If a number is passed, all its values will be the same.
	 * @param {number} margins.left - Left margin of the chart.
	 * @param {number} margins.right - Right margin of the chart.
	 * @param {number} margins.top - Upper margin of the chart.
	 * @param {number} margins.bottom - Lower margin of the chart.
	 * @param {Object} dimensions - The dimensions of the chart.
	 * @param {number} dimensions.width - The width of the chart, counting the margins.
	 * @param {number} dimensions.height - The height of the chart, counting the margins.
	 */
	constructor(container, id, position, margins, dimensions) {
		super(container, id, position, margins, dimensions, "starGlyph");
		
		this._selection.attr("transform", "translate(" + (this._margins.left + this._width / 2) + "," + (this._margins.top + this._height / 2) + ")");
		
		this._polygonSelection = null;
		
		this._labelSelection = null;
		
		this._scales = [];
		
		this._pathGenerator = d3.lineRadial()
			.angle((d, i)=>(this._getAngle(i)))
			.radius((d, i)=>this._scales[i % this._scales.length](d));
		
		this._fillFunction = (d, i)=>"blue";
	}
	
	/**
	 * Returns the selection of the polygon of the chart.
	 * @returns {d3.selection} The polygon of this chart.
	 */
	polygonSelection() {
		return this._polygonSelection;
	}
	
	/**
	 * Returns the selection of the labels of each corner.
	 * @returns {d3.selection} The labels of the corners.
	 */
	labelSelection() {
		return this._labelSelection;
	}
	
	/**
	 * A path generator for the polygon. If gen is given, sets it, otherwise returns the current pathGenerator.
	 * @param {d3.line} gen - The new pathGenerator.
	 * @returns {(StarGlyph|d3.lineRadial)} This object or the current pathGenerator.
	 */
	pathGenerator(gen) {
		if (gen) {
			this._pathGenerator = gen;
			return this;
		} else {
			return this._pathGenerator;
		}
	}
	
	/**
	 * The function which sets the color of the polygon. If func is given, sets it, otherwise returns the current fillFunction.
	 * @param {function} func - The new fillFunction.
	 * @returns {(StarGlyph|function)} This object or the current fillFunction.
	 */
	fillFunction(func) {
		if (func) {
			this._fillFunction = func;
			return this;
		} else {
			return this._fillFunction;
		}
	}
	
	/**
	 * The function which sets the domains of every variable scale.
	 * @param {newDomains} - The new domains of the chart scales.
	 * @returns {StarGlyph} This chart.
	 */
	setScaleDomains(newDomains) {
		this._scales = [];
		for (let i in newDomains) {
			this._scales[i] = d3.scaleLinear()
				.domain(newDomains[i])
				.range([0, d3.min([this._width, this._height]) / 2]);
		}
		return this;
	}
	
	/** 
	 * Inserts data on the star glyph and plots it.
	 * @param {number[]} dataset - An array of values for the polygon.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the polygon.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {StarGlyph} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("polygon" + i));
		attributes["class"] = "polygon";
		Chart.addIfNull(attributes, "d", (d, i)=>(this._pathGenerator(d, i)));
		
		dataset.push(dataset[0]);	//With this, the path will be closed
		this._polygonSelection = this._selection.selectAll(".polygon").data([dataset]).enter().append("path")
			.attr("fill", this._fillFunction);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._polygonSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the labels at the corners.
	 * @param {string[]} labels - An array of values for the labels.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {StarGlyph} This chart.
	 */
	setCornerLabels(labels, attributes, onEvents) {
		let radius = d3.min([this._width, this._height]) / 2 + 3;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes["class"] = "cornerLabel";
		Chart.addIfNull(attributes, "x", (d, i)=>(Math.sin(this._getAngle(i)) * radius));
		Chart.addIfNull(attributes, "y", (d, i)=>(-Math.cos(this._getAngle(i)) * radius));
		Chart.addIfNull(attributes, "text-anchor", (d, i)=>this._getTextAnchor(i));
		Chart.addIfNull(attributes, "dominant-baseline", (d, i)=>this._getDominantBaseline(i));
		
		this._labelSelection = this._selection.selectAll(".cornerLabel").data(labels).enter().append("text")
			.text((d, i)=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._labelSelection, attributes, onEvents);
		
		return this;
	}
	
	_getAngle(i) {
		return 2 * Math.PI * i / this._scales.length;
	}
	
	_getTextAnchor(i) {
		let sine = Math.sin(this._getAngle(i));
		return (sine < -1e-6) ? "end"
			: (sine > 1e-6) ? "start"
			: "middle";
	}
	
	_getDominantBaseline(i) {
		let cosine = Math.cos(this._getAngle(i));
		return (cosine < -1e-6) ? "hanging"
			: (cosine > 1e-6) ? "baseline"
			: "middle";
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {StarGlyph} This chart.
	 */
	clear() {
		if (this._polygonSelection) {
			this._polygonSelection.remove();
			this._polygonSelection = null;
		}
		if (this._labelSelection) {
			this._labelSelection.remove();
			this._labelSelection = null;
		}
		return super.clear();
	}
}
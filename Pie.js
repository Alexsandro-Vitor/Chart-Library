/**
 * Class that represents a Pie chart. Used to represent proportions.
 * @extends Chart
 */
class Pie extends Chart {
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
		super(container, id, position, margins, dimensions, "pieChart");
		
		this._selection.attr("transform", "translate(" + (this._margins.left + this._width / 2) + "," + (this._margins.top + this._height / 2) + ")");
		
		this._sliceSelection = null;
		
		this._labelSelection = null;
		
		this._innerRadius = (d, i)=>0;
		this._outerRadius = (d, i)=>(d3.min([this._width, this._height]) / 2);
		
		this._colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/**
	 * Returns the selection of the slices of the chart.
	 * @returns {d3.selection} The slices of this chart.
	 */
	sliceSelection() {
		return this._sliceSelection;
	}
	
	/**
	 * Returns the selection of the labels of each slice.
	 * @returns {d3.selection} The labels of the slices.
	 */
	labelSelection() {
		return this._labelSelection;
	}
	
	/**
	 * Function which sets the inner radius of the slice based on its value. If func is given, sets it, otherwise returns the current innerRadius.
	 * @param {function} func - The new innerRadius.
	 * @returns {(Pie|function)} This object or the current innerRadius.
	 */
	innerRadius(func) {
		if (func) {
			this._innerRadius = func;
			return this;
		} else {
			return this._innerRadius;
		}
	}
	
	/**
	 * Function which sets the outer radius of the slice based on its value. If func is given, sets it, otherwise returns the current outerRadius.
	 * @param {function} func - The new outerRadius.
	 * @returns {(Pie|function)} This object or the current outerRadius.
	 */
	outerRadius(func) {
		if (func) {
			this._outerRadius = func;
			return this;
		} else {
			return this._outerRadius;
		}
	}
	
	/**
	 * The color scale of the pie chart. Used to set the colors of each slice. If scale is given, sets it, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Pie|d3.scale)} This object or the current colorScale.
	 */
	colorScale(scale) {
		if (scale) {
			this._colorScale = scale;
			return this;
		} else {
			return this._colorScale;
		}
	}
	
	/** 
	 * Inserts data on the pie and plots it.
	 * @param {number[]} dataset - An array of values for the slices.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the slices.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Pie} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		this._pieData = d3.pie()(dataset);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("slice" + i));
		attributes.class = "slice";
		Chart.addIfNull(attributes, "d", (d, i)=>(this.genSlice(d, i)()));
		
		//Slice sliceSelection and color setting
		this._sliceSelection = this._selection.selectAll(".slice").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart._colorScale(i % thisChart._colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._sliceSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the labels of the slices.
	 * @param {string[]} labels - An array of values for the labels.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Pie} This chart.
	 */
	setSliceLabels(labels, attributes, onEvents) {
		let centroids = this._sliceSelection.data().map((d, i)=>this.genSlice(d, i).centroid());
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes.class = "sliceLabel";
		Chart.addIfNull(attributes, "x", (d, i)=>(centroids[i][0]));
		Chart.addIfNull(attributes, "y", (d, i)=>(centroids[i][1]));
		Chart.addIfNull(attributes, "text-anchor", "middle");
		Chart.addIfNull(attributes, "dominant-baseline", "middle");
		
		this._labelSelection = this._selection.selectAll(".sliceLabel").data(labels).enter().append("text")
			.text((d, i)=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._labelSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Generates slices from an array with the Array.prototype.map() function. Also uses values from innerRadius and outerRadius.
	 * @param {number} d - A value in the array.
	 * @param {number} i - An index in the array.
	 * @returns {d3.arc} Arc made with the value of the array.
	 */
	genSlice(d, i) {
		return d3.arc()
			.innerRadius(this._innerRadius(d, i))
			.outerRadius(this._outerRadius(d, i))
			.startAngle(this._pieData[i].startAngle)
			.endAngle(this._pieData[i].endAngle);
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Pie} This chart.
	 */
	clear() {
		if (this._sliceSelection) {
			this._sliceSelection.remove();
			this._sliceSelection = null;
			this._pieData = null;
		}
		if (this._labelSelection) {
			this._labelSelection.remove();
			this._labelSelection = null;
		}
		return super.clear();
	}
}
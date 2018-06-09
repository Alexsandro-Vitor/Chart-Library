/**
 * Class that represents a Histogram.
 * @extends Chart
 */
class Histogram extends Chart {
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
		super(container, id, position, margins, dimensions, "histogramChart");
		
		this._xScale = d3.scaleLinear();
		
		this._xAxisScale = d3.scaleOrdinal()
			.range([0, this._width]);
		this._xAxis = d3.axisBottom(this._xAxisScale);
		this._xAxisGroup = this._selection
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + this._height  + ")");
		this._xAxisGroup.call(this._xAxis);
		
		this._yScale = d3.scaleLinear()
			.range([this._height, 0]);
		this._yAxis = d3.axisLeft(this._yScale);
		this._yAxisGroup = this._selection
			.append("g")
			.attr("class", "yAxis");
		this._yAxisGroup.call(this._yAxis);
		
		this._colSelection = null;
		
		this._colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/**
	 * Returns the X scale of the chart.
	 * @returns {d3.scale} The X scale of this chart.
	 */
	xScale() {
		return this._xScale;
	}
	
	/**
	 * The X scale of the axis. If scale is given, sets it and also sets the X axis, otherwise returns the current xAxisScale.
	 * @param {d3.scale} scale - The new xAxisScale.
	 * @returns {(Histogram|d3.scale)} This object or the current xAxisScale.
	 */
	xAxisScale(scale) {
		if (scale) {
			this._xAxisScale = scale;
			this._xScale
				.domain([0, scale.domain().length - 3])
				.range([scale.range()[1], scale.range()[scale.domain().length - 2]]);
			Chart.adjustScaleDomain(this._xAxisScale, this._xAxis, this._xAxisGroup, this._xAxisScale.domain());
			return this;
		} else {
			return this._xAxisScale;
		}
	}
	
	/**
	 * The Y scale of the chart. If scale is given, sets it and also sets the Y axis, otherwise returns the current yScale.
	 * @param {d3.scale} scale - The new yScale.
	 * @returns {(Histogram|d3.scale)} This object or the current yScale.
	 */
	yScale(scale) {
		if (scale) {
			this._yScale = scale;
			Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, d3.extent(this._yScale.domain()));
			return this;
		} else {
			return this._yScale;
		}
	}
	
	/**
	 * Returns the selection of the columns of the chart.
	 * @returns {d3.selection} The columns of this chart.
	 */
	colSelection() {
		return this._colSelection;
	}
	
	/**
	 * The color scale of the histogram. Used to set the colors of each column in the histogram. If scale is given, sets it and also changes the current column colors, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Histogram|d3.scale)} This object or the current colorScale.
	 */
	colorScale(scale) {
		if (scale) {
			this._colorScale = scale;
			if (this._colSelection != null) this._colSelection.attr("fill", (d, i)=>(this._colorScale(i % scale.range().length)));
			return this;
		} else {
			return this._colorScale;
		}
	}
	
	/** 
	 * Inserts data on the histogram and plots it.
	 * @param {number[]} dataset - An array of values for the columns.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the columns.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Histogram} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let colWidth = this._width / (this._xAxisScale.domain().length - 1);
		let thisChart = this;
		
		//Adjusting the yScale and axis
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, [0, d3.max(dataset)]);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("col" + this._xAxisScale.domain()[i+1]));
		attributes["class"] = "column";
		Chart.addIfNull(attributes, "x", (d, i)=>(this._xScale(i) - colWidth/2));
		Chart.addIfNull(attributes, "y", (d, i)=>(this._yScale(d)));
		Chart.addIfNull(attributes, "width", colWidth);
		Chart.addIfNull(attributes, "height", (d, i)=>(this._height - this._yScale(d)));
		
		//Column selection and color setting
		this._colSelection = this._selection.selectAll(".column").data(dataset).enter().append("rect")
			.attr("fill", (d, i)=>(thisChart._colorScale(i % thisChart._colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._colSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Histogram} This chart.
	 */
	clear() {
		if (this._colSelection) {
			this._colSelection.remove();
			this._colSelection = null;
		}
		return super.clear();
	}
}
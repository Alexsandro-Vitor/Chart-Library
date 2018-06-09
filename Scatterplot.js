/**
 * Class that represents a Scatterplot.
 * @extends Chart
 */
class Scatterplot extends Chart {
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
		super(container, id, position, margins, dimensions, "scatterplotChart");
		
		this._xScale = d3.scaleLinear()
			.range([0, this._width]);
		
		this._xAxisTop = d3.axisTop(this._xScale);
		this._xAxisTopGroup = this._selection
			.append("g")
			.attr("class", "xAxis");
		this._xAxisTopGroup.call(this._xAxisTop);
		
		this._xAxisBottom = d3.axisBottom(this._xScale);
		this._xAxisBottomGroup = this._selection
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0, " + this._height + ")");
		this._xAxisBottomGroup.call(this._xAxisBottom);
		
		this._yScale = d3.scaleLinear()
			.range([this._height, 0]);
		
		this._yAxisLeft = d3.axisLeft(this._yScale);
		this._yAxisLeftGroup = this._selection
			.append("g")
			.attr("class", "yAxis")
		this._yAxisLeftGroup.call(this._yAxisLeft);
		
		this._yAxisRight = d3.axisRight(this._yScale);
		this._yAxisRightGroup = this._selection
			.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + this._width + ", 0)");
		this._yAxisRightGroup.call(this._yAxisRight);
		
		this._dotSelection = null;
		
		this._colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/**
	 * The X scale of the chart. If scale is given, sets it and also sets the X axes, otherwise returns the current xScale.
	 * @param {d3.scale} scale - The new xScale.
	 * @returns {(Scatterplot|d3.scale)} This object or the current xScale.
	 */
	xScale(scale) {
		if (scale) {
			this._xScale = scale;
			Chart.adjustScaleDomain(this._xScale, this._xAxisLeft, this._xAxisLeftGroup, d3.extent(this._xScale.domain()));
			Chart.adjustScaleDomain(this._xScale, this._xAxisLeft, this._xAxisLeftGroup, d3.extent(this._xScale.domain()));
			return this;
		} else {
			return this._xScale;
		}
	}
	
	/**
	 * The Y scale of the chart. If scale is given, sets it and also sets the Y axes, otherwise returns the current yScale.
	 * @param {d3.scale} scale - The new yScale.
	 * @returns {(Scatterplot|d3.scale)} This object or the current yScale.
	 */
	yScale(scale) {
		if (scale) {
			this._yScale = scale;
			Chart.adjustScaleDomain(this._yScale, this._yAxisLeft, this._yAxisLeftGroup, d3.extent(this._yScale.domain()));
			Chart.adjustScaleDomain(this._yScale, this._yAxisLeft, this._yAxisLeftGroup, d3.extent(this._yScale.domain()));
			return this;
		} else {
			return this._yScale;
		}
	}
	
	/**
	 * Returns the selection of the dots of the chart.
	 * @returns {d3.selection} The dots of this chart.
	 */
	dotSelection() {
		return this._dotSelection;
	}
	
	/**
	 * The color scale of the scatterplot. Used to set the colors of each dot. If scale is given, sets it, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Scatterplot|d3.scale)} This object or the current colorScale.
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
	 * Inserts data on the scatterplot and plots it.
	 * @param {number[]} dataset - An array of values for the dots.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Scatterplot} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dot" + i));
		attributes["class"] = "dot";
		Chart.addIfNull(attributes, "cx", (d, i)=>(this._xScale(d[0])));
		Chart.addIfNull(attributes, "cy", (d, i)=>(this._yScale(d[1])));
		Chart.addIfNull(attributes, "r", "4px");
		
		//Adjusting the scales and axis
		let minMaxX = d3.extent(dataset.map((d, i)=>this._xScale.invert(attributes.cx(d, i))));
		let minMaxY = d3.extent(dataset.map((d, i)=>this._yScale.invert(attributes.cy(d, i))));
		Chart.adjustScaleDomain(this._xScale, this._xAxisTop, this._xAxisTopGroup, minMaxX);
		Chart.adjustScaleDomain(this._xScale, this._xAxisBottom, this._xAxisBottomGroup, minMaxX);
		Chart.adjustScaleDomain(this._yScale, this._yAxisLeft, this._yAxisLeftGroup, minMaxY);
		Chart.adjustScaleDomain(this._yScale, this._yAxisRight, this._yAxisRightGroup, minMaxY);
		
		//Dot selection and color setting
		this._dotSelection = this._selection.selectAll(".dot").data(dataset).enter().append("circle")
			.attr("fill", (d, i)=>(thisChart._colorScale(i % thisChart._colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._dotSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Scatterplot} This chart.
	 */
	clear() {
		if (this._dotSelection) {
			this._dotSelection.remove();
			this._dotSelection = null;
		}
		return super.clear();
	}
}
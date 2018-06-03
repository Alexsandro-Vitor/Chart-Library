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
		
		/**
		 * The X scale of the histogram. Used by the columns.
		 * @member {d3.scale} Histogram#xScale
		 * @default d3.scaleLinear()
		 */
		this.xScale = d3.scaleLinear();
		
		/**
		 * The X scale of the histogram. Used by the axis.
		 * @member {d3.scale} Histogram#xAxisScale
		 * @default d3.scaleOrdinal().range([0, this.width()])
		 */
		this.xAxisScale = d3.scaleOrdinal()
			.range([0, this._width]);
		/**
		 * The X axis of the histogram.
		 * @member {d3.axis} Histogram#xAxis
		 * @default d3.axisBottom(this.xAxisScale)
		 */
		this.xAxis = d3.axisBottom(this.xAxisScale);
		/**
		 * The group of the X axis.
		 * @member {d3.selection} Histogram#xAxisGroup
		 */
		this.xAxisGroup = this._selection
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + this._height  + ")");
		this.xAxisGroup.call(this.xAxis);
		
		this._yScale = d3.scaleLinear()
			.range([this._height, 0]);
		this._yAxis = d3.axisLeft(this._yScale);
		this._yAxisGroup = this._selection
			.append("g")
			.attr("class", "yAxis");
		this._yAxisGroup.call(this._yAxis);
		
		/**
		 * The names of the columns.
		 * @member {string[]} Histogram#xAxisNames
		 */
		this.xAxisNames = [];
		
		this._colSelection = null;
		
		/**
		 * The color scale of the histogram. Used to set the colors of each column in the histogram.
		 * @member {d3.scale} Histogram#colorScale
		 * @default d3.scaleLinear().domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1)).range(d3.schemeCategory10)
		 */
		this.colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/** 
	 * Sets the names of the columns of the histogram and modify the axis.
	 * @param {string[]} newDomain - An array of names for the columns.
	 */
	setXDomain(newDomain) {
		this.xAxisNames = newDomain.slice();
		newDomain.push("");
		newDomain.unshift("");
		let sequence = Chart.genSequence(0, newDomain.length, this._width);
		this.xAxisScale
			.domain(newDomain)
			.range(sequence);
		this.xAxis.scale(this.xAxisScale);
		this.xAxisGroup.call(this.xAxis);
		
		this.xScale
			.domain([0, this.xAxisNames.length-1])
			.range([sequence[1], sequence[this.xAxisNames.length]]);
	}
	
	/**
	 * The Y scale of the chart. If scale is given, sets it and also sets the Y axis, otherwise returns the current yScale.
	 * @param {d3.scale} scale - The new yScale.
	 * @returns {(Segments|d3.scale)} This object or the current yScale.
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
	 * Inserts data on the histogram and plots it.
	 * @param {number[]} dataset - An array of values for the columns.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the columns.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Histogram} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let colWidth = this._width / (this.xAxisNames.length + 1);
		let thisChart = this;
		
		//Adjusting the yScale and axis
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, [0, d3.max(dataset)]);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("col" + thisChart.xAxisNames[i]));
		attributes["class"] = "column";
		Chart.addIfNull(attributes, "x", (d, i)=>(thisChart.xScale(i) - colWidth/2));
		Chart.addIfNull(attributes, "y", (d, i)=>(thisChart._yScale(d)));
		Chart.addIfNull(attributes, "width", colWidth);
		Chart.addIfNull(attributes, "height", (d, i)=>(thisChart._height - thisChart._yScale(d)));
		
		//Column selection and color setting
		this._colSelection = this._selection.selectAll(".column").data(dataset).enter().append("rect")
			.attr("fill", (d, i)=>(thisChart.colorScale(i % thisChart.colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._colSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function.
	 * @param {string[]} newColors - An array of colors for the colorScale to work with.
	 */
	setColorScale(newColors) {
		let sequence = Chart.genSequence(0, newColors.length, newColors.length-1);
		this.colorScale
			.domain(sequence)
			.range(newColors);
		let thisChart = this;
		if (this._colSelection != null) this._colSelection.attr("fill", (d, i)=>(thisChart.colorScale(i % newColors.length)));
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
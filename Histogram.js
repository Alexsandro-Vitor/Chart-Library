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
		
		/**
		 * The Y scale of the histogram. Used by the axis and the columns.
		 * @member {d3.scale} Histogram#yScale
		 * @default d3.scaleLinear().range([this.height(), 0])
		 */
		this.yScale = d3.scaleLinear()
			.range([this._height, 0]);
		/**
		 * The Y axis of the histogram.
		 * @member {d3.axis} Histogram#yAxis
		 * @default d3.axisLeft(this.yScale)
		 */
		this.yAxis = d3.axisLeft(this.yScale);
		/**
		 * The group of the Y axis.
		 * @member {d3.selection} Histogram#yAxisGroup
		 */
		this.yAxisGroup = this._selection
			.append("g")
			.attr("class", "yAxis");
		this.yAxisGroup.call(this.yAxis);
		
		/**
		 * The names of the columns.
		 * @member {string[]} Histogram#xAxisNames
		 */
		this.xAxisNames = [];
		
		/**
		 * The columns of the histogram.
		 * @member {d3.selection} Histogram#colSelection
		 */
		this.colSelection = null;
		
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
		var sequence = Chart.genSequence(0, newDomain.length, this._width);
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
	 * Inserts data on the histogram and plots it.
	 * @param {number[]} dataset - An array of values for the columns.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the columns.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setData(dataset, attributes, onEvents) {
		var colWidth = this._width / (this.xAxisNames.length + 1);
		var thisChart = this;
		if (attributes == null) attributes = [];
		
		//Adjusting the yScale and axis
		Chart.adjustScaleDomain(this.yScale, this.yAxis, this.yAxisGroup, 0, d3.max(dataset));
		
		//Mandatory attributes
		Chart.addIfNull(attributes, "id", (d, i)=>("col" + thisChart.xAxisNames[i]));
		attributes["class"] = "column";
		Chart.addIfNull(attributes, "x", (d, i)=>(thisChart.xScale(i) - colWidth/2));
		Chart.addIfNull(attributes, "y", (d, i)=>(thisChart.yScale(d)));
		Chart.addIfNull(attributes, "width", colWidth);
		Chart.addIfNull(attributes, "height", (d, i)=>(thisChart._height - thisChart.yScale(d)));
		
		//Column selection and color setting
		this.colSelection = this._selection.selectAll(".column").data(dataset).enter().append("rect")
			.attr("fill", (d, i)=>(thisChart.colorScale(i % thisChart.colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.colSelection, attributes, onEvents);
	}
	
	/** 
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function.
	 * @param {string[]} newColors - An array of colors for the colorScale to work with.
	 */
	setColorScale(newColors) {
		var sequence = Chart.genSequence(0, newColors.length, newColors.length-1);
		this.colorScale
			.domain(sequence)
			.range(newColors);
		var thisChart = this;
		if (this.colSelection != null) this.colSelection.attr("fill", (d, i)=>(thisChart.colorScale(i % newColors.length)));
	}
}
/**
 * Class that represents a Histogram
 */
class Histogram extends Chart {
	/**
	 * @constructor
	 * @param {Object} container - The tag in which the histogram will be inserted
	 * @param {string} id - The id of the histogram tag
	 * @param {(Object|number)} margins - The margins of the histogram. If a number is passed, all its values will be the same
	 * @param {number} margins.left - Left margin of the histogram
	 * @param {number} margins.right - Right margin of the histogram
	 * @param {number} margins.top - Upper margin of the histogram
	 * @param {number} margins.bottom - Lower margin of the histogram
	 * @param {number} totalWidth - The width of the histogram, counting the margins
	 * @param {number} totalHeight - The height of the histogram, counting the margins 
	 */
	constructor(container, id, margins, totalWidth, totalHeight) {
		super(container, id, margins, totalWidth, totalHeight, "histogram");
		
		/**
		 * The X scale of the histogram. Used by the columns
		 * @member {Object} xScale
		 */
		this.xScale = d3.scaleLinear();
		
		/**
		 * The X scale of the histogram. Used by the axis
		 * @member {Object} xAxisScale
		 */
		this.xAxisScale = d3.scaleOrdinal()
			.range([0, this.width]);
		/**
		 * The X axis of the histogram
		 * @member {Object} xAxis
		 */
		this.xAxis = d3.axisBottom(this.xAxisScale);
		/**
		 * The group of the X axis
		 * @member {Object} xAxisGroup
		 */
		this.xAxisGroup = this.tag
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + this.height  + ")");
		this.xAxisGroup.call(this.xAxis);
		
		/**
		 * The Y scale of the histogram. Used by the axis and the columns
		 * @member {Object} yScale
		 */
		this.yScale = d3.scaleLinear()
			.range([this.height, 0]);
		/**
		 * The Y axis of the histogram
		 * @member {Object} yAxis
		 */
		this.yAxis = d3.axisLeft(this.yScale);
		/**
		 * The group of the Y axis
		 * @member {Object} yAxisGroup
		 */
		this.yAxisGroup = this.tag
			.append("g")
			.attr("class","yAxis");
		this.yAxisGroup.call(this.yAxis);
		
		/**
		 * The names of the columns
		 * @member {string[]} xAxisNames
		 */
		this.xAxisNames = [];
		
		/**
		 * The columns of the histogram
		 * @member {Object} colSelection
		 */
		this.colSelection = null;
		
		/**
		 * The color scale of the histogram. Used to set the colors of each column in the histogram
		 * @member {Object} colorScale
		 */
		this.colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/** 
	 * Sets the names of the columns of the histogram and modify the axis
	 * @param {string[]} newDomain - An array of names for the columns
	 */
	setXDomain(newDomain) {
		this.xAxisNames = newDomain.slice();
		newDomain.push("");
		newDomain.unshift("");
		var sequence = Chart.genSequence(0, newDomain.length, this.width);
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
	 * Inserts data on the histogram and plots it
	 * @param {number[]} dataset - An array of values for the columns
	 * @param {Object} attributes - An object containing functions or constants for attributes of the columns
	 * @param {Object} onEvents - An object containing functions for events
	 */
	setData(dataset, attributes, onEvents) {
		var colWidth = this.width / (this.xAxisNames.length + 1);
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
		Chart.addIfNull(attributes, "height", (d, i)=>(thisChart.height - thisChart.yScale(d)));
		
		//Column selection and color setting
		this.colSelection = this.tag.selectAll(".column").data(dataset).enter().append("rect")
			.attr("fill", (d, i)=>(thisChart.colorScale(i % thisChart.colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.colSelection, attributes, onEvents);
	}
	
	/** 
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function
	 * @param {string[]} newColors - An array of colors for the colorScale to work with
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
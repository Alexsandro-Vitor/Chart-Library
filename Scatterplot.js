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
		super(container, id, position, margins, dimensions, "scatteplotChart");
		
		/**
		 * The X scale of the chart.
		 * @member {d3.scale} Scatterplot#xScale
		 * @default d3.scaleLinear().range([0, this.width])
		 */
		this.xScale = d3.scaleLinear()
			.range([0, this.width]);
		/**
		 * The Y scale of the chart.
		 * @member {d3.scale} Scatterplot#yScale
		 * @default d3.scaleLinear().range([this.height, 0])
		 */
		this.yScale = d3.scaleLinear()
			.range([this.height, 0]);
		/**
		 * The top X axis of the chart.
		 * @member {d3.axis} Scatterplot#xAxisTop
		 * @default d3.axisTop(this.xScale)
		 */
		this.xAxisTop = d3.axisTop(this.xScale);
		/**
		 * The bottom X axis of the chart.
		 * @member {d3.axis} Scatterplot#xAxisBottom
		 * @default d3.axisBottom(this.xScale
		 */
		this.xAxisBottom = d3.axisBottom(this.xScale);
		/**
		 * The group of the top X axis.
		 * @member {d3.selection} Scatterplot#xAxisTopGroup
		 */
		this.xAxisTopGroup = this.tag
			.append("g")
			.attr("class", "xAxis");
		this.xAxisTopGroup.call(this.xAxisTop);
		/**
		 * The group of the bottom X axis.
		 * @member {d3.selection} Scatterplot#xAxisBottomGroup
		 */
		this.xAxisBottomGroup = this.tag
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0, " + this.height + ")");
		this.xAxisBottomGroup.call(this.xAxisBottom);
		/**
		 * The left Y axis of the chart.
		 * @member {d3.axis} Scatterplot#yAxisLeft
		 * @default d3.axisLeft(this.yScale)
		 */
		this.yAxisLeft = d3.axisLeft(this.yScale);
		/**
		 * The right Y axis of the chart.
		 * @member {d3.axis} Scatterplot#yAxisRight
		 * @default d3.axisRight(this.yScale)
		 */
		this.yAxisRight = d3.axisRight(this.yScale);
		/**
		 * The group of the left Y axis.
		 * @member {d3.selection} Scatterplot#yAxisLeftGroup
		 */
		this.yAxisLeftGroup = this.tag
			.append("g")
			.attr("class", "yAxis")
		this.yAxisLeftGroup.call(this.yAxisLeft);
		/**
		 * The group of the right Y axis.
		 * @member {d3.selection} Scatterplot#yAxisRightGroup
		 */
		this.yAxisRightGroup = this.tag
			.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + this.width + ", 0)");
		this.yAxisRightGroup.call(this.yAxisRight);
		/**
		 * The dots of the scatterplot.
		 * @member {d3.selection} Scatterplot#dotSelection
		 */
		this.dotSelection = null;
		/**
		 * The color scale of the scatterplot. Used to set the colors of each dot.
		 * @member {d3.scale} Scatterplot#colorScale
		 * @default d3.scaleLinear().domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1)).range(d3.schemeCategory10)
		 */
		this.colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/** 
	 * Inserts data on the scatterplot and plots it.
	 * @param {number[]} dataset - An array of values for the dots.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setData(dataset, attributes, onEvents) {
		var thisChart = this;
		
		//Adjusting the scales and axis
		Chart.adjustScaleDomain(this.xScale, this.xAxisTop, this.xAxisTopGroup, d3.min(dataset.map(d=>d[0])), d3.max(dataset.map(d=>d[0])));
		Chart.adjustScaleDomain(this.xScale, this.xAxisBottom, this.xAxisBottomGroup, d3.min(dataset.map(d=>d[0])), d3.max(dataset.map(d=>d[0])));
		Chart.adjustScaleDomain(this.yScale, this.yAxisLeft, this.yAxisLeftGroup, d3.min(dataset.map(d=>d[1])), d3.max(dataset.map(d=>d[1])));
		Chart.adjustScaleDomain(this.yScale, this.yAxisLeft, this.yAxisLeftGroup, d3.min(dataset.map(d=>d[1])), d3.max(dataset.map(d=>d[1])));
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dot" + i));
		attributes["class"] = "dot";
		Chart.addIfNull(attributes, "cx", (d, i)=>(thisChart.xScale(d[0])));
		Chart.addIfNull(attributes, "cy", (d, i)=>(thisChart.yScale(d[1])));
		Chart.addIfNull(attributes, "r", "4px");
		
		//Column selection and color setting
		this.dotSelection = this.tag.selectAll(".dot").data(dataset).enter().append("circle")
			.attr("fill", (d, i)=>(thisChart.colorScale(i % thisChart.colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.dotSelection, attributes, onEvents);
	}
	
	/** 
	 * Clears the chart, removing all paths and dots.
	 */
	clear() {
		if (this.dotSelection) {
			this.dotSelection.remove();
			this.dotSelection = null;
		}
	}
}
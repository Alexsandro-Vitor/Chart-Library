class Scatterplot extends Chart {
	/**
	 * @constructor
	 * @param {Object} container - The tag in which the chart will be inserted
	 * @param {string} id - The id of the chart tag
	 * @param {(Object|number)} margins - The margins of the chart. If a number is passed, all its values will be the same
	 * @param {number} margins.left - Left margin of the chart
	 * @param {number} margins.right - Right margin of the chart
	 * @param {number} margins.top - Upper margin of the chart
	 * @param {number} margins.bottom - Lower margin of the chart
	 * @param {number} totalWidth - The width of the chart, counting the margins
	 * @param {number} totalHeight - The height of the chart, counting the margins 
	 */
	constructor(container, id, margins, totalWidth, totalHeight) {
		super(container, id, margins, totalWidth, totalHeight, "scatteplotChart");
		
		/**
		 * The X scale of the chart.
		 * @member {Object} xScale
		 */
		this.xScale = d3.scaleLinear()
			.range([0, this.width]);
		/**
		 * The Y scale of the chart.
		 * @member {Object} yScale
		 */
		this.yScale = d3.scaleLinear()
			.range([this.height, 0]);
		/**
		 * The top X axis of the chart
		 * @member {Object} xAxisTop
		 */
		this.xAxisTop = d3.axisTop(this.xScale);
		/**
		 * The bottom X axis of the chart
		 * @member {Object} xAxisBottom
		 */
		this.xAxisBottom = d3.axisBottom(this.xScale);
		/**
		 * The group of the top X axis
		 * @member {Object} xAxisTopGroup
		 */
		this.xAxisTopGroup = this.tag
			.append("g")
			.attr("class", "xAxis");
		this.xAxisTopGroup.call(this.xAxisTop);
		/**
		 * The group of the bottom X axis
		 * @member {Object} xAxisBottomGroup
		 */
		this.xAxisBottomGroup = this.tag
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0, " + this.height + ")");
		this.xAxisBottomGroup.call(this.xAxisBottom);
		/**
		 * The left Y axis of the chart
		 * @member {Object} yAxisLeft
		 */
		this.yAxisLeft = d3.axisLeft(this.yScale);
		/**
		 * The right Y axis of the chart
		 * @member {Object} yAxisRight
		 */
		this.yAxisRight = d3.axisRight(this.yScale);
		/**
		 * The group of the left Y axis
		 * @member {Object} yAxisLeftGroup
		 */
		this.yAxisLeftGroup = this.tag
			.append("g")
			.attr("class", "yAxis")
		this.yAxisLeftGroup.call(this.yAxisLeft);
		/**
		 * The group of the right Y axis
		 * @member {Object} yAxisRightGroup
		 */
		this.yAxisRightGroup = this.tag
			.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + this.width + ", 0)");
		this.yAxisRightGroup.call(this.yAxisRight);
		/**
		 * The dots of the scatterplot
		 * @member {Object} dotSelection
		 */
		this.dotSelection = null;
		/**
		 * The color scale of the scatterplot. Used to set the colors of each dot.
		 * @member {Object} colorScale
		 */
		this.colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/** 
	 * Inserts data on the scatterplot and plots it
	 * @param {number[]} dataset - An array of values for the dots
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots
	 * @param {Object} onEvents - An object containing functions for events
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
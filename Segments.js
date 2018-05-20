class Segments extends Chart {
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
		super(container, id, margins, totalWidth, totalHeight, "segmentsChart");
		
		/**
		 * The X scale of the chart. Used by the columns
		 * @member {Object} xScale
		 */
		this.xScale = d3.scaleLinear();
		
		/**
		 * The X scale of the chart. Used by the axis
		 * @member {Object} xAxisScale
		 */
		this.xAxisScale = d3.scaleOrdinal()
			.range([0, this.width]);
		/**
		 * The X axis of the chart
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
		 * The Y scale of the chart. Used by the axis and the columns
		 * @member {Object} yScale
		 */
		this.yScale = d3.scaleLinear()
			.range([this.height, 0]);
		/**
		 * The Y axis of the chart
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
		 * The names in the X axis
		 * @member {string[]} xAxisNames
		 */
		this.xAxisNames = [];
		
		/**
		 * The segments of the chart
		 * @member {Object} segSelection
		 */
		this.segSelection = [];
		/**
		 * The dots of the chart
		 * @member {Object} dotSelection
		 */
		this.dotSelection = [];
		/**
		 * The ranges of the chart
		 * @member {Object} rangeSelection
		 */
		this.rangeSelection = [];
		
		/**
		 * The color scale for dots on the chart. Used to set the colors of each dotGroup in the chart
		 * @member {Object} dotColorScale
		 */
		this.dotColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet1.length, d3.schemeSet1.length - 1))
			.range(d3.schemeSet1);
		
		/**
		 * The color scale for ranges on the chart. Used to set the colors of each scale in the chart
		 * @member {Object} rangeColorScale
		 */
		this.rangeColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet2.length, d3.schemeSet2.length - 1))
			.range(d3.schemeSet2);
	}
	
	/** 
	 * Sets the names the X axis
	 * @param {string[]} newDomain - An array of names for the X axis
	 */
	setXDomain(newDomain) {
		this.xAxisNames = newDomain.slice();
		var sequence = Chart.genSequence(0, newDomain.length, this.width);
		this.xAxisScale
			.domain(newDomain)
			.range(sequence);
		this.xAxis.scale(this.xAxisScale);
		this.xAxisGroup.call(this.xAxis);
		
		this.xScale
			.domain([0, this.xAxisNames.length-1])
			.range([0, this.width]);
	}
	
	/** 
	 * Inserts data on the chart as segments and plots it
	 * @param {number[][]} dataset - An array of arrays for each segment
	 * @param {Object} attributes - An object containing functions or constants for attributes of the segments
	 * @param {Object} onEvents - An object containing functions for events
	 */
	setSegments(dataset, attributes, onEvents) {
		var thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("seg" + i));
		attributes["class"] = "segment";
		Chart.addIfNull(attributes, "d", (d, i)=>(thisChart.genSegPath(d)));
		Chart.addIfNull(attributes, "stroke", "black");
		
		this.segSelection = this.tag.selectAll(".segment").data(dataset).enter().append("path")
			.attr("fill", "transparent");
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.segSelection, attributes, onEvents);
	}
	
	/** 
	 * Inserts data on the chart as dots and plots it
	 * @param {number[][]} dataset - An array of arrays for each dot
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots
	 * @param {Object} onEvents - An object containing functions for events
	 */
	setDots(dataset, attributes, onEvents) {
		var thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dotGroup" + i));
		attributes["class"] = "dotGroup";
		Chart.addIfNull(attributes, "r", "5px");
		Chart.addIfNull(attributes, "cx", (d, i)=>thisChart.xScale(i));
		Chart.addIfNull(attributes, "cy", (d, i)=>thisChart.yScale(d));
		
		//Creating the groups
		this.dotSelection = this.tag.selectAll(".dotGroup").data(dataset).enter().append("g")
			.attr("id", attributes["id"])
			.attr("class", attributes["class"])
			.attr("fill", (d, i)=>(thisChart.dotColorScale(i % thisChart.dotColorScale.domain().length)))
			.selectAll(".groupDot").data(d=>d).enter().append("circle");
		
		attributes["id"] = (d, i)=>("dot_" + thisChart.xAxisNames[i]);
		attributes["class"] = "groupDot";
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.dotSelection, attributes, onEvents);
	}
	
	/** 
	 * Inserts data on the chart as ranges and plots it
	 * @param {number[][][]} dataset - An array of arrays for each range
	 * @param {number[][]} dataset[i] - The data used to create one range
	 * @param {number[]} dataset[i][0] - The array with the minimum values of the range
	 * @param {number[]} dataset[i][1] - The array with the maximum values of the range
	 * @param {Object} attributes - An object containing functions or constants for attributes of the ranges
	 * @param {Object} onEvents - An object containing functions for events
	 */
	setRanges(dataset, attributes, onEvents) {		
		var thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("range" + i));
		attributes["class"] = "range";
		Chart.addIfNull(attributes, "d", (d, i)=>(thisChart.genRangePath(d[0], d[1])));
		
		this.rangeSelection = this.tag.selectAll(".range").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart.rangeColorScale(i % thisChart.rangeColorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.rangeSelection, attributes, onEvents);
	}
	
	/**
	 * Generates a path for a segment
	 * @param {number[]} d - The array with the values of the path
	 * @returns {string} A value for the "d" field of the path
	 */
	genSegPath(d) {
		var path = d3.path();
		path.moveTo(this.xScale(0), this.yScale(d[0]));
		for (var i = 1; i < d.length; i++) {
			path.lineTo(this.xScale(i), this.yScale(d[i]));
		}
		return path.toString();
	}
	
	/**
	 * Generates a path for a range
	 * @param {number[]} minValues - The array with the minimum values of the range
	 * @param {number[]} maxValues - The array with the maximum values of the range
	 * @returns {string} A value for the "d" field of the path
	 */
	genRangePath(minValues, maxValues) {
		var path = d3.path();
		path.moveTo(this.xScale(0), this.yScale(minValues[0]));
		for (var i = 1; i < minValues.length; i++) {
			path.lineTo(this.xScale(i), this.yScale(minValues[i]));
		}
		for (var i = maxValues.length-1; i >= 0; i--) {
			path.lineTo(this.xScale(i), this.yScale(maxValues[i]));
		}
		path.closePath();
		return path.toString();
	}
	
	/** 
	 * Sets the new colors of the dotGroups. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function
	 * @param {string[]} newColors - An array of colors for the dotColorScale to work with
	 */
	setDotColorScale(newColors) {
		this.dotColorScale.range(newColors);
	}
	
	/** 
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function
	 * @param {string[]} newColors - An array of colors for the rangeColorScale to work with
	 */
	setRangeColorScale(newColors) {
		this.rangeColorScale.range(newColors);
	}
}
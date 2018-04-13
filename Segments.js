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
		 * The ranges of the chart
		 * @member {Object} rangeSelection
		 */
		this.rangeSelection = [];
		
		/**
		 * The color scale of the chart. Used to set the colors of each column in the chart
		 * @member {Object} colorScale
		 */
		this.colorScale = d3.scaleLinear()
			.range(["red", "green"]);
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
		Chart.addIfNull(attributes, "id", function(d, i) {return "seg" + i;});
		attributes["class"] = "segment";
		Chart.addIfNull(attributes, "d", function(d, i) {return thisChart.genSegPath(d);});
		Chart.addIfNull(attributes, "stroke", "black");
		
		this.segSelection = this.tag.selectAll(".segment").data(dataset).enter().append("path")
			.attr("fill", "transparent");
		
		//Setting attributes
		for (var attrName in attributes) {
			this.segSelection.attr(attrName, attributes[attrName]);
		}
		
		//Setting events
		for (var eventName in onEvents) {
			this.segSelection.on(eventName, onEvents[eventName]);
		}
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
		if (attributes == null) attributes = [];
		
		//Mandatory attributes
		Chart.addIfNull(attributes, "id", function(d, i) {return "range" + i;});
		attributes["class"] = "range";
		Chart.addIfNull(attributes, "d", function(d, i) {return thisChart.genRangePath(d[0], d[1]);});
		
		this.rangeSelection = this.tag.selectAll(".range").data(dataset).enter().append("path")
			.attr("fill", function(d, i) {
				if (dataset.length == 1) return thisChart.colorScale(0);
				else return thisChart.colorScale(i * thisChart.xScale.domain()[1] / (dataset.length-1));
			});
		
		//Setting attributes
		for (var attrName in attributes) {
			this.rangeSelection.attr(attrName, attributes[attrName]);
		}
		
		//Setting events
		for (var eventName in onEvents) {
			this.rangeSelection.on(eventName, onEvents[eventName]);
		}
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
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function
	 * @param {string[]} newColors - An array of colors for the colorScale to work with
	 */
	setColorScale(newColors) {
		var sequence = Chart.genSequence(0, newColors.length, this.xAxisNames.length-1);
		this.colorScale
			.domain(sequence)
			.range(newColors);
		var thisHist = this;
		if (this.colSelection != null) this.colSelection.attr("fill", function(d, i) {return thisHist.colorScale(i);});
	}
}
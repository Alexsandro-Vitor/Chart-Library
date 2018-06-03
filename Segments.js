/**
 * Class that represents a Segment chart.
 * @extends Chart
 */
class Segments extends Chart {
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
		super(container, id, position, margins, dimensions, "segmentsChart");
		
		/**
		 * The X scale of the chart. Used by the segments.
		 * @member {d3.scale} Segments#xScale
		 * @default d3.scaleLinear()
		 */
		this.xScale = d3.scaleLinear();
		
		/**
		 * The X scale of the chart. Used by the axis.
		 * @member {d3.scale} Segments#xAxisScale
		 * @default d3.scaleOrdinal().range([0, this.width()])
		 */
		this.xAxisScale = d3.scaleOrdinal()
			.range([0, this._width]);
		/**
		 * The X axis of the chart.
		 * @member {d3.axis} Segments#xAxis
		 * @default d3.axisBottom(this.xAxisScale)
		 */
		this.xAxis = d3.axisBottom(this.xAxisScale);
		/**
		 * The group of the X axis.
		 * @member {d3.selection} Segments#xAxisGroup
		 */
		this.xAxisGroup = this._selection
			.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + this._height  + ")");
		this.xAxisGroup.call(this.xAxis);
		
		/**
		 * The Y scale of the chart. Used by the axis and the columns.
		 * @member {d3.scale} Segments#yScale
		 * @default d3.scaleLinear().range([this.height(), 0])
		 */
		this.yScale = d3.scaleLinear()
			.range([this._height, 0]);
		/**
		 * The Y axis of the chart.
		 * @member {d3.axis} Segments#yAxis
		 * @default d3.axisLeft(this.yScale)
		 */
		this.yAxis = d3.axisLeft(this.yScale);
		/**
		 * The group of the Y axis.
		 * @member {d3.selection} Segments#yAxisGroup
		 */
		this.yAxisGroup = this._selection
			.append("g")
			.attr("class","yAxis");
		this.yAxisGroup.call(this.yAxis);
		
		/**
		 * The names in the X axis.
		 * @member {string[]} Segments#xAxisNames
		 */
		this.xAxisNames = [];
		
		this._rangeLayer = this._selection.append("g");
		this._segLayer = this._selection.append("g");
		this._dotLayer = this._selection.append("g");
		
		/**
		 * The segments of the chart.
		 * @member {d3.selection} Segments#segSelection
		 */
		this.segSelection = null;
		/**
		 * The dots of the chart.
		 * @member {d3.selection} Segments#dotSelection
		 */
		this.dotSelection = null;
		/**
		 * The ranges of the chart.
		 * @member {d3.selection} Segments#rangeSelection
		 */
		this.rangeSelection = null;
		
		/**
		 * A path generator for the segments.
		 * @member {d3.line} Segments#segPathGenerator
		 * @default d3.line().x((d, i)=>this.xScale(i)).y((d, i)=>this.yScale(d));
		 */
		this.segPathGenerator = d3.line()
			.x((d, i)=>this.xScale(i))
			.y((d, i)=>this.yScale(d));
		
		/**
		 * A path generator for the range.
		 * @member {d3.area} Segments#rangePathGenerator
		 * @default d3.area().x((d, i)=>this.xScale(i)).y0((d, i)=>this.yScale(d[0])).y1((d, i)=>this.yScale(d[1]));
		 */
		this.rangePathGenerator = d3.area()
			.x((d, i)=>this.xScale(i))
			.y0((d, i)=>this.yScale(d[0]))
			.y1((d, i)=>this.yScale(d[1]));
		
		/**
		 * The color scale for dots on the chart. Used to set the colors of each dotGroup in the chart.
		 * @member {d3.scale} Segments#dotColorScale
		 * @default d3.scaleLinear().domain(Chart.genSequence(0, d3.schemeSet1.length, d3.schemeSet1.length - 1)).range(d3.schemeSet1)
		 */
		this.dotColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet1.length, d3.schemeSet1.length - 1))
			.range(d3.schemeSet1);
		
		/**
		 * The color scale for ranges on the chart. Used to set the colors of each scale in the chart.
		 * @member {d3.scale} Segments#rangeColorScale
		 * @default d3.scaleLinear().domain(Chart.genSequence(0, d3.schemeSet2.length, d3.schemeSet2.length - 1)).range(d3.schemeSet2)
		 */
		this.rangeColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet2.length, d3.schemeSet2.length - 1))
			.range(d3.schemeSet2);
	}
	
	/** 
	 * Sets the names the X axis.
	 * @param {string[]} newDomain - An array of names for the X axis.
	 */
	setXDomain(newDomain) {
		this.xAxisNames = newDomain.slice();
		let sequence = Chart.genSequence(0, newDomain.length, this._width);
		this.xAxisScale
			.domain(newDomain)
			.range(sequence);
		this.xAxis.scale(this.xAxisScale);
		this.xAxisGroup.call(this.xAxis);
		
		this.xScale
			.domain([0, this.xAxisNames.length-1])
			.range([0, this._width]);
	}
	
	/** 
	 * Inserts data on the chart as segments and plots it.
	 * @param {number[][]} dataset - An array of arrays for each segment.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the segments.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setSegments(dataset, attributes, onEvents) {
		let thisChart = this;
		
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>d3.extent(d));
		datasetExtent.push(this.yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this.yScale, this.yAxis, this.yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("seg" + i));
		attributes["class"] = "segment";
		Chart.addIfNull(attributes, "d", (d, i)=>(thisChart.segPathGenerator(d)));
		Chart.addIfNull(attributes, "stroke", "black");
		
		this.segSelection = this._segLayer.selectAll(".segment").data(dataset).enter().append("path")
			.attr("fill", "transparent");
		
		//Updating previous selections
		if (this.dotSelection) {
			this.dotSelection
				.attr("cx", (d, i)=>thisChart.xScale(i))
				.attr("cy", (d, i)=>thisChart.yScale(d));
		}
		if (this.rangeSelection) this.rangeSelection.attr("d", (d, i)=>(thisChart.rangePathGenerator(d)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.segSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Inserts data on the chart as dots and plots it.
	 * @param {number[][]} dataset - An array of arrays for each dot.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setDots(dataset, attributes, onEvents) {
		let thisChart = this;
		
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>d3.extent(d));
		datasetExtent.push(this.yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this.yScale, this.yAxis, this.yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dotGroup" + i));
		attributes["class"] = "dotGroup";
		Chart.addIfNull(attributes, "r", "5px");
		Chart.addIfNull(attributes, "cx", (d, i)=>thisChart.xScale(i));
		Chart.addIfNull(attributes, "cy", (d, i)=>thisChart.yScale(d));
		
		//Creating the groups
		this.dotSelection = this._dotLayer.selectAll(".dotGroup").data(dataset).enter().append("g")
			.attr("id", attributes["id"])
			.attr("class", attributes["class"])
			.attr("fill", (d, i)=>(thisChart.dotColorScale(i % thisChart.dotColorScale.domain().length)))
			.selectAll(".groupDot").data(d=>d).enter().append("circle");
		
		//Updating previous selections
		if (this.segSelection) this.segSelection.attr("d", (d, i)=>(thisChart.segPathGenerator(d)));
		if (this.rangeSelection) this.rangeSelection.attr("d", (d, i)=>(thisChart.rangePathGenerator(d)));
		
		attributes["id"] = (d, i)=>("dot_" + thisChart.xAxisNames[i]);
		attributes["class"] = "groupDot";
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.dotSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Inserts data on the chart as ranges and plots it.
	 * @param {number[][][]} dataset - An array of arrays for each range.
	 * @param {number[][]} dataset[i] - The data used to create one range.
	 * @param {number[]} dataset[i][a] - Array with the minimum and maximum values (respectively) at index 'a'.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the ranges.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setRanges(dataset, attributes, onEvents) {		
		let thisChart = this;
		
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>[d3.min(d.map(d=>d[0])), d3.max(d.map(d=>d[1]))]);
		datasetExtent.push(this.yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this.yScale, this.yAxis, this.yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("range" + i));
		attributes["class"] = "range";
		Chart.addIfNull(attributes, "d", (d, i)=>(thisChart.rangePathGenerator(d)));
		
		this.rangeSelection = this._rangeLayer.selectAll(".range").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart.rangeColorScale(i % thisChart.rangeColorScale.domain().length)));
		
		//Updating previous selections
		if (this.dotSelection) {
			this.dotSelection
				.attr("cx", (d, i)=>thisChart.xScale(i))
				.attr("cy", (d, i)=>thisChart.yScale(d));
		}
		if (this.segSelection) this.segSelection.attr("d", (d, i)=>(thisChart.segPathGenerator(d)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.rangeSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the new colors of the dotGroups. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function.
	 * @param {string[]} newColors - An array of colors for the dotColorScale to work with.
	 */
	setDotColorScale(newColors) {
		this.dotColorScale.range(newColors);
	}
	
	/** 
	 * Sets the new colors of the chart. The colors need to be set here because you cant have an "fill" field in an array, since it's the name of an array function.
	 * @param {string[]} newColors - An array of colors for the rangeColorScale to work with.
	 */
	setRangeColorScale(newColors) {
		this.rangeColorScale.range(newColors);
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Scatterplot} This chart.
	 */
	clear() {
		if (this.dotSelection) {
			this.dotSelection.remove();
			this.dotSelection = null;
		}
		if (this.segSelection) {
			this.segSelection.remove();
			this.segSelection = null;
		}
		if (this.rangeSelection) {
			this.rangeSelection.remove();
			this.rangeSelection = null;
		}
		return super.clear();
	}
}
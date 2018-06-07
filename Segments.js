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
		
		this._xScale = d3.scaleLinear()
			.range([0, this._width]);
		
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
			.attr("class","yAxis");
		this._yAxisGroup.call(this._yAxis);
		
		//Layers to make sure the ranges stay behind the segments and the segments stay behind the dots
		this._rangeLayer = this._selection.append("g");
		this._segLayer = this._selection.append("g");
		this._dotLayer = this._selection.append("g");
		
		this._segSelection = null;
		
		this._dotSelection = null;
		
		this._rangeSelection = null;
		
		this.segPathGenerator = d3.line()
			.x((d, i)=>this._xScale(i))
			.y((d, i)=>this._yScale(d));
		
		this.rangePathGenerator = d3.area()
			.x((d, i)=>this._xScale(i))
			.y0((d, i)=>this._yScale(d[0]))
			.y1((d, i)=>this._yScale(d[1]));
		
		this._dotColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet1.length, d3.schemeSet1.length - 1))
			.range(d3.schemeSet1);
		
		this._rangeColorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeSet2.length, d3.schemeSet2.length - 1))
			.range(d3.schemeSet2);
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
	 * @returns {(Segments|d3.scale)} This object or the current xAxisScale.
	 */
	xAxisScale(scale) {
		if (scale) {
			this._xAxisScale = scale;
			this._xScale.domain([0, scale.domain().length-1]);
			Chart.adjustScaleDomain(this._xAxisScale, this._xAxis, this._xAxisGroup, this._xAxisScale.domain());
			return this;
		} else {
			return this._xScale;
		}
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
	 * Returns the selection of the segments of the chart.
	 * @returns {d3.selection} The segments of this chart.
	 */
	segSelection() {
		return this._segSelection;
	}
	
	/**
	 * Returns the selection of the dots of the chart.
	 * @returns {d3.selection} The dots of this chart.
	 */
	dotSelection() {
		return this._dotSelection;
	}
	
	/**
	 * Returns the selection of the ranges of the chart.
	 * @returns {d3.selection} The ranges of this chart.
	 */
	rangeSelection() {
		return this._rangeSelection;
	}
	
	/**
	 * A path generator for the segments. If gen is given, sets it, otherwise returns the current segPathGenerator.
	 * @param {d3.line} gen - The new segPathGenerator.
	 * @returns {(Segments|d3.line)} This object or the current segPathGenerator.
	 */
	segPathGenerator(gen) {
		if (gen) {
			this._segPathGenerator = gen;
			return this;
		} else {
			return this._segPathGenerator;
		}
	}
	
	/**
	 * A path generator for the range. If gen is given, sets it, otherwise returns the current rangePathGenerator.
	 * @param {d3.area} gen - The new rangePathGenerator.
	 * @returns {(Segments|d3.area)} This object or the current rangePathGenerator.
	 */
	rangePathGeneration(gen) {
		if (gen) {
			this._rangePathGenerator = gen;
			return this;
		} else {
			return this._rangePathGenerator;
		}
	}
	
	/**
	 * The color scale for ranges on the chart. Used to set the colors of each scale in the chart. If scale is given, sets it, otherwise returns the current dotColorScale.
	 * @param {d3.scale} scale - The new dotColorScale.
	 * @returns {(Segments|d3.scale)} This object or the current dotColorScale.
	 */
	dotColorScale(scale) {
		if (scale) {
			this._dotColorScale = scale;
			return this;
		} else {
			return this._dotColorScale;
		}
	}
	
	/**
	 * The color scale for ranges on the chart. Used to set the colors of each scale in the chart. If scale is given, sets it, otherwise returns the current rangeColorScale.
	 * @param {d3.scale} scale - The new rangeColorScale.
	 * @returns {(Segments|d3.scale)} This object or the current rangeColorScale.
	 */
	rangeColorScale(scale) {
		if (scale) {
			this._rangeColorScale = scale;
			return this;
		} else {
			return this._rangeColorScale;
		}
	}
	
	/** 
	 * Inserts data on the chart as segments and plots it.
	 * @param {number[][]} dataset - An array of arrays for each segment.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the segments.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Segments} This chart.
	 */
	setSegments(dataset, attributes, onEvents) {
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>d3.extent(d));
		datasetExtent.push(this._yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("seg" + i));
		attributes["class"] = "segment";
		Chart.addIfNull(attributes, "d", (d, i)=>(this.segPathGenerator(d)));
		Chart.addIfNull(attributes, "stroke", "black");
		
		this._segSelection = this._segLayer.selectAll(".segment").data(dataset).enter().append("path")
			.attr("fill", "transparent");
		
		//Updating previous selections
		if (this._dotSelection) {
			this._dotSelection
				.attr("cx", (d, i)=>this._xScale(i))
				.attr("cy", (d, i)=>this._yScale(d));
		}
		if (this._rangeSelection) this._rangeSelection.attr("d", (d, i)=>(this.rangePathGenerator(d)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._segSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Inserts data on the chart as dots and plots it.
	 * @param {number[][]} dataset - An array of arrays for each dot.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the dots.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Segments} This chart.
	 */
	setDots(dataset, attributes, onEvents) {
		let thisChart = this;
		
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>d3.extent(d));
		datasetExtent.push(this._yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dotGroup" + i));
		attributes["class"] = "dotGroup";
		Chart.addIfNull(attributes, "r", "5px");
		Chart.addIfNull(attributes, "cx", (d, i)=>this._xScale(i));
		Chart.addIfNull(attributes, "cy", (d, i)=>this._yScale(d));
		
		//Creating the groups
		this._dotSelection = this._dotLayer.selectAll(".dotGroup").data(dataset).enter().append("g")
			.attr("id", attributes["id"])
			.attr("class", attributes["class"])
			.attr("fill", (d, i)=>(thisChart._dotColorScale(i % thisChart._dotColorScale.domain().length)))
			.selectAll(".groupDot").data(d=>d).enter().append("circle");
		
		//Updating previous selections
		if (this._segSelection) this._segSelection.attr("d", (d, i)=>(this.segPathGenerator(d)));
		if (this._rangeSelection) this._rangeSelection.attr("d", (d, i)=>(this.rangePathGenerator(d)));
		
		attributes["id"] = (d, i)=>("dot_" + this._xAxisScale.domain()[i]);
		attributes["class"] = "groupDot";
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._dotSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Inserts data on the chart as ranges and plots it.
	 * @param {number[][][]} dataset - An array of arrays for each range.
	 * @param {number[][]} dataset[i] - The data used to create one range.
	 * @param {number[]} dataset[i][a] - Array with the minimum and maximum values (respectively) at index 'a'.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the ranges.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Segments} This chart.
	 */
	setRanges(dataset, attributes, onEvents) {		
		let thisChart = this;
		
		//Adjusting the yScale and axis
		let datasetExtent = dataset.map(d=>[d3.min(d.map(d=>d[0])), d3.max(d.map(d=>d[1]))]);
		datasetExtent.push(this._yScale.domain());
		let newDomain = [d3.min(datasetExtent.map(d=>d[0])), d3.max(datasetExtent.map(d=>d[1]))];
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, newDomain);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("range" + i));
		attributes["class"] = "range";
		Chart.addIfNull(attributes, "d", (d, i)=>(this.rangePathGenerator(d)));
		
		this._rangeSelection = this._rangeLayer.selectAll(".range").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart._rangeColorScale(i % thisChart._rangeColorScale.domain().length)));
		
		//Updating previous selections
		if (this._dotSelection) {
			this._dotSelection
				.attr("cx", (d, i)=>this._xScale(i))
				.attr("cy", (d, i)=>this._yScale(d));
		}
		if (this._segSelection) this._segSelection.attr("d", (d, i)=>(this.segPathGenerator(d)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._rangeSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Segments} This chart.
	 */
	clear() {
		if (this._dotSelection) {
			this._dotSelection.remove();
			this._dotSelection = null;
		}
		if (this._segSelection) {
			this._segSelection.remove();
			this._segSelection = null;
		}
		if (this._rangeSelection) {
			this._rangeSelection.remove();
			this._rangeSelection = null;
		}
		return super.clear();
	}
}
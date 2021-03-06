/**
 * Class that represents a Chart.
 */
 class Chart {
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
	 * @param {string} tagClass - The type of chart.
	 */
	constructor(container, id, position, margins, dimensions, tagClass) {
		this._container = container;
		
		this._id = id;
		
		if ((position == null) || (typeof(position) != "object")) {
			this._x = 0;
			this._y = 0;
		} else {
			this._x = position.x;
			this._y = position.y;
		}
		
		if (margins == null) {
			this._margins = {left:10, right:10, top:10, bottom:10};
		} else if (typeof(margins) == "number") {
			this._margins = {left:margins, right:margins, top:margins, bottom:margins};
		} else {
			this._margins = margins;
		}
		
		if (dimensions == null) {
			this._width = container.attr("width") - this._margins.left - this._margins.right;
			this._height = container.attr("height") - this._margins.top - this._margins.bottom;
		} else {
			this._width = dimensions.width - this._margins.left - this._margins.right;
			this._height = dimensions.height - this._margins.top - this._margins.bottom;
		}
		
		this._selection = this._container.append("g")
			.attr("id", this._id)
			.attr("class", tagClass)
			.attr("transform", "translate(" + (this._margins.left + this._x) + "," + (this._margins.top + this._y) + ")");
	}
	
	/**
	 * Returns a selection of the tag containing this chart.
	 * @returns {d3.selection} The container of this chart.
	 */
	container() {
		return this._container;
	}
	
	/**
	 * If a value is given, sets the id, otherwise returns this chart's id.
	 * @param {string} id - The new id of the chart.
	 * @returns {(Chart|string)} This object or the current id.
	 */
	id(id) {
		if (id) {
			this._id = id;
			this._selection.attr("id", id);
			return this;
		} else {
			return this._id;
		}
	}
	
	/**
	 * Returns the coordinates of the origin of the chart.
	 * @returns {number[]} The chart's coordinates.
	 */
	position() {
		return [this._x, this._y];
	}
	
	/**
	 * Returns the margins of the chart.
	 * @returns {Object} The margins of the chart.
	 */
	margins() {
		return this._margins;
	}
		
	/**
	 * The inside width of the margin.
	 * @returns {number} The width of the chart.
	 */
	width() {
		return this._width;
	}
	
	/**
	 * The inside height of the margin.
	 * @returns {number} The height of the chart.
	 */
	height() {
		return this._height;
	}
	
	/**
	 * Returns the selection of the tag of the chart.
	 * @returns {d3.selection} The selection of this chart.
	 */
	selection() {
		return this._selection;
	}
	
	/**
	 * The label table of the chart. If table is given, sets the label table. Always returns the current or, if set, the new label table.
	 * @param {LabelTable} table - The new label table.
	 * @returns {LabelTable} The new label table.
	 */
	labelTable(table) {
		if (table) this._labelTable = table;
		return this._labelTable;
	}
	
	/** 
	 * Clears the chart, removing the label table.
	 * @returns {Chart} This chart.
	 */
	clear() {
		if (this._labelTable) {
			this._labelTable.selection().remove();
			this._labelTable = null;
		}
		return this;
	}
	
	/** 
	 * Generates an array with equally distanced values.
	 * @param {number} start - The first value of the returned array.
	 * @param {number} size - The size of the returned array.
	 * @param {number} end - The last value of the returned array.
	 * @returns {number[]} Array with equally distanced values.
	 */
	static genSequence(start, size, end) {
		let output = [];
		size--;
		for (let i = 0; i <= size; i++) {
			output.push(start + i * (end - start) / size);
		}
		return output;
	}
	
	/**
	 * Adjusts the domain of a scale and its axis.
	 * @param {d3.scale} scale - The scale to be adjusted.
	 * @param {d3.axis} axis - The axis which uses the scale.
	 * @param {d3.selection} axisGroup - The group in which the axis is.
	 * @param {number[]} domain - The new domain of the scale.
	 */
	static adjustScaleDomain(scale, axis, axisGroup, domain) {
		if (domain) scale.domain(domain);
		axis.scale(scale);
		axisGroup.call(axis);
	}
	
	/** 
	 * Adds a value to a field if it's null.
	 * @param {Object} array - The array which will have a value added.
	 * @param {(number|string)} field - The name of the field.
	 * @param {(function|number|string)} value - The value added.
	 */
	static addIfNull(array, field, value) {
		if (array[field] == null) array[field] = value;
	}
	
	/**
	 * Sets attributes and events of a selection.
	 * @param {d3.selection} selection - The selection of elements used.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the selected elements.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	static insertAttributesEvents(selection, attributes, onEvents) {
		//Setting attributes
		for (let attrName in attributes) {
			selection.attr(attrName, attributes[attrName]);
		}
		
		//Setting events
		for (let eventName in onEvents) {
			selection.on(eventName, onEvents[eventName]);
		}
	}
}

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
		
		this._xScale = d3.scaleLinear();
		
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
			.attr("class", "yAxis");
		this._yAxisGroup.call(this._yAxis);
		
		this._colSelection = null;
		
		this._colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
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
	 * @returns {(Histogram|d3.scale)} This object or the current xAxisScale.
	 */
	xAxisScale(scale) {
		if (scale) {
			this._xAxisScale = scale;
			this._xScale
				.domain([0, scale.domain().length - 3])
				.range([scale.range()[1], scale.range()[scale.domain().length - 2]]);
			Chart.adjustScaleDomain(this._xAxisScale, this._xAxis, this._xAxisGroup, this._xAxisScale.domain());
			return this;
		} else {
			return this._xAxisScale;
		}
	}
	
	/**
	 * The Y scale of the chart. If scale is given, sets it and also sets the Y axis, otherwise returns the current yScale.
	 * @param {d3.scale} scale - The new yScale.
	 * @returns {(Histogram|d3.scale)} This object or the current yScale.
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
	 * The color scale of the histogram. Used to set the colors of each column in the histogram. If scale is given, sets it and also changes the current column colors, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Histogram|d3.scale)} This object or the current colorScale.
	 */
	colorScale(scale) {
		if (scale) {
			this._colorScale = scale;
			if (this._colSelection != null) this._colSelection.attr("fill", (d, i)=>(this._colorScale(i % scale.range().length)));
			return this;
		} else {
			return this._colorScale;
		}
	}
	
	/** 
	 * Inserts data on the histogram and plots it.
	 * @param {number[]} dataset - An array of values for the columns.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the columns.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Histogram} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let colWidth = this._width / (this._xAxisScale.domain().length - 1);
		let thisChart = this;
		
		//Adjusting the yScale and axis
		Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup, [0, d3.max(dataset)]);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("col" + this._xAxisScale.domain()[i+1]));
		attributes.class = "column";
		Chart.addIfNull(attributes, "x", (d, i)=>(this._xScale(i) - colWidth/2));
		Chart.addIfNull(attributes, "y", (d, i)=>(this._yScale(d)));
		Chart.addIfNull(attributes, "width", colWidth);
		Chart.addIfNull(attributes, "height", (d, i)=>(this._height - this._yScale(d)));
		
		//Column selection and color setting
		this._colSelection = this._selection.selectAll(".column").data(dataset).enter().append("rect")
			.attr("fill", (d, i)=>(thisChart._colorScale(i % thisChart._colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._colSelection, attributes, onEvents);
		
		return this;
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

/**
 * Class that represents a Segment chart. Can also be used to create stream graphs with the segments.setRanges() function.
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
		
		this._segPathGenerator = d3.line()
			.x((d, i)=>this._xScale(i))
			.y((d, i)=>this._yScale(d));
		
		this._rangePathGenerator = d3.area()
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
			Chart.adjustScaleDomain(this._xAxisScale, this._xAxis, this._xAxisGroup);
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
			Chart.adjustScaleDomain(this._yScale, this._yAxis, this._yAxisGroup);
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
	rangePathGenerator(gen) {
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
		attributes.class = "segment";
		Chart.addIfNull(attributes, "d", (d, i)=>(this._segPathGenerator(d)));
		Chart.addIfNull(attributes, "stroke", "black");
		
		this._segSelection = this._segLayer.selectAll(".segment").data(dataset).enter().append("path")
			.attr("fill", "transparent");
		
		//Updating previous selections
		if (this._dotSelection) {
			this._dotSelection
				.attr("cx", (d, i)=>this._xScale(i))
				.attr("cy", (d, i)=>this._yScale(d));
		}
		if (this._rangeSelection) this._rangeSelection.attr("d", (d, i)=>(this._rangePathGenerator(d)));
		
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
		Chart.addIfNull(attributes, "r", "5px");
		Chart.addIfNull(attributes, "cx", (d, i)=>this._xScale(i));
		Chart.addIfNull(attributes, "cy", (d, i)=>this._yScale(d));
		
		//Creating the groups
		this._dotSelection = this._dotLayer.selectAll(".dotGroup").data(dataset).enter().append("g")
			.attr("id", (d, i)=>("dotGroup" + i))
			.attr("class", "dotGroup")
			.attr("fill", (d, i)=>(thisChart._dotColorScale(i % thisChart._dotColorScale.domain().length)))
			.selectAll(".groupDot").data(d=>d).enter().append("circle");
		
		//Updating previous selections
		if (this._segSelection) this._segSelection.attr("d", (d, i)=>(this._segPathGenerator(d)));
		if (this._rangeSelection) this._rangeSelection.attr("d", (d, i)=>(this._rangePathGenerator(d)));
		
		attributes.id = (d, i)=>("dot_" + this._xAxisScale.domain()[i]);
		attributes.class = "groupDot";
		
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
		attributes.class = "range";
		Chart.addIfNull(attributes, "d", (d, i)=>(this._rangePathGenerator(d)));
		
		this._rangeSelection = this._rangeLayer.selectAll(".range").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart._rangeColorScale(i % thisChart._rangeColorScale.domain().length)));
		
		//Updating previous selections
		if (this._dotSelection) {
			this._dotSelection
				.attr("cx", (d, i)=>this._xScale(i))
				.attr("cy", (d, i)=>this._yScale(d));
		}
		if (this._segSelection) this._segSelection.attr("d", (d, i)=>(this._segPathGenerator(d)));
		
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

/**
 * Class that represents a Map chart.
 * @extends Chart
 */
class Map extends Chart {
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
		super(container, id, position, margins, dimensions, "mapChart");
		
		this._projection = d3.geoMercator();
		this._geoPath = d3.geoPath().projection(this._projection);
		
		this._fillValue = (d, i)=>1;
		
		this._colorScale = d3.scalePow();
		
		this._colorScheme = d3.interpolateInferno;
		
		this._fillFunction = (d, i)=>this._colorScheme(this._colorScale(this._fillValue(d, i)));
		
		this._pathSelection = null;
		
		this._dotSelection = null;
	}
	
	/**
	 * Returns the selection of the paths of the chart.
	 * @returns {d3.selection} The paths of this chart.
	 */
	pathSelection() {
		return this._pathSelection;
	}
	
	/**
	 * Returns the selection of the dots of the chart.
	 * @returns {d3.selection} The dots of this chart.
	 */
	dotSelection() {
		return this._dotSelection;
	}
	
	/**
	 * If a projection is given, sets the projection of the map, otherwise returns the current projection.
	 * @param {Object} projection - The new projection of the map.
	 * @returns {(Map|d3.projection)} This object or the current projection.
	 */
	projection(projection) {
		if (projection) {
			this._projection = projection;
			this._geoPath = d3.geoPath().projection(this._projection);
			return this;
		} else {
			return this._projection;
		}
	}
	
	/**
	 * The function which determines the value of the dataset to be used on the fillFunction. Default function always returns 1. If a function is given, sets fillValue, otherwise returns the current fillValue.
	 * @param {function} func - The new fillValue.
	 * @returns {(Map|function)} This object or the current fillValue.
	 */
	fillValue(func) {
		if (func) {
			this._fillValue = func;
			return this;
		} else {
			return this._fillValue;
		}
	}
	
	/**
	 * The scale between input values and the value used at colorScheme. Its range should stay at [0, 1]. If a scale is given sets the colorScale, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Map|d3.projection)} This object or the current colorScale.
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
	 * The color scheme used at the chart. Uses d3.interpolateInferno by default. If a scale is given sets the colorScheme, otherwise returns the current colorScheme.
	 * @param {d3.scale} scheme - The new colorScheme.
	 * @returns {(Map|d3.scale)} This object or the current colorScheme.
	 */
	colorScheme(scheme) {
		if (scheme) {
			this._colorScheme = scheme;
			return this;
		} else {
			return this._colorScheme;
		}
	}
	
	/**
	 * The function which sets the colors of the map. If a function is given, sets fillFunction. Setting func to null will reset fillFunction to its default value: (d, i)=>this._colorScheme(this._colorScale(this._fillValue(d, i))). Not passing a value makes it return the current fillFunction.
	 * @param {function} func - The new fillFunction.
	 * @returns {(Map|function)} This object or the current fillFunction.
	 */
	fillFunction(func) {
		if (func) {
			this._fillFunction = func;
			return this;
		} else if (func === null) {
			this._fillFunction = (d, i)=>this._colorScheme(this._colorScale(this._fillValue(d, i)));
			return this;
		} else {
			return this._fillFunction;
		}
	}
	
	/** 
	 * Plots the geojson on the chart as paths.
	 * @param {Object} geojson - The data of a geojson file.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Map} This chart.
	 */
	setMap(geojson, attributes, onEvents) {
		let thisChart = this;
		
		//Scales the projection to centralize the map
		this._projection.fitExtent([[0, 0], [this._width, this._height]], geojson);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>d.properties.L1);
		attributes.class = "mapPath";
		Chart.addIfNull(attributes, "d", (d, i)=>this._geoPath(d.geometry));
		
		this._pathSelection = this._selection.selectAll(".mapPath").data(geojson.features).enter().append("path")
			.attr("fill", (d, i)=>thisChart._fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._pathSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Plots the dataset on the map chart.
	 * @param {number[][]} dataset - The data to be plotted on the map.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Map} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		
		this._pathSelection.data(dataset)
			.attr("fill", (d, i)=>thisChart._fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._pathSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Plots data as dots on the map chart.
	 * @param {number[][]} dataset - The data to be plotted on the map.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Map} This chart.
	 */
	setDots(dataset, attributes, onEvents) {
		let thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dot" + i));
		attributes.class = "mapDot";
		Chart.addIfNull(attributes, "r", "3px");
		Chart.addIfNull(attributes, "cx", 10);
		Chart.addIfNull(attributes, "cy", 10);
		
		this._dotSelection = this._selection.selectAll(".mapDot").data(dataset).enter().append("circle")
			.attr("fill", (d, i)=>thisChart._fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._dotSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Map} This chart.
	 */
	clear() {
		if (this._pathSelection) {
			this._pathSelection.remove();
			this._pathSelection = null;
		}
		if (this._dotSelection) {
			this._dotSelection.remove();
			this._dotSelection = null;
		}
		return super.clear();
	}
}

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
		
		this._fillFunction = (d, i)=>this._colorScale(i % this._colorScale.domain().length);
	}
	
	/**
	 * The X scale of the chart. If scale is given, sets it and also sets the X axes, otherwise returns the current xScale.
	 * @param {d3.scale} scale - The new xScale.
	 * @returns {(Scatterplot|d3.scale)} This object or the current xScale.
	 */
	xScale(scale) {
		if (scale) {
			this._xScale = scale;
			Chart.adjustScaleDomain(this._xScale, this._xAxisTop, this._xAxisTopGroup);
			Chart.adjustScaleDomain(this._xScale, this._xAxisBottom, this._xAxisBottomGroup);
			if (this._dotSelection) this._dotSelection.attr("cx", (d, i)=>this._xScale(d[0]));
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
			Chart.adjustScaleDomain(this._yScale, this._yAxisLeft, this._yAxisLeftGroup);
			Chart.adjustScaleDomain(this._yScale, this._yAxisRight, this._yAxisRightGroup);
			if (this._dotSelection) this._dotSelection.attr("cy", (d, i)=>this._yScale(d[1]));
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
	 * The function which sets the colors of the dots. If a function is given, sets fillFunction. Setting func to null will reset fillFunction to its default value: (d, i)=>this._colorScale(i % this._colorScale.domain().length). Not passing a value makes it return the current fillFunction.
	 * @param {function} func - The new fillFunction.
	 * @returns {(Scatterplot|function)} This object or the current fillFunction.
	 */
	fillFunction(func) {
		let thisChart = this;
		if (func) this._fillFunction = func;
		else if (func === null) this._fillFunction = (d, i)=>this._colorScale(i % this._colorScale.domain().length);
		else return this._fillFunction;
		
		if (this._dotSelection) this._dotSelection.attr("fill", (d, i)=>thisChart._fillFunction(d, i));
		return this;
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
		attributes.class = "dot";
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
			.attr("fill", (d, i)=>thisChart._fillFunction(d, i));
		
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

/**
 * Class that represents a Pie chart. Used to represent proportions.
 * @extends Chart
 */
class Pie extends Chart {
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
		super(container, id, position, margins, dimensions, "pieChart");
		
		this._selection.attr("transform", "translate(" + (this._margins.left + this._width / 2) + "," + (this._margins.top + this._height / 2) + ")");
		
		this._sliceSelection = null;
		
		this._labelSelection = null;
		
		this._innerRadius = (d, i)=>0;
		this._outerRadius = (d, i)=>(d3.min([this._width, this._height]) / 2);
		
		this._colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/**
	 * Returns the selection of the slices of the chart.
	 * @returns {d3.selection} The slices of this chart.
	 */
	sliceSelection() {
		return this._sliceSelection;
	}
	
	/**
	 * Returns the selection of the labels of each slice.
	 * @returns {d3.selection} The labels of the slices.
	 */
	labelSelection() {
		return this._labelSelection;
	}
	
	/**
	 * Function which sets the inner radius of the slice based on its value. If func is given, sets it, otherwise returns the current innerRadius.
	 * @param {function} func - The new innerRadius.
	 * @returns {(Pie|function)} This object or the current innerRadius.
	 */
	innerRadius(func) {
		if (func) {
			this._innerRadius = func;
			return this;
		} else {
			return this._innerRadius;
		}
	}
	
	/**
	 * Function which sets the outer radius of the slice based on its value. If func is given, sets it, otherwise returns the current outerRadius.
	 * @param {function} func - The new outerRadius.
	 * @returns {(Pie|function)} This object or the current outerRadius.
	 */
	outerRadius(func) {
		if (func) {
			this._outerRadius = func;
			return this;
		} else {
			return this._outerRadius;
		}
	}
	
	/**
	 * The color scale of the pie chart. Used to set the colors of each slice. If scale is given, sets it, otherwise returns the current colorScale.
	 * @param {d3.scale} scale - The new colorScale.
	 * @returns {(Pie|d3.scale)} This object or the current colorScale.
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
	 * Inserts data on the pie and plots it.
	 * @param {number[]} dataset - An array of values for the slices.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the slices.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Pie} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		this._pieData = d3.pie()(dataset);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("slice" + i));
		attributes.class = "slice";
		Chart.addIfNull(attributes, "d", (d, i)=>(this.genSlice(d, i)()));
		
		//Slice sliceSelection and color setting
		this._sliceSelection = this._selection.selectAll(".slice").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart._colorScale(i % thisChart._colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._sliceSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the labels of the slices.
	 * @param {string[]} labels - An array of values for the labels.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Pie} This chart.
	 */
	setSliceLabels(labels, attributes, onEvents) {
		let centroids = this._sliceSelection.data().map((d, i)=>this.genSlice(d, i).centroid());
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes.class = "sliceLabel";
		Chart.addIfNull(attributes, "x", (d, i)=>(centroids[i][0]));
		Chart.addIfNull(attributes, "y", (d, i)=>(centroids[i][1]));
		Chart.addIfNull(attributes, "text-anchor", "middle");
		Chart.addIfNull(attributes, "dominant-baseline", "middle");
		
		this._labelSelection = this._selection.selectAll(".sliceLabel").data(labels).enter().append("text")
			.text((d, i)=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._labelSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Generates slices from an array with the Array.prototype.map() function. Also uses values from innerRadius and outerRadius.
	 * @param {number} d - A value in the array.
	 * @param {number} i - An index in the array.
	 * @returns {d3.arc} Arc made with the value of the array.
	 */
	genSlice(d, i) {
		return d3.arc()
			.innerRadius(this._innerRadius(d, i))
			.outerRadius(this._outerRadius(d, i))
			.startAngle(this._pieData[i].startAngle)
			.endAngle(this._pieData[i].endAngle);
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Pie} This chart.
	 */
	clear() {
		if (this._sliceSelection) {
			this._sliceSelection.remove();
			this._sliceSelection = null;
			this._pieData = null;
		}
		if (this._labelSelection) {
			this._labelSelection.remove();
			this._labelSelection = null;
		}
		return super.clear();
	}
}

/**
 * Class that represents a Star Glyph. Used to represent multiple variables of a single sample.
 * @extends Chart
 */
class StarGlyph extends Chart {
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
		super(container, id, position, margins, dimensions, "starGlyphChart");
		
		this._selection.attr("transform", "translate(" + (this._margins.left + this._width / 2) + "," + (this._margins.top + this._height / 2) + ")");
		
		this._polygonSelection = null;
		
		this._labelSelection = null;
		
		this._scales = [];
		
		this._pathGenerator = d3.lineRadial()
			.angle((d, i)=>(this._getAngle(i)))
			.radius((d, i)=>this._scales[i % this._scales.length](d));
		
		this._fillFunction = (d, i)=>"blue";
	}
	
	/**
	 * Returns the selection of the polygon of the chart.
	 * @returns {d3.selection} The polygon of this chart.
	 */
	polygonSelection() {
		return this._polygonSelection;
	}
	
	/**
	 * Returns the selection of the labels of each corner.
	 * @returns {d3.selection} The labels of the corners.
	 */
	labelSelection() {
		return this._labelSelection;
	}
	
	/**
	 * A path generator for the polygon. If gen is given, sets it, otherwise returns the current pathGenerator.
	 * @param {d3.line} gen - The new pathGenerator.
	 * @returns {(StarGlyph|d3.lineRadial)} This object or the current pathGenerator.
	 */
	pathGenerator(gen) {
		if (gen) {
			this._pathGenerator = gen;
			return this;
		} else {
			return this._pathGenerator;
		}
	}
	
	/**
	 * The function which sets the color of the polygon. If func is given, sets it, otherwise returns the current fillFunction.
	 * @param {function} func - The new fillFunction.
	 * @returns {(StarGlyph|function)} This object or the current fillFunction.
	 */
	fillFunction(func) {
		if (func) {
			this._fillFunction = func;
			return this;
		} else {
			return this._fillFunction;
		}
	}
	
	/**
	 * The function which sets the domains of every variable scale.
	 * @param {newDomains} - The new domains of the chart scales.
	 * @returns {StarGlyph} This chart.
	 */
	setScaleDomains(newDomains) {
		this._scales = [];
		for (let i in newDomains) {
			this._scales[i] = d3.scaleLinear()
				.domain(newDomains[i])
				.range([0, d3.min([this._width, this._height]) / 2]);
		}
		return this;
	}
	
	/** 
	 * Inserts data on the star glyph and plots it.
	 * @param {number[]} dataset - An array of values for the polygon.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the polygon.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {StarGlyph} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("polygon" + i));
		attributes.class = "polygon";
		Chart.addIfNull(attributes, "d", (d, i)=>(this._pathGenerator(d, i)));
		
		dataset.push(dataset[0]);	//With this, the path will be closed
		this._polygonSelection = this._selection.selectAll(".polygon").data([dataset]).enter().append("path")
			.attr("fill", this._fillFunction);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._polygonSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Sets the labels at the corners.
	 * @param {string[]} labels - An array of values for the labels.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {StarGlyph} This chart.
	 */
	setCornerLabels(labels, attributes, onEvents) {
		let radius = d3.min([this._width, this._height]) / 2 + 3;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes.class = "cornerLabel";
		Chart.addIfNull(attributes, "x", (d, i)=>(Math.sin(this._getAngle(i)) * radius));
		Chart.addIfNull(attributes, "y", (d, i)=>(-Math.cos(this._getAngle(i)) * radius));
		Chart.addIfNull(attributes, "text-anchor", (d, i)=>this._getTextAnchor(i));
		Chart.addIfNull(attributes, "dominant-baseline", (d, i)=>this._getDominantBaseline(i));
		
		this._labelSelection = this._selection.selectAll(".cornerLabel").data(labels).enter().append("text")
			.text((d, i)=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._labelSelection, attributes, onEvents);
		
		return this;
	}
	
	_getAngle(i) {
		return 2 * Math.PI * i / this._scales.length;
	}
	
	_getTextAnchor(i) {
		let sine = Math.sin(this._getAngle(i));
		return (sine < -1e-6) ? "end"
			: (sine > 1e-6) ? "start"
			: "middle";
	}
	
	_getDominantBaseline(i) {
		let cosine = Math.cos(this._getAngle(i));
		return (cosine < -1e-6) ? "hanging"
			: (cosine > 1e-6) ? "baseline"
			: "middle";
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {StarGlyph} This chart.
	 */
	clear() {
		if (this._polygonSelection) {
			this._polygonSelection.remove();
			this._polygonSelection = null;
		}
		if (this._labelSelection) {
			this._labelSelection.remove();
			this._labelSelection = null;
		}
		return super.clear();
	}
}

/**
 * Class that represents a Correlation chart. It is used for plotting the correlation between any two variables of a dataset.
 * @extends Chart
 */
 class Correlation extends Chart {
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
		super(container, id, position, margins, dimensions, "correlationChart");
		
		this._rowLabelSelection = null;
		this._colLabelSelection = null;
		
		this._ellipseSelection = null;
		this._cellSelection = null;
		
		this._colorScheme = d3.interpolateRdYlBu;
	}
	
	/**
	 * Returns the selection of the labels of the rows.
	 * @returns {d3.selection} The row labels of this chart.
	 */
	rowLabelSelection() {
		return this._rowLabelSelection;
	}
	
	/**
	 * Returns the selection of the labels of the columns.
	 * @returns {d3.selection} The column labels of this chart.
	 */
	colLabelSelection() {
		return this._colLabelSelection;
	}
	
	/**
	 * Returns the selection of the ellipses of the chart.
	 * @returns {d3.selection} The ellipses of this chart.
	 */
	ellipseSelection() {
		return this._ellipseSelection;
	}
	
	/**
	 * Returns the selection of the cells of the chart.
	 * @returns {d3.selection} The cells of this chart.
	 */
	cellSelection() {
		return this._cellSelection;
	}
	
	/**
	 * The color scheme used at the chart. Uses d3.interpolateRdYlBu by default. If a scale is given sets the colorScheme, otherwise returns the current colorScheme.
	 * @param {d3.scale} scheme - The new colorScheme.
	 * @returns {(Correlation|d3.scale)} This object or the current colorScheme.
	 */
	colorScheme(scheme) {
		if (scheme) {
			this._colorScheme = scheme;
			return this;
		} else {
			return this._colorScheme;
		}
	}
	
	/** 
	 * Sets the labels for rows and columns.
	 * @param {number[][]} names - The names of the dataset attributes.
	 * @param {Object} attributes - An object containing functions or constants for the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Correlation} This chart.
	 */
	setLabels(names, attributes, onEvents) {
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes.class = "rowLabel";
		Chart.addIfNull(attributes, "text-anchor", "end");
		attributes["dominant-baseline"] = "hanging";
		attributes.transform = (d, i)=>("translate(0, "+((i+1/2) * this._height / names.length)+")rotate(45)");
		
		this._rowLabelSelection = this._selection.selectAll(".rowLabel").data(names).enter().append("text")
			.text(d=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._rowLabelSelection, attributes, null);
		
		attributes.class = "colLabel";
		attributes["dominant-baseline"] = "bottom";
		attributes.transform = (d, i)=>("translate("+((i+1/2) * this._width / names.length)+", 0)rotate(45)");
		
		this._colLabelSelection = this._selection.selectAll(".colLabel").data(names).enter().append("text")
			.text(d=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._colLabelSelection, attributes, onEvents);
		
		return this;
	}
	
	/** 
	 * Plots the correlation table of the dataset.
	 * @param {number[][]} dataset - The dataset which correlation will be calculated.
	 * @param {Object} attributes - An object containing functions or constants for the ellipses that represent the correlations.
	 * @param {Object} onEvents - An object containing functions for events.
	 * @returns {Correlation} This chart.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		let correlations = Correlation.pearson(dataset);
		let posScale = d3.scaleLinear()
			.domain([-1, 0, 1])
			.range([0.0000001, 1, Math.sqrt(2)]);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes.id = (d, i)=>("ellipse_" + i);
		attributes.class = "groupEllipse";
		attributes.rx = (d, i)=>(posScale(d) * d3.min([this._height, this._width]) / (2 * dataset[0].length));
		attributes.ry = (d, i)=>(posScale(-d) * d3.min([this._width, this._height]) / (2 * dataset[0].length));
		attributes.transform = (d, i)=>("translate(" + (i * this._width / dataset[0].length) + ", 0)rotate(-45)");
		Chart.addIfNull(attributes, "stroke", (d, i)=>thisChart._colorScheme((d+1)/2));
		
		let rowTransform = (d, i)=>("translate(" + (this._width / (2 * dataset[0].length)) + "," + ((i + 1/2) * this._height / dataset[0].length) + ")");
		this._ellipseSelection = this._selection.selectAll(".ellipseGroup").data(correlations).enter().append("g")
			.attr("id", (d, i)=>("ellipseGroup" + i))
			.attr("class", "ellipseGroup")
			.attr("transform", rowTransform)
			.selectAll(".groupEllipse").data(d=>d).enter().append("ellipse")
				.attr("fill", (d, i)=>thisChart._colorScheme((d+1)/2));
		
		rowTransform = (d, i)=>("translate(0," + (i * this._height / dataset[0].length) + ")");
		this._cellSelection = this._selection.selectAll(".rectGroup").data(correlations).enter().append("g")
			.attr("id", (d, i)=>("rectGroup_" + i))
			.attr("class", "rectGroup")
			.attr("transform", rowTransform)
			.selectAll(".groupRect").data(d=>d).enter().append("rect")
				.attr("id", (d, i)=>"rect_" + i)
				.attr("class", "groupRect")
				.attr("x", (d, i)=>(i * this._width / dataset[0].length))
				.attr("width", this._width / dataset[0].length)
				.attr("height", this._height / dataset[0].length)
				.attr("stroke", "black")
				.attr("fill", "transparent");
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this._ellipseSelection, attributes, null);
		Chart.insertAttributesEvents(this._cellSelection, null, onEvents);
		
		return this;
	}
	
	/**
	 * Generates a table of correlation values using the Pearson algorithm.
	 * @param {number[][]} dataset - The dataset which correlation will be calculated.
	 * @returns [number[][]} The correlation table of the dataset.
	 */
	static pearson(dataset) {
		//Mean calculation
		let means = new Array(dataset[0].length);
		for (let i = 0; i < dataset[0].length; i++) {
			means[i] = d3.mean(dataset.map(d=>d[i]));
		}
		
		//Correlation
		let output = new Array(dataset[0].length);
		for (let i = 0; i < dataset[0].length; i++) {
			output[i] = new Array(dataset[0].length);
			for (let j = 0; j < dataset[0].length; j++) {
				let covariance = d3.sum(dataset.map(d=>(d[i] - means[i]) * (d[j] - means[j])));
				let stdDeviationI = d3.sum(dataset.map(d=>(d[i] - means[i]) * (d[i] - means[i])));
				let stdDeviationJ = d3.sum(dataset.map(d=>(d[j] - means[j]) * (d[j] - means[j])));
				output[i][j] = covariance / Math.sqrt(stdDeviationI * stdDeviationJ);
			}
		}
		return output;
	}
	
	/** 
	 * Clears the chart, removing all plottings.
	 * @returns {Correlation} This chart.
	 */
	clear() {
		if (this._rowLabelSelection) {
			this._rowLabelSelection.remove();
			this._rowLabelSelection = null;
		}
		if (this._colLabelSelection) {
			this._colLabelSelection.remove();
			this._colLabelSelection = null;
		}
		if (this._ellipseSelection) {
			this._ellipseSelection.remove();
			this._ellipseSelection = null;
		}
		if (this._cellSelection) {
			this._cellSelection.remove();
			this._cellSelection = null;
		}
		return super.clear();
	}
}

/**
 * Class that represents a Label table. It can be attached to any Chart with the chart.labelTable() function.
 * @extends Chart
 */
class LabelTable extends Chart {
	/**
	 * @constructor
	 * @param {Chart} chart - The chart of this label table.
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
	constructor(chart, id, position, margins, dimensions) {
		super(chart.selection(), id, position, margins, dimensions, "labels");
		
		this._chart = chart;
		
		this._colorSelection = null;
		
		this._textSelection = null;
		
		this._border = this._selection.append("rect")
			.attr("class", "border")
			.attr("width", this._width)
			.attr("height", this._height)
			.attr("stroke", "black")
			.attr("fill", "white");
	}
	
	/** 
	 * The chart labelled by this label table.
	 * @returns {Chart} The chart of this label table.
	 */
	chart() {
		return this._chart;
	}
	
	/**
	 * Returns the selection of the rects with the color of the chart.
	 * @returns {d3.selection} The colored rects of this chart.
	 */
	colorSelection() {
		return this._colorSelection;
	}
	
	/**
	 * Returns the selection of the texts with the labels of the chart.
	 * @returns {d3.selection} The text labels of this chart.
	 */
	textSelection() {
		return this._textSelection;
	}
	
	/**
	 * Returns the selection of the border of the label table.
	 * @returns {d3.selection} The border of this label table.
	 */
	border(rect) {
		return this._border;
	}
	
	/** 
	 * Inserts data on the labels table.
	 * @param {string[]} colors - An array of colors.
	 * @param {(number[]|string[])} values - An array of labels for the colors.
	 * @param {(function[]|number[])} colorAttributes - An object containing functions or constants for attributes of the color rects.
	 * @param {(function[]|number[])} valueAttributes - An object containing functions or constants for attributes of the label texts.
	 * @returns {LabelTable} This label table.
	 */
	setValues(colors, values, colorAttributes, valueAttributes) {
		let thisChart = this;
		
		//Mandatory attributes of the colors
		if (colorAttributes == null) colorAttributes = [];
		colorAttributes["class"] = "colorPlot";
		Chart.addIfNull(colorAttributes, "x", 0);
		Chart.addIfNull(colorAttributes, "y", (d, i)=>(i * thisChart._height / colors.length));
		Chart.addIfNull(colorAttributes, "width", thisChart._height / colors.length);
		Chart.addIfNull(colorAttributes, "height", thisChart._height / colors.length);
		
		this._colorSelection = this._selection.selectAll("colorPlot").data(colors).enter().append("rect")
			.attr("fill", (d, i)=>d);
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this._colorSelection, colorAttributes, null);
		
		//Mandatory attributes of the texts
		if (valueAttributes == null) valueAttributes = [];
		valueAttributes["class"] = "colorLabel";
		Chart.addIfNull(valueAttributes, "x", colorAttributes["width"] + 5);
		Chart.addIfNull(valueAttributes, "y", colorAttributes["y"]);
		Chart.addIfNull(valueAttributes, "width", thisChart._width - valueAttributes["x"]);
		Chart.addIfNull(valueAttributes, "height", colorAttributes["height"]);
		
		this._textSelection = this._selection.selectAll("colorLabel").data(values).enter().append("text")
			.text(d=>d)
			.attr("dominant-baseline", "hanging");
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this._textSelection, valueAttributes, null);
		
		return this;
	}
}
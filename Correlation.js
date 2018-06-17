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
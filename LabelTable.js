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
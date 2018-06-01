/**
 * Class that represents a Label table.
 * @extends Chart
 */
class Labels extends Chart {
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
		
		/**
		 * The chart of this label table.
		 * @member {Chart} Label#chart
		 */
		this.chart = chart;
		
		/**
		 * The rects with the colors of the chart.
		 * @member {d3.selection} Label#colorSelection
		 */
		this.colorSelection = null;
		
		/**
		 * The texts with the ranges for each color of the chart.
		 * @member {d3.selection} Label#textSelection
		 */
		this.textSelection = null;
		
		/**
		 * The border of the label table.
		 * @member {d3.selection} Label#border
		 * @default d3.select("#" + this.chart.id).select("#" + this.id).select(".border")
		 */
		this.border = this._selection.append("rect")
			.attr("class", "border")
			.attr("width", this._width)
			.attr("height", this._height)
			.attr("stroke", "black")
			.attr("fill", "white");
	}
	
	/** 
	 * Inserts data on the labels table.
	 * @param {string[]} colors - An array of colors.
	 * @param {(number[]|string[])} values - An array of labels for the colors.
	 * @param {(function[]|number[])} colorAttributes - An object containing functions or constants for attributes of the color rects.
	 * @param {(function[]|number[])} valueAttributes - An object containing functions or constants for attributes of the label texts.
	 */
	setValues(colors, values, colorAttributes, valueAttributes) {
		var thisChart = this;
		
		//Mandatory attributes of the colors
		if (colorAttributes == null) colorAttributes = [];
		colorAttributes["class"] = "colorPlot";
		Chart.addIfNull(colorAttributes, "x", 0);
		Chart.addIfNull(colorAttributes, "y", (d, i)=>(i * thisChart._height / colors.length));
		Chart.addIfNull(colorAttributes, "width", thisChart._height / colors.length);
		Chart.addIfNull(colorAttributes, "height", thisChart._height / colors.length);
		
		this.colorSelection = this._selection.selectAll("colorPlot").data(colors).enter().append("rect")
			.attr("fill", (d, i)=>d);
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this.colorSelection, colorAttributes, null);
		
		//Mandatory attributes of the texts
		if (valueAttributes == null) valueAttributes = [];
		valueAttributes["class"] = "colorLabel";
		Chart.addIfNull(valueAttributes, "x", colorAttributes["width"] + 5);
		Chart.addIfNull(valueAttributes, "y", colorAttributes["y"]);
		Chart.addIfNull(valueAttributes, "width", thisChart._width - valueAttributes["x"]);
		Chart.addIfNull(valueAttributes, "height", colorAttributes["height"]);
		
		this.textSelection = this._selection.selectAll("colorLabel").data(values).enter().append("text")
			.text(d=>d)
			.attr("dominant-baseline", "hanging");
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this.textSelection, valueAttributes, null);
	}
}
/**
 * Class that represents a Pie chart.
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
		
		this.tag.attr("transform", "translate(" + (this.margins.left + this.width / 2) + "," + (this.margins.top + this.height / 2) + ")");
		
		/**
		 * The slices of the pie.
		 * @member {d3.selection} Pie#sliceSelection
		 */
		this.sliceSelection = null;
		
		/**
		 * The labels of the slices.
		 * @member {d3.selection} Pie#labelSelection
		 */
		this.labelSelection = null;
		
		/**
		 * Function which sets the inner radius of the slice based on its value.
		 * @member {function} Pie#innerRadius
		 * @default 0
		 */
		this.innerRadius = (d, i)=>0;
		/**
		 * Function which sets the outer radius of the slice based on its value.
		 * @member {function} Pie#outerRadius
		 * @default (d, i)=>(d3.min([this.width, this.height]) / 2)
		 */
		this.outerRadius = (d, i)=>(d3.min([this.width, this.height]) / 2);
		
		/**
		 * The color scale of the pie chart. Used to set the colors of each slice.
		 * @member {d3.scale} Pie#colorScale
		 * @default d3.scaleLinear().domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1)).range(d3.schemeCategory10)
		 */
		this.colorScale = d3.scaleLinear()
			.domain(Chart.genSequence(0, d3.schemeCategory10.length, d3.schemeCategory10.length - 1))
			.range(d3.schemeCategory10);
	}
	
	/** 
	 * Inserts data on the pie and plots it.
	 * @param {number[]} dataset - An array of values for the slices.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the slices.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setData(dataset, attributes, onEvents) {
		let thisChart = this;
		this._pieData = d3.pie()(dataset);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("slice" + i));
		attributes["class"] = "slice";
		Chart.addIfNull(attributes, "d", (d, i)=>(thisChart.genSlice(d, i)()));
		
		//Slice sliceSelection and color setting
		this.sliceSelection = this.tag.selectAll(".slice").data(dataset).enter().append("path")
			.attr("fill", (d, i)=>(thisChart.colorScale(i % thisChart.colorScale.domain().length)));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.sliceSelection, attributes, onEvents);
	}
	
	/** 
	 * Sets the labels of the slices.
	 * @param {string[]} labels - An array of values for the labels.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the labels.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setSliceLabels(labels, attributes, onEvents) {
		let thisChart = this;
		let centroids = this.sliceSelection.data().map((d, i)=>this.genSlice(d, i).centroid());
		console.log(this.sliceSelection.data());
		console.log(centroids);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		attributes["class"] = "sliceLabel";
		Chart.addIfNull(attributes, "x", (d, i)=>(centroids[i][0]));
		Chart.addIfNull(attributes, "y", (d, i)=>(centroids[i][1]));
		Chart.addIfNull(attributes, "text-anchor", "middle");
		Chart.addIfNull(attributes, "dominant-baseline", "middle");
		
		this.labelSelection = this.tag.selectAll(".sliceLabel").data(labels).enter().append("text")
			.text((d, i)=>d);
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.labelSelection, attributes, onEvents);
	}
	
	/** 
	 * Generates slices from an array with the Array.prototype.map() function. Also uses values from innerRadius and outerRadius.
	 * @param {number} d - A value in the array.
	 * @param {number} i - An index in the array.
	 * @returns {d3.arc} Arc made with the value of the array.
	 */
	genSlice(d, i) {
		return d3.arc()
			.innerRadius(this.innerRadius(d, i))
			.outerRadius(this.outerRadius(d, i))
			.startAngle(this._pieData[i].startAngle)
			.endAngle(this._pieData[i].endAngle);
	}
	
	/** 
	 * Clears the chart, removing all slices and labels.
	 */
	clear() {
		if (this.sliceSelection) {
			this.sliceSelection.remove();
			this.sliceSelection = null;
			this._pieData = null;
		}
		if (this.labelSelection) {
			this.labelSelection.remove();
			this.labelSelection = null;
		}
		if (this.labels) {
			this.labels.tag.remove();
			this.labels = null;
		}
	}
}
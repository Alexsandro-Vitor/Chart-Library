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
		/**
		 * The tag in which the chart will be inserted.
		 * @member {d3.selection} Chart#container
		 */
		this.container = container;
		
		/**
		 * The id of the chart tag.
		 * @member {string} Chart#id
		 */
		this.id = id;
		
		/**
		 * The X coordinate of the chart.
		 * @member {number} Chart#x
		 */
		/**
		 * The Y coordinate of the chart.
		 * @member {number} Chart#y
		 */
		if ((position == null) || (typeof(position) != "object")) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = position.x;
			this.y = position.y;
		}
		
		/**
		 * The margins of the chart.
		 * @member {Object} Chart#margins
		 */
		if (margins == null) {
			this.margins = {left:10, right:10, top:10, bottom:10};
		} else if (typeof(margins) == "number") {
			this.margins = {left:margins, right:margins, top:margins, bottom:margins};
		} else {
			this.margins = margins;
		}
		this.margins.left += this.x;
		this.margins.top += this.y;
		
		/**
		 * The inside width of the margin.
		 * @member {number} Chart#width
		 */
		/**
		 * The inside height of the margin.
		 * @member {number} Chart#height
		 */
		if (dimensions == null) {
			this.width = container.attr("width") - this.margins.left - this.margins.right + this.x;
			this.height = container.attr("height") - this.margins.top - this.margins.bottom + this.y;
		} else {
			this.width = dimensions.width - this.margins.left - this.margins.right;
			this.height = dimensions.height - this.margins.top - this.margins.bottom;
		}
		
		/**
		 * The selection of the chart.
		 * @member {d3.selection} Chart#tag
		 * @default d3.selectAll("." + tagClass).select("#" + this.id)
		 */
		this.tag = this.container.append("g")
			.attr("id", this.id)
			.attr("class", tagClass)
			.attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
	}
	
	/** 
	 * Generates an array with equally distanced values.
	 * @param {number} start - The first value of the returned array.
	 * @param {number} size - The size of the returned array.
	 * @param {number} end - The last value of the returned array.
	 * @returns {number[]} Array with equally distanced values.
	 */
	static genSequence(start, size, end) {
		var output = [];
		size--;
		for (var i = 0; i <= size; i++) {
			output.push(start + i * (end - start) / size);
		}
		return output;
	}
	
	/**
	 * Adjusts the domain of a scale and its axis.
	 * @param {d3.scale} scale - The scale to be adjusted.
	 * @param {d3.axis} axis - The axis which uses the scale.
	 * @param {d3.selection} axisGroup - The group in which the axis is.
	 * @param {number} minValue - The minimum value of the new domain.
	 * @param {number} maxValue - The maximum value of the new domain.
	 */
	static adjustScaleDomain(scale, axis, axisGroup, minValue, maxValue) {
		scale.domain([minValue, maxValue]);
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
		for (var attrName in attributes) {
			selection.attr(attrName, attributes[attrName]);
		}
		
		//Setting events
		for (var eventName in onEvents) {
			selection.on(eventName, onEvents[eventName]);
		}
	}
}
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
		
		/**
		 * The projection of the chart.
		 * @member {d3.projection} Map#projection
		 * @default d3.geoMercator()
		 */
		this.projection = d3.geoMercator();
		
		/**
		 * The geoPath of the chart.
		 * @member {d3.path} Map#geoPath
		 * @default d3.geoPath().projection(this.projection)
		 */
		this.geoPath = d3.geoPath().projection(this.projection);
		
		/**
		 * The Paths of the chart.
		 * @member {d3.selection} Map#pathSelection
		 */
		this.pathSelection = null;
		
		/**
		 * The scale between input values and the value used at colorScheme. Its range should stay at [0, 1].
		 * @member {d3.scale} Map#colorScale
		 * @default d3.scalePow()
		 */
		this.colorScale = d3.scalePow();
		
		/**
		 * The color scheme used at the chart. Uses d3.interpolateInferno by default.
		 * @member {d3.scale} Map#colorScheme
		 * @default d3.interpolateInferno
		 */
		this.colorScheme = d3.interpolateInferno;
		
		/**
		 * The function which selects the color of the plots. By default, it uses the fillValue normalized by the colorScale to select a value at the colorScheme.
		 * @member {function} Map#fillFunction
		 * @default (d, i)=>this.colorScheme(this.colorScale(this.fillValue(d, i)))
		 */
		this.fillFunction = (d, i)=>this.colorScheme(this.colorScale(this.fillValue(d, i)));
		
		/**
		 * The function which determines the value of the dataset which will be used on the fillFunction. Default function always returns 1.
		 * @member {function} Map#fillValue
		 * @default (d, i)=>1
		 */
		this.fillValue = (d, i)=>1;
		
		/**
		 * The dots plotted in the chart.
		 * @member {d3.selection} Map#dotSelection
		 */
		this.dotSelection = null;
	}
	
	/** 
	 * Plots the geojson on the chart as paths.
	 * @param {Object} geojson - The data of a geojson file.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setMap(geojson, attributes, onEvents) {
		var thisChart = this;
		
		//Scales the projection to centralize the map
		this.projection.fitExtent([[0, 0], [this.width, this.height]], geojson);
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>d.properties.L1);
		attributes["class"] = "mapPath";
		Chart.addIfNull(attributes, "d", (d, i)=>thisChart.geoPath(d.geometry));
		
		this.pathSelection = this.tag.selectAll(".mapPath").data(geojson.features).enter().append("path")
			.attr("fill", (d, i)=>thisChart.fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.pathSelection, attributes, onEvents);
	}
	
	/** 
	 * Plots the dataset on the map chart.
	 * @param {number[][]} dataset - The data to be plotted on the map.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setData(dataset, attributes, onEvents) {
		var thisChart = this;
		
		this.pathSelection.data(dataset)
			.attr("fill", (d, i)=>thisChart.fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.pathSelection, attributes, onEvents);
	}
	
	/** 
	 * Plots data as dots on the map chart.
	 * @param {number[][]} dataset - The data to be plotted on the map.
	 * @param {Object} attributes - An object containing functions or constants for attributes of the map.
	 * @param {Object} onEvents - An object containing functions for events.
	 */
	setDots(dataset, attributes, onEvents) {
		var thisChart = this;
		
		//Mandatory attributes
		if (attributes == null) attributes = [];
		Chart.addIfNull(attributes, "id", (d, i)=>("dot" + i));
		attributes["class"] = "mapDot";
		Chart.addIfNull(attributes, "r", "3px");
		Chart.addIfNull(attributes, "cx", 10);
		Chart.addIfNull(attributes, "cy", 10);
		
		this.dotSelection = this.tag.selectAll(".mapDot").data(dataset).enter().append("circle")
			.attr("fill", (d, i)=>thisChart.fillFunction(d, i));
		
		//Insertion of attributes and events
		Chart.insertAttributesEvents(this.dotSelection, attributes, onEvents);
	}
	
	/** 
	 * Clears the chart, removing all paths and dots.
	 */
	clear() {
		if (this.pathSelection) {
			this.pathSelection.remove();
			this.pathSelection = null;
		}
		if (this.dotSelection) {
			this.dotSelection.remove();
			this.dotSelection = null;
		}
		if (this.labels) {
			this.labels.tag.remove();
			this.labels = null;
		}
	}
}
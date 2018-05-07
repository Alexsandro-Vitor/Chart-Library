class Labels extends Chart {
	constructor(chart, id, margins, totalWidth, totalHeight) {
		super(chart.tag, id, margins, totalWidth, totalHeight, "labels");
		
		this.chart = chart;
		
		this.colorSelection = null;
		
		this.textSelection = null;
		
		this.borda = this.tag.append("rect")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("stroke", "black")
			.attr("fill", "white");
	}
	
	setValues(colors, values, colorAttributes, valueAttributes) {
		var thisChart = this;
		
		//Mandatory attributes of the colors
		if (colorAttributes == null) colorAttributes = [];
		colorAttributes["class"] = "colorPlot";
		Chart.addIfNull(colorAttributes, "x", 0);
		Chart.addIfNull(colorAttributes, "y", (d, i)=>(i * thisChart.height / colors.length));
		Chart.addIfNull(colorAttributes, "width", thisChart.height / colors.length);
		Chart.addIfNull(colorAttributes, "height", thisChart.height / colors.length);
		
		this.colorSelection = this.tag.selectAll("colorPlot").data(colors).enter().append("rect")
			.attr("fill", (d, i)=>d);
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this.colorSelection, colorAttributes, null);
		
		//Mandatory attributes of the texts
		if (valueAttributes == null) valueAttributes = [];
		valueAttributes["class"] = "colorLabel";
		Chart.addIfNull(valueAttributes, "x", colorAttributes["width"] + 5);
		Chart.addIfNull(valueAttributes, "y", colorAttributes["y"]);
		Chart.addIfNull(valueAttributes, "width", thisChart.width - valueAttributes["x"]);
		Chart.addIfNull(valueAttributes, "height", colorAttributes["height"]);
		
		this.textSelection = this.tag.selectAll("colorLabel").data(values).enter().append("text")
			.text(d=>d)
			.attr("dominant-baseline", "hanging");
		
		//Insertion of attributes
		Chart.insertAttributesEvents(this.textSelection, valueAttributes, null);
	}
}
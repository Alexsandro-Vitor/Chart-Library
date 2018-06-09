# Chart-Library
This library contains code for production of some charts using d3 (https://d3js.org/).

Currently the following charts can be made with it:
* Histograms
* Maps
* Pie Charts
* Scatterplots
* Segments
* Star Glyphs

## Documentation

The full documentation is available at: https://alexsandro-vitor.github.io/Chart-Library/

## The Basics

### Using the Library

* **Complete version:** Download *Chart-Library.js* or the minified version *Chart-Library.min.js*.
* **Individual charts:** Download the Chart.js file and the files you want.

### Plotting a chart

After creating the chart object, use the data insertion function to insert the data. The insertion function is `setData()` in all charts but Segments, which has 3 functions (`setSegments()`, `setDots()` and `setRanges()`) instead. In all cases, the parameters are the same: *dataset*, *attributes*, *onEvents*.

```js
let svgTag = d3.select("body").append("svg")
	.attr("width", 600)
	.attr("height", 400);

let scatterplot = new Scatterplot(svgTag, "id", null, 20, null)
	.setData([[5, 5], [-5, 5], [-6, -4], [-3, -5], [0, -5.5], [3, -5], [6, -4]]);
```

### Setting the attributes

If you want to change how the objects will be plotted, use the *attributes* parameter.

```js
let dataset = [[5, 5], [-5, 5], [-6, -4], [-3, -5], [0, -5.5], [3, -5], [6, -4]];
let attributes = {
	cx: (d, i)=>scatterplot.xScale()(i),
	cy: (d, i)=>scatterplot.yScale()(d[1])
};
scatterplot.setData(dataset, attributes);
```
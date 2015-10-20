

var drawStackedBars = function (data, options) {
    $("#graph").empty();
    
    // number of layers (# of keys)
    var LayersN = Object.keys(data).length;
    var stack = d3.layout.stack(),
        layers = stack(Object.keys(data).map(function (key) { return createLayer(key, data); }));
    // number of samples per layer (maxYear - minYear)
    var MinMaxYears = getMinMaxYear(data);
    var SamplesN = MinMaxYears.max - MinMaxYears.min;
    
    var margin = options.margin;
    var width = $("#graph-container").width() - margin.left - margin.right,
        height = $("#graph-container").height() - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal()
        .domain(d3.range(MinMaxYears.min, MinMaxYears.max + 1))
        .rangeBands([0, width], .08);
    
    var y = d3.scale.linear()
        .domain([0, getMaxValue(data)])
        .range([height, 0]);

    // scale for the x axis
    var xLabel = d3.scale.ordinal()
        .domain(d3.range(MinMaxYears.min, MinMaxYears.max + 1, 10))
        .rangeBands([0, width], .08);
    
    // set the color range for the layers
    var color = d3.scale.category10();
    //var color = d3.scale.linear()
    //    .domain([0, LayersN - 1])
    //    .range(["#aad", "#556"]);
    
    // set the x axis
    var xAxis = d3.svg.axis()
        .scale(xLabel)
        .tickSize(5)
        .tickPadding(6)
        .orient("bottom");
    
    // setting the svg element (container for the visualization)
    var svg = d3.select("#graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // create the layers
    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) { return color(i) });
    
    var rect = layer.selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.x); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);
    
    rect.transition()
        .delay(function (d, i) { return i * 10; })
        .attr("y", function (d) { return y(d.y0 + d.y); })
        .attr("height", function (d) { return y(d.y0) - y(d.y0 + d.y); });
    
    // create the legend
    var legendRectSize = 16;
    var legendSpacing = 4;
    
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = height * color.domain().length / 2;
        var horz = -1 * legendRectSize;
        var vert = i * (legendRectSize + legendSpacing);
        return "translate(" + horz + "," + vert + ")";
        });
    
    legend.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", color)
        .style("stroke", color);
    
    legend.append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(function (idx) { return Object.keys(data)[idx]; });

    // append the x axis to the svg
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

}
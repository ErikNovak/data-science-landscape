
var getMaxValue = function (data) {
    var maximum = {};
    var keys = Object.keys(data);
    for (var KeyN = 0; KeyN < keys.length; KeyN++) {
        var years = Object.keys(data[keys[KeyN]]);
        for (var YearN = 0; YearN < years.length; YearN++) {
            if (maximum[years[YearN]] != null) {
                maximum[years[YearN]] += data[keys[KeyN]][years[YearN]];
            } else {
                maximum[years[YearN]] = data[keys[KeyN]][years[YearN]];
            }
        }
    }
    var arr = Object.keys(maximum).map(function (key) { return maximum[key] }); 
    var max = Math.max.apply(null, arr);
    return max;
}

var getMinMaxYear = function (data) {
    var minimum = [];
    var maximum = [];
    var keywords = Object.keys(data);
    for (var KeyN = 0; KeyN < keywords.length; KeyN++) {
        var keyYears = Object.keys(data[keywords[KeyN]]);
        minimum.push(Math.min.apply(null, keyYears));
        maximum.push(Math.max.apply(null, keyYears));
    }
    var min = Math.min.apply(null, minimum);
    var max = Math.max.apply(null, maximum);
    return { min: min, max: max };
}

var createLayer = function (key, data) {
    var arr = [];
    var years = Object.keys(data[key]);
    var MinMax = getMinMaxYear(data);
    for (var YearN = MinMax.min; YearN <= MinMax.max; YearN++) {
        if (years.indexOf(YearN.toString()) != -1 ) {
            arr.push({ x: YearN, y: data[key][YearN.toString()] });
        } else {
            arr.push({ x: YearN, y: 0 });
        }
    }
    return arr;
}

var drawTimeseries = function (data, options) {
    $("#graph").empty();
    
    // number of layers (# of keys)
    var LayersN = Object.keys(data).length;
    var stack = d3.layout.stack(),
        layers = stack(Object.keys(data).map(function (key) { return createLayer(key, data); }));
    // number of samples per layer (maxYear - minYear)
    var MinMaxYears = getMinMaxYear(data);
    var SamplesN = MinMaxYears.max - MinMaxYears.min;
    
    var margin = options.margin;
    var width = $("#graphcontainer").width() - margin.left - margin.right,
        height = $("#graphcontainer").height() - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal()
        .domain(d3.range(MinMaxYears.min, MinMaxYears.max + 1))
        .rangeBands([0, width], .08);
    
    var xLabel = d3.scale.ordinal()
        .domain(d3.range(MinMaxYears.min, MinMaxYears.max + 1, 4))
        .rangeBands([0, width], .08);

    var y = d3.scale.linear()
        .domain([0, getMaxValue(data)])
        .range([height, 0]);
    
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
    
    var svg = d3.select("#graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");
    console.log("Here!");
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

    // append the x axis to the svg
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

}
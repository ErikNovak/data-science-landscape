/**
 * STREAM GRAPH
 * Creates a stream graph class using d3.js.
 * The x values are currently supported only by numbers. Time is not implemented yet.
 */

function streamGraph(_options) {
    // settings
    var options = $.extend({
        containerName: undefined,                                   // the dom that contains the svg element
        scaleType: d3.scale.linear(),                               // the scale type (d3.scale.linear(), d3.scale.ordinal(), d3.scale.log())
        offsetType: "silhouette",                                   // the offset type ("zero", "wiggle", "silhouette", "expand")
        xCoordinateType: "number",                                  // the type of the x coordinate ("number", "time")
        interpolateType: "basis",                                   // the area interpolation type ("linear", "step", "basis", "cardinal", "monotone")
        tooltipTextCallback: tooltipTextCallback,                   // the callback that generates the text info on the chart (defined at the end of the file)
        margin: { top: 30, left: 30, bottom: 20, right: 30 },
        colors: d3.scale.category20()
    }, _options);
    
    var format = d3.time.format("%Y-%m-%d");
    var parse = format.parse;
    var zoom = undefined;
    var xAxis = undefined;
    var xScale = undefined;
    var chartBody = undefined;
    
    /**
     * The streamData is a JSON object containing the data of the search 
     * data. It is in a form:
     * {
     *      "Keyword": {
     *          type: "keyword",
     *          data: {
     *              "x.variable0": "y.variable0",
     *              "x.variable1": "y.variable1",
     *              "x.variable2": "y.variable2",
     *              "x.variable3": "y.variable3"
     *          }
     *      },
     *      "Author": {
     *          type: "author",
     *          data: {
     *              "Keyword1": {
     *                  type: "keyword",
     *                  data: { 
     *                      "x.variable0": "y.variable0",
     *                      ...
     *                  }
     *              },
     *              "Keyword2": {
     *                  ...
     *              } 
     *          }
     *      },
     *      ...
     * }
     * The data is then taken and is modified for the visualization.
     */
    var streamData = null;
    
    /**
     * Gets the stream data. 
     * @returns {object} The stream data contained.
     */
    this.getData = function () {
        return streamData;
    }
    
    /**
     * Set the stream data. 
     * @param {object} [_streamData] - The stream data added.
     */
    this.setData = function (_streamData) {
        if (streamData == _streamData || _streamData == undefined) {
            this.displayStreamGraph();
        } else {
            streamData = _streamData;
            this.displayStreamGraph();
        }
    }
    
    /**
     * Updates the options.
     * @param {object} [_options] - The options given for the update.  
     */
    this.updateOptions = function (_options) {
        options = $.extend(options, _options);
    }
    
    /**
     * Gets the minimum and maximum value of x variable of the key. 
     * @param {object} json - The json containing the data and type of the key.
     */
    var keyXMinMax = function (json) {
        var minimum = [];
        var maximum = [];
        if (json.type == "keyword") {
            var time = Object.keys(json.data);
            return { min: Math.min.apply(null, time), max: Math.max.apply(null, time) };
        } else if (json.type == "author") {
            var keywords = Object.keys(json.data);
            for (var KeyN = 0; KeyN < keywords.length; KeyN++) {
                var time = Object.keys(json.data[keywords[KeyN]].data);
                minimum.push(Math.min.apply(null, time));
                maximum.push(Math.max.apply(null, time));
            }
            var min = Math.min.apply(null, minimum);
            var max = Math.max.apply(null, maximum);
            return { min: min, max: max };
        }
    }
    
    /**
     * Gets the minimum and maximum value of x variables in streamData.
     * @returns {object} The JSON object containing the minimum and maxiumum x values of streamData.
     */
    var xMinMax = function () {
        var minimum = [];
        var maximum = [];
        var topics = Object.keys(streamData);
        for (var xIdx = 0; xIdx < topics.length; xIdx++) {
            var x = keyXMinMax(streamData[topics[xIdx]]);
            minimum.push(x.min);
            maximum.push(x.max);
        }
        var min = Math.min.apply(null, minimum);
        var max = Math.max.apply(null, maximum);
        return { minimum: min, maximum: max };
    }
    
    /**
     * Creates the layers out of the streamData.
     * @param {number} json - The key info in the data JSON object.
     * @returns {Array.<object>} The array of coordinates created for the key variable out of data.
     */
    var createLayers = function () {
        var arr = [];
        var xminmax = xMinMax();
        var topics = Object.keys(streamData);
        for (var idx in topics) {
            var topic = topics[idx];
            var json = streamData[topics[idx]];
            
            if (json.type == "keyword") {
                var topicArr = [];
                // if the topic is a keyword
                var time = Object.keys(json.data);
                for (var xIdx = xminmax.minimum; xIdx <= xminmax.maximum; xIdx++) {
                    if (time.indexOf(xIdx.toString()) != -1) {
                        topicArr.push({ type: "keyword", name: topic, x: xIdx, y: json.data[xIdx.toString()] });
                    } else {
                        topicArr.push({ type: "keyword", name: topic, x: xIdx, y: 0 });
                    }
                }
                arr.push(topicArr);
            } else if (json.type == "author") {
                
                var keywords = Object.keys(json.data);
                for (var KeywordsN = 0; KeywordsN < keywords.length; KeywordsN++) {
                    var topicArr = [];
                    var time = Object.keys(json.data[keywords[KeywordsN]].data);
                    for (var xIdx = xminmax.minimum; xIdx <= xminmax.maximum; xIdx++) {
                        if (time.indexOf(xIdx.toString()) != -1) {
                            topicArr.push({ type: "author", name: topic, subname: keywords[KeywordsN], x: xIdx, y: json.data[keywords[KeywordsN]].data[xIdx.toString()] });
                        } else {
                            topicArr.push({ type: "author", name: topic, subname: keywords[KeywordsN], x: xIdx, y: 0 });
                        }
                    }
                    arr.push(topicArr);
                }
                
            }
        }
        return arr;
    }
    
    /**
     * Displays the stream graph.
     * 
     */
    this.displayStreamGraph = function () {
        // the width and height of the container and the chartBody
        var totalWidth = $(options.containerNm).width(),
            totalHeight = $(options.containerNm).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        d3.select(options.containerNm + " svg").remove();
        
        if (streamData == undefined) {
            $(options.containerNm).hide();
            return;
        }
        $(options.containerNm).show();
        
        // construct the zoom object
        zoom = d3.behavior.zoom();
        
        if (options.xCoordinateType == "number") {
            // if the x coordinate type is a number
            
            // get the maximum and minimum x coordinate value
            var xminmax = xMinMax();
            var xStart, 
                xEnd = xminmax.maximum;
            if (xminmax.minimum < 1975) {
                // if the minimum year is less than 1975
                xStart = 1975;
            } else {
                xStart = xminmax.minimum;
            }
            // scale for the x axis
            xScale = options.scaleType;
            xScale.domain([xStart, xEnd + 1])
                .range([0, width]);
            
            // axis format
            var axisFormat = d3.format(".0f");
            
            // set the x axis
            xAxis = d3.svg.axis()
                .scale(xScale)
                .tickFormat(axisFormat)
                .ticks(10)
                .tickSize(5)
                .tickPadding(6)
                .orient("bottom");
        } else if (options.xCoordinateType == "time") {
            // if the x coordinate type is timestamp
            return;
        }
        
        // setting the svg element (container for the visualization)
        var svg = d3.select(options.containerNm)
            .append("svg")
            .attr("id", "svg-canvas")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
            .call(zoom);
        
        svg.append("rect")
            .attr("fill", "transparent")
            .attr("width", width)
            .attr("height", height);
        
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);
        
        // setting the chart body
        chartBody = svg.append("g")
            .attr("clip-path", "url(#clip)");
        
        chartBody.selectAll(".area")
            .data(function () {
            var arr = [];
            var topics = Object.keys(streamData);
            for (var id in topics) {
                if (streamData[topics[id]].type == "keyword") { arr.push({}); }
                else if (streamData[topics[id]].type == "author") {
                    for (var key in Object.keys(streamData[topics[id]].data)) {
                        arr.push({});
                    }
                }
            }
            return arr;
        })
            .enter()
            .append("path")
            .attr("class", "area");
        
        zoom.x(xScale)
            .scaleExtent([0, 5]);
        
        // append the x axis to the svg
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);
        
        // draw the charts
        this.redraw();
    }
    
    this.redraw = function () {
        
        // what to do when zoomed
        var onZoom = function () {
            svg.select(".x.axis").call(xAxis);
            chartBody.selectAll(".area")
                .data(layers)
                .attr("d", area);
        }
        zoom.on("zoom", onZoom);
        
        var self = this,
            totalHeight = $(options.containerNm).height(),
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        // stack the layers
        var stack = d3.layout.stack().offset(options.offsetType),
            layers = stack(createLayers());
        
        var yScale = d3.scale.linear()
            .domain([0, d3.max(layers, function (layer) { return d3.max(layer, function (val) { return val.y0 + val.y; }); })])
            .range([height, 0]);
        
        // creating the area
        var area = d3.svg.area()
            .interpolate(options.interpolateType)
            .x(function (d) { return xScale(d.x); })
            .y0(function (d) { return yScale(d.y0); })
            .y1(function (d) { return yScale(d.y0 + d.y); });
        
        // get the svg element
        var svg = d3.select(options.containerNm + " svg");
        
        // draw the stream graph areas
        chartBody.selectAll(".area")
            .data(layers)
            .attr("d", area)
            .style("fill", function (d, idx) { return options.colors(idx); });
        
        // create the on mousemove and mouseout functions on areas
        chartBody.selectAll(".area")
            .on("mousemove", function (d, idx) {
            
            // remove the highlight rect
            $(options.containerNm + " .time-rect").remove();
            var coords = d3.mouse(this);
            
            var time;
            if (options.xCoordinateType == "number") {
                time = Math.floor(xScale.invert(coords[0]));
                // the time grey rectangle
                var xTimeStart = xScale(time);
                var xTimeEnd = xScale(time + 1);

            } else if (options.xCoordinateType == "time") {
                return;
            }
            
            // find the data for the selected year
            matchingValue = $.grep(d, function (data) { return data.x == time; });
            if (matchingValue.length == 0) {
                return;
            }
            // highlight the selected area with a darker color
            var originalFill = $(this).attr("original-fill") ? $(this).attr("original-fill") : $(this).css("fill");
            $(this).attr("original-fill", originalFill);
            var darkerColor = d3.rgb(originalFill).darker();
            $(this).css("fill", darkerColor.toString());
            
            // create the tooltip with the related information
            if (options.tooltipTextCallback) {
                var tooltipDiv = $(options.containerNm + " .graph-tooltip");
                tooltipDiv.html(options.tooltipTextCallback(matchingValue));
                var x = coords[0] + options.margin.left;
                var y = coords[1] + options.margin.top;
                var xOffset = (coords[0] > ($(options.containerNm).width() / 2)) ? (-tooltipDiv.outerWidth() - 5) : 5;
                var yOffset = (coords[1] > ($(options.containerNm).height() / 2)) ? (-tooltipDiv.outerHeight() - 5) : 5;
                var xAdditionalOffset = 10; // additional x offset
                var yAdditionalOffset = 0;  // additional y offset
                tooltipDiv.css({ left: (x + xOffset + xAdditionalOffset) + "px", top: (y + yOffset + yAdditionalOffset) + "px" })
                    .removeClass("notvisible");
            }
            
            // create the rectangle
            chartBody.append("rect")
                    .attr("class", "time-rect")
                    .attr("x", xTimeStart)
                    .attr("y", 0)
                    .attr("width", xTimeEnd - xTimeStart)
                    .attr("height", height)
                    .attr("fill", "rgba(0,0,0,0.1)")
                    .style("pointer-events", "none");
        })
            .on("mouseout", function (d, idx) {
            // hide the rectangle
            $(options.containerNm + " .time-rect").remove();
            //Hide the tooltip
            $(options.containerNm + " .graph-tooltip").addClass("notvisible");
            var originalFill = $(this).attr("original-fill");
            if (originalFill)
                $(this).css("fill", originalFill);
        });
        
        
        // create the legend
        var legendRectSize = 16;
        var legendSpacing = 4;
        
        var legend = svg.selectAll('.legend')
            .data(options.colors.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * options.colors.domain().length / 2;
            var horz = 1 * legendRectSize;
            var vert = i * (legendRectSize + legendSpacing) + 10;
            return "translate(" + horz + "," + vert + ")";
        });
        
        legend.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .style("fill", options.colors)
            .style("stroke", options.colors);
        
        // get the labels
        var legendLabel = [];
        {
            var topics = Object.keys(streamData);
            for (var topic in topics) {
                var json = streamData[topics[topic]];
                if (json.type == "keyword") {
                    legendLabel.push(topics[topic]);
                } else if (json.type == "author") {
                    var keywords = Object.keys(json.data);
                    for (var key in keywords) {
                        legendLabel.push(topics[topic] + ", " + keywords[key]);
                    }
                }
            }
        }
        
        legend.append("text")
            .attr("x", legendRectSize + legendSpacing)
            .attr("y", legendRectSize - legendSpacing)
            .text(function (idx) {
            return legendLabel[idx];
        });
    }
}

/**
 * Additional functions and callbacks
 */

var tooltipTextCallback = function (data) {
    var text = null;
    if (data[0].type == "keyword") {
        text = "<p>In the year <b>" + data[0].x + "</b>" +
           "<br>there were <b>" + data[0].y + "</b> papers" +
           "<br>containing the" +
           "<br>" + data[0].type + " <b>" + data[0].name + "</b></p>";
        return text;
    } else if (data[0].type == "author") {
        text = "<p>In the year <b>" + data[0].x + "</b>" +
           "<br>there were <b>" + data[0].y + "</b> papers" +
           "<br>written by " + "<b>" + data[0].name + "</b>" +
           "<br>" + " on the topic of <b>" + data[0].subname + "</b></p>";
    }
    return text;
}
/**
 * STREAM GRAPH
 * Creates a stream graph class using d3.js.
 * The x values are currently supported only by numbers. Time is not implemented yet.
 */

function streamGraph(_options) {
    // settings
    var options = $.extend({
        containerName: undefined,                                       // the dom that contains the svg element
        scaleType: d3.scale.linear(),                                   // the scale type (d3.scale.linear(), d3.scale.ordinal(), d3.scale.log())
        offsetType: "silhouette",                                       // the offset type ("zero", "wiggle", "silhouette", "expand")
        xCoordinateType: "number",                                      // the type of the x coordinate ("number", "time")
        interpolateType: "basis",                                       // the area interpolation type ("linear", "step", "basis", "cardinal", "monotone")
        tooltipTextCallback: helperFunctions.tooltipTextCallbackStream, // the callback that generates the text info on the chart (defined at the end of the file)
        margin: { top: 30, left: 30, bottom: 20, right: 30 },
        colors: d3.scale.category20()
    }, _options);
    
    var zoom = undefined;
    var xAxis = undefined;
    var xScale = undefined;
    var chartBody = undefined;
    
    /**
     * The streamData is a JSON object containing the data of the search.
     * It is in a form:
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
        if (_streamData == undefined) {
            return;
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
     * Gets the minimum and maximum value of x variables in streamData.
     * @returns {object} The JSON object containing the minimum and maxiumum x values of streamData.
     */
    var xMinMax = function () {
        var years = Object.keys(streamData.years);
        var min = Math.min.apply(null, years);
        var max = Math.max.apply(null, years);
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
        var minYear = xminmax.minimum;
        var maxYear = xminmax.maximum;
        // create the layer
        var keywords = streamData.searchTags.filter(function (json) { if (json.type == "keyword") { return true; } else { return false; } });
        var authors = streamData.searchTags.filter(function (json) { if (json.type == "author") { return true; } else { return false; } });
        var journals = streamData.searchTags.filter(function (json) { if (json.type == "journal") { return true; } else { return false; } });
        var organizations = streamData.searchTags.filter(function (json) { if (json.type == "organization") { return true; } else { return false; } });
        var conferences = streamData.searchTags.filter(function (json) { if (json.type == "conferenceSeries") { return true; } else { return false; } });
        var paperArr = [];
        var X = Object.keys(streamData.years);

        for (var YearN = minYear; YearN <= maxYear; YearN++) {
            if (X.indexOf(YearN.toString()) != -1) {
                paperArr.push({
                    keywords: keywords, 
                    authors: authors, 
                    journals: journals, 
                    organizations: organizations, 
                    conferences: conferences,
                    x: YearN, 
                    y: streamData.years[YearN.toString()]
                });
            } else {
                paperArr.push({
                    keywords: keywords, 
                    authors: authors, 
                    journals: journals, 
                    organizations: organizations, 
                    conferences: conferences,
                    x: YearN, 
                    y: 0
                });
            }
        }
        arr.push(paperArr);
        return arr;
    }
    
    /**
     * Displays the stream graph.
     * 
     */
    this.displayStreamGraph = function () {
        // the width and height of the container and the chartBody
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        d3.select(options.containerName + " svg").remove();
        
        if (streamData == undefined) {
            $(options.containerName).hide();
            return;
        } else {
            $(options.containerName).show();
        }
        // construct the zoom object
        zoom = d3.behavior.zoom();
        
        // get the maximum and minimum x coordinate value
        var xminmax = xMinMax();
        var xStart, 
            xEnd = xminmax.maximum;
        if (xminmax.minimum < 1975) { xStart = 1975; } 
        else { xStart = xminmax.minimum; }
        if (xStart == xEnd) { xStart -= 1; xEnd += 1; }
        
        // scale for the x axis
        xScale = options.scaleType;
        xScale.domain([xStart, xEnd + 1])
                .range([0, width]);
        
        // axis format
        var axisFormat = d3.format("0.f");
        // set the x axis
        xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(8)
                .tickSize(5)
                .tickPadding(4)
                .tickFormat(axisFormat)
                .orient("bottom");
        
        // setting the svg element (container for the visualization)
        var svg = d3.select(options.containerName)
            .append("svg")
            .attr("id", "svg-container")
            .attr("width", totalWidth)
            .attr("height", totalHeight);
        
        // appending the background color rectangle (for save picture)
        svg.append("rect")
            .attr("fill", "#FFFFFF")
            .attr("width", totalWidth)
            .attr("height", totalHeight);
        
        // appending the sub-container for the SVG elements
        svg = svg.append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
            .call(zoom);
        
        
        svg.append("rect")
            .attr("fill", "#FFFFFF")
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
            .data([{}])
            .enter().append("path")
            .attr("class", "area");
        
        zoom.x(xScale)
            .scaleExtent([0, 4]);
        
        // append the x axis to the svg
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);
        
        svg.select(".x.axis")
            .selectAll("text")
            .attr("font-family", "sans-serif");
        
        // draw the charts
        this.redraw();
    }
    
    /**
     * Draws the graph with all the functions. 
     */
    this.redraw = function () {
        
        // what to do when zoomed
        var onZoom = function () {
            svg.select(".x.axis").call(xAxis);
            chartBody.selectAll(".area")
                .data(layers)
                .attr("d", area);
        }
        zoom.on("zoom", onZoom);
        
        var totalHeight = $(options.containerName).height(),
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
        var svg = d3.select("#svg-container");
        
        // draw the stream graph areas
        chartBody.selectAll(".area")
            .data(layers)
            .attr("d", area)
            .style("fill", function (d, idx) { return options.colors(idx); });
        
        // create the on mousemove and mouseout functions on areas
        chartBody.selectAll(".area")
            .on("mousemove", function (d, idx) {
            
            // remove the highlight rect
            $(options.containerName + " .time-rect").remove();
            var coords = d3.mouse(this);
            
            var time = Math.floor(xScale.invert(coords[0]));
            // the time grey rectangle
            var xTimeStart = xScale(time);
            var xTimeEnd = xScale(time + 1);
            
            
            
            // find the data for the selected year
            matchingValue = $.grep(d, function (data) {
                return data.x == time;
            });
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
                var tooltipDiv = $(options.containerName + " .graph-tooltip");
                tooltipDiv.html(options.tooltipTextCallback(matchingValue));
                var x = coords[0] + options.margin.left;
                var y = coords[1] + options.margin.top;
                var xOffset = (coords[0] > ($(options.containerName).width() / 2)) ? (-tooltipDiv.outerWidth() - 5) : 5;
                var yOffset = (coords[1] > ($(options.containerName).height() / 2)) ? (-tooltipDiv.outerHeight() - 5) : 5;
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
            $(options.containerName + " .time-rect").remove();
            //Hide the tooltip
            $(options.containerName + " .graph-tooltip").addClass("notvisible");
            var originalFill = $(this).attr("original-fill");
            if (originalFill)
                $(this).css("fill", originalFill);
        });
    }
}

/**
 * Helper functions.
 * The tooltip text creater.
 */

/**
 * Creates the tooltip text for the Microsoft Academics data. 
 * @param {object} data - The json object containing the data of the keyword/author/journal.
 * @returns {string} The string for the appropriate data.
 */
var helperFunctions = {
    tooltipTextCallbackStream: function (data) {
        var dataInfo = data[0];        
        var text = "<p>";
        text += "In the year " + dataInfo.x + " there were " + dataInfo.y + " papers";
        text += "<br>with the following attributes:";
        if (dataInfo.authors.length != 0) {
            text += "<br><b>Authors:</b>";
            for (var N = 0; N < dataInfo.authors.length; N++) {
                text += "<br>" + dataInfo.authors[N].label;
            } 
        }
        if (dataInfo.keywords.length != 0) {
            text += "<br><b>Containing keywords:</b>";
            for (var N = 0; N < dataInfo.keywords.length; N++) {
                text += "<br>" + dataInfo.keywords[N].label;
            } 
        }
        if (dataInfo.journals.length != 0) {
            dataInfo += "<br><b>Published in journals:</b>";
            for (var N = 0; N < dataInfo.journals.length; N++) {
                text += "<br>" + dataInfo.journals[N].label;
            }
        }
        if (dataInfo.conferences.length != 0) {
            text += "<br><b>Were presented at:</b>";
            for (var N = 0; N < dataInfo.conferences.length; N++) {
                text += "<br>" + dataInfo.conferences[N].label;
            }
        }
        if (dataInfo.organizations.length != 0) {
            text += "<br><b>Where authors are from:</b>";
            for (var N = 0; N < dataInfo.organizations.length; N++) {
                text += "<br>" + dataInfo.organizations[N].label;
            }
        }
        return text;
    }
}
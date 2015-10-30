/*
 * LANDSCAPE GRAPH
 * Creates the topic landscape using d3.js.
 * 
 */
function landscapeGraph(_options) {
    // setting
    var options = $.extend({
        containerName: undefined,                                               // the dom that contains the svg element
        tooltipTextCallBack: undefined,                                         // the callback that generates the text info on the chart (defined at the end of the file)
        margin: { top: 30, left: 30, bottom: 20, right: 30 },
    }, _options);
    
    var xScale = undefined;
    var yScale = undefined;
    var chartBody = undefined;
    
    /**
     * The landscapeData is a JSON object containing the data of the search.
     * The data contains the x and y coordinate of the document, created by
     * the multidimensional scaling.
     */
    var landscapeData = null;
    
    /*
     * Gets the landscape data.
     * @returns {object} The landscape data contained.
     */
    this.getData = function () {
        return landscapeData;
    }
    
    /*
     * Set the landscape data. 
     * @param {object} [_landscapeData] - The landscape data added.
     */
    this.setData = function (_landscapeData) {
        if (_landscapeData == undefined) {
            return;
        } else {
            landscapeData = _landscapeData;
            this.displayLandscapeGraph();
        }
    }
    
    /*
     * Updates the options. 
     * @param {object} [_options] - The options given for the update.
     */
    this.updateOptions = function (_options) {
        options = $.extend(options, _options);
    }
    
    /*
     * Displays the landscape graph.
     */
    this.displayLandscapeGraph = function () {
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        d3.select(options.containerName + " svg").remove();
        
        if (landscapeData == undefined) {
            $(options.containerName).hide();
            return;
        }
        
        $(options.containerName).show();
        
        // construct the zoom object
        //zoom = d3.behaviour.zoom();
        
        var svg = d3.select(options.containerName)
            .append("svg")
            .attr("id", "svg-canvas")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .append("g")
            .attr("transform", "translate(" + options.margin.left + ", " + options.margin.top + ")");
        
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
        
        chartBody = svg.append("g")
            .attr("clip-path", "url(#clip)");
        
        xScale = d3.scale.linear()
            .domain([0, 1])
            .range([(width - height) / 2, (width + height) / 2]);
        
        yScale = d3.scale.linear()
            .domain([0, 1])
            .range([height, 0]);
        
        // redraw the graph
        this.redraw();
    }
    
    /*
     * Redraws the landscape of topics. 
     * 
     */
    this.redraw = function () {
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        var nodes = chartBody.selectAll("g")
            .data(landscapeData)
            .enter()
            .append("circle")
            .attr("class", "nodes")
            .attr("fill", "#6375fc")
            .attr("cx", function (d) {
            return xScale(d.x);
        })
            .attr("cy", function (d) {
            return yScale(d.y);
        })
            .attr("r", 2);
        
        var areas = chartBody.selectAll("g")
            .data(landscapeData)
            .enter()
            .append("circle")
            .attr("class", "areas")
            .attr("opacity", 0.05)
            .attr("fill", "#808080")
            .attr("cx", function (d) {
            return xScale(d.x);
        })
            .attr("cy", function (d) {
            return yScale(d.y);
        })
            .attr("r", 25);

        //chartBody.selectAll("text")
        //    .data(landscapeData)
        //    .enter()
        //    .append("text")
        //    .attr("x", function (d) {
        //        return xScale(d.x) + 5;
        //    })
        //    .attr("y", function (d) {
        //        return yScale(d.y) + 5;
        //    })
        //    .text(function (d) {
        //        return d.label;
        //    })
        //    .attr("font-family", "sans-serif")
        //    .attr("font-size", "10px")
        //    .attr("fill", "#6375fc");
    }

}


/**
 * Helper functions. 
 * 1. NormalDist: Used to create the canvas and color the pixels.
 * 
 */

var NormalDist = function (t) {
    var f = 100 * Math.exp(-t * t / 2);
    return f;
}  
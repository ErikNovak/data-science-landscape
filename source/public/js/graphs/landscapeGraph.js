/*
 * LANDSCAPE GRAPH
 * Creates the topic landscape using d3.js.
 * 
 */
function landscapeGraph(_options) {
    // setting
    var options = $.extend({
        containerName: undefined,                                               // the dom that contains the svg element
        tooltipTextCallback: LHelperFunctions.tooltipTextCallbackLandscape,     // the callback that generates the text info on the chart (defined at the end of the file)
        radius: { point: 2.5, hexagon: 5 },
        margin: { top: 20, left: 20, bottom: 20, right: 20 },               
        color: {
            shadeLight: "#A28DE6", shadeDark: "#4724B9",  
            addShadeLight: "#FFEF6B", addShadeDark: "#FFE510",
            background: "#260788", text: "#FFFFFF"
        }
    }, _options);
    
    var zoom = undefined;
    var xScale = undefined;
    var yScale = undefined;
    var cShadeScale = undefined;
    var cAddScale = undefined;
    var chartBody = undefined;
    
    
    /**
     * The landscapeData is a JSON object containing the data landscape and additional
     * points.
     * The data contains the x and y coordinate of the document, created by
     * the multidimensional scaling, the title of the paper, its keywords and
     * authors.
     */
    var landscapeData = null;
    
    /**
     * The clustersData is a JSON object containing the additional data cluster  
     * positioning. Contains the x and y coordinate.
     */
    var clusterData = null;
    
    /*
     * Gets the landscape data.
     * @returns {object} A JSON object containing the landscapeData (key: point) and
     * keywordsData (key: keywords).
     */
    this.getLandscapeData = function () {
        return { points: landscapeData, clusters: clusterData };
    }
    
    /*
     * Set the landscape data. 
     * @param {object} [data] - Contains the paper points (key: points) and the
     * keywords points (key: keywords).
     */
    this.setData = function (data) {
        // if data is not contained
        if (data.points == null) {
            throw "landscapeGraph.setData: must contain the .points data!";
        } else {
            // set the data and draw the graph
            landscapeData = data.points;
            clusterData = data.clusters;
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
     * Sets the SVG container for the DOM manipulation and vizualization.
     */
    this.displayLandscapeGraph = function () {
        
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        // remove the previous SVG container
        d3.select(options.containerName + " svg").remove();
        
        // if the data is not defined
        if (landscapeData == undefined) {
            $(options.containerName).hide();
            return;
        } else {
            $(options.containerName).show();
        }
        
        // construct the zoom object
        zoom = d3.behavior.zoom();
        
        // create the SVG container
        var svg = d3.select(options.containerName)
            .append("svg")
            .attr("id", "svg-container")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .append("g")
            .attr("transform", "translate(" + options.margin.left + ", " + options.margin.top + ")")
            .call(zoom);
        
        svg.append("rect")
            .attr("fill", options.color.background)
            .attr("width", width)
            .attr("height", height);
        
        // create the border of what is shown
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);
        
        chartBody = svg.append("g")
            .attr("clip-path", "url(#clip)");
        
        // padding: all points are in the SVG container field
        // they are not clipped in half
        var padding = { left: 30, right: 30, top: 30, bottom: 30 };
        
        // the x coordinate scale
        xScale = d3.scale.linear()
            .domain([0, 1])
            .range([(width - height) / 2 + padding.left, (width + height) / 2 - padding.right]);
        
        // the y coordinate scale
        yScale = d3.scale.linear()
            .domain([0, 1])
            .range([height - padding.bottom, 0 + padding.top]);
        
        // the color scale for the shade / hexagons
        cShadowScale = d3.scale.log()
            .domain([1, 5000])
            .range([options.color.shadeDark, options.color.shadeLight])
            .interpolate(d3.interpolateLab);
        
        // the color scale for the additional points / hexagons
        cAddScale = d3.scale.log()
            .domain([1, 5000])
            .range([options.color.addShadeDark, options.color.addShadeLight])
            .interpolate(d3.interpolateLab);
        
        // zoom configurations
        zoom.x(xScale)
            .y(yScale)
            .scaleExtent([1, 10]);
        
        // redraw the graph
        this.redraw();
    }
    
    /*
     * Redraws the landscape of topics. 
     * It redraws all the data. 
     */
     this.redraw = function () {
        
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            width = totalWidth - options.margin.left - options.margin.right,
            height = totalHeight - options.margin.top - options.margin.bottom;
        
        // what to do when zoomed
        var onZoom = function () {
            
            d3.select("#hexagons").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            
            // change the points position and size
            chartBody.selectAll(".points")
                 .attr("cx", function (d) { return xScale(d.x); })
                 .attr("cy", function (d) { return yScale(d.y); })
                 .attr("r", function (d) { return options.radius.point * d3.event.scale });
            
            // change the keywords position and the which are shown
            var keywordTags = chartBody.selectAll(".keyword")
                .attr("x", function (d) { return xScale(d.x); })
                .attr("y", function (d) { return yScale(d.y); })
            
            if ($("#checkKeyword").is(":checked")) {
                keywordTags.filter(".hidden")
                .classed("hidden", false);
                tagsVisibility(keywordTags);
            }
            // change the journals position and the which are shown
            var journalTags = chartBody.selectAll(".journal")
                .attr("x", function (d) { return xScale(d.x); })
                .attr("y", function (d) { return yScale(d.y); })
            
            if ($("#checkJournal").is(":checked")) {
                journalTags.filter(".hidden")
                .classed("hidden", false);
                tagsVisibility(journalTags);
            }
            // change the journals position and the which are shown
            chartBody.selectAll(".conference").filter(".hidden")
                .classed("hidden-keyword", false);
            
            var conferenceTags = chartBody.selectAll(".conference")
                .attr("x", function (d) { return xScale(d.x); })
                .attr("y", function (d) { return yScale(d.y); });
            
            if ($("#checkConference").is(":checked")) {
                conferenceTags.filter(".hidden")
                .classed("hidden", false);
                tagsVisibility(conferenceTags);
            }
        }
        zoom.on("zoom", onZoom);
        
        /**
         * Hexbins are GREAT for static visualization, BUT for panning and zooming
         * they are not. Append hexbins to "g" tag in SVD. On zoom, get the "g" tag
         * and transform it. It will zoom/pan the hexagons.
         */
        var hexagons = chartBody.append("g")
                          .attr("id", "hexagons");
        // create the hexagon shade 
        var hexbinMain = d3.hexbin()
            .radius(options.radius.hexagon);
        
        var hexagonsMain = hexagons.selectAll(".HexagonMain")
            .data(hexbinMain(landscapeData.main.map(function (d) { return [xScale(d.x), yScale(d.y)]; })));
        
        hexagonsMain.enter().append("path")
            .attr("class", "HexagonMain")
            .attr("d", hexbinMain.hexagon())
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style("fill", function (d) { return cShadowScale(d.length); });
        
        // create the additional shade
        //var hexbinAdd = d3.hexbin()
        //    .size([width, height])
        //    .radius(options.radius.hexagon / 2);
        
        //var hexagonsAdd = hexagons.selectAll(".HexagonAdd")
        //    .data(hexbinAdd(landscapeData.highlight.map(function (d) { return [xScale(d.x), yScale(d.y)]; })));
        
        //hexagonsAdd.enter().append("path")
        //    .attr("class", "HexagonAdd")
        //    .attr("d", hexbinAdd.hexagon())
        //    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        //    .style("fill", function (d) { return cAddScale(d.length); });
        
        // add the points
        var points = chartBody.selectAll(".points")
                .data(landscapeData.highlight.length != 0 ? landscapeData.highlight : landscapeData.main);
        points.exit().remove();
        points.enter().append("circle")
                .attr("class", "points")
                .attr("cx", function (d) { return xScale(d.x); })
                .attr("cy", function (d) { return yScale(d.y); })
                .attr("r", options.radius.point)
                .attr("fill", landscapeData.highlight.length != 0 ? options.color.addShadeLight : options.color.shadeLight);
        
        /*
         * Sets the visibility of the keywords tags. If two are covering
         * each other, the younger one is hidden.    
         * @param {object} _tags - The keyword tags. 
         */ 
        var tagsVisibility = function (_tags) {
            // create additional cluster border control
            var additionalBorder = 5;
            // saves the visible clusters
            var visibleClusters = [];
            // get the DOMs and go through them
            var DOMs = _tags[0];
            for (var ClusN = 0; ClusN < DOMs.length; ClusN++) {
                var currentClust = DOMs[ClusN];
                var currentBox = currentClust.getBBox();
                for (var i = 0; i < visibleClusters.length; i++) {
                    var visibleBox = visibleClusters[i].getBBox();
                    // if the bounding boxes cover each other
                    if (Math.abs(currentBox.x - visibleBox.x) - additionalBorder <= Math.max(currentBox.width, visibleBox.width) && 
                        Math.abs(currentBox.y - visibleBox.y) - additionalBorder <= Math.max(currentBox.height, visibleBox.height)) {
                        $(currentClust).attr("class", $(currentClust).attr("class") + " hidden");
                        break;
                    }
                }
                // otherwise the cluster is visible
                visibleClusters.push(currentClust);
            }
        }
        
        // create the journals tags
        var journalTags = chartBody.selectAll(".journal")
            .data(clusterData.journals);
        journalTags.exit().remove();
        journalTags.enter().append("text")
            .attr("class", "journal")
            .attr("x", function (d) { return xScale(d.x); })
            .attr("y", function (d) { return yScale(d.y) - 7; })
            .text(function (d) {
            // get the points, that are close to the journals position 
            closePoints = $.grep(landscapeData.main, function (point) {
                return Math.sqrt(Math.pow((xScale(d.x) - xScale(point.x)), 2) + 
                                Math.pow((yScale(d.y) - yScale(point.y)), 2)) < 30;
            });
            if (closePoints.length == 0) { return; }
            // get the frequency of the journals
            var journalFrequency = {};
            for (var MatN = 0; MatN < closePoints.length; MatN++) {
                var journals = closePoints[MatN].journals;
                for (var KeyN = 0; KeyN < journals.length; KeyN++) {
                    if (journalFrequency[journals[KeyN]] != null) {
                        journalFrequency[journals[KeyN]] += 1;
                    } else {
                        journalFrequency[journals[KeyN]] = 1;
                    }
                }
            }
            if (Object.keys(journalFrequency).length == 0) {
                return;
            }
            if (landscapeData.highlight.length != 0) {
                // get the journal with the maximum frequency
                var num = 0;
                var topJournal;
                var journals = Object.keys(journalFrequency);
                for (var KeyN = 0; KeyN < journals.length; KeyN++) {
                    var Kn = journals[KeyN];
                    if (num < journalFrequency[Kn]) {
                        num = journalFrequency[Kn];
                        topJournal = Kn;
                    }
                }
                return topJournal;
            } else {
                return LHelperFunctions.getTag(journalFrequency);
            }
        })
            .attr("font-size", $("#spinJournal input").val() + "px")
            .attr("font-family", "sans-serif")
            .attr("fill", "#FFFF00");
        tagsVisibility(journalTags);
        
        // create the keyword tags
        var keywordTags = chartBody.selectAll(".keyword")
            .data(clusterData.keywords);
        keywordTags.exit().remove();
        keywordTags.enter().append("text")
            .attr("class", "keyword")
            .attr("x", function (d) { return xScale(d.x); })
            .attr("y", function (d) { return yScale(d.y) - 7; })
            .text(function (d) {
            // get the points, that are close to the keyword position 
            closePoints = $.grep(landscapeData.main, function (point) {
                return Math.sqrt(Math.pow((xScale(d.x) - xScale(point.x)), 2) + 
                                Math.pow((yScale(d.y) - yScale(point.y)), 2)) < (landscapeData.highlight.length != 0 ? 10 : 30);
            });
            if (closePoints.length == 0) { return; }
            
            // get the frequency of the keywords
            var keywordFrequency = {};
            for (var MatN = 0; MatN < closePoints.length; MatN++) {
                var keywords = closePoints[MatN].keywords;
                for (var KeyN = 0; KeyN < keywords.length; KeyN++) {
                    if (keywordFrequency[keywords[KeyN]] != null) {
                        keywordFrequency[keywords[KeyN]] += 1;
                    } else {
                        keywordFrequency[keywords[KeyN]] = 1;
                    }
                }
            }
            if (Object.keys(keywordFrequency).length == 0) {
                return;
            }
            if (landscapeData.highlight.length != 0) {
                // get the keyword with the maximum frequency
                var num = 0;
                var topKeyword;
                var keywords = Object.keys(keywordFrequency);
                for (var KeyN = 0; KeyN < keywords.length; KeyN++) {
                    var Kn = keywords[KeyN];
                    if (num < keywordFrequency[Kn]) {
                        num = keywordFrequency[Kn];
                        topKeyword = Kn;
                    }
                }
                return topKeyword;
            } else {
                return LHelperFunctions.getTag(keywordFrequency);
            }
        })
            .attr("font-size", $("#spinKeyword input").val() + "px")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("fill", options.color.text);
        tagsVisibility(keywordTags);
        
        // create the conference series tags
        var conferenceSeriesTags = chartBody.selectAll(".conference")
            .data(clusterData.conferences);
        conferenceSeriesTags.exit().remove();
        conferenceSeriesTags.enter().append("text")
            .attr("class", "conference")
            .attr("x", function (d) { return xScale(d.x); })
            .attr("y", function (d) { return yScale(d.y); })
            .text(function (d) {
            // get the points, that are close to the conferences position 
            closePoints = $.grep(landscapeData.main, function (point) {
                return Math.sqrt(Math.pow((xScale(d.x) - xScale(point.x)), 2) + 
                                Math.pow((yScale(d.y) - yScale(point.y)), 2)) < 20;
            });
            if (closePoints.length == 0) { return; }
            // get the frequency of the conferences
            var conferenceFrequency = {};
            for (var MatN = 0; MatN < closePoints.length; MatN++) {
                var conference = closePoints[MatN].conference;
                if (conferenceFrequency[conference] != null) {
                    conferenceFrequency[conference] += 1;
                } else {
                    conferenceFrequency[conference] = 1;
                }
            }
            if (Object.keys(conferenceFrequency).length == 0) {
                return;
            }
            //if (landscapeData.highlight.length != 0) {
            //    // get the conference with the maximum frequency
            //    var num = 0;
            //    var topConference;
            //    var conferences = Object.keys(conferenceFrequency);
            //    for (var KeyN = 0; KeyN < conferences.length; KeyN++) {
            //        var Kn = conferences[KeyN];
            //        if (num < conferenceFrequency[Kn]) {
            //            num = conferenceFrequency[Kn];
            //            topConference = Kn;
            //        }
            //    }
            //    return topConference;
            //}
            return LHelperFunctions.getTag(conferenceFrequency);
        })
            .attr("font-size", $("#spinConference input").val() + "px")
            .attr("font-family", "sans-serif")
            .attr("fill", "#FF1800");
        tagsVisibility(conferenceSeriesTags);
        
        /**
         * Additional functionality
         * Creates the box containing the paper information when the point is clicked.
         */ 
        chartBody.selectAll(".points")
            .on("mouseover", function (d, idx) {
            
            var coords = d3.mouse(this);
            xCoord = xScale.invert(coords[0]);
            yCoord = yScale.invert(coords[1]);
            
            // create the tooltip with the point's information
            if (options.tooltipTextCallback) {
                var tooltipDiv = $(options.containerName + " .graph-tooltip");
                tooltipDiv.html(options.tooltipTextCallback(d));
                var x = coords[0] + options.margin.left;
                var y = coords[1] + options.margin.top;
                var xOffset = (coords[0] > ($(options.containerName).width() / 2)) ? (-tooltipDiv.outerWidth() - 5) : 5;
                var yOffset = (coords[1] > ($(options.containerName).height() / 2)) ? (-tooltipDiv.outerHeight() - 5) : 5;
                var xAdditionalOffset = 10; // additional x offset
                var yAdditionalOffset = 0;  // additional y offset
                tooltipDiv.css({ left: (x + xOffset + xAdditionalOffset) + "px", top: (y + yOffset + yAdditionalOffset) + "px" })
                    .removeClass("notvisible");
            }
        })
            .on("mouseout", function (d, idx) {
            //Hide the tooltip
            $(options.containerName + " .graph-tooltip").addClass("notvisible");
        });
    }
}

/**
 * Creates the tooltip text for the Microsoft Academics data. 
 * @param {object} data - The json object containing the data of the paper.
 * @returns {string} The string for the appropriate data.
 */
LHelperFunctions = {
    tooltipTextCallbackLandscape : function (data) {
        // the paper title
        var text = "<b>Paper title:</b><br>" + data.title + "<br>";
        // the paper keywords
        text += "<b>Keywords:</b> ";
        for (var KeywordN = 0; KeywordN < data.keywords.length; KeywordN++) {
            text += data.keywords[KeywordN];
            if (KeywordN != data.keywords.length - 1) { text += ", "; }
        }
        text += "<br>";
        // the paper authors
        text += "<b>Authors:</b>";
        for (var AuthorN = 0; AuthorN < data.authors.length; AuthorN++) {
            text += "<br>" + data.authors[AuthorN];
        }
        return text;
    },
    getTag : function (json) {
        // create an array of key-values
        var jsonArr = [];
        for (key in json) {
            jsonArr.push([key, json[key]]);
        }
        jsonArr.sort(function (a, b) { return a[1] - b[1]; });
        // get the distribution of the values
        var distribution = [0, jsonArr[0][1]]; // add the biggest value
        for (var i = 1; i < jsonArr.length; i++) {
            distribution.push(distribution[i - 1] + jsonArr[i][1]);
        }
        var diceToss = Math.floor(Math.random() * distribution[distribution.length - 1]);
        for (var i = 0; i < distribution.length - 1; i++) {
            if (distribution[i] <= diceToss && diceToss < distribution[i + 1]) {
                return jsonArr[i][0];
            }
        }
    }
}
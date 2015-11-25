/**
 * Jsonifies the record set, so it can be used for the d3.js visualizations.
 * 
 */ 

var qm = require("qminer");

/**
 * Jsonfies the recordSet data in the format for timestreamGraph.
 * 
 */ 
exports.timeStream = function (paperSet, additionalOptions) {
    // set the additional options
    var startYear = additionalOptions.year.start == "" ? -Infinity : parseInt(additionalOptions.year.start);
    var endYear = additionalOptions.year.end == "" ? Infinity : parseInt(additionalOptions.year.end);
    
    var json = {};
    // parse the data from the recordSet by year
    for (var RecN = 0; RecN < paperSet.length; RecN++) {
        var paper = paperSet[RecN];
        if (startYear <= paper.publishYear && paper.publishYear <= endYear) {
            if (json[paper.publishYear] == null) {
                json[paper.publishYear] = 1;
            } else {
                json[paper.publishYear] += 1;
            }
        }
    }
    return json;
}

exports.landscapeClusters = function (A) {
    var A = A.transpose();
    // set the functions for the square domain: [0, 1]^2
    var xSquare = helperFunctions.linear(A.getCol(0));
    var ySquare = helperFunctions.linear(A.getCol(1));
    // save the coordinates
    var clusterCoords = [];
    for (var RowN = 0; RowN < A.rows; RowN++) {
        var row = A.getRow(RowN);
        clusterCoords.push({
            x: xSquare(row.at(0)), 
            y: ySquare(row.at(1))
        });
    }
    return clusterCoords;
}

/**
     * Returns an array with the MDS data as coordinates. 
     * @param {module:la.Matrix | module:la.SparseMatrix} A - The document matrix.
     * @returns {Array.<object>} The array containing the json object, where Array[i].x
     * and Array[i].y are the coordinates of the mapped i-th document.
     */
 exports.landscapePoints = function (json) {
    
    var points = json.matrix;
    
    var xSquare = helperFunctions.linear(points.getCol(0));
    var ySquare = helperFunctions.linear(points.getCol(1));
    var documentXY = [];
    for (var RowN = 0; RowN < points.rows; RowN++) {
        var docRow = points.getRow(RowN);
        var record = json.records[RowN];
        debugger
        var title = record.title;
        var authors = record.hasAuthors.map(function (rec) { return rec.name; });
        var keywords = record.containsKeywords.map(function (rec) { return rec.name; });
        var journals = record.wasPublishedIn.map(function (rec) { return rec.name; });
        //var conference = record.wasPresentedAt.map(function (rec) { return rec.name; });
        documentXY.push({
            title: title, 
            authors: authors, 
            keywords: keywords, 
            journals: journals,
            //conference: conference, 
            x: xSquare(docRow.at(0)), 
            y: ySquare(docRow.at(1))
        });
    }
    return documentXY;
}

/**
 * Helper functions. 
 * 
 */
var helperFunctions = {
    /**
    * Gets the minimum and maximum values of the vector.
    * @param {module:la.Vector} vec - The vector.
    * @returns {object} The json object, where json.min is the minimum value
    * and json.max is the maximum value of the vector vec.
    */
    minmax : function (vec) {
        var sorted = vec.sort();
        var min = sorted.at(0);
        var max = sorted.at(sorted.length - 1);
        return { min: min, max: max };
    },
    
    /**
    * Gets the linear function, that maps the minimum value of the vector
    * to 0 and the maximum value of the vector to 1. 
    * @param {module:la.Vector} vec - The vector.
    * @returns {function} The function, that takes the value t and returns
    * the value between 0 and 1, based on the minimum and maximum value of
    * the vector.
    */
    linear : function (vec) {
        var m = helperFunctions.minmax(vec);
        return function (t) {
            return 1 / (m.max - m.min) * t - m.min / (m.max - m.min);
        };
    }
}
/**
 * This file contains the functions for constructing the
 * landscape visualization.
 * 
 * 1. Document Representation (DR) returns the representation
 * of the documents in the matrix using TFIDF.
 * 2. Latent Semantic Indexing (LSI) returns the projection
 * of the document matrix on the semantic space.  
 * 3. Multidimensional Scaling (MDS) returns the mapping of
 * the original multidimensional vectors onto two dimensions. 
 * 
 */

var qm = require('qminer');

module.exports = exports = {
    
    /**
     * Returns the projection of the document matrix on the scemantic space. 
     * @param {module:la.Matrix | module:la.SparseMatrix} A - The document matrix.
     * @returns {module:la.Matrix} The projection on the scemantic space.
     */
    LSI: function (A) {
        console.log("LSI");
        var k = 37;
        var svd = qm.la.svd(A, k, { iter: 10 });
        var U = svd.U.getColSubmatrix(qm.la.rangeVec(1, 36));
        var lsi = U.multiplyT(A);
        return lsi;
    },
    
    /**
     * Returns the mapping of the multidimensional matrix on two dimensions. 
     * @param {module:la.Matrix | module:la.SparseMatrix} A - The multidimensional matrix.
     * @returns {module:la.Matrix} The mapping of the matrix on two dimensions.
     */
    MDS: function (A) {
        console.log("MDS");
        var PCA = new qm.analytics.PCA({ iter: 100, k: 2 });
        PCA.fit(A);
        var model = PCA.getModel();
        return model.P;
    },
    
    /**
     * Combines the whole process of the multidimensional scaling.
     * @param {module:la.Matrix | module:la.SparseMatrix} A - The document matrix. 
     * @returns {module:la.Matrix} The mapping of the matrix on two dimensions.
     */
    Landscape: function (A) {
        var lsi = exports.LSI(A);
        console.log("DIST");
        var distMatrix = qm.la.pdist2(lsi, lsi);
        var mds = exports.MDS(distMatrix);
        return mds;
    },
    // jsonification of the result from Landscape
    /**
     * Returns an array with the MDS data as coordinates. 
     * @param {module:la.Matrix | module:la.SparseMatrix} A - The document matrix.
     * @returns {Array.<object>} The array containing the json object, where Array[i].x
     *  and Array[i].y are the coordinates of the mapped i-th document.
     */
    jsonify: function (A) {
        var landscape = exports.Landscape(A);
        console.log("JSON");
        var xSquare = linear(landscape.getCol(0));
        var ySquare = linear(landscape.getCol(1));
        var documentXY = [];
        for (var RowN = 0; RowN < landscape.rows; RowN++) {
            var docRow = landscape.getRow(RowN);
            documentXY.push({ x: xSquare(docRow.at(0)), y: ySquare(docRow.at(1)) });
        }
        return documentXY;
    }
}

/**
 * Helper functions. 
 * 
 */

/**
 * Gets the minimum and maximum values of the vector.
 * @param {module:la.Vector} vec - The vector.
 * @returns {object} The json object, where json.min is the minimum value
 * and json.max is the maximum value of the vector vec.
 */
var minmax = function (vec) {
    var sorted = vec.sort();
    var min = sorted.at(0);
    var max = sorted.at(sorted.length - 1);
    return { min: min, max: max };
}

/**
 * Gets the linear function, that maps the minimum value of the vector
 * to 0 and the maximum value of the vector to 1. 
 * @param {module:la.Vector} vec - The vector.
 * @returns {function} The function, that takes the value t and returns
 * the value between 0 and 1, based on the minimum and maximum value of
 * the vector.
 */
var linear = function (vec) {
    var m = minmax(vec);
    return function (t) {
        return 1 / (m.max - m.min) * t - m.min / (m.max - m.min);
    };
}
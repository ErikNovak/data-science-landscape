/**
 * Server for the QVisual project.  
 * 
 */

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path');

var app = express();
var server = http.Server(app);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var htmlPath = __dirname + '/public/html/'
app.get('/', function (request, response) {
    response.sendFile(path.join(htmlPath, 'index.html'));
});

server.listen('3000', function () {
    console.log("Listening port 3000: at http://aidemo.ijs.si/datascience/");
});

/**
 * QMiner database.
 * 
 */

var qm = require('qminer');
var jsonify = require('./utility/jsonify.js');
var algorithms = require('./utility/algorithms.js');

var basePath = './database/'
var base = new qm.Base({
    mode: 'openReadOnly',
    dbPath: basePath + "QMinerAcademicsDataScience/"
});

var ftr = new qm.FeatureSpace(base, [
    { type: "text", source: "Papers", field: "title" },                                         // paper title
    { type: "text", source: { store: "Papers", join: "containsKeywords" }, field: "name" },     // paper keywords
    { type: "text", source: { store: "Papers", join: "wasPublishedIn" }, field: "name" },       // paper journals
    { type: "text", source: { store: "Papers", join: "wasPresentedAt" }, field: "name" }         // paper conferences
]);

/**
 * Queries the data from the database.
 * @param {Array.<object>} data - The Array of json objects containing the search criteria.
 * @returns {module:qm.RecordSet} The record set satisfying the search criteria.
 */ 
var dataQuery = function (data) {
    var result;
    // set the array for the query
    var join = [];
    var store;
    for (var DataN = 0; DataN < data.length; DataN++) {
        var json;
        switch (data[DataN].type) {
            case ("keyword"):
                json = {
                    $name: "inPapers", 
                    $query: { $from: "Keywords", normalizedName: data[DataN].value }
                };
                break;
            case ("author"):
                json = {
                    $name: "hasWritten", 
                    $query: { $from: "Authors", normalizedName: data[DataN].value }
                };
                break;
            case ("journal"):
                json = {
                    $name: "containsPapers", 
                    $query: { $from: "Journals", normalizedName: data[DataN].value }
                };
                break;
            case ("conferenceSeries"):
                json = {
                    $name: "containsPapers", 
                    $query: { $from: "ConferenceSeries", name: data[DataN].value }
                };
                break;
            case ("organization"):
                json = {
                    $name: "inPapers", 
                    $query: { $from: "Affiliations", normalizedName: data[DataN].value }
                };
                break;
        }
        join.push(json);
    }
    var query = { $join: join };
    var result = base.search(query);
    return result;
}

// query data for autocomplete
var autoQuery = function (data) {
    var result = [];
    var stores;
    if (data.search == "keywords") {
        stores = [{ store: "Keywords", type: "keyword" }];
    } else if (data.search == "authors") {
        stores = [{ store: "Authors", type: "author" }];
    } else if (data.search == "journals") {
        stores = [{ store: "Journals", type: "journal" }];
    } else if (data.search == "organizations") {
        stores = [{ store: "Affiliations", type: "organization" }];
    } else if (data.search == "conferenceSeries") {
        stores = [{ store: "ConferenceSeries", type: "conferenceSeries" }];
    } else if (data.search == "all") {
        stores = [
            { store: "Keywords", type: "keyword" },
            { store: "Authors", type: "author" },
            { store: "Journals", type: "journal" },
            { store: "Affiliations", type: "organization" },
            { store: "ConferenceSeries", type: "conferenceSeries" }
        ];
    }
    // search through every stores
    for (var StoreN = 0; StoreN < stores.length; StoreN++) {
		console.time("Query");
        var query = { $from: stores[StoreN].store, normalizedName: { $wc: "*" + data.value.toLowerCase() + "*" },  $limit: 10 };
        var res = base.search(query);
		console.timeEnd("Query")
		console.time("Array")
        // get the first 10 of each query
        var arr = res.map(function (record) {
            var type = stores[StoreN].type;
            var value = record.normalizedName;
            var label = record.name;
            return { type: type, value: value, label : label };
        });
        console.timeEnd("Array")
        result = result.concat(arr);
    }
    // removing duplicates
    var uniqueResult = [];
    for (var N = 0; N < result.length; N++) {
        if (uniqueResult.map(function (json) { return json.value }).indexOf(result[N].value) == -1) {
            uniqueResult.push(result[N]);
        }
    }
    return uniqueResult;
}

/**
 * Request handling. 
 * '/pdf' - The SVG to PDF construction.
 * '/'    - The data request. 
 */

// querying the timestream data and sending it back
app.post('/datascience/timestream', function (request, response) {
    var sentData = request.body;
    var search = dataQuery(sentData.data);
    var options = {
        containerName: ".graph-content",
        offsetType: "zero",
        margin: {
            top: 40, 
            left: 30, 
            bottom: 30, 
            right: 30
        }
    }
    
    if (search.length == 0) {
        response.send({ error: "There was no data found." });
    }
    // jsonifying the data for timestream graph
    var values = {
        years: jsonify.timeStream(search, sentData.options), 
        searchTags: sentData.data
    };
    var data = {
        values: values,
        options: options
    };
    // sending the data back to the client
    response.send(data);
})

app.post('/datascience/landscape', function (request, response) {
    var sentData = request.body;
    
    var search = dataQuery(sentData.data);
	// filter for the years
	startYear = sentData.options.year.start != '' ? sentData.options.year.start : -Infinity;
	endYear = sentData.options.year.end != '' ? sentData.options.year.end : Infinity;
	search.filter(function (rec) { return startYear <= rec.publishYear && rec.publishYear < endYear });
	
    var options = {
        containerName: ".graph-content",
        //margin: {
        //    top: 40, 
        //    left: 30, 
        //    bottom: 30, 
        //    right: 30
        //}
    }
    
    // if the search recordset is empty
    if (search.length == 0) {
        response.send({ error: "There was no data found." });
    }
    /**
     *  Get the data for the landscape
     */
    // set the upper number limit of papers
    var limit = 20000;
    // the landscape and additional points
    var landscapeP = null,
        additionalP = [];
    if (sentData.options.wholeLandscape == "true") {
        console.time("Landscape");
        // get the coordinates and clusters of the whole landscape
        
        console.time("MegaSet");
        var allPapersN = base.store("Papers").allRecords.length;
        var sampleKeywords = base.store("Keywords").allRecords.sample(10000);
        var megaSet = sampleKeywords[0].inPapers.sample(Math.ceil(sampleKeywords[0].inPapers.length / allPapersN * limit));
        for (var PapN = 1; PapN < sampleKeywords.length; PapN++) {
            megaSet = megaSet.setUnion(sampleKeywords[PapN].inPapers.sample(Math.ceil(sampleKeywords[PapN].inPapers.length / allPapersN * limit)));
        }
        console.timeEnd("MegaSet");
        console.time("Update");
        ftr.clear(); ftr.updateRecords(megaSet);
        console.timeEnd("Update");
        
        // send the status to the client
        console.time("Points");
        var mat = ftr.extractSparseMatrix(megaSet);
        var MDS = new algorithms.MDS({ clusterN: 200, iter: 10 });
        MDS.constructClusters(mat);
        landscapeP = jsonify.landscapePoints({ matrix: MDS.getArticlesCoord(mat), records: megaSet });
        console.timeEnd("Points");
        console.time("Additional");
        // get the additional points
        var searchPapers = search.sample(2000);
        var mat = ftr.extractSparseMatrix(searchPapers);
        additionalP = additionalP.concat(jsonify.landscapePoints({ matrix: MDS.getArticlesCoord(mat), records: searchPapers }));
        console.timeEnd("Additional");
        console.timeEnd("Landscape");
    } else {
        // working on!!!
        console.time("Landscape");
        var articles = [];
        
        console.time("MegaSet");
        // create the mega subset and visualize it
        var megaSet = search;
        console.timeEnd("MegaSet");
        if (megaSet.length > limit) {
            megaSet = search.sample(limit);
        }
        
        // update feature space
        console.time("Update Records");
        ftr.clear();
        ftr.updateRecords(megaSet);
        console.timeEnd("Update Records");
        
        console.time("Extract Features");
        var mat = ftr.extractSparseMatrix(megaSet);
        console.timeEnd("Extract Features");
        
        console.time("Construct Clusters");
        var coordinates = new algorithms.MDS({ clusterN: 200, iter: 10 });
        coordinates.constructClusters(mat);
        console.timeEnd("Construct Clusters");
        
        console.time("Get Articles");
        var CMat = coordinates.getArticlesCoord(mat);
        console.timeEnd("Get Articles");
        
        console.time("MDS Jsonify");
        landscapeP = jsonify.landscapePoints({ matrix: CMat, records: megaSet });
        console.timeEnd("MDS Jsonify");
        console.timeEnd("Landscape");
    }
    
        // get the clusters for the keywords, journals and conference position
        var keywordsC = new qm.la.Matrix({ rows: 2, cols: 600, random: true });
        var keywordsJson = jsonify.landscapeClusters(keywordsC);
        
        var journalsC = new qm.la.Matrix({ rows: 2, cols: 600, random: true });
        var journalsJson = jsonify.landscapeClusters(journalsC);
        
        var conferencesC = new qm.la.Matrix({ rows: 2, cols: 600, random: true });
        var conferencesJson = jsonify.landscapeClusters(conferencesC);
    //}
    // store the data and send it
    data = {
        points: {
            main: landscapeP,
            highlight: additionalP
        },
        clusters: {
            keywords: keywordsJson, 
            journals: journalsJson, 
            conferences: conferencesJson
        },
        options: options
    };
    
    // send the status to the client
    response.send(data);
});

// send the data to the cient
app.post('/autocomplete', function (request, response) {
    var req = request.body;
    // for getting the the autocomplete list
    var auto = autoQuery(req);
    response.send(auto);
})

app.post('/pdf', function (request, response) {
    // get the .xml file and save it
    var dataJSON = request.body;
    fs.writeFile(path.join(__dirname, 'pics/chart.xml'), dataJSON.xml, {}, function (err) { if (err) { console.log(err); } });
    
    // use inkscape to save the .xml file as a .pdf
    var Inkscape = require('inkscape'),
        svgToPdfConverter = new Inkscape(['--export-pdf', '--export-width=1024']);
    
    var sourceStream = fs.createReadStream(path.join(__dirname, 'pics/chart.xml'));
    var destinationStream = fs.createWriteStream(path.join(__dirname, 'pics/chart.pdf'));
    sourceStream.pipe(svgToPdfConverter).pipe(destinationStream);
    // send the .pdf file
    //response.sendFile('pics/chart.pdf', { root: __dirname });
    // delete the .xml and .pdf file
    console.log("delete")
    //fs.unlink(path.join(__dirname, 'pics/chart.xml'));
    //fs.unlink('./pics/chart.pdf');

})

// if node is interrupted by CTRL+C
process.on('SIGINT', function () {
    // close the base
    base.close();
    // exit the process
    process.exit();
});

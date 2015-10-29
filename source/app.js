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
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

var htmlPath = __dirname + '/public/html/'
app.get('/', function (request, response) {
    response.sendFile(path.join(htmlPath, 'search.html'));
});

app.listen('3000', function () {
    console.log("Listening at the port http://localhost:3000/");
});

/**
 * QMiner database.
 * 
 */

var qm = require('qminer');
var dataformat = require('./dataformat/dataformat.js');
var landscape = require('./dataformat/landscape.js');

var basePath = './database/'
var base = new qm.Base({
    mode: 'openReadOnly',
    dbPath: basePath + "YahooFinanceTest/db/" //"QMinerAcademicsScience/"
});

var ftr = new qm.FeatureSpace(base, 
    { type: "text", source: "Yahoo", field: "article", weight: "tfidf", normalize: true, tokenizer: { type: "simple", stopwords: "en" }
});


// query the data from the database
var dataQuery = function (data) {
    //var result = [];
    //var store;
    //for (var DataN = 0; DataN < data.length; DataN++) {
    //    // get the correct store name
    //    if (data[DataN].type == "keyword") { store = "FieldsOfStudy" }
    //    else if (data[DataN].type == "author") { store = "Authors" }
    //    else if (data[DataN].type == "journal") { store = "Journals" }
    //    // query the data
    //    var query = { $from: store, normalizedName: data[DataN].value };
    //    var res = base.search(query);
    //    result.push({ value: data[DataN].label, type: data[DataN].type, subset: res });
    //}
    //return result;
    //ftr.clear();
    var sample = base.store("Yahoo").newRecordSet(qm.la.rangeVec(0, 99));
    ftr.updateRecords(sample);
    //var fout = new qm.fs.openWrite("./matrix.bin");
    //ftr.extractSparseMatrix(base.store("Test").newRecordSet(qm.la.rangeVec(0, 99))).save(fout).close();
    return sample;

}

// query the data for autocomplete
var autoQuery = function (data) {
    
    //var result = [];
    //var stores;
    //if (data.autotype == "keywords") {
    //    stores = [{ store: "FieldsOfStudy", type: "keyword" }];
    //} else {
    //    stores = [
    //        { store: "FieldsOfStudy", type: "keyword" },
    //        { store: "Authors", type: "author" },
    //        { store: "Journals", type: "journal" }
    //    ];
    //}
    //for (var StoreN = 0; StoreN < stores.length; StoreN++) {
    //    var query = { $from: stores[StoreN].store, normalizedName: { $wc: "*" + data.value.toLowerCase() + "*" } };
    //    var res = base.search(query);
        
    //    var arr = res.map(function (record) {
    //        var type = stores[StoreN].type;
    //        var value = record.normalizedName;
    //        var label = record.name;
    //        return { type: type, value: value, label: label };
    //    });
    //    result = result.concat(arr.slice(0, 5));
    //}
    //return result;
}


// send the data to the cient
app.post('/', function (request, response) {
    
    var req = request.body;
    if (req.type == "autocomplete") {
        // for getting the the autocomplete list
        var auto = autoQuery(req);
        response.send(auto);
    } else {
        // for showing the graphs
        var search = dataQuery(req.data);
        // given options
        var options = {
            containerName: ".graph-content",
            margin: {
                top: 40, 
                left: 30, 
                bottom: 30, 
                right: 30
            }
        };
        
        var values;
        if (req.graph_type == "Timestream chart") {
            values = dataformat.jsonify(search, req.addOptions);
            
        } else if (req.graph_type == "Topic landscape") {
            values = landscape.jsonify(ftr.extractSparseMatrix(search));
        }

        var data = {
            values: values,
            options: options
        };
        response.send(data);
    }
})

process.on('SIGINT', function () {
    // close the base
    base.close();
    // exit the process
    process.exit();
});

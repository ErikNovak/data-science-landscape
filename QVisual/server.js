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
    response.sendFile(path.join(htmlPath, 'index.html'));
});

app.listen('3000', function () {
    console.log("Listening at the port http://localhost:3000/");
});

/**
 * QMiner database.
 * 
 */

var qm = require('qminer');
var timeseries = require('./datajsonification/timeseries.js');

var basePath = './database/'
var base = new qm.Base({
    mode: 'openReadOnly',
    dbPath: basePath + "QMinerAcademics/"
});

// query the data from the data
var queryData = function (storeName, searchData) {
    var data = {};
    for (var DataN = 0; DataN < searchData.length; DataN++) {
        var query = { $from: storeName, name: searchData[DataN] };
        var res = base.search(query);
        data[searchData[DataN]] = res;
    }
    return data;
}


app.post('/', function (request, response) {
    var req = request.body;
    var search = queryData(req.store, req.data);
    // given options
    var options = {
        margin: {
            top: 40, 
            left: 30, 
            bottom: 30, 
            right: 30
        }
    };
    var data = {
        values: timeseries.keywords(search), 
        options: options
    };
    response.send(data);
})











process.on('SIGINT', function () {
    // close the base
    base.close();
    // exit the process
    process.exit();
});

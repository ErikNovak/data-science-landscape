/**
 * Server for the QVisual project.  
 * 
 */

var http = require('http'),
    express = require('express'),
    fs = require('fs'),
    path = require('path');

var app = express();
app.use(express.static(__dirname + '/public'));

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

var basePath = './database/'
var base = new qm.Base({
    mode: 'openReadOnly',
    dbPath: basePath + "QMinerAcademics/"
});












process.on('SIGINT', function () {
    // close the base
    base.close();
    // exit the process
    process.exit();
});

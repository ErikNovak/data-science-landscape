/**
* Creates the QMiner base containing MicrosoftAcademics data.
*/

var qm = require('qminer');
var fs = qm.fs;

var basePath = '../database/';
// choose which Subset to load (Science or Regular) 
var DataScienceSubset = true;
var subset = DataScienceSubset ? "MicrosoftAcademicScienceSubset/" : "MicrosoftAcademicSubset/";

// read the files
var AffiliationsIn = new fs.FIn(basePath + subset + 'Affiliations.txt');
var AuthorsIn = new fs.FIn(basePath + subset + 'Authors.txt');
var ConferenceSeriesIn = new fs.FIn(basePath + subset + 'ConferenceSeries.txt');
var ConferenceInstancesIn = new fs.FIn(basePath + subset + 'ConferenceInstances.txt');
var FieldsOfStudyIn = new fs.FIn(basePath + subset + 'FieldsOfStudy.txt');
var JournalsIn = new fs.FIn(basePath + subset + 'Journals.txt');
var PapersIn = new fs.FIn(basePath + subset + 'Papers.txt');
var PaperAuthorAffiliationsIn = new fs.FIn(basePath + subset + 'PaperAuthorAffiliations.txt');
var PaperKeywordsIn = new fs.FIn(basePath + subset + 'PaperKeywords.txt');
//var PaperReferencesIn = new fs.FIn(basePath + subset + 'PaperReferences.txt')
//var PaperUrls = new fs.FIn(basePath + subset + 'PaperUrls.txt');

// creates the base with the given schema.json
var QMinerDatabase = basePath + (DataScienceSubset ? "QMinerAcademicsDataScience/" : "QMinerAcademicsData/");
var base = new qm.Base({
    mode: "createClean",
    schemaPath: "./schema.json",
    dbPath: QMinerDatabase
});

// helper function
var textUpperCase = function (name) {
    return name.replace(/\w\S*/g, function (text) {
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
}

// import Author in QMiner
console.log("Authors");
while (!AuthorsIn.eof) {
    var data = AuthorsIn.readLine().split('\t');
    var id = data[0];
    var name = data[1];
    base.store("Authors").push({
        ID: id, 
        name: textUpperCase(name), 
        normalizedName: name
    });
}

// import ConferenceSeries in QMiner
console.log("ConferenceSeries");
while (!ConferenceSeriesIn.eof) {
    var data = ConferenceSeriesIn.readLine().split('\t');
    var id = data[0];
    var abbreviation = data[1];
    var name = data[2];
    base.store("ConferenceSeries").push({
        ID: id, 
        abbreviation: abbreviation,
        name: textUpperCase(name), 
        normalizedName: name
    });
}

// import Affiliations in QMiner
console.log("Affiliations");
while (!AffiliationsIn.eof) {
    var data = AffiliationsIn.readLine().split("\t");
    var id = data[0];
    var name = data[1];
    base.store("Affiliations").push({
        ID: id, 
        name: textUpperCase(name), 
        normalizedName: name
    });
}

// import Journals in QMiner
console.log("Journals");
while (!JournalsIn.eof) {
    var data = JournalsIn.readLine().split("\t");
    var id = data[0];
    var name = data[1];
    base.store("Journals").push({
        ID: id, 
        name: name, 
        normalizedName: name.toLowerCase()
    });
}

// import FieldsOfStudy in QMiner
console.log("FieldsOfStudy");
while (!FieldsOfStudyIn.eof) {
    var data = FieldsOfStudyIn.readLine().split("\t");
    var id = data[0];
    var name = data[1];
    base.store("Keywords").push({
        ID: id, 
        name: name, 
        normalizedName: name.toLowerCase()
    });
}

// import Papers in QMiner
console.log("Papers");
var conferenceCount = 0;
while (!PapersIn.eof) {
    var data = PapersIn.readLine().split("\t");
    var id = data[0];
    var originalName = data[1];
    var normalizedName = data[2];
    var publishYear = parseInt(data[3]);
    var publishDate = data[4];
    var DOI = data[5];
    var originalVenue = data[6];
    var normalizedVenue = data[7];
    var journalID = data[8];
    var conferenceSeriesID = data[9]
    var paperRank = parseInt(data[10]);
    base.store("Papers").push({
        ID: id,
        title: originalName,
        normalizedTitle: normalizedName,
        publishYear: publishYear,
        publishDate: publishDate,
        DOI: DOI,
        venueName: originalVenue,
        normalizedVenueName: normalizedVenue,
        paperRank: paperRank
    });
    if (base.store("Journals").recordByName(journalID) != null) {
        base.store("Papers").recordByName(id).$addJoin("wasPublishedIn", 
            base.store("Journals").recordByName(journalID));
    }
    if (base.store("ConferenceSeries").recordByName(conferenceSeriesID) != null) {
        conferenceCount++;
        base.store("Papers").recordByName(id).$addJoin("wasPresentedAt", 
            base.store("ConferenceSeries").recordByName(conferenceSeriesID));
    }
}
console.log("ConferenceCount: " + conferenceCount);

// import Keywords in QMiner
console.log("Keywords");
while (!PaperKeywordsIn.eof) {
    var data = PaperKeywordsIn.readLine().split("\t");
    var paperID = data[0];
    var keyword = data[1];
    var fieldOfStudyID = data[2];
    if (base.store("Keywords").recordByName(fieldOfStudyID) != null) {
        base.store("Keywords").recordByName(fieldOfStudyID).$addJoin("inPapers", 
            base.store("Papers").recordByName(paperID));
    }
}

// import PaperAuthorAffiliations in QMiner
console.log("PaperAuthorAffiliations");
while (!PaperAuthorAffiliationsIn.eof) {
    var data = PaperAuthorAffiliationsIn.readLine().split("\t");
    var paperID = data[0];
    var authorID = data[1];
    var affiliationID = data[2];
    if (base.store("Authors").recordByName(authorID) != null) {
        base.store("Papers").recordByName(paperID).$addJoin("hasAuthors", 
            base.store("Authors").recordByName(authorID));
    }
    if (base.store("Affiliations").recordByName(affiliationID) != null) {
        base.store("Papers").recordByName(paperID).$addJoin("hasAffiliations", 
            base.store("Affiliations").recordByName(affiliationID));
    }
}

// import ConferenceInstances in QMiner
console.log("ConferenceInstances");
while (!ConferenceInstancesIn.eof) {
    var data = ConferenceInstancesIn.readLine().split('\t');
    var seriesID = data[0];
    var instanceID = data[1];
    var abbreviation = data[2];
    var name = data[3];
    var location = data[4];
    var url = data[5];
    var startDate = data[6];
    var endDate = data[7];
    var abstractRegistrationDate = data[8];
    var submissionDeadlineDate = data[9];
    var notificationDueDate = data[10];
    var finalVersionDueDate = data[11];
    base.store("ConferenceInstances").push({
        ID: instanceID, 
        abbreviation: abbreviation, 
        normalizedName: name.toLowerCase(),
        name: name, 
        location: location,
        url: url,
        startDate: startDate,
        endDate: endDate,
        abstractRegistrationDate: abstractRegistrationDate,
        submissionDeadlineDate: submissionDeadlineDate,
        notificationDueDate: notificationDueDate,
        finalVersionDueDate: finalVersionDueDate
    });
    if (base.store("ConferenceSeries").recordByName(seriesID) != null) {
        base.store("ConferenceInstances").recordByName(instanceID).$addJoin("isPartOfSeries", 
            base.store("ConferenceSeries").recordByName(seriesID));
    }
}

// close the base
base.close();
/**
* Creates the QMiner base containing MicrosoftAcademics data.
*/

var qm = require('qminer');
var fs = qm.fs;

var basePath = '../database/';
// choose which Subset to load (Science or Regular) 
var ScienceSubset = true;
var subset = ScienceSubset ? "MicrosoftAcademicScienceSubset/" : "MicrosoftAcademicSubset/";

// read the files
var PaperIn = new fs.FIn(basePath + subset + 'Papers.txt');
var AuthorIn = new fs.FIn(basePath + subset + 'Authors.txt');
var AffiliationsIn = new fs.FIn(basePath + subset + 'Affiliations.txt');
var PapersAuthorAffiliationsIn = new fs.FIn(basePath + subset + 'PaperAuthorAffiliations.txt');
var PaperReferencesIn = new fs.FIn(basePath + subset + 'PaperReferences.txt')
var JournalsIn = new fs.FIn(basePath + subset + 'Journals.txt');
var KeywordsIn = new fs.FIn(basePath + subset + 'PaperKeywords.txt');
var FieldsOfStudyIn = new fs.FIn(basePath + subset + 'FieldsOfStudy.txt');

// creates the base with the given schema.json
var QMinerDatabase = ScienceSubset ? "QMinerAcademicsScience/" : "QMinerAcademics/";
var base = new qm.Base({
    mode: "createClean",
    schemaPath: "./schema.json",
    dbPath: basePath + QMinerDatabase
});

// helper function
var textUpperCase = function (name) {
    return name.replace(/\w\S*/g, function (text) {
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
}

// import the Author data in the base
while (!AuthorIn.eof) {
    var authorData = AuthorIn.readLine().split("\t");
    var id = authorData[0];
    var name = authorData[1];
    base.store("Authors").push({ ID: id, name: textUpperCase(name), normalizedName: name });
}

// import the Affiliations data in the base
while (!AffiliationsIn.eof) {
    var affiliationsData = AffiliationsIn.readLine().split("\t");
    var id = affiliationsData[0];
    var name = affiliationsData[1];
    base.store("Affiliations").push({ ID: id, name: textUpperCase(name), normalizedName: name });
}

// import the Journals data in the base
while (!JournalsIn.eof) {
    var journalsData = JournalsIn.readLine().split("\t");
    var id = journalsData[0];
    var name = journalsData[1];
    base.store("Journals").push({ ID: id, name: name, normalizedName: name.toLowerCase() });
}

// import the FieldsOfStudy data in the base
while (!FieldsOfStudyIn.eof) {
    var fieldsOfStudyData = FieldsOfStudyIn.readLine().split("\t");
    var id = fieldsOfStudyData[0];
    var name = fieldsOfStudyData[1];
    base.store("FieldsOfStudy").push({ ID: id, name: name, normalizedName: name.toLowerCase() });
}

// import the Papers data in the base
while (!PaperIn.eof) {
    var papersData = PaperIn.readLine().split("\t");
    var id = papersData[0];
    var originalName = papersData[1];
    var normalizedName = papersData[2];
    var publishYear = parseInt(papersData[3]);
    var publishDate = papersData[4];
    var DOI = papersData[5];
    var originalVenue = papersData[6];
    var normalizedVenue = papersData[7];
    var journalID = papersData[8];
    var paperRank = parseInt(papersData[9]);
    base.store("Papers").push({
        ID: id,
        originalPaperTitle: originalName,
        normalizedPaperTitle: normalizedName,
        paperPublishYear: publishYear,
        paperPublishDate: publishDate,
        DOI: DOI,
        originalVenueName: originalVenue,
        normalizedVenueName: normalizedVenue,
        paperRank: paperRank
    });
    if (base.store("Journals").recordByName(journalID) != null) {
        base.store("Papers").recordByName(id).$addJoin("wasPublishedIn", base.store("Journals").recordByName(journalID));
    }
}

// import the Keywords data in the base
while (!KeywordsIn.eof) {
    var keywordsData = KeywordsIn.readLine().split("\t");
    var paperID = keywordsData[0];
    var keyword = keywordsData[1];
    var fieldOfStudyID = keywordsData[2];
    
    if (base.store("FieldsOfStudy").recordByName(fieldOfStudyID) != null) {
        base.store("FieldsOfStudy").recordByName(fieldOfStudyID).$addJoin("inPapers", base.store("Papers").recordByName(paperID));
    }
}

// import the PaperAuthorAffiliations data in the base
while (!PapersAuthorAffiliationsIn.eof) {
    var PAPData = PapersAuthorAffiliationsIn.readLine().split("\t");
    var paperID = PAPData[0];
    var authorID = PAPData[1];
    var affiliationID = PAPData[2];
    if (base.store("Authors").recordByName(authorID) != null) {
        base.store("Papers").recordByName(paperID).$addJoin("hasAuthors", base.store("Authors").recordByName(authorID));
    }
    if (base.store("Affiliations").recordByName(affiliationID) != null) {
        base.store("Papers").recordByName(paperID).$addJoin("hasAffiliations", base.store("Affiliations").recordByName(affiliationID));
    }
}

//// import the PaperReferences data in the base
//while (!PaperReferencesIn.eof) {
//    var PRData = PaperReferencesIn.readLine().split("\t");
//    var paperID = PRData[0];
//    var referencesID = PRData[1];
//    base.store("PaperReferences").push({ ID: referencesID });
//    if (base.store("Papers").recordByName(paperID) != null) {
//        base.store("PaperReferences").recordByName(referencesID).$addJoin("referencedIn", base.store("Papers").recordByName(paperID));
//    }
//}

// close the base
base.close();
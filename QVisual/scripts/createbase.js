/**
* Creates the QMiner base containing MicrosoftAcademics data.
*/

var qm = require('qminer');
var fs = qm.fs;

var basePath = '../database/';

// read the files
var PaperIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/Papers.txt');
var AuthorIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/Authors.txt');
var AffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/Affiliations.txt');
var PapersAuthorAffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/PaperAuthorAffiliations.txt');
var PaperReferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/PaperReferences.txt')
var JournalsIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/Journals.txt');
var KeywordsIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/PaperKeywords.txt');
var FieldsOfStudyIn = new fs.FIn(basePath + 'MicrosoftAcademicSubset/FieldsOfStudy.txt');

// creates the base with the given schema.json
var base = new qm.Base({
    mode: "createClean",
    schemaPath: "./schema.json",
    dbPath: basePath + "QMinerAcademics/"
});

// import the Author data in the base
while (!AuthorIn.eof) {
    var authorData = AuthorIn.readLine().split("\t");
    var id = authorData[0];
    var name = authorData[1];
    base.store("Authors").push({ ID: id, name: name });
}

// import the Affiliations data in the base
while (!AffiliationsIn.eof) {
    var affiliationsData = AffiliationsIn.readLine().split("\t");
    var id = affiliationsData[0];
    var name = affiliationsData[1];
    base.store("Affiliations").push({ ID: id, name: name });
}

// import the Journals data in the base
while (!JournalsIn.eof) {
    var journalsData = JournalsIn.readLine().split("\t");
    var id = journalsData[0];
    var name = journalsData[1];
    base.store("Journals").push({ ID: id, name: name });
}

// import the FieldsOfStudy data in the base
while (!FieldsOfStudyIn.eof) {
    var fieldsOfStudyData = FieldsOfStudyIn.readLine().split("\t");
    var id = fieldsOfStudyData[0];
    var name = fieldsOfStudyData[1];
    base.store("FieldsOfStudy").push({ ID: id, name: name });
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

    base.store("PaperKeywords").push({ keyword: keyword });
    if (base.store("Papers").recordByName(paperID) != null) {
        base.store("PaperKeywords").recordByName(keyword).$addJoin("inPapers", base.store("Papers").recordByName(paperID));
    }
    if (base.store("FieldsOfStudy").recordByName(fieldOfStudyID) != null) {
        base.store("PaperKeywords").recordByName(keyword).$addJoin("inFieldOfStudy", base.store("FieldsOfStudy").recordByName(fieldOfStudyID));
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

// import the PaperReferences data in the base
while (!PaperReferencesIn.eof) {
    var PRData = PaperReferencesIn.readLine().split("\t");
    var paperID = PRData[0];
    var referencesID = PRData[1];
    base.store("PaperReferences").push({ ID: referencesID });
    if (base.store("Papers").recordByName(paperID) != null) {
        base.store("PaperReferences").recordByName(referencesID).$addJoin("referencedIn", base.store("Papers").recordByName(paperID));
    }
}

// close the base
base.close();
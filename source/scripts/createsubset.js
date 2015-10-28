/**
*  Creates a subset of the first 10k papers from the MicrosoftAcademic with it's 
* corresponding data from the other files (author, affiliations, etc.).
*
* First it goes through the first 10k papers from the Papers.txt file and saves
* it's paper ID and journals ID. Then it goes through Journals.txt, PaperKeywords.txt, 
* FieldsOfStudy.txt, PaperAuthorAffiliations.txt, Authors.txt and Affiliations.txt.
* The subset is saved in MicrosoftAcademicSubset file.
* 
* The data from Conferences.txt, PaperReferences.txt and PaperUrls.txt are not
* included in the subset at the moment.
*/

var qm = require('../../qminer');
var ht = qm.ht;
var fs = qm.fs;


var basePath = '../database/';
// input files (original)
var PaperIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Papers.txt');
var AuthorIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Authors.txt');
var AffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Affiliations.txt');
var PapersAuthorAffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperAuthorAffiliations.txt');
var JournalsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Journals.txt');
var KeywordsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperKeywords.txt');
var FieldsOfStudyIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/FieldsOfStudy.txt');

var ReferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperReferences.txt');
var PaperURLIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperUrls.txt');
//var ConferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Conferences.txt');

// output files (subset)
var PaperOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/Papers.txt');
var AuthorOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/Authors.txt');
var AffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/Affiliations.txt');
var PapersAuthorAffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/PaperAuthorAffiliations.txt');
var JournalsOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/Journals.txt');
var KeywordsOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/PaperKeywords.txt');
var FieldsOfStudyOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/FieldsOfStudy.txt');

var ReferencesOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/PaperReferences.txt');
var PaperURLOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/PaperUrls.txt');
//var ConferencesOut = new fs.FOut(basePath + 'MicrosoftAcademicSubset/Conferences.txt');

// set the number of lines to copy
var Num = 10000;
var allData = false;
var verbose = true;

// copy the first Num papers in a new file
if (verbose) {
    console.log("Writing Paper lines");
}
var PaperID = new ht.StrIntMap();
var JournalID = new ht.StrIntMap();
for (var LineN = 0; LineN < Num; LineN++) {
    // write the line from the PaperIn
    var PaperLine = PaperIn.readLine();
    var PaperLineSplit = PaperLine.split("\t");
    PaperOut.write(PaperLine + '\n');

    // append the Paper Id to the vector
    PaperID.put(PaperLineSplit[0], 0);
    JournalID.put(PaperLineSplit[8], 0);
}
PaperOut.close();

// copy the Journals 
if (verbose) {
    console.log("Writing Journals");
}
var counterJournals = 0;
while (!JournalsIn.eof) {
    // read and split the line
    var JournalsLine = JournalsIn.readLine();
    var JournalsLineSplit = JournalsLine.split("\t");
    // check if the id is in the line

    if (JournalID.hasKey(JournalsLineSplit[0])) {
        // write the Journals and update the counter
        JournalsOut.write(JournalsLine + '\n');
        counterJournals++;
        process.stdout.write("Number of journals: " + counterJournals + "\r");
    }
}
JournalsOut.close();

// copy the Keywords
if (verbose) {
    console.log("Writing Keywords");
}
var FieldsOfStudyID = new ht.StrIntMap();
var counterKeywords = 0;
while (!KeywordsIn.eof) {
    // read and split the line
    var KeywordsLine = KeywordsIn.readLine();
    var KeywordsLineSplit = KeywordsLine.split("\t");
    // check if the id is in the line
    if (PaperID.hasKey(KeywordsLineSplit[0])) {
        // write the Keywords and update the counter
        KeywordsOut.write(KeywordsLine + '\n');
        FieldsOfStudyID.put(KeywordsLineSplit[2], 0);
        counterKeywords++;
        process.stdout.write("Number of Keywords: " + counterKeywords + "\r");
    }
}
KeywordsOut.close();

// copy the Fields of Study
if (verbose) {
    console.log("Writing FieldsOfStudy");
}
var counterFieldsOfStudy = 0;
while (!FieldsOfStudyIn.eof) {
    // read and split the line
    var FieldsLine = FieldsOfStudyIn.readLine();
    var FieldsLineSplit = FieldsLine.split("\t");
    // check if the id is in the line
    if (FieldsOfStudyID.hasKey(FieldsLineSplit[0])) {
        // write the Fields and update the counter
        FieldsOfStudyOut.write(FieldsLine + '\n');
        counterFieldsOfStudy++;
        process.stdout.write("Number of Fields of Study: " + counterFieldsOfStudy + "\r");
    }
}
FieldsOfStudyOut.close();

// copy the PapersAuthorAffiliations with matching Paper ID
if (verbose) {
    console.log("Writing PaperAuthorAffiliations lines");
}
var AuthorID = new ht.StrIntMap();
var AffiliatonsID = new ht.StrIntMap();
// count how many files were already written
var counterAPA = 0;
while (!PapersAuthorAffiliationsIn.eof) {
    // read and split the line
    var APALine = PapersAuthorAffiliationsIn.readLine();
    var APALineSplit = APALine.split("\t");
    // check if the id is in the line
    if (PaperID.hasKey(APALineSplit[0])) {
        // write the paper affiliations and save the Author and Affiliations ID
        PapersAuthorAffiliationsOut.write(APALine + '\n');
        AuthorID.put(APALineSplit[1], 0);
        AffiliatonsID.put(APALineSplit[2], 0);
        counterAPA++;
        process.stdout.write("Number of PaperAuthorAffiliations: " + counterAPA + "\r");
    }

}
PapersAuthorAffiliationsOut.close();

// copy the Authors with matching AuthorID
if (verbose) {
    console.log("Writing Author lines");
}
var counterAuthor = 0;
while (!AuthorIn.eof) {
    // read and split the line
    var AuthorLine = AuthorIn.readLine();
    var AuthorLineSplit = AuthorLine.split("\t");
    // check if the id is in the line
    if (AuthorID.hasKey(AuthorLineSplit[0])) {
        // write the author
        AuthorOut.write(AuthorLine + '\n');
        counterAuthor++;
        process.stdout.write("Number of Authors: " + counterAuthor + "\r");
    }

}
AuthorOut.close();

// copy the Affiliations with matching AffiliationsID
if (verbose) {
    console.log("Writing Affiliations lines");
}
var counterAff = 0;
while (!AffiliationsIn.eof) {
    // read and split the line
    var AffLine = AffiliationsIn.readLine();
    var AffLineSplit = AffLine.split("\t");
    // check if the id is in the line
    if (AffiliatonsID.hasKey(AffLineSplit[0])) {
        // write the author
        AffiliationsOut.write(AffLine + '\n');
        counterAff++;
        process.stdout.write("Number of Affiliations: " + counterAff + "\r");
    }

}
AffiliationsOut.close();

if (allData) {

    // copy the PaperReferences with matching PaperID
    if (verbose) {
        console.log("Writing Paper References lines");
    }
    var counterRef = 0;
    while (!ReferencesIn.eof) {
        // read and split the line
        var RefLine = ReferencesIn.readLine();
        var RefLineSplit = RefLine.split("\t");
        // check if the id is in the line
        if (PaperID.hasKey(RefLineSplit[0])) {
            // write the author
            ReferencesOut.write(RefLine + '\n');
            counterRef++;
            process.stdout.write("Number of PaperReferences: " + counterRef + "\r");
        }
    }
    ReferencesOut.close();

    // copy the PaperUrl with matching PaperID
    if (verbose) {
        console.log("Writing Paper URL lines");
    }
    var counterURL = 0;
    while (!PaperURLIn.eof) {
        // read and split the line
        var URLLine = PaperURLIn.readLine();
        var URLLineSplit = URLLine.split("\t");
        // check if the id is in the line
        if (PaperID.hasKey(URLLineSplit[0])) {
            // write the author
            PaperURLOut.write(URLLine + '\n');
            counterURL++;
            process.stdout.write("Number of PaperURL: " + counterURL + "\r");
        }
    }
    PaperURLOut.close();
}
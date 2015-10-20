/**
*  Creates a subset of the all the data science papers from the MicrosoftAcademic with it's 
* corresponding data from the other files (author, affiliations, etc.).
*/

var qm = require('qminer');
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

//var ReferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperReferences.txt');
//var PaperURLIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperUrls.txt');
//var ConferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Conferences.txt');

// output files (subset)
var PaperOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Papers.txt');
var AuthorOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Authors.txt');
var AffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Affiliations.txt');
var PapersAuthorAffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperAuthorAffiliations.txt');
var JournalsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Journals.txt');
var KeywordsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperKeywords.txt');
var FieldsOfStudyOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/FieldsOfStudy.txt');

//var ReferencesOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperReferences.txt');
//var PaperURLOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperUrls.txt');
//var ConferencesOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Conferences.txt');

// add the data science themes
var DataScience = new ht.StrIntMap();
DataScience.put("Mathematics", 0);
DataScience.put("Statistics", 0);
DataScience.put("Chemometrics", 0);
DataScience.put("Information science", 0);
DataScience.put("Computer science", 0);
DataScience.put("Signal processing", 0);
DataScience.put("Probability models", 0);
DataScience.put("Machine learning", 0);
DataScience.put("Statistical learning", 0);
DataScience.put("Data mining", 0);
DataScience.put("Database", 0);
DataScience.put("Data engineering", 0);
DataScience.put("Pattern recognition and learning", 0);
DataScience.put("Visualization", 0);
DataScience.put("Predictive analytics", 0);
DataScience.put("Uncertainty modeling", 0);
DataScience.put("Data warehousing", 0);
DataScience.put("Data compression", 0);
DataScience.put("Computer programming", 0);
DataScience.put("Artificial intelligence", 0);
DataScience.put("High performance computing", 0);

// copy the FieldsOfStudy 
var FieldID = new ht.StrIntMap();
var FieldCounter = 0;
while (!FieldsOfStudyIn.eof) {
    var FieldLine = FieldsOfStudyIn.readLine();
    var FieldSplit = FieldLine.split("\t");
    if (DataScience.hasKey(FieldSplit[1])) {
        FieldsOfStudyOut.write(FieldLine + '\n');
        FieldID.put(FieldSplit[0], 0);
        process.stdout.write("Number of Fields: " + ++FieldCounter + "\r");
    }
}
FieldsOfStudyOut.close();

// copy the Keywords 
var PaperID = new ht.StrIntMap();
var KeywordCounter = 0;
while (!KeywordsIn.eof) {
    var KeywordLine = KeywordsIn.readLine();
    var KeywordSplit = KeywordLine.split("\t");
    if (FieldID.hasKey(KeywordSplit[2])) {
        KeywordsOut.write(KeywordLine + '\n');
        PaperID.put(KeywordSplit[0], 0);
        process.stdout.write("Number of Keywords: " + ++KeywordCounter + "\r");
    }
}
KeywordsOut.close();

// copy the Papers
var JournalID = new ht.StrIntMap();
var PaperCounter = 0;
while (!PaperIn.eof) {
    var PaperLine = PaperIn.readLine();
    var PaperSplit = PaperLine.split("\t");
    if (PaperID.hasKey(PaperSplit[0])) {
        PaperOut.write(PaperLine + '\n');
        JournalID.put(PaperSplit[8], 0);
        process.stdout.write("Number of Papers: " + ++PaperCounter + "\r");
    }
}
PaperOut.close();

// copy the Journals 
var JournalsCounter = 0;
while (!JournalsIn.eof) {
    var JournalsLine = JournalsIn.readLine();
    var JournalsSplit = JournalsLine.split("\t");
    if (JournalID.hasKey(JournalsSplit[0])) {
        JournalsOut.write(JournalsLine + '\n');
        process.stdout.write("Number of journals: " + ++JournalsCounter + "\r");
    }
}
JournalsOut.close();

// copy the PapersAuthorAffiliations
var AuthorID = new ht.StrIntMap();
var AffiliatonsID = new ht.StrIntMap();
var APACounter = 0;
while (!PapersAuthorAffiliationsIn.eof) {
    var APALine = PapersAuthorAffiliationsIn.readLine();
    var APASplit = APALine.split("\t");
    if (PaperID.hasKey(APASplit[0])) {
        PapersAuthorAffiliationsOut.write(APALine + '\n');
        AuthorID.put(APASplit[1], 0);
        AffiliatonsID.put(APASplit[2], 0);
        process.stdout.write("Number of PaperAuthorAffiliations: " + ++APACounter + "\r");
    }
}
PapersAuthorAffiliationsOut.close();

// copy the Authors
var AuthorCounter = 0;
while (!AuthorIn.eof) {
    var AuthorLine = AuthorIn.readLine();
    var AuthorSplit = AuthorLine.split("\t");
    if (AuthorID.hasKey(AuthorSplit[0])) {
        AuthorOut.write(AuthorLine + '\n');
        process.stdout.write("Number of Authors: " + ++AuthorCounter + "\r");
    }
}
AuthorOut.close();

// copy the Affiliations
var AffCounter = 0;
while (!AffiliationsIn.eof) {
    var AffLine = AffiliationsIn.readLine();
    var AffSplit = AffLine.split("\t");
    if (AffiliatonsID.hasKey(AffSplit[0])) {
        AffiliationsOut.write(AffLine + '\n');
        process.stdout.write("Number of Affiliations: " + ++AffCounter + "\r");
    }
}
AffiliationsOut.close();

//// copy the PaperReferences
//var RefCounter = 0;
//while (!ReferencesIn.eof) {
//    var RefLine = ReferencesIn.readLine();
//    var RefSplit = RefLine.split("\t");
//    if (PaperID.hasKey(RefSplit[0])) {
//        ReferencesOut.write(RefLine + '\n');
//        process.stdout.write("Number of PaperReferences: " + ++RefCounter + "\r");
//    }
//}
//ReferencesOut.close();

//// copy the PaperUrl
//var CounterURL = 0;
//while (!PaperURLIn.eof) {
//    // read and split the line
//    var URLLine = PaperURLIn.readLine();
//    var URLSplit = URLLine.split("\t");
//    // check if the id is in the line
//    if (PaperID.hasKey(URLSplit[0])) {
//        // write the author
//        PaperURLOut.write(URLLine + '\n');
//        process.stdout.write("Number of PaperURL: " + ++CounterURL + "\r");
//    }
//}
//PaperURLOut.close();

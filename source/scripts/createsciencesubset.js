/**
*  Creates a subset of the all the data science papers from the MicrosoftAcademic with it's 
* corresponding data from the other files (author, affiliations, etc.).
*/

var qm = require('qminer');
var ht = qm.ht;
var fs = qm.fs;


/**
 * Load and create the stream files for filtering the data science data.
 */ 

var basePath = '../database/';
// input files (original)
var AffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Affiliations.txt');
var AuthorsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Authors.txt');
var ConferenceSeriesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/ConferenceSeries.txt');
var ConferenceInstancesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/ConferenceInstances.txt');
var FieldsOfStudyIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/FieldsOfStudy.txt');
var JournalsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Journals.txt');
var PapersIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/Papers.txt');
var PaperAuthorAffiliationsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperAuthorAffiliations.txt');
var PaperKeywordsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperKeywords.txt');
var PaperReferencesIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperReferences.txt');
var PaperUrlsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperUrls.txt');

// output files (subset)
var AffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Affiliations.txt');
var AuthorsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Authors.txt');
var ConferenceSeriesOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/ConferenceSeries.txt');
var ConferenceInstancesOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/ConferenceInstances.txt');
var FieldsOfStudyOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/FieldsOfStudy.txt');
var JournalsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Journals.txt');
var PapersOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/Papers.txt');
var PaperAuthorAffiliationsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperAuthorAffiliations.txt');
var PaperKeywordsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperKeywords.txt');
var PaperReferencesOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperReferences.txt');
var PaperUrlsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperUrls.txt');

/**
 * Set the keywords in the hash table to use for the data science filtering.
 * 
 */ 

// add the data science themes (Wikipedia)
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

// Hand given by feeling
DataScience.put("Semantic Web", 0);
DataScience.put("Semantic Web Stack", 0);
DataScience.put("Semantic tehnology", 0);
DataScience.put("Semantic memory", 0);
DataScience.put("Semantic analytics", 0);
DataScience.put("Latent semantic indexing", 0);
DataScience.put("Semantic HTML", 0);
DataScience.put("Semantic data model", 0);
DataScience.put("Probabilistic latent semantic analysis", 0);
DataScience.put("Latent semantic analysis", 0);
DataScience.put("Multidimensional scaling", 0);

// Additional Keywords from www.datasciencecentral.com (Most popular keywords)
DataScience.put("Big data", 0);
DataScience.put("Analytics", 0);
DataScience.put("Pivotal", 0);
DataScience.put("Deep learning", 0);
DataScience.put("Business intelligence", 0);
DataScience.put("Predictive modeling", 0);
DataScience.put("Clustering", 0);
DataScience.put("Opeartions research", 0);
DataScience.put("Graph database", 0);
DataScience.put("Internet of things", 0);
DataScience.put("Data warehouse", 0);
DataScience.put("Data architecture", 0);

/**
 * Filtering and writing the data in the files.
 */ 

// copy the FieldsOfStudy 
var FieldID = new ht.StrIntMap();
var FieldCounter = 0;
while (!FieldsOfStudyIn.eof) {
    var line = FieldsOfStudyIn.readLine();
    var columns = line.split("\t");
    if (DataScience.hasKey(columns[1])) {
        FieldsOfStudyOut.write(line + '\n');
        FieldID.put(columns[0], 0);
        ++FieldCounter;
    }
}
console.log("Number of Fields: " + FieldCounter + "\r");
FieldsOfStudyOut.close();

// copy the Keywords 
var PaperID = new ht.StrIntMap();
var KeywordCounter = 0;
while (!PaperKeywordsIn.eof) {
    var line = PaperKeywordsIn.readLine();
    var columns = line.split("\t");
    if (FieldID.hasKey(columns[2])) {
        PaperKeywordsOut.write(line + '\n');
        PaperID.put(columns[0], 0);
        ++KeywordCounter;
    }
}
console.log("Number of Keywords: " + KeywordCounter + "\r");
PaperKeywordsOut.close();

// reverse keyword search
// get the keywords that are in the PaperID
var PaperKeywordsIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/PaperKeywords.txt');
var PaperKeywordsOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/PaperKeywords.txt');
var NewFieldID = new ht.StrIntMap();
var KeywordCounter = 0;
while (!PaperKeywordsIn.eof) {
    var line = PaperKeywordsIn.readLine();
    var columns = line.split("\t");
    if (PaperID.hasKey(columns[0])) {
        PaperKeywordsOut.write(line + '\n');
        NewFieldID.put(columns[2], 0);
        ++KeywordCounter;
    }
}
console.log("Number of Keywords: " + KeywordCounter + "\r");
PaperKeywordsOut.close();

// reverse fields search
// get the FieldsOfStudy that are in PaperID
var FieldsOfStudyIn = new fs.FIn(basePath + 'MicrosoftAcademicGraph/FieldsOfStudy.txt');
var FieldsOfStudyOut = new fs.FOut(basePath + 'MicrosoftAcademicScienceSubset/FieldsOfStudy.txt');
var FieldCounter = 0;
while (!FieldsOfStudyIn.eof) {
    var line = FieldsOfStudyIn.readLine();
    var columns = line.split("\t");
    if (NewFieldID.hasKey(columns[0])) {
        FieldsOfStudyOut.write(line + '\n');
        ++FieldCounter;
    }
}
console.log("Number of Fields: " + FieldCounter + "\r");
FieldsOfStudyOut.close();

// copy the Papers
var JournalID = new ht.StrIntMap();
var ConferenceSeriesID = new ht.StrIntMap();
var PaperCounter = 0;
while (!PapersIn.eof) {
    var line = PapersIn.readLine();
    var columns = line.split("\t");
    if (PaperID.hasKey(columns[0])) {
        PapersOut.write(line + '\n');
        JournalID.put(columns[8], 0);
        ConferenceSeriesID.put(columns[9], 0);
        ++PaperCounter;
    }
}
console.log("Number of Papers: " + PaperCounter + "\r");
PapersOut.close();

// copy the conference series
var SeriesCounter = 0;
while (!ConferenceSeriesIn.eof) {
    var line = ConferenceSeriesIn.readLine();
    var columns = line.split("\t");
    if (ConferenceSeriesID.hasKey(columns[0])) {
        ConferenceSeriesOut.write(line + '\n');
        ++SeriesCounter;
    }
}
console.log("Number of Conference Series: " + SeriesCounter + "\r");
ConferenceSeriesOut.close();

// copy the conference series
var instancesCounter = 0;
while (!ConferenceInstancesIn.eof) {
    var line = ConferenceInstancesIn.readLine();
    var columns = line.split("\t");
    if (ConferenceSeriesID.hasKey(columns[0])) {
        ConferenceInstancesOut.write(line + '\n');
        ++instancesCounter;
    }
}
console.log("Number of Conference Instances: " + instancesCounter + "\r");
ConferenceInstancesOut.close();

// copy the Journals 
var JournalsCounter = 0;
while (!JournalsIn.eof) {
    var line = JournalsIn.readLine();
    var columns = line.split("\t");
    if (JournalID.hasKey(columns[0])) {
        JournalsOut.write(line + '\n');
        ++JournalsCounter;
    }
}
console.log("Number of Journals: " + JournalsCounter + "\r");
JournalsOut.close();

// copy the PapersAuthorAffiliations
var AuthorID = new ht.StrIntMap();
var AffiliatonsID = new ht.StrIntMap();
var APACounter = 0;
while (!PaperAuthorAffiliationsIn.eof) {
    var line = PaperAuthorAffiliationsIn.readLine();
    var columns = line.split("\t");
    if (PaperID.hasKey(columns[0])) {
        PaperAuthorAffiliationsOut.write(line + '\n');
        AuthorID.put(columns[1], 0);
        AffiliatonsID.put(columns[2], 0);
        ++APACounter;
    }
}
console.log("Number of PaperAuthorAffiliations: " + APACounter + "\r");
PaperAuthorAffiliationsOut.close();

// copy the Authors
var AuthorCounter = 0;
while (!AuthorsIn.eof) {
    var line = AuthorsIn.readLine();
    var columns = line.split("\t");
    if (AuthorID.hasKey(columns[0])) {
        AuthorsOut.write(line + '\n');
        ++AuthorCounter;
    }
}
console.log("Number of Authors: " + AuthorCounter + "\r");
AuthorsOut.close();

// copy the Affiliations
var AffCounter = 0;
while (!AffiliationsIn.eof) {
    var line = AffiliationsIn.readLine();
    var columns = line.split("\t");
    if (AffiliatonsID.hasKey(columns[0])) {
        AffiliationsOut.write(line + '\n');
        ++AffCounter;
    }
}
console.log("Number of Affiliations: " + AffCounter + "\r");
AffiliationsOut.close();

// copy the Paper References
var RefCounter = 0;
while (!PaperReferencesIn.eof) {
    var line = PaperReferencesIn.readLine();
    var columns = line.split("\t");
    if (PaperID.hasKey(columns[0])) {
        PaperReferencesOut.write(line + '\n');
        RefCounter++;
    }
}
console.log("Number of References: " + RefCounter + "\r");
PaperReferencesIn.close();

// copy the paper Urls
var urlCounter = 0;
while (!PaperUrlsIn.eof) {
    var line = PaperUrlsIn.readLine();
    var columns = line.split("\t");
    if (PaperID.hasKey(columns[0])) {
        PaperUrlsOut.write(line + '\n');
        urlCounter++;
    }
}
console.log("Number of Urls: " + urlCounter + "\r");
PaperUrlsOut.close();

// END OF PROCESS
/**
 * This file contains the functions for constructing the 
 * timestream graph data format.
 * 
 * 1. The function jsonify creates the json object containing 
 * the data for the timestream graph.
 * 
 */
var qm = require('qminer');

module.exports = exports = {
    
    jsonify: function (jsonSet, addOptions) {
        topics = {};
        var startYear = addOptions.year.start == "" ? -Infinity : parseInt(addOptions.year.start);
        var endYear = addOptions.year.end == "" ? Infinity : parseInt(addOptions.year.end);
        for (var KeyN = 0; KeyN < jsonSet.length; KeyN++) {
            var topic = jsonSet[KeyN].value;
            topics[topic] = { type: jsonSet[KeyN].type, data: {} };
            var paperSet;
            if (jsonSet[KeyN].type == "keyword") {
                // if the topic is a keyword
                paperSet = jsonSet[KeyN].subset[0].inPapers;
                for (var PaperN = 0; PaperN < paperSet.length; PaperN++) {
                    var paper = paperSet[PaperN];
                    var paperYear = paper.paperPublishYear;
                    if (startYear <= paperYear && paperYear <= endYear) {
                        if (topics[topic].data[paperYear] != null) {
                            topics[topic].data[paperYear] += 1;
                        } else {
                            topics[topic].data[paperYear] = 1;
                        }
                    }
                }
                
            } else if (jsonSet[KeyN].type == "author" || jsonSet[KeyN].type == "journal") {
                // if the topic is an author
                var paperSubset = jsonSet[KeyN].subset[0];
                paperSet = jsonSet[KeyN].type == "author" ? paperSubset.hasWritten : paperSubset.hasPapers;
                var keywords = addOptions.keywords != null ? addOptions.keywords.map(function (json) { return json.label; }) : [];
                for (var PaperN = 0; PaperN < paperSet.length; PaperN++) {
                    var paperYear = paperSet[PaperN].paperPublishYear;
                    var paperKeywords = paperSet[PaperN].hasFieldsOfStudy;
                    if (startYear <= paperYear && paperYear <= endYear) {
                        for (var KeywordN = 0; KeywordN < paperKeywords.length; KeywordN++) {
                            var paperKeyword = paperKeywords[KeywordN].name;
                            if (keywords.length == 0 || keywords.indexOf(paperKeyword) != -1) {
                                if (topics[topic].data[paperKeyword] == null) {
                                    topics[topic].data[paperKeyword] = { type: "keyword", data: {} };
                                }
                                if (topics[topic].data[paperKeyword].data[paperYear] != null) {
                                    topics[topic].data[paperKeyword].data[paperYear] += 1;
                                } else {
                                    topics[topic].data[paperKeyword].data[paperYear] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        return topics;
    }
}
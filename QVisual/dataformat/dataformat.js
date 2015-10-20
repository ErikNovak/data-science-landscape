
var qm = require('qminer');

module.exports = exports = {
        

    jsonify: function (jsonSet) {
        topics = {};
        for (var KeyN = 0; KeyN < jsonSet.length; KeyN++) {
            var topic = jsonSet[KeyN].value;
            topics[topic] = { type: jsonSet[KeyN].type, data: {} };
            var paperSet;
            if (jsonSet[KeyN].type == "keyword") {
                // if the topic is a keyword
                paperSet = jsonSet[KeyN].subset[0].inPapers;
                for (var PaperN = 0; PaperN < paperSet.length; PaperN++) {
                    var paper = paperSet[PaperN];
                    if (topics[topic].data[paper.paperPublishYear] != null) {
                        topics[topic].data[paper.paperPublishYear] += 1;
                    } else {
                        topics[topic].data[paper.paperPublishYear] = 1;
                    }
                }
                
            } else if (jsonSet[KeyN].type == "author") {
                // if the topic is an author
                paperSet = jsonSet[KeyN].subset[0].hasWritten;
                for (var PaperN = 0; PaperN < paperSet.length; PaperN++) {
                    var paperYear = paperSet[PaperN].paperPublishYear;
                    var paperKeywords = paperSet[PaperN].hasFieldsOfStudy;
                    for (var KeywordN = 0; KeywordN < paperKeywords.length; KeywordN++) {
                        if (topics[topic].data[paperKeywords[KeywordN].name] == null) {
                            topics[topic].data[paperKeywords[KeywordN].name] = { type: "keyword", data: {} };
                        }
                        if (topics[topic].data[paperKeywords[KeywordN].name].data[paperYear] != null) {
                            topics[topic].data[paperKeywords[KeywordN].name].data[paperYear] += 1;
                        } else {
                            topics[topic].data[paperKeywords[KeywordN].name].data[paperYear] = 1;
                        }
                    }
                }
            }
        }
        return topics;
    }
}
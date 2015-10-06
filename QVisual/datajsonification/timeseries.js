
var qm = require('qminer');

module.exports = exports = {
    
    keywords : function (JSONSet) {
        data = {};
        var keys = Object.keys(JSONSet);
        for (var KeyN = 0; KeyN < keys.length; KeyN++) {
            var keyword = keys[KeyN];
            data[keyword] = {};
            var paperSet = JSONSet[keyword][0].inPapers;
            for (var PaperN = 0; PaperN < paperSet.length; PaperN++) {
                var paper = paperSet[PaperN];
                if (data[keyword][paper.paperPublishYear] != null) {
                    data[keyword][paper.paperPublishYear] += 1;
                } else {
                    data[keyword][paper.paperPublishYear] = 1;
                }
            }
        }
        return data;
    }

}
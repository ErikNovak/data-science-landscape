
var getMaxValue = function (data) {
    var maximum = {};
    var keys = Object.keys(data);
    for (var KeyN = 0; KeyN < keys.length; KeyN++) {
        var years = Object.keys(data[keys[KeyN]]);
        for (var YearN = 0; YearN < years.length; YearN++) {
            if (maximum[years[YearN]] != null) {
                maximum[years[YearN]] += data[keys[KeyN]][years[YearN]];
            } else {
                maximum[years[YearN]] = data[keys[KeyN]][years[YearN]];
            }
        }
    }
    var arr = Object.keys(maximum).map(function (key) { return maximum[key] });
    var max = Math.max.apply(null, arr);
    return max;
}

var getMinMaxYear = function (data) {
    var minimum = [];
    var maximum = [];
    var keywords = Object.keys(data);
    for (var KeyN = 0; KeyN < keywords.length; KeyN++) {
        var keyYears = Object.keys(data[keywords[KeyN]]);
        minimum.push(Math.min.apply(null, keyYears));
        maximum.push(Math.max.apply(null, keyYears));
    }
    var min = Math.min.apply(null, minimum);
    var max = Math.max.apply(null, maximum);
    return { min: min, max: max };
}

var createLayer = function (key, data) {
    var arr = [];
    var years = Object.keys(data[key]);
    var MinMax = getMinMaxYear(data);
    for (var YearN = MinMax.min; YearN <= MinMax.max; YearN++) {
        if (years.indexOf(YearN.toString()) != -1) {
            arr.push({ x: YearN, y: data[key][YearN.toString()] });
        } else {
            arr.push({ x: YearN, y: 0 });
        }
    }
    return arr;
}
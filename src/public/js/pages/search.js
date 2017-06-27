
// change the selected search value
var search = {
    drawTimestreamChart : function () {
        
        //get the search input
        var search = $(".searchbar").tokenfield("getTokens");
        // get the advance options search input
        search = search.concat($("#advance_keywords").tokenfield("getTokens"));
        search = search.concat($("#advance_authors").tokenfield("getTokens"));
        search = search.concat($("#advance_journals").tokenfield("getTokens"));
        search = search.concat($("#advance_organizations").tokenfield("getTokens"));
        search = search.concat($("#advance_conferences").tokenfield("getTokens"));
        
        // get the additional options 
        var additionalOptions = { wholeLandscape: false, year: { start: 0, end: 0 } };
        additionalOptions.year.start = $("#options_start_year").val().trim();
        additionalOptions.year.end = $("#options_end_year").val().trim();
        
        if (search.length == 0) { return; }
        
        // hide the graph and show the wait icon
        $(".graph-content").hide();
        $(".chartOptions").hide();
        $(".wait-content").show();
        
        $.ajax({
            type: 'POST',
            url: 'datascience/timestream',
            cache: false,
            data: { data: search, options: additionalOptions },
            success: function (data) {
                if (data.error != null) {
                    $("#modalTrigger").trigger("click");
                } else {
                    // need to change the with of the graph container
                    $("#graph-colChange").addClass("col-md-12").removeClass("col-md-10");
                    $(".wait-content").hide();
                    var graph = new streamGraph(data.options);
                    graph.setData(data.values);
                }
            }
        });
    },

    drawLandscape : function () {
        
        //get the search input
        var search = $(".searchbar").tokenfield("getTokens");
        // get the advance options search input
        search = search.concat($("#advance_keywords").tokenfield("getTokens"));
        search = search.concat($("#advance_authors").tokenfield("getTokens"));
        search = search.concat($("#advance_journals").tokenfield("getTokens"));
        search = search.concat($("#advance_organizations").tokenfield("getTokens"));
        search = search.concat($("#advance_conferences").tokenfield("getTokens"));
        
        // get the additional options 
        var additionalOptions = { wholeLandscape: false, year: { start: 0, end: 0 } };
        additionalOptions.wholeLandscape = false;
        additionalOptions.year.start = $("#options_start_year").val().trim();
        additionalOptions.year.end = $("#options_end_year").val().trim();
        
        if (search.length == 0) { return; }
        
        // hide the graph and show the wait icon
        $(".graph-content").hide();
        $(".chartOptions").hide();
        $(".wait-content").show();
        
        $.ajax({
            type: 'POST',
            url: 'datascience/landscape',
            cache: false,
            data: { data: search, options: additionalOptions },
            success: function (data) {
                if (data.error != null) {
                    $("#modalTrigger").trigger("click");
                } else {
                    // need to change the with of the graph container
                    $("#graph-colChange").addClass("col-md-10").removeClass("col-md-12");
                    $(".wait-content").hide();
                    // set the additional options for the graph
                    defaultOptions();
                    
                    var graph = new landscapeGraph(data.options);
                    graph.setData(data);
                    $(".chartOptions").show();
                }
            }
        })
    },
    drawWholeLandscape : function () {
        
        //get the search input
        var search = $(".searchbar").tokenfield("getTokens");
        // get the advance options search input
        search = search.concat($("#advance_keywords").tokenfield("getTokens"));
        search = search.concat($("#advance_authors").tokenfield("getTokens"));
        search = search.concat($("#advance_journals").tokenfield("getTokens"));
        search = search.concat($("#advance_organizations").tokenfield("getTokens"));
        search = search.concat($("#advance_conferences").tokenfield("getTokens"));
        
        // get the additional options 
        var additionalOptions = { wholeLandscape: false, year: { start: 0, end: 0 } };
        additionalOptions.wholeLandscape = true;
        additionalOptions.year.start = $("#options_start_year").val().trim();
        additionalOptions.year.end = $("#options_end_year").val().trim();
        
        if (search.length == 0) { return; }
        
        // hide the graph and show the wait icon
        $(".graph-content").hide();
        $(".chartOptions").hide();
        $(".wait-content").show();
        
        $.ajax({
            type: 'POST',
            url: 'datascience/landscape',
            cache: false,
            data: { data: search, options: additionalOptions },
            success: function (data) {
                if (data.error != null) {
                    $("#modalTrigger").trigger("click");
                } else {
                    // need to change the with of the graph container
                    $("#graph-colChange").addClass("col-md-10").removeClass("col-md-12");
                    $(".wait-content").hide();
                    // set the additional options for the graph
                    defaultOptions();

                    var graph = new landscapeGraph(data.options);
                    graph.setData(data);
                    $(".chartOptions").show();
                }
            }
        })
    }
}
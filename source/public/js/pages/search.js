
// change the selected search value
var search = {
    drawChart : function () {
        
        //get the search input
        var search_values = $(".searchbar").tokenfield("getTokens");
        //if (search_values.length == 0) { return; }

        // get the additional options 
        var addOptions = { keywords: [], authors: [], year: { start: 1975, end: 2015 } };
        addOptions.keywords = $("#options_keywords").tokenfield("getTokens");
        //addOptions.authors = $("#options_authors").val().split(/[,]+/);
        addOptions.year.start = $("#options_start_year").val().trim();
        addOptions.year.end = $("#options_end_year").val().trim();
        
        var graphtype = $('#graph-type').text();

        // hide the graph and show the wait icon
        $(".graph-content").hide();
        $(".wait-content").show();
        // send and recieve data
        $.ajax({
            type: 'POST',
            url: '/',
            data: { data: search_values, graph_type: graphtype, addOptions: addOptions },
            success: function (data) {
                $(".wait-content").hide();
                // get the graph type
                var graph = null;
                switch (graphtype) {
                    case 'Timestream chart': {
                        graph = new streamGraph(data.options);
                        break;
                    } case 'Topic landscape': {
                        graph = new landscapeGraph(data.options);
                        break;
                    }
                }
                graph.setData(data.values);
            }
        })
    }
}
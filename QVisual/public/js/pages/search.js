
// change the selected search value
var search = {
    drawChart : function () {
        
        //get the search input
        var search_values = $(".searchbar").tokenfield("getTokens");
        // get the data from the server
        if (search_values.length == 0) {
            return;
        }
        // hide the graph and show the wait icon
        $(".graph-content").hide();
        $(".wait-content").show();
        // send and recieve data
        $.ajax({
            type: 'POST',
            url: '/',
            data: { data: search_values },
            success: function (data) {
                $(".wait-content").hide();
                // get the graph type
                var graph = null;
                switch ($('#graph-type').text()) {
                    case 'Timestream chart': {
                        graph = new streamGraph(data.options);
                        break;
                    } case 'Topic map (TODO)': {
                        graph = new streamGraph(data.options);
                        break;
                    }
                }
                graph.setData(data.values);
            }
        })
    }
}
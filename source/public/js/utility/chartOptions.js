/**
 * Set the chart options.
 * 
 */
$(function () {
    var tagsVisibility = function (_tags) {
        // create additional cluster border control
        var additionalBorder = 5;
        // saves the visible clusters
        var visibleClusters = [];
        // get the DOMs and go through them
        var DOMs = _tags[0];
        for (var ClusN = 0; ClusN < DOMs.length; ClusN++) {
            var currentClust = DOMs[ClusN];
            var currentBox = currentClust.getBBox();
            for (var i = 0; i < visibleClusters.length; i++) {
                var visibleBox = visibleClusters[i].getBBox();
                // if the bounding boxes cover each other
                if (Math.abs(currentBox.x - visibleBox.x) - additionalBorder <= Math.max(currentBox.width, visibleBox.width) && 
                        Math.abs(currentBox.y - visibleBox.y) - additionalBorder <= Math.max(currentBox.height, visibleBox.height)) {
                    $(currentClust).attr("class", $(currentClust).attr("class") + " hidden");
                    break;
                }
            }
            // otherwise the cluster is visible
            visibleClusters.push(currentClust);
        }
    }

    // spin for the keywords text size
    $('#spinKeyword').spinbox({
        value: '14px',
        min: 0,
        max: 30,
        step: 1,
        units: ['px']
    });
    
    $('#spinKeyword').on('changed.fu.spinbox', function (event, value) {
        var svg = d3.select('.graph-content svg');
        svg.selectAll(".keyword")
            .attr("font-size", value);
    });

    $('#spinJournal').spinbox({
        value: '10px',
        min: 0,
        max: 30,
        step: 1,
        units: ['px']
    });

    $('#spinJournal').on('changed.fu.spinbox', function (event, value) {
        var svg = d3.select('.graph-content svg');
        svg.selectAll(".journal")
            .attr("font-size", value);
    });
    
    // keyword checkbox
    $('#checkKeyword').on('click', function () {
        if ($(this).is(":checked")) {
            var svg = d3.select('.graph-content svg');
            var keyword = svg.selectAll(".keyword").filter(".hidden")
                .classed("hidden", false);
            tagsVisibility(keyword);
            $("#spinKeyword").show();
        } else {
            // get the keywords and hide them
            var svg = d3.select('.graph-content svg');
            svg.selectAll(".keyword")
                .attr("class", "keyword hidden");
            $("#spinKeyword").hide();
        }
    });

    // journal checkbox
    $('#checkJournal').on('click', function () {
        if ($(this).is(":checked")) {
            var svg = d3.select('.graph-content svg');
            var journal = svg.selectAll(".journal").filter(".hidden")
                .classed("hidden", false);
            tagsVisibility(journal);
            $("#spinJournal").show();
        } else {
            // get the keywords and hide them
            var svg = d3.select('.graph-content svg');
            svg.selectAll(".journal")
                .attr("class", "journal hidden");
            $("#spinJournal").hide();
        }
    })
})
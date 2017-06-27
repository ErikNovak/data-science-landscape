/**
 * Containes the jQuery function for the additional options. 
 * 
 */

/**
 * Changes the text of the graph type:
 * Timestream chart
 * Academic landscape
 */ 
$(function () {
    $(".dropdown-container .dropdown-menu").on("click", "li a", function () {
        // change the text of the dropdown container
        $("#graph-type").text($(this).text());
        $("#graph-type").val($(this).val());
        if ($(this).text() != "Academic landscape") {
            var checkbox = document.getElementById("whole-landscape");
            checkbox.style.visibility = "hidden";
        } else {
            var checkbox = document.getElementById("whole-landscape");
            checkbox.style.visibility = "visible";
        }
        // draw the chart
		$(".graph-content").hide();
        $(".chartOptions").hide();
        search.drawChart();
    })
});

/**
 * Initialize the autocomplete of the basic searchbar.
 */ 
var autoCompleteTimeout = null;
$(function () {
    // initialize the autocomplete
    $("#basic_searchbar").tokenfield({
        autocomplete: {
            source: [],
            delay: 0
        }
    });
    // update the autocomplete when typing in the basic searchbar
    $("#basic_searchbar-tokenfield").on("input", function () {
        var tag = $(this).val();
        window.clearTimeout(autoCompleteTimeout);
        autoCompleteTimeout = window.setTimeout(function () {
            if (tag.length < 2) {
                return;
            }
            $.ajax({
                type: 'POST',
                url: 'autocomplete',
                data: { search: "all", value: tag },
                success: function (data) {
                    var autocompleteBasic = data;
                    var autocomplete = $("#basic_searchbar").data('bs.tokenfield').$input.autocomplete({
                        source: autocompleteBasic
                    });
                    autocomplete.data("ui-autocomplete")._renderItem = function (ul, item) {
                        var icon;
                        // get the correct type icon
                        if (item.type == "keyword") {
                            icon = "glyphicon-tag";
                        } else if (item.type == "author") {
                            icon = "glyphicon-user";
                        } else if (item.type == "journal") {
                            icon = "glyphicon-book";
                        } else if (item.type == "conferenceSeries") {
                            icon = "glyphicon-bullhorn";
                        } else if (item.type == "organization") {
                            icon = "glyphicon-briefcase";
                        }
                        var span = $("<span>").addClass("glyphicon " + icon)
                                    .addClass("aria-hidden", "true");
                        var li = $("<li>").addClass("item-autocomplete")
                                    .attr("data-value", item.value)
                                    .append(span)
                                    .append(" " + item.label)
                                    .appendTo(ul);
                        return li;
                    }
                    // trigger arrow key press
                    var keydown = $.Event("keydown");
                    keydown.which = 40;
                    $("#basic_searchbar-tokenfield").trigger(keydown);
                }
            });
        }, 400)
    });
    
    

    // if the token already exists, do nothing
    $("#basic_searchbar").on('tokenfield:createtoken', function (event) {
        var existingTokens = $(this).tokenfield('getTokens');
        $.each(existingTokens, function (index, token) {
            if (token.value === event.attrs.value) {
                $(".token-input").val("");
                event.preventDefault();
            }
        });
    });
    // added icon to the token
    $("#basic_searchbar").on('tokenfield:createdtoken', function (event) {
        var icon;
        switch (event.attrs.type) {
            case ("keyword"):
                icon = "class=' glyphicon glyphicon-tag' aria-hidden='true'";
                break;
            case ("author"):
                icon = "class=' glyphicon glyphicon-user' aria-hidden='true'";
                break;
            case ("journal"):
                icon = "class=' glyphicon glyphicon-book' aria-hidden='true'";
                break;
            case ("conferenceSeries"):
                icon = "class=' glyphicon glyphicon-bullhorn' aria-hidden='true'";
                break;
            case ("organization"):
                icon = "class=' glyphicon glyphicon-briefcase' aria-hidden='true'";
                break;
        }
        // prepend the correct icon
        $(event.relatedTarget).prepend("<span class='token-label'><span " + icon + "></span></span>");
        // hide the remove (x) icon
        $(event.relatedTarget).find("a").hide();
        // on hover show the remove (x) icon
        $(event.relatedTarget).hover(
            function () { $(this).find("a").show(200); },
            function () { $(this).find("a").hide(200); }
        );
        // on click the DOM is removed
        $(event.relatedTarget).click(function () { 
            $(this).remove();
        })
    });
});


/*
 * The advance search helper functions like, toggle additional  
 * options, autocomplete and other.
 */

// toggles the visibility of the advance search container
function toggleAdditional() {
    var button = $("#options");
    if (button.attr("data-value") == "right") {
        button.removeClass("glyphicon-chevron-right")
              .addClass("glyphicon-chevron-down");
        button.attr("data-value", "down");
    } else if (button.attr("data-value") == "down") {
        button.removeClass("glyphicon-chevron-down")
        .addClass("glyphicon-chevron-right");
        button.attr("data-value", "right");
    }
    $(".additional-options").slideToggle("slow");
}

/**
 * Advance search: 
 * keywords
 */ 
var advanceSearch = function (domTag) {
    // initialize the keyword autocomplete
    $(domTag).tokenfield({
        autocomplete: {
            source: [],
            delay: 0
        }
    });
    // update the autocomplete when typing in
    $(domTag + "-tokenfield").on("input", function () {
        var tag = $(this).val();
        window.clearTimeout(autoCompleteTimeout);
        autoCompleteTimeout = window.setTimeout(function () {
            if (tag.length < 2) {
                return;
            }
            var search;
            switch (domTag) {
                case ("#advance_conferences"):
                    search = "conferenceSeries";
                    break;
                case ("#advance_keywords"):
                    search = "keywords";
                    break;
                case ("#advance_authors"):
                    search = "authors";
                    break;
                case ("#advance_journals"):
                    search = "journals";
                    break;
                case ("#advance_organizations"):
                    search = "organizations";
                    break;
            }
            $.ajax({
                type: 'POST',
                url: 'autocomplete',
                data: { value: tag, search: search },
                success: function (data) {
                    var autocompleteConferenceSeries = data;
                    $(domTag).data('bs.tokenfield').$input.autocomplete({
                        source: autocompleteConferenceSeries,
                        delay: 0
                    });
                    // trigger arrow key press
                    var e = $.Event("keydown");
                    e.which = 40;                       // down key press
                    $(domTag + "-tokenfield").trigger(e);
                }
            });
        }, 400)
    });
    // if the token already exists, do nothing
    $(domTag).on('tokenfield:createtoken', function (event) {
        var existingTokens = $(this).tokenfield('getTokens');
        $.each(existingTokens, function (index, token) {
            if (token.value === event.attrs.value) {
                $(".token-input").val("");
                event.preventDefault();
            }
        });
    });
    // if the tag is clicked, remove it
    $(domTag).on('tokenfield:createdtoken', function (event) {
        // hide the remove (x) icon
        $(event.relatedTarget).find("a").hide();
        // on hover show the remove (x) icon
        $(event.relatedTarget).hover(
            function () { $(this).find("a").show(200); },
            function () { $(this).find("a").hide(200); }
        );
        // on click the DOM is removed
        $(event.relatedTarget).click(function () {
            $(this).remove();
        })
    });
}

$(function () {
    advanceSearch("#advance_keywords");
    advanceSearch("#advance_authors");
    advanceSearch("#advance_journals");
    advanceSearch("#advance_organizations");
    advanceSearch("#advance_conferences");
})
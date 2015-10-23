/**
 * Containes the jQuery function for the additional options. 
 * 
 */

// changes the text of the graph type selector dropdown menu
$(function () {
    $(".dropdown-container .dropdown-menu").on("click", "li a", function () {
        $("#graph-type").text($(this).text());
        $("#graph-type").val($(this).val());
    })
});

// toggles the visibility of the additional options container
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

// autocomplete for the topics and tokenfield
var availableTopics = undefined;
var autoCompleteTimeout = null;
$(function () {
    $(".searchbar").tokenfield({
        autocomplete: {
            source: [],
            delay: 0
        }
    });
    $(".token-input").on("input", function () {
        var topic = $(this).val();
        window.clearTimeout(autoCompleteTimeout);
        autoCompleteTimeout = window.setTimeout(function () {
            if (topic.length < 2) {
                return;
            }
            $.ajax({
                type: 'POST',
                url: '/',
                data: { type: "autocomplete", value: topic },
                success: function (data) {
                    availableTopics = data.slice(0, 15);
                    
                    $(".searchbar").data('bs.tokenfield').$input.autocomplete({
                        source: availableTopics,
                        delay: 0
                    }).data("ui-autocomplete")._renderItem = function (ul, item) {
                        var icon;
                        // get the correct type icon
                        if (item.type == "keyword") {
                            icon = "glyphicon-tag";
                        } else if (item.type == "author") {
                            icon = "glyphicon-user";
                        } else if (item.type == "journal") {
                            icon = "glyphicon-book";
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
                }
            });
        }, 400)
    });
});

$(function () {
    $(".searchbar").on('tokenfield:createtoken', function (event) {
        var existingTokens = $(this).tokenfield('getTokens');
        $.each(existingTokens, function (index, token) {
            if (token.value === event.attrs.value) {
                $(".token-input").val("");
                event.preventDefault();
            }
        });
    });
    $(".searchbar").on('tokenfield:createdtoken', function (event) {
        var icon;
        if (event.attrs.type == "keyword") {
            // set for the keyword icon
            icon = "class=' glyphicon glyphicon-tag' aria-hidden='true'";
        } else if (event.attrs.type == "author") {
            // set for the author icon
            icon = "class=' glyphicon glyphicon-user' aria-hidden='true'";
        } else if (event.attrs.type == "journal") {
            // set for the journal icon
            icon = "class=' glyphicon glyphicon-book' aria-hidden='true'";
        }
        
        $(event.relatedTarget).prepend("<span class='token-label'><span " + icon + "></span></span>");
    });
});

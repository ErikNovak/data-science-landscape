
// change the selected search value
$(function () {
    $(".dropdown-menu").on("click", "li a", function () {
        $("#selected").text($(this).text());
        $("#selected").val($(this).text());
    })
});

var json;
function drawChart() {
    //get the search input
    var searchValues = $("#searchInput").val();
    var search = searchValues.split(",");
    // get the data from the server
    if (search.length == 1 && search[0] == '') {
        return;
    }
    
    // get the store for data querying
    var store;
    switch ($('#selected').text()) {
        case 'Keywords': {
            store = 'FieldsOfStudy';
            break;
        } case 'Authors': {
            store = 'Authors';
            break;
        } case 'Journals': {
            store = 'Journals';
            break;
        }
    }

    // send and recieve data
    $.ajax({
        type: 'POST',
        url: '/',
        data: { store: store, data: search },
        success: function (data) {

            json = data.values;
            drawStackedBars(data.values, data.options);
        }
    })
}


/**
 * Saves the SVG as a .xml file, which is then sent to the server
 * to be written in a file. Still must have a function to convert
 * the .xml file to a .pdf file. (use Inkscape)
 */
function getPDFfromSVG() {
    // get and convert the SVG element
    var SVGElement = document.getElementById("svg-container");
    var SVGText = (new XMLSerializer()).serializeToString(SVGElement);

    // remove the hidden keywords elements
    var regex = /<text class="[\w]+ hidden"[\w=". \-#<]+>[\w ]+<\/text>/g;
    
    regex = /<text class="[\w]+ hidden"[\w=". \-#<]+\/>/g;
    SVGText = SVGText.replace(regex, '');

    $.ajax({
        type: 'POST',
        url: '/pdf',
        cache: false,
        data: { xml: SVGText }
    });   
}

/*
 * Saves the SVG as a .png file. It is then sent to the client via browser.
 */ 
function getPNGfromSVG() {
    saveSvgAsPng(document.getElementById("svg-container"), "chart.png");
}
/**
 * WAIT ANIMATION
 * Creates a wait icon animation using d3.js.
 */
function waitAnimation(_options) {
    // settings
    var options = $.extend({
        containerName: undefined,                                   // the dom that contains the svg element
        radius: { inner: 30, outer: 40 },                           // the inner and outer radius of the wait icon
        color: { background: "#ddd", foreground: "#6375fc" }        // the background and foreground color of the wait icon
    }, _options);
    
    this.displayAnimation = function () {
        // set the location of the icon
        var totalWidth = $(options.containerName).width(),
            totalHeight = $(options.containerName).height(),
            tau = 2 * Math.PI;
        
        var svg = d3.select(options.containerName)
            .append("svg")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .append("g")
            .attr("transform", "translate(" + totalWidth / 2 + "," + totalHeight / 2 + ")");
        
        // set the arc of object
        var arc = d3.svg.arc()
            .innerRadius(options.radius.inner)
            .outerRadius(options.radius.outer);
        
        // the background arc
        var background = svg.append("path")
        .datum({ startAngle: 0, endAngle: tau })
        .style("fill", options.color.background)
        .attr("d", arc);
        
        // one part of the foreground arc
        var foregroundFirst = svg.append("path")
        .datum({ startAngle: 0, endAngle: tau / 6 })
        .style("fill", options.color.foreground)
        .attr("d", arc);
        
        // second part of the foreground arc
        var foregroundSecond = svg.append("path")
        .datum({ startAngle: tau / 2, endAngle: 2 * tau / 3 })
        .style("fill", options.color.foreground)
        .attr("d", arc);
        
        var startAngleFirst = 0;
        var endAngleFirst =  tau / 6;
        
        var startAngleSecond = tau / 2;
        var endAngleSecond = 2 * tau / 3;
        
        setInterval(function () {
            // update the first arc
            startAngleFirst +=  tau / 360;
            endAngleFirst +=  tau / 360;
            
            foregroundFirst.transition()
            .duration(1)
            .call(arcTween, startAngleFirst, endAngleFirst);
            
            // update the second arc
            startAngleSecond +=  + tau / 360;
            endAngleSecond +=  tau / 360;
            
            foregroundSecond.transition()
            .duration(1)
            .call(arcTween, startAngleSecond, endAngleSecond);
        }, 1);
        
        // helper function for the transition of the arc
        function arcTween(transition, startAngle, endAngle) {
            transition.attrTween("d", function (d) {
                var interpolateStart = d3.interpolate(d.startAngle, startAngle);
                var interpolateEnd = d3.interpolate(d.endAngle, endAngle);
                return function (t) {
                    d.startAngle = interpolateStart(t);
                    d.endAngle = interpolateEnd(t);
                    return arc(d);
                }
            });
        }
    }
}

// create the wait animation
$(function () {
    var options = { containerName: ".wait-content" };
    var wait = new waitAnimation(options);
    wait.displayAnimation();
})
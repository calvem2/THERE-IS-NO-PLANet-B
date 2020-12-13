var dataset = [];
var formatDateIntoYear = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date("1965-01-01"),
    endDate = new Date("2019-12-30");
var liz_margin = {top:0, right:100, bottom:0, left:50},
    w = 960 - liz_margin.left - liz_margin.right,
    h = 200 - liz_margin.top - liz_margin.bottom;


var svgSlider = d3.select("#slider")
    .append("svg")
    .attr("width", w + liz_margin.left + liz_margin.right)
    .attr("height", h);
    
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, w])
    .clamp(true);

var slider = svgSlider.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + liz_margin.left + "," + h / 2 + ")"); // y position of the slider

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("drag", dragged));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

// Circle for the slider
var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

// Label above the circle slider
var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDateIntoYear(startDate)) // Get the year 
    .attr("transform", "translate(0," + (-25) + ")"); // y position of the text

// The svg
var s_svg = d3.select("#my_dataviz"),
  s_width = +s_svg.attr("width"),
  s_height = +s_svg.attr("height");
  
  // Map and projection
  var path = d3.geoPath();
  var projection = d3.geoMercator()
    .scale(100)
    .center([0,20])
    .translate([s_width / 2, s_height / 2]);
  
  // Define the div for the tooltip
  var div = d3.select("body").append("div")	
              .attr("class", "tooltip")				
            //   .style("opacity", 0);
            //   .attr("class", "ag-bar-tooltip")
              .style("background-color", "white")
              .style("border", "solid")
              .style("border-width", "3px")
              .style("border-radius", "5px")
              .style("padding", "10px");

  // Data and color scale
  var colorScale = d3.scaleThreshold()
    .domain([15000.0, 30000.0, 45000.0, 60000.0, 75000.0, 90000.0])
    .range(['#ffbac8', '#e38d9e', '#cc6c7f','#c94962', '#ab243e', '#750d23', '#5c0b1c']);

  // Values to get the colors for the legend from
  var legendColorValues = [15000.0, 30000.0, 45000.0, 60000.0, 75000.0, 90000.0, 100000];
  // Size for the legend rectangle colors
  var energySquareSize = 20;
  // Add the color rectangles for the legend
  var legendSquares = svgSlider.selectAll("energy-squares")
    .data(legendColorValues)
    .enter()
    .append("rect")
      .attr("x", function(d,i){ return 70 + i * (5.4 * energySquareSize + 2)}) // move left and right
      .attr("y", 160) // move up and down
      .attr("width", (5.4 * energySquareSize)) // width of rectangles
      .attr("height", energySquareSize) // height of rectangles
      .style("opacity", .85)
      .style("fill", function(d) { 
        // Do (d - 1) since the range for the colors is not inclusive
        return colorScale(d - 1);
      });

  // Labels for the legend
  var labels = ["< 15,000", "15,000 - 29,999", "30,000 - 44,999", 
    "45,000 - 59,999", "60,000 - 74,999", "75,000 - 89,999", ">= 90,000"]

  // Add the labels for the legend
  var legendTitles = svgSlider.selectAll("mylabels")
    .data(labels)
    .enter()
    .append("text")
      .attr("x", function(d,i){ return 122 + i * (5.4 * energySquareSize + 2)}) // move left and right
      .attr("y", 195) // move up and down
      .style("fill", "black") // color of legend text
      .text(function(d) {
          return d;
      })
      .attr("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .style("font-size", "11px");

var topo = [];
function drawMap() {
  // Load external data and boot
  fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(response => {
    return response.json();
  }).then(data => {
    // Work with JSON data here
    topo = data;
    // Draw the map
    s_svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")

        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
  }).catch(err => {
    // Do something for an error here
    console.log("Error Reading data " + err);
  });
}

drawMap();
var country_map = new Map();

// On the drag of the slider's handle
function dragged(event, d) {
    var h = x.invert(event.x);
    country_map.clear();
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDateIntoYear(h));
    ready(topo, formatDateIntoYear(h));
}


function ready(topo, year) {
    //console.log(year);
    d3.csv("energy.csv").then(function(d) {
        for (var i = 0; i < d.length; i++) {
            if (d[i].year == year) 
                country_map.set(d[i].code, d[i].energy);
        }

        let mouseOver = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
            d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black")
        }
    
        let mouseLeave = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
            d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
        }
    
        // Draw the map
        s_svg.selectAll("path")
            .data(topo.features)
    
            // set the color of each country
            .attr("fill", function (d) {
                d.total = country_map.get(d.id) || 0;
                // Color the map accordingly
                if (d.total != 0) {
                    return colorScale(d.total);
                }
                // Color grey if value is not in the data
                return "#6e6b6c";
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return d.properties.name; } )
            .style("opacity", .9)
            .on("mouseover", function(event, d) {
                div.transition()		
                    .duration(200)		
                    .style("opacity", .85);
                var currkWh = Math.floor(parseInt(country_map.get(d.id)));
                // If there is no data don't print NaN
                if (Number.isNaN(currkWh)) {
                    div.html("<p class='energy-tooltip-title' >" + d.properties.name + "</p>"
                        + "<p class='energy-tooltip-subcategory'>No data for " + year + ".</p>")
                        .style("border-color", "#6e6b6c");
                } else { // Regular style
                    var countryColor = colorScale(country_map.get(d.id));
                    div.html(`<p class='energy-tooltip-title' >` + d.properties.name + `</p>` 
                        + `<p class='energy-tooltip-subcategory'>` + year + `: ` 
                        + `<a class='energy-tooltip-value' style='color:${countryColor}'>` 
                        + numberWithCommas(currkWh) + ` kWh</a></p>`)
                        .style("border-color", countryColor);
                }	
                div.style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");	
            })
            .on("mousemove", function(event, d) {
                div.style("left", (event.pageX + 20) + "px")		
                    .style("top", (event.pageY - 28) + "px");	
            })				
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
    });    
  }

// Format the number to have comma separators
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
var dataset = [];
var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
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
    .attr("transform", "translate(" + liz_margin.left + "," + h / 2 + ")");

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
        .on("start drag", function() { update(x.invert(event.x)); }));

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

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")


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
              .style("opacity", 0);

  // Data and color scale
  var colorScale = d3.scaleThreshold()
    .domain([0, 5000.0, 10000.0, 20000.0, 30000.0, 70000.0, 100000.0])
    .range(d3.schemeBlues[7]);



  
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

function update(h) {
    country_map.clear();
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDate(h));
    ready(topo, formatDateIntoYear(h));
}


function ready(topo, year) {
    console.log(year);
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
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return d.properties.name; } )
            .style("opacity", .8)
            .on("mouseover", function(event, d) {
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html("<b>" + d.properties.name + "</b><br>" + Math.floor(parseInt(country_map.get(d.id))) + " kWh")	
                    .style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");	
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
    });    
  }
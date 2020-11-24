// d3.select("body").append("p").text("new paragraph!");
var w = 200;
var h = 100;
var k = 10;
var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h)

d3.json("https://raw.githubusercontent.com/seattleio/seattle-boundaries-data/master/data/neighborhoods.geojson", function (data) {
    console.log(data)
    var group = svg.selectAll("g")
        .data(data.features)
        .enter()
        .append("g")
    
    var projection = d3.geo.albersUsa()
                // .center([0,47.6062])
                // .rotate([122.3321,0])
                // // .parallels([41,44])
                // .translate([w/2, h/2])
                // .scale(k) // scale factor
                        
    var path = d3.geo.path().projection(projection);
    var areas = group.append("path")
        .attr("d",path)
        .attr("class", "area")
        .attr("fill", "green") 
});

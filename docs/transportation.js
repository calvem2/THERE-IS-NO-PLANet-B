d3.csv("transportation.csv", function(data) {
    console.log(data);
});


// TODO: make the functions that are needed to extract data


// start drawing the line
var margin = {
    top: 10, 
    right: 30, 
    bottom: 30, 
    left: 60
},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// parse Dates
var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");

// create axes
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// color scale
var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);


// function to generate line from coordinates
var line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.Passenger_road_vehicles))

// create the svg element that the line chart will attach to
var svg = d3.select("#t_line_chart")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// read the CSV
d3.csv("transportation.csv", 

    function(d) {
        return { 
            Year : d3.timeParse("%Y")(d.Year), 
            Passenger_road_vehicles : d.Passenger_road_vehicles,
            Aviation : d.Aviation,
            Road_freight_vehicles : d.Road_freight_vehicles,
            Shipping : d.Shipping,
            Other : d.Other
        }
    },

    function(data) {
        // group the data
        var groupData = d3.nest()
            .key(function(d) { return d.Year; })
            .entries(data);

        // add x axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.Year; }))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));


        // inefficient way to find the max
        var max_p = d3.max(data, function(d) { return d.Passenger_road_vehicles});
        var max_a = d3.max(data, function(d) { return d.Aviation});
        var max_r = d3.max(data, function(d) { return d.Road_freight_vehicles});
        var max_s = d3.max(data, function(d) { return d.Shipping});
        var max_o = d3.max(data, function(d) { return d.Other});
        var dataMax = Math.max(max_p, max_a, max_r, max_s, max_o);

        // add y axis
        var y = d3.scaleLinear()
            .domain([0, dataMax])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette
        var res = groupData.map(function(d) { return d.key});
        console.log(res);
        var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00']);

        // draw line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Passenger_road_vehicles) })
            )  
            
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Aviation) })
            )  

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width",3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Road_freight_vehicles) })
            )   
            
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Shipping) })
            )  

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "purple")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Other) })
            )  

        // draw title
        d3.select("#t_line_chart #t_line_chart_title")
        .text("Transport sector CO2 emissions by mode in the Sustainable Development Scenario, 2000-2030");

        // draw legend
        var legend = svg.selectAll('g.legend')
            .append('g')
            .attr('class', 'legend');


        // mouseover tooltip

        // append a g for all the mouse over 
        var mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

        // this is the vertical line
        mouseG.append("path")
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        // keep a reference to all our lines
        var lines = document.getElementsByClassName('line');

        // a g for each circle and text on the line
        var mousePerLine = mouseG.selectAll(".mouse-per-line")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

        // the circle
        mousePerLine.append("circle")
            .attr("r", 7)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        // the text
        mousePerLine.append("text")
            .attr("transform", "translate(10, 3)");

        // rect to capture mouse movements
        mouseG.append('svg:rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
            })
            .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
            })
            .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);

        // move the vertical line
        d3.select(".mouse-line")
            .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
            });

        // position the circle and text
        d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
            console.log(width/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.Other; }).right;
                idx = bisect(d.values, xDate);

            console.log("xData: ");

            // since we are use curve fitting we can't relay on finding the points like I had done in my last answer
            // this conducts a search using some SVG path functions
            // to find the correct position on the line
            // from http://bl.ocks.org/duopixel/3824661
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
                target = Math.floor((beginning + end) / 2);
                pos = lines[i].getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                    break;
                }
                if (pos.x > mouse[0])      end = target;
                else if (pos.x < mouse[0]) beginning = target;
                else break; //position found
            }

            // update the text with y value
            d3.select(this).select('text')
                .text(y.invert(pos.y).toFixed(2));

            // return position
            return "translate(" + mouse[0] + "," + pos.y +")";
            });
        });
    })


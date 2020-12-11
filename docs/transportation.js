const controller = new ScrollMagic.Controller();

// start drawing the line
var t_margin = {
    top: 10, 
    right: 40,
    bottom: 30, 
    left: 60
},
    t_width = (650 - t_margin.left - t_margin.right) + 100,
    t_height = (550 - t_margin.top - t_margin.bottom);

// parse Dates
var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");

// create axes
var x = d3.scaleTime().range([0, t_width]);
var y = d3.scaleLinear().range([t_height, 0]);

// color scale
var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);


// function to generate line from coordinates
var line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.Passenger_road_vehicles))

// create the svg element that the line chart will attach to
var t_svg = d3.select("#t_line_chart")
    .append('svg')
    .attr("width", t_width + t_margin.left + t_margin.right)
    .attr("height", t_height + t_margin.top + t_margin.bottom + 25)
    .append("g")
    .attr("transform", "translate(" + t_margin.left + "," + t_margin.top + ")");

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
            .range([0, t_width]);
        t_svg.append("g")
            .attr("transform", "translate(0," + t_height + ")")
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
            .range([t_height, 0]);
        t_svg.append("g")
            .call(d3.axisLeft(y));

        // add axes titles
        t_svg.append("text")
            .attr("class", "x label axis-title")
            .attr("text-anchor", "end")
            .attr("x", t_width / 2)
            .attr("y", t_height + 50)
            .text("Year");

        t_svg.append("text")
            .attr("class", "y label axis-title")
            .attr("text-anchor", "end")
            .attr("y", -55)
            .attr("x", -125)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Amount of CO2 (gigatonnes)");

        // add subtitle
        d3.select("#t_line_chart")
            .append("p")
            .attr("class", "subtitle")
            .html("<a href='https://www.iea.org/reports/world-energy-model/sustainable-development-scenario' target='_blank'>IEA's Sustainable Development Scenario</a>" +
                " shows how the world can change course to meet three main " +
                "energy-related Sustainable Development Goals: achieve universal access to energy (SDG 7), " +
                "reduce the severe health impacts of air pollution (part of SDG 3), and tackle climate change (SDG 13) ");

        // color palette
        var res = groupData.map(function(d) { return d.key});
        var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00']);

        // draw vertical line at 2020
        t_svg.append("line")
            .attr("x1", x(new Date("2020")))
            .attr("y1", 0)
            .attr("x2", x(new Date("2020")))
            .attr("y2", t_height)
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke-width", 2)
            .style("stroke", "lightgrey")
            .style("fill", "none");

        // draw line
        var path = t_svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Passenger_road_vehicles) })
            )

        var totalLength = path.node().getTotalLength();
            
        t_svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "rgb(114, 119, 119)")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Aviation) })
            )  

        t_svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "pink")
            .attr("stroke-width",3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Road_freight_vehicles) })
            )   
            
        t_svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "rgb(58, 88, 116)")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Shipping) })
            )  

        t_svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "rgb(84, 42, 125)")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.Other) })
            )

        // draw title
        d3.select("#t_line_chart_title")
        .text("CO2 Emissions by Mode: Sustainable Development Scenario");

        // draw legend
        var legend = d3.select("#t_line_chart_legend")
            .append("svg").attr("height", t_height + t_margin.top + t_margin.bottom + 25)
            .attr("width", 225);

        // passenger freight vehicles
        legend.append("rect")
            .attr("x", 5)
            .attr("y", 92)
            .attr("width", 15)
            .attr("height", 15)
            .attr("r", 6)
            .style("fill", "red")

        legend.append("text")
            .attr("x", 30)
            .attr("y", 100)
            .text("Road Passenger Vehicles")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")

        // road freight vehicles
        legend.append("rect")
            .attr("x", 5)
            .attr("y", 122)
            .attr("width", 15)
            .attr("height", 15)
            .attr("r", 6)
            .style("fill", "pink")

        legend.append("text")
            .attr("x", 30)
            .attr("y", 130)
            .text("Road Freight Vehicles")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")

        // aviation
        legend.append("rect")
            .attr("x", 5)
            .attr("y", 152)
            .attr("width", 15)
            .attr("height", 15)
            .attr("r", 6)
            .style("fill", "rgb(114, 119, 119)")

        legend.append("text")
            .attr("x", 30)
            .attr("y", 160)
            .text("Aviation")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")

        
        // shipping
        legend.append("rect")
            .attr("x", 5)
            .attr("y", 182)
            .attr("width", 15)
            .attr("height", 15)
            .attr("r", 6)
            .style("fill", "rgb(58, 88, 116)")

        legend.append("text")
            .attr("x", 30)
            .attr("y", 190)
            .text("Shipping")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")

        // other
        legend.append("rect")
            .attr("x", 5)
            .attr("y", 212)
            .attr("width", 15)
            .attr("height", 15)
            .attr("r", 6)
            .style("fill", "rgb(84, 42, 125)")

        legend.append("text")
            .attr("x", 30)
            .attr("y", 220)
            .text("Other")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle")

        // Draw lines on reveal
        new ScrollMagic.Scene({
            triggerElement: '#transportation',
            triggerHook: 0.5,
            duration: "80%", // hide 10% before exiting view (80% + 10% from bottom)
            offset: 50, // move trigger to center of element
            reverse: false
        })
            .on('enter', (e) => {
                d3.selectAll(".line")
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(3000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);
            })
            .addTo(controller);

        // mouseover tooltip

        // append a g for all the mouse over 
        var mouseG = t_svg.append("g")
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
            .data(lines)
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
            .attr('width', t_width)
            .attr('height', t_height)
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
            var d = "M" + mouse[0] + "," + t_height;
            d += " " + mouse[0] + "," + 0;
            return d;
            });

        // position the circle and text
        d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
            // var xDate = x.invert(mouse[0]),
            //     bisect = d3.bisector(function(d) { return d.Other; }).right;
            //     idx = bisect(d.values, xDate);

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

    }

    // function(d) {
    //     return { 
    //         Year : d3.timeParse("%Y")(d.Year), 
    //         Sector : d.Sector,
    //         CO2 : d.CO2, 
    //     }
    // },

    // function(data) {
    //     console.log("data: ", data);

    //     var groupedData = d3.nest()
    //         .key(function(d) { return d.Sector })
    //         .entries(data);

    //     console.log("grouped data: ", groupedData);
        
    //     // add x axis
    //     var x = d3.scaleTime()
    //         .domain(d3.extent(data, function(d) { return d.Year; }))
    //         .range([0, t_width]);
    //     t_svg.append("g")
    //         .attr("transform", "translate(0," + t_height + ")")
    //         .call(d3.axisBottom(x));

    //     // add y axis
    //     var y = d3.scaleLinear()
    //         .domain([0, d3.max(data, function(d) { return d.CO2 })])
    //         .range([t_height, 0]);
    //     t_svg.append("g")
    //         .call(d3.axisLeft(y));

    //     // color palette
    //     var res = groupedData.map(function(d){ return d.key }) // list of group names
    //     var color = d3.scaleOrdinal()
    //         .domain(res)
    //         .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'])

    //     // Draw the line
    //     t_svg.selectAll(".line")
    //     .data(groupedData)
    //     .enter()
    //     .append("path")
    //       .attr("fill", "none")
    //       .attr("stroke", function(d){ return color(d.key) })
    //       .attr("stroke-width", 1.5)
    //       .attr("d", function(d){
    //           console.log();
    //         return d3.line()
    //           .x(function(d) { return x(d.year); })
    //           .y(function(d) { return y(d.CO2); })
    //           .curve(d3.curveBasis);
    //       });
    // }
)


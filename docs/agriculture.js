//Set max width and height of map
// const width = 975;
// const height = 610;

// set the dimensions and margins of the graph
var margin = {top: 60, right: 100, bottom: 120, left: 50},
    width = 860 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg to the body of the page
var svg = d3.select("#agriculture_graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("foodData.csv").then(function(data) {
  d3.csv("subCategories.csv").then(function(subCategories) {
    // Graph title
    d3.select("#agriculture_graph .agriculture-title")
        .text("Food Group Supply Chain Emissions");

    // Only get the subgroups needed
    var subgroups = data.columns.slice(1, 8);
  
    // List of food groups
    var groups = d3.map(data, function(d){
      return(d.Food_Product);
    })

    // List of food subcategories
    var subGroups = d3.map(subCategories, function(d){
      return(d.Categories);
    })


    // svg.append("select")
    //   .attr("id", "#dropdown-select")

    // Add the options to the drop down menu
    d3.select("#dropdown-select")
      .selectAll('myOptions')
     	.data(subGroups) // TODO: get the names of the subcategories here
      .enter()
      .append('option')
      .attr("x", 375)    // moves the text left and right from the x-axis
      .attr("y",  530)
      .text(function (d) { return "Sort Descending: " + d.replaceAll("_", " "); }) // text showed in the menu
      .attr("value", function (d) { return d; }); // corresponding value returned by the dropdown

    // X axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("font-size", 15)
        .attr("x", 375)    // moves the text left and right from the x-axis
        .attr("y",  530)    // moves the text up and down from the x-axis
        .style("fill", "black") // color of title
        .text("Food Groups");

    // Y axis title
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("font-size", 15)
        .attr("y", -50)     // moves the text left and right from the y-axis
        .attr("x", -200)    // moves the text up and down from the y-axis
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("fill", "black") // color of title
        .text("Greenhouse Gas Emissions (kgCO2 per kg Food Product)"); 
  
    // Add X axis
    var x = d3.scaleBand()
        //.domain(groups)
        .domain(data.map(function(d) {
          return d.Food_Product;
        }))
        .range([0, width])
        .padding([0.2])
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(10))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 60])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // color palette = one color per subgroup
    // var color = d3.scaleOrdinal()
    //   .domain(subgroups)
    // TODO: change the colors to bucket into
    var colors = ['#0d3b66','#faf0ca','#f4d35e', '#ee964b', '#f95738', '#7b886b', '#a41623'];

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups)
      (data)
  
    // TODO: make the tooltip follow the mouse
    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#agriculture_graph")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
        .style("padding", "10px")
    
    // TODO: Update the tool tip
    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      // TODO: put name of food here too
      // Get the name of the hovered sub category of the bar
      var subgroupName = d3.select(this.parentNode).datum().key;
      // Get the value of the hovered category of the bar
      var subgroupValue = d3.select(this).datum().data[subgroupName];
      // Get name of current food hovered over
      var foodName = d3.select(this).datum().data["Food_Product"];
      tooltip
          .html(foodName + "<br>Subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
          .style("opacity", 1)
    }
    // TODO: place this where the mouse is
    // var mousemove = function(d) {
    //   tooltip
    //     .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    //     .style("top", (d3.mouse(this)[1]) + "px")
    // }
    var mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
    }

    // Show the bars
    svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
        .attr("fill", function(d) { 
          // Color the subsections of the bars
          return(colors[d.index])
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) {
              return x(d.data.Food_Product); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width", x.bandwidth())
          .attr("stroke", "grey")
        .on("mouseover", mouseover)
        // TODO: implement this
        //.on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

     // Create the legend for the graph
     // TODO: add titles to these
     var size = 15;
     svg.selectAll("mydots")
       .data(stackedData)
       .enter()
       .append("rect")
         .attr("x", 750)
         .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
         .attr("width", size)
         .attr("height", size)
         .style("fill", function(d){ return(colors[d.index]) })//return color(d)})
      
      // TODO: fix this
      // // Resort the graph
      // function updateChartSorting(selectedGroup) {
      //   //console.log(selectedGroup);
      //   // TODO: implement sorting here
      //   //d3.selectAll("rect")
      //    // Sort the data
      //   // TODO: make this based on totals 
      //   data.sort(function(d) {
      //     //console.log(a);
      //     //console.log(b);
      //     return d3.ascending(parseInt(d.Farm));
      //   });
      //   // Update the x axis
      //   x.domain(data.map(function(d) {
      //     return parseInt(d.Farm);
      //   }));
      //   svg.selectAll("rect")
      //     .transition()
      //     .duration(500)
      //     .attr("x", function(d){

      //     })
      // }

      // Listen for when the dropdown is updated
      d3.select("#dropdown-select").on("change", function(d) {
        var selectedOption = d3.select(this).property("value");
        updateChartSorting(selectedOption);
      })
      
   })
})
//Set max width and height of map
// const width = 975;
// const height = 610;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 160, bottom: 120, left: 50},
    width = 900 - margin.left - margin.right,
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
    // TODO: load this in later?
    // Graph title
    // d3.select("#agriculture_graph .agriculture-title")
    //     .text("Food Group Supply Chain Emissions");

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
        .attr("font-size", 16)
        .attr("x", 350)    // moves the text left and right from the x-axis
        .attr("y",  550)    // moves the text up and down from the x-axis
        .style("fill", "black") // color of title
        .text("Food Groups");

    // Y axis title
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("font-size", 16)
        .attr("y", -50)     // moves the text left and right from the y-axis
        .attr("x", -200)    // moves the text up and down from the y-axis
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("fill", "black") // color of title
        .text("Greenhouse Gas Emissions (kgCO2 per kg Food Product)"); 
  
    // Add X axis
    var x = d3.scaleBand()
        .domain(data.sort(function(a, b) { 
            return parseInt(b.Total) - parseInt(a.Total);
          }).map(function(d) {
            return d.Food_Product;
          }))
        .range([0, width])
        //.padding([0.2])
    var xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Redraw the titles at a an angle
    xAxis.transition().duration(1000).call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
  
    // Add Y axis
    var y = d3.scaleLinear()
      //.domain([0, 60])
      .domain([0, d3.max(data, function(d) { return parseInt(d.Total); })])
      .range([ height, 0 ]);
    var yAxis = svg.append("g")
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
    var tooltip = d3.select("#agriculture_graph")//.select("svg")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");
    
    // Show the tooltip on mouse over
    var mouseover = function(d) {
      // Get name of current food hovered over
      var foodName = d3.select(this).datum().data["Food_Product"];
      // Get the name of the hovered sub category of the bar
      var subgroupName = d3.select(this.parentNode).datum().key.replaceAll("_", " ");
      // Get the value of the hovered category of the bar
      var subgroupValue = d3.select(this).datum().data[subgroupName];
      // Get the total for the bar graph
      var totalValue = d3.select(this).datum().data["Total"];
      tooltip
          .html("<b>" + foodName 
            + "</b><br>Subgroup: " + subgroupName 
            + "<br>Value: " + subgroupValue + " kgCo2"
            + "<br><br>Total: " + totalValue + " kgCo2")
          .style("opacity", 1)
          .style("left", (d.clientX + 30) + "px")
          .style("top", (d.clientY + 200) + "px");
    }

    // Place tooltip on mouse move
    var mousemove = function(d) {
      tooltip
        .style("left", (d.clientX + 30) + "px")
        .style("top", (d.clientY + 200) + "px")
    }
    // Make the tooltip disappear when mouse leaves
    var mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
    }

    // ////////////////////////
    // // Draw the bar chart //
    // ////////////////////////

    // Draw the initial graph
    updateBarGraph("No_Diet");

    // Updates the bar graph based on the diet filter
    // and selected sorting method
    function updateBarGraph(dietName) {
      // Get the category to sort on
      var sortCategory = d3.select("#dropdown-select").property("value");
      
      // Sort the data based on the category to sort on 
      // and filter the data based on the diet name
      var filteredDietData = data.sort(function(a, b) { 
        return parseFloat(b[sortCategory]) - parseFloat(a[sortCategory])
      }).filter(d => d[dietName] == 1);

      // Update the domain of the x axis
      x.domain(filteredDietData.map(function(d) {
        return d.Food_Product;
      })).range([0, width])
      .padding([0.2]);

      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

       // Update the y axis
       // TODO: Sort based on the name not the total
       y.domain([0, d3.max(filteredDietData, function(d) { return Math.ceil(parseFloat(d.Total)); })]);
       yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Create the stacked data based on the given
      // filtered data
      var stackedDietData = d3.stack()
        .keys(subgroups)
        (filteredDietData)

      // Create the group
      var barGroup = svg.selectAll("g.layer")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedDietData);
    
      barGroup.exit().remove();

      barGroup.enter().append("g")
        .classed("layer", true)
        .attr("fill", function(d) { 
          // Color the subsections of the bars
          return(colors[d.index])
        });

      // Show the bars
      var bars = svg.selectAll("g.layer").selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d, e => e.data.Food_Product);

      bars.exit().remove();

      // TODO: fix this animation so it grows on change of
      // radio button
      bars.enter().append("rect")
        .attr("width", x.bandwidth())
        .merge(bars)
        .attr("class", "bar")
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .transition()
        .duration(1000)  
        .attr("x", function(d) {
          return x(d.data.Food_Product); })
          .attr("stroke", "grey");

      // Create tool tip for the bar graph
      svg.selectAll("g.layer").selectAll("rect")
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
    }



    // // Show the bars
    // var bars = svg.append("g")
    //   .selectAll("g")
    //   // Enter in the stack data = loop key per key = group per group
    //   .data(stackedData) // filters the data
    //       //.sort((a, b) => b.Total - a.Total)
    //   .enter().append("g")
    //     .attr("fill", function(d) { 
    //       // Color the subsections of the bars
    //       return(colors[d.index])
    //     })
    //     .selectAll(".bar")
    //     // enter a second time = loop subgroup per subgroup to add all rectangles
    //     .data(function(d) { return d; })
    //     .enter().append("rect")
    //       .attr("class", "bar")
    //       .attr("x", function(d) {
    //           return x(d.data.Food_Product); })
    //       .attr("y", function(d) { return y(d[1]); })
    //       .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    //       .attr("width", x.bandwidth())
    //       .attr("stroke", "grey")
    //     .on("mouseover", mouseover)
    //     // TODO: implement this
    //     //.on("mousemove", mousemove)
    //     .on("mouseleave", mouseleave);


    ////////////
    // Legend //
    ////////////
     // X axis title
     svg.append("text")
     .attr("class", "legend_title")
      .attr("text-anchor", "left")
      .attr("font-size", 18)
      .attr("x", 700)    // moves the text left and right from the x-axis
      .attr("y",  40)    // moves the text up and down from the x-axis
      .style("fill", "black") // color of title
      .text("Subcategories");
    
    // Create the color blocks for the legend
    var size = 15;
    svg.selectAll("mydots")
      .data(stackedData)
      .enter()
      .append("rect")
        .attr("x", 700) // move left and right
        .attr("y", function(d,i){ return 50 + i*(size+5)}) // move up and down
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return(colors[d.index]) })//return color(d)})
    // Add the text to the legend
    svg.selectAll("mylabels")
      .data(stackedData)
      .enter()
      .append("text")
        .attr("x", 720)
        .attr("y", function(d,i){ return 50 + i*(size+5) + (size/2)+ 1}) // move up and down
        .style("fill", "black")
        .text(function(d){ return d.key.replaceAll("_", " ") })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
    

      /////////////////////////////////////////
      // On change event for dropdown sorting//
      /////////////////////////////////////////

      // TODO: checked is not working
      // Listen for when the dropdown is updated
      d3.select("#dropdown-select").on("change", function(d) {
        // See if there is a selected radio button
        var selectedDiet = "No_Diet";
        if (document.getElementById("pescatarian").checked) {
          selectedDiet = "Pescatarian";
        } else if (document.getElementById("vegetarian").checked) {
          selectedDiet = "Vegetarian";
        } else if (document.getElementById("vegan").checked) {
          selectedDiet = "Vegan";
        }

        // Update the graph based on filter and sorting
        updateBarGraph(selectedDiet);
      })


      ////////////////////////////////
      // On change events for diets //
      ////////////////////////////////

      // Filter the graph to show omnivorous foods only
      d3.select("#no-diet").on("change", function(d) {
        updateBarGraph("No_Diet");
      })

      // Filter the graph to show pescatarian foods only
      d3.select("#pescatarian").on("change", function(d) {
          updateBarGraph("Pescatarian");
      })

      // Filter the graph to show vegetarian foods only
      d3.select("#vegetarian").on("change", function(d) {
        updateBarGraph("Vegetarian");
      })

      // Filter the graph to show vegan foods only
      d3.select("#vegan").on("change", function(d) {
       updateBarGraph("Vegan");
      })
   })
})
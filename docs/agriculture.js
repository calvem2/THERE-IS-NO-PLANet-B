// Set the dimensions and margins of the graph
var agMargin = {top: 30, right: 160, bottom: 120, left: 50},
    agWidth = 900 - agMargin.left - agMargin.right,
    agHeight = 600 - agMargin.top - agMargin.bottom;

// Parse the Data
d3.csv("data/foodData.csv").then(function(data) {
  d3.csv("subCategories.csv").then(function(subCategories) {

    // Append the svg to the body of the page
    var svg = d3.select("#agriculture_graph")
      .append("svg")
        .attr("width", agWidth + agMargin.left + agMargin.right)
        .attr("height", agHeight + agMargin.top + agMargin.bottom)
        // .call(d3.zoom()
        //   .scaleExtent([1, 10])
        //   .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.top]])
        //   .extent([[margin.left, margin.top], [width - margin.right, height - margin.top]])
        //   .on("zoom", zoom))
      .append("g")
        .attr("transform",
              "translate(" + agMargin.left + "," + agMargin.top + ")");      

    // Only get the subgroups needed
    var subgroups = data.columns.slice(1, 8);
    // Initialize the subgroup map to be used with the subgroup list
    var subgroupMap = new Map();
    subgroupMap.set("Farm", 1);
    subgroupMap.set("Land_Use_Change", 1);
    subgroupMap.set("Animal_Feed", 1);
    subgroupMap.set("Processing", 1);
    subgroupMap.set("Transport", 1);
    subgroupMap.set("Packaging", 1);
    subgroupMap.set("Retail", 1);

    // // Create the color map for the bar chart
    var barColorMap = new Map();
    barColorMap.set("Farm", "#ff4747");
    barColorMap.set("Land_Use_Change", "#659b5e");
    barColorMap.set("Animal_Feed", "#ffb140");
    barColorMap.set("Processing", "#8cb1ab");
    barColorMap.set("Transport", "#37515f");
    barColorMap.set("Packaging", "#8c5383");
    barColorMap.set("Retail", "#ad7b5c");

    // Set the colors for the bar graph
    var barColor = d3.scaleOrdinal()
    .range(["#ff4747", "#659b5e", "#ffb140", "#8cb1ab", "#37515f", "#8c5383", "#ad7b5c"])
    .domain(subgroups);
  
    // List of food groups
    var groups = d3.map(data, function(d){
      return(d.Food_Product);
    })

    // List of food subcategories
    var allSubGroups = d3.map(subCategories, function(d){
      return(d.Categories);
    })

    // Add the options to the drop down menu
    var dropdownSelect = d3.select("#dropdown-select")
      .selectAll('myOptions')
     	.data(allSubGroups) // TODO: get the names of the subcategories here
      .enter()
      .append('option')
      .attr("x", 375)    // moves the text left and right from the x-axis
      .attr("y",  530)
      .text(function (d) { return "Sort Descending: " + d.replaceAll("_", " "); }) // text showed in the menu
      .attr("value", function (d) { return d; }); // corresponding value returned by the dropdown

    // Adds all of the check boxes to the custom drop down
    var testAddCheckbox = d3.select("#checkboxes")
      .selectAll('myOptions')
      .data(data)
      .enter()
      .append('label')
        .attr('for', function(d) {return d.Food_Product; })
        //.attr('id', function(d) {return d.Food_Product; }) // set the id of the 
        .text(function(d) {return d.Food_Product})
      .append('input')
        .attr('type', 'checkbox')
        .attr('id', function(d) {return d.Food_Product; }) // set the id of the 
        .text(function(d) {return d.Food_Product});


    // X axis title
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("font-size", 18)
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
        .attr("x", -220)    // moves the text up and down from the y-axis
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("fill", "black") // color of title
        .text("Greenhouse Gas Emissions (kgCO2 per kg Food Product)"); 

    ///////////////
    // Subtitles //
    ///////////////

    // Append retail subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Retail")
      .text("Retail – emissions from retail processes (e.g. energy used in refrigeration of food products)");
  
    // Append packaging subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Packaging")
      .text("Packaging – emissions from production of packaging materials, transport of packaging, and disposal of packaging");

    // Append transport subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Transport")
      .text("Transport – emissions from energy use in the transport of food");

    // Append processing subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Processing")
      .text("Processing – emissions from energy use in the process of converting " + 
            "raw agricultural products into final food products");

    // Append animal feed subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Animal_Feed")
      .text("Animal Feed – emissions from crop production and its processing into " +
            "feed for livestock (the Vegan diet does not contain this category)");

    // Append land use change subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Land_Use_Change")
      .text(" Land Use Change – emissions from deforestation and underground changes in soil carbon");
    
    // Append farm subtitle
    d3.selectAll("#agriculture_graph")
      .append("p")
      .attr("class", "ag-subtitle")
      .attr("id", "Farm")
      .text("Farm – emissions from farm machinery, fertilizers, cows, manure, and rice");

    // Add X axis
    var x = d3.scaleBand()
        .domain(data.sort(function(a, b) { 
            return parseInt(b.Total) - parseInt(a.Total);
          }).map(function(d) {
            return d.Food_Product;
          }))
        .range([0, agWidth])
        //.padding([0.2])
    var xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + agHeight + ")")
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
      .range([ agHeight, 0 ]);
    var yAxis = svg.append("g")
      .call(d3.axisLeft(y));
  
    // color palette = one color per subgroup
    // var color = d3.scaleOrdinal()
    //   .domain(subgroups)
    // TODO: change the colors to bucket into
    // Create the color map
    var color = d3.scaleOrdinal()
      .range(["#ff4747", "#659b5e", "#ffb140", "#8cb1ab", "#37515f", "#8c5383", "#ad7b5c"])
      .domain(subgroups);

    var barColor = d3.scaleOrdinal()
      .range(["#ff4747", "#659b5e", "#ffb140", "#8cb1ab", "#37515f", "#8c5383", "#ad7b5c"])
      .domain(subgroups);

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
      .attr("class", "ag-bar-tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "3px")
      .style("border-radius", "5px")
      .style("padding", "10px");
    
    // Show the tooltip on mouse over
    var mouseover = function(d) {
      // Get name of current food hovered over
      var foodName = d3.select(this).datum().data["Food_Product"];
      // Get the name of the hovered sub category of the bar
      var subgroupName = d3.select(this.parentNode).datum().key;
      // Get the value of the hovered category of the bar
      var subgroupValue = d3.select(this).datum().data[subgroupName];
      // Get the total for the bar graph
      var totalValue = d3.select(this).datum().data["Total"];
      // Color of the hovered over bar
      var colorOfBar = barColorMap.get(subgroupName);
      tooltip
          .style("border-color", colorOfBar)
          .html("<p class='ag-tooltip-title' >" + foodName.toUpperCase() + "</p>"
            + `<p class='ag-tooltip-subcategory'>` + subgroupName.replaceAll("_", " ") + ": </p>"
            + `<p class='ag-tooltip-value' style='color:${colorOfBar}'>` + subgroupValue +  " kgCo2</p>"
            + "<br><p class='ag-tooltip-value'>Total: " + totalValue + " kgCo2</p>")
          .style("opacity", 1)
          .style("left", (850) + "px")
          .style("top", (875) + "px");
    }

    // Make the tooltip disappear when mouse leaves
    var mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
    }

    ////////////////////////
    // Draw the bar chart //
    ////////////////////////

    // Draw the initial graph
    updateBarGraph("No_Diet", false);

    // Updates the bar graph based on the diet filter
    // and selected sorting method
    function updateBarGraph(dietName, doTransition) {
      // Get the category to sort on
      var sortCategory = d3.select("#dropdown-select").property("value");
      
      // Update the subtitle beneath the graph based on what we are sorting
      for (var i = 1; i < allSubGroups.length; i++) {
        console.log(sortCategory);
        // Display everything if total is selected
        if (sortCategory == "Total") {
          document.getElementById(allSubGroups[i]).style.display = "block";
        } else {
          // Display if it is the subcategory that we want to display
          if (sortCategory == allSubGroups[i]) {
            document.getElementById(allSubGroups[i]).style.display = "block";
          } else { // Get rid of all of the subtitles that are not sorted on
            document.getElementById(allSubGroups[i]).style.display = "none";
          }
        }
      }
 
      // Sort the data based on the category to sort on 
      // and filter the data based on the diet name and the subgroup selected
      var filteredDietData = data.sort(function(a, b) { 
        return parseFloat(b[sortCategory]) - parseFloat(a[sortCategory])
      }).filter(function(d) { // TODO filter based on subgroups selected as well
        return d[dietName] == 1;
      });

      // Update the domain of the x axis
      x.domain(filteredDietData.map(function(d) {
        return d.Food_Product;
      })).range([0, agWidth])
      .padding([0.2]);

      // Transition for the x axis
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      // Create the stacked data based on the given
      // filtered data
      var testUpdateData = subgroups;
      var stackedDietData = d3.stack()
        .keys(testUpdateData)
        (filteredDietData);


      // Get the max for the y axis
      var maxYval = 0;
      for (var i = 0; i < stackedData[0].length; i++) {
        var innerData = stackedData[0][i].data;
        var currMax = 0; 
        // Loop through and sum up the 
        for (var j = 0; j < subgroups.length; j++) {
          // Filter on the diet
          if (innerData[dietName] == 1) {
            currMax += parseFloat(innerData[subgroups[j]]);
          }
        }
        // Update the max value if needed
        if (currMax > maxYval) {
          maxYval = currMax;
        }
        currMax = 0;
      }

      // Update the y axis
      y.domain([0, maxYval]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Create the group
      var barGroup = svg.selectAll("g.layer")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedDietData);
    
      //** attempt to update the colors did not work **//

      // TODO: works correctly in getting the current colors needed
      // but does not do the correct thing
      // var colorRange = [];
      // // Update the color range
      // for (let [key, value] of subgroupMap) {
      //   if (subgroupMap.get(key) == 1) {
      //     colorRange.push(barColorMap.get(key));
      //   }
      // }

      // // TODO: see if this works
      // barColor.range(colorRange)
      //   .domain(subgroups);
    
      barGroup.exit().remove();
      
      // .attr("fill", function(d) { 
      //   // Color the subsections of the bars
      //   //return(colorMap.get(d.key))
      //   return barColor(d.index);
      // });

      // TODO: this is not working - have colors stay the same
      //TODO: does not update correctly 
      barGroup.enter().append("g")
        .classed("layer", true)
        .attr("fill", function(d) { 
          // Color the subsections of the bars
          //return(colorMap.get(d.key))
          return barColor(d.index);
        });

      // Show the bars
      var bars = svg.selectAll("g.layer").selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d, e => e.data.Food_Product);

      bars.exit().remove();
      
      // If we want the sorting animation to happen then do the transition
      if (doTransition) {
        bars.enter().append("rect")
        .attr("width", Math.min(x.bandwidth(), 30))// TODO: doesnt work well
        .merge(bars)
        .attr("class", "bar")
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .transition()
        .duration(1000)  
        .attr("x", function(d) {
          return x(d.data.Food_Product); })
      } else {
        bars.enter().append("rect")
        .attr("width", Math.min(x.bandwidth(), 30)) // TODO: doesnt work well
        .merge(bars)
        .attr("class", "bar")
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("x", function(d) {
          return x(d.data.Food_Product); })
        }

      // Create tool tip for the bar graph
      svg.selectAll("g.layer").selectAll("rect")
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave);
    }


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
    var legendSquares = svg.selectAll("mysquares")
      .data(color.domain().slice().reverse())
      .enter()
      .append("rect")
        .attr("x", 700) // move left and right
        .attr("y", function(d,i){ return 50 + i*(size+5)}) // move up and down
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d) { return color(d); })//colorMap.get(d.key); })
        //.on("click", function(e, d) { legendClicked(d); })
    // Add the text to the legend
    var legendTitles = svg.selectAll("mylabels")
      .data(color.domain().slice().reverse())
      .enter()
      .append("text")
        .attr("x", 720)
        .attr("y", function(d,i){ return 50 + i*(size+5) + (size/2)+ 1}) // move up and down
        .style("fill", "black")
        .text(function(d){ return d.replaceAll("_", " ") })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        //.on("click", function(e, d) { legendClicked(d); })
    
    // // Update the legend and graph when it is clicked
    // function legendClicked(subCategoryClicked) {
    //   // TODO: update the color domain: 
    //   // Does not work
    //   // color.range(["red", "green", "yellow", "black", "#a05d56", "#d0743c", "#ff8c00"])
    //   // .domain(subgroups);

    //   // Update the map to toggle the category clicked
    //   if (subgroupMap.get(subCategoryClicked) == 1) {
    //     // Toggle off the sub group
    //     subgroupMap.set(subCategoryClicked, 0);
    //   } else {
    //     // Toggle on the sub group
    //     subgroupMap.set(subCategoryClicked, 1);
    //   }
    //   // Update the legend title colors
    //   legendTitles.style("fill", function(d) {
    //     var currSubCategory = d;
    //     // If the subcategory is selected in the legend
    //     if (subgroupMap.get(currSubCategory) == 1) {
    //       return("black");
    //     }
    //     return("#ccc");   
    //   });

    //   // Update the legend square colors
    //   legendSquares.style("fill", function(d) { 
    //     var currSubCategory = d;
    //     // If the subcategory is selected in the legend
    //     if (subgroupMap.get(currSubCategory) == 1) {
    //       return color(d);
    //       //return(colorMap.get(d.key));
    //     }
    //     return("#ccc");   
    //   });
    //   // Update the subgroup list
    //   subgroups = [];
      
    //   //var allGroups = ["Total"];
    //   // Loop through the map
    //   for (let [key, value] of subgroupMap) {
    //     // Add the sub group to the list if it needs to be displayed
    //     if (value == 1) {
    //       //allGroups.push(key);
    //       subgroups.push(key);
    //     }
    //   }

    //   // d3.select("#dropdown-select")
    //   // .selectAll('myOptions')
    //  	// .data(allGroups) // TODO: get the names of the subcategories here
    //   // .enter()
    //   // .append('option')
    //   // .attr("x", 375)    // moves the text left and right from the x-axis
    //   // .attr("y",  530)
    //   // .text(function (d) { return "Sort Descending: " + d.replaceAll("_", " "); }) // text showed in the menu
    //   // .attr("value", function (d) { return d; });

    //   // dropdownSelect.data(allGroups) 
    //   // .enter()
    //   // .text(function (d) { return "Sort Descending: \"" + d.replaceAll("_", " ") + "\""; }) // text showed in the menu
    //   // .attr("value", function (d) { return d; });

    //   // Update the graph
    //   onchangeUpdateGraph(false);
    // }
    

      /////////////////////////////////////////
      // On change event for dropdown sorting//
      /////////////////////////////////////////

      // TODO: checked is not working
      // Listen for when the dropdown is updated
      d3.select("#dropdown-select").on("change", function(d) {
        onchangeUpdateGraph(true);
      })

      // Update the graph based on sorting and radio button clicked
      function onchangeUpdateGraph(doTransition) {
        // See if there is a selected radio button
        var selectedDiet = "No_Diet";
        if (document.getElementById("pescatarian").checked) {
          selectedDiet = "Pescatarian";
        } else if (document.getElementById("vegetarian").checked) {
          selectedDiet = "Vegetarian";
        } else if (document.getElementById("vegan").checked) {
          selectedDiet = "Vegan";
        } else if (document.getElementById("custom").checked) {
          // selectedDiet = "Custom";
          document.getElementById("custom-select").disabled = false;
        }
        // TODO: make the selected diet 

        // Update the graph based on filter and sorting
        updateBarGraph(selectedDiet, doTransition);
      }


      ////////////////////////////////
      // On change events for diets //
      ////////////////////////////////

      // Filter the graph to show omnivorous foods only
      d3.select("#no-diet").on("change", function(d) {
        document.getElementById("custom-select").disabled = true;
        document.getElementById("checkboxes").style.display = "none";
        updateBarGraph("No_Diet", true);
      })

      // Filter the graph to show pescatarian foods only
      d3.select("#pescatarian").on("change", function(d) {
        document.getElementById("custom-select").disabled = true;
        document.getElementById("checkboxes").style.display = "none";
        updateBarGraph("Pescatarian", true);
      })

      // Filter the graph to show vegetarian foods only
      d3.select("#vegetarian").on("change", function(d) {
        document.getElementById("custom-select").disabled = true;
        document.getElementById("checkboxes").style.display = "none";
        updateBarGraph("Vegetarian", true);
      })

      // Filter the graph to show vegan foods only
      d3.select("#vegan").on("change", function(d) {
        document.getElementById("custom-select").disabled = true;
        document.getElementById("checkboxes").style.display = "none";
        updateBarGraph("Vegan", true);
      })

      // Filter the graph to show custom foods only
      d3.select("#custom").on("change", function(d) {
        document.getElementById("custom-select").disabled = false;
        //document.getElementById("checkboxes").style.display = "none";
        //updateBarGraph("Vegan", true);
      })

      // TODO: attempt to implement a zooming function for the bar graph
      // function zoom(eventTest) { 
      //   //window.alert("test");
      //   // x.range([margin.left, width - margin.right].map(function(d){  return 30; }));//return eventTest.transform.__proto__.rescaleX(d); }));
      //   //  xAxis.call(d3.axisBottom(x))
      //   // .selectAll("text")
      //   //   .style("text-anchor", "end")
      //   //   .attr("dx", "-.8em")
      //   //   .attr("dy", ".15em")
      //   //   .attr("transform", "rotate(-65)");
      //   // svg.selectAll("g.layer").selectAll("rect")
      //   //   .attr("x", d => x(d.Food_Product))
      //   //   .attr("width", x.bandwidth());
      // }
   })
})
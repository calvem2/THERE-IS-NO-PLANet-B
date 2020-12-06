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
    barColorMap.set("Farm", "#c5596e");
    barColorMap.set("Land_Use_Change", "#52b79c");
    barColorMap.set("Animal_Feed", "#b7d175");
    barColorMap.set("Processing", "#4d8993");
    barColorMap.set("Transport", "#476585");
    barColorMap.set("Packaging", "#8e6994");
    barColorMap.set("Retail", "#A78683");

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
      .attr("id", function (d) { return "dropdown-" + d; })
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

    // Create the color map
    var color = d3.scaleOrdinal()
      .range(["#c5596e", "#52b79c", "#b7d175", "#4d8993", "#476585", "#8e6994", "#A78683"])
      .domain(subgroups);

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups)
      (data);
  
    // TODO: make the tooltip follow the mouse
    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#agriculture_graph")
      .append("div")
      .style("opacity", 0)
      .attr("class", "ag-bar-tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "3px")
      .style("border-radius", "5px")
      .style("padding", "10px");
    
    // Show the tooltip on mouse over
    var mouseover = function(event, d) {
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
          .style("left", (event.pageX - 300) + "px")
          .style("top", (event.pageY - 1250) + "px");
    }

    var mousemove = function(event, d) {
      tooltip
          .style("left", (event.pageX - 300) + "px")
          .style("top", (event.pageY - 1250) + "px");
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
    updateBarGraph("No_Diet", false, "Total");

    // Updates the bar graph based on the diet filter
    // and selected sorting method
    function updateBarGraph(dietName, doTransition, sortCategory) {
      // Update the subtitle beneath the graph based on what we are sorting
      for (var i = 1; i < allSubGroups.length; i++) {
        // Display everything if total is selected
        if (sortCategory == "Total") {
          // Make everything not bold
          document.getElementById(allSubGroups[i]).style.fontWeight = "10";
          if (subgroupMap.get(allSubGroups[i]) == 1) {
            document.getElementById(allSubGroups[i]).style.display = "block";
          } else {
            document.getElementById(allSubGroups[i]).style.display = "none";
          }
        } else {
          // Display the subtitle text
          if (subgroupMap.get(allSubGroups[i]) == 1) {
            document.getElementById(allSubGroups[i]).style.display = "block";
            if (sortCategory == allSubGroups[i]) {
              document.getElementById(allSubGroups[i]).style.fontWeight = "800";
            } else {
              document.getElementById(allSubGroups[i]).style.fontWeight = "10";
            }
          } else { // Don't display the subtitle text 
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
    
      barGroup.exit().remove();

      barGroup.enter().append("g")
        .classed("layer", true);

      // Update the color of the bar chart
      svg.selectAll("g.layer").attr("fill", function(d) { 
        return barColorMap.get(d.key);
      });

      // Show the bars
      var bars = svg.selectAll("g.layer").selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d, e => e.data.Food_Product);

      bars.exit().remove();
      
      // If we want the sorting animation to happen then do the transition
      if (doTransition) {
        bars.enter().append("rect")
        .attr("width", 16)// TODO: doesnt work well
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
        .attr("width", 16) // TODO: doesnt work well
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
        .on('mousemove', mousemove)
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
        .on("click", function(e, d) { legendClicked(d); })
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
        .on("click", function(e, d) { legendClicked(d); })
    
    // Update the legend and graph when it is clicked
    function legendClicked(subCategoryClicked) {
      // Update the map to toggle the category clicked
      if (subgroupMap.get(subCategoryClicked) == 1) {
        // Toggle off the sub group
        subgroupMap.set(subCategoryClicked, 0);
      } else {
        // Toggle on the sub group
        subgroupMap.set(subCategoryClicked, 1);
      }
      // Update the legend title colors
      legendTitles.style("fill", function(d) {
        var currSubCategory = d;
        // If the subcategory is selected in the legend
        if (subgroupMap.get(currSubCategory) == 1) {
          return("black");
        }
        return("#ccc");   
      });

      // Update the legend square colors
      legendSquares.style("fill", function(d) { 
        var currSubCategory = d;
        // If the subcategory is selected in the legend
        if (subgroupMap.get(currSubCategory) == 1) {
          return color(d);
          //return(colorMap.get(d.key));
        }
        return("#ccc");   
      });

      // Get the sort selected in the drop down
      var selectedSort = d3.select("#dropdown-select").property("value");
      var selectedSortIsFilteredOut = false;
      // Update the subgroup list
      subgroups = [];
      // Loop through the map
      for (let [key, value] of subgroupMap) {
        var dropdownID = "dropdown-" + key;
        // Add the sub group to the list if it needs to be displayed
        if (value == 1) {
          subgroups.push(key);
          // Make the subcategory shown in the dropdown
          document.getElementById(dropdownID).style.display = "block";
        } else {
          // Hide the subcategory from the dropdown
          document.getElementById(dropdownID).style.display = "none";
          // If the selected sort is being filtered out
          if (selectedSort == key) {
            selectedSortIsFilteredOut = true;
          }
        }
      }
      
      // Update the .csv files with the new total values
      updateCSVTotals(subgroups);

      // Change the dropdown selected to be Total
      if (selectedSortIsFilteredOut) {
        // Select total to be the selected drop down element
        let element = document.getElementById("dropdown-select");
        element.value = "Total";
        // Sort the graph based on the total
        onchangeUpdateGraph(true, "Total");
      } else { // Keep the same sort
        onchangeUpdateGraph(true, d3.select("#dropdown-select").property("value"));
      }    
    }

    // Update the csv Total column with the new totals
    // based on the current sub groups filtered
    function updateCSVTotals(currSubGroups) { 
      data.forEach(function(d) {
        var newTotal = 0;
        // Get the total based on what is filtered in the legend
        for (var i = 0; i < currSubGroups.length; i++) {
          newTotal += parseFloat(d[currSubGroups[i]]); 
        }
        // Make update the total in the data
        d.Total = Math.round(newTotal * 100) / 100;
      });
    }
    

      /////////////////////////////////////////
      // On change event for dropdown sorting//
      /////////////////////////////////////////

      // TODO: checked is not working
      // Listen for when the dropdown is updated
      d3.select("#dropdown-select").on("change", function(d) {
        onchangeUpdateGraph(true, d3.select("#dropdown-select").property("value"));
      })

      // Update the graph based on sorting and radio button clicked
      function onchangeUpdateGraph(doTransition, sortCategory) {
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
        updateBarGraph(selectedDiet, doTransition, sortCategory);
      }


      ////////////////////////////////
      // On change events for diets //
      ////////////////////////////////

      // Filter the graph to show omnivorous foods only
      d3.select("#no-diet").on("change", function(d) {
        updateBarGraph("No_Diet", true, d3.select("#dropdown-select").property("value"));
      })

      // Filter the graph to show pescatarian foods only
      d3.select("#pescatarian").on("change", function(d) {
        updateBarGraph("Pescatarian", true, d3.select("#dropdown-select").property("value"));
      })

      // Filter the graph to show vegetarian foods only
      d3.select("#vegetarian").on("change", function(d) {
        updateBarGraph("Vegetarian", true, d3.select("#dropdown-select").property("value"));
      })

      // Filter the graph to show vegan foods only
      d3.select("#vegan").on("change", function(d) {
        updateBarGraph("Vegan", true, d3.select("#dropdown-select").property("value"));
      })
   })
})
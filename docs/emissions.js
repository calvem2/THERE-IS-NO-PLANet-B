// Set the dimensions and margins of the graph
let margin = {top: 0, right: 200, bottom: 10, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    nodeWidth = 45;

// Format variables
let formatNumber = d3.format(",.1f"); // zero decimal places
let format = function(d) { return formatNumber(d); };
let sectorColor = d3.scaleOrdinal(["#C25067", "#48AD92", "#4D6D8F", "#946D69"]);
let subSectorColor = d3.scaleOrdinal(["#000", "#cd6476", "#d87885", "#e28c94", "#ec9fa4", "#f6b3b4", "#ffc6c4",
                                        "#61b795", "#76c097", "#8aca9a", "#9dd49c", "#afde9e", "#c1e8a1", "#d3f2a3",
                                        "#89a8cd", "#caeaff",
                                        "#b38476", "#d39c83"]);

// function to color nodes based on sector/sub-sector
function color(node) {
    if (node["sub-sector"] !== undefined) {
        return subSectorColor(node["sub-sector"]);
    } else if (node["sector"] !== undefined) {
        return sectorColor(node.sector)
    }
    return "#a9a9a9";
}
// Clear tooltips on click for chart
d3.select("#emissions-chart")
    .on("click", function() {
        d3.selectAll(".node-tooltip").style("display", "none");
        description.text("");
    });

// Append the svg object to the body of the page
let svg = d3.select("#emissions-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
let sankey = d3.sankey()
    .nodeWidth(nodeWidth)
    .nodePadding(15)
    .nodeAlign(d3.sankeyLeft)
    .size([width, height])
    .nodeSort(null);

// Add description
let description = d3.selectAll("#emissions")
    .append("p")
    .attr("id", "sector-description");

// Append subtitle
d3.selectAll("#emissions")
    .append("p")
    .attr("class", "subtitle")
    .text("Explore the breakdown of emission by hovering over sectors. Click on a sector to view its percentage of total emissions.");

// Append subtitle for data info
d3.selectAll("#emissions")
    .append("p")
    .attr("class", "subtitle")
    .html("<a href='https://www.climatewatchdata.org/ghg-emissions'>Source</a>: Climate Watch and the World Resources Institute's breakdown of global emissions by sector.");

// Load data and draw diagram
d3.json("Global-GHG-Emissions.json").then(function(ghgData) {
    // Set color domains
    sectorColor.domain(_.keys(_.countBy(ghgData.nodes, function(nodes) { return nodes["sector"]; })));
    subSectorColor.domain(_.keys(_.countBy(ghgData.nodes, function(nodes) { return nodes["sub-sector"]})));

    // Load nodes and links from data into sankey diagram
    let graph = sankey(ghgData);

    // Add the links
    let links = svg.append("g").selectAll("link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("id", d => "link-" + d.index)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke-opacity", 0)
        .attr("stroke", d => color(d.target))
        .attr("stroke-width", d => Math.max(1, d.width))
        .sort(function(a, b) { return b.dy - a.dy; });


    // Animate links
    new ScrollMagic.Scene({
            triggerElement: '#emissions',
            triggerHook: 0.5,
            duration: "80%", // hide 10% before exiting view (80% + 10% from bottom)
            offset: 50, // move trigger to center of element
            reverse: false
        })
        .on('enter', (e) => {
            // if (e.scrollDirection == "FORWARD" && startpin.progress() < 0.37) {
                d3.selectAll(".link").each(function(d, i) {
                    var pathLength = d3.select("#link-" + i).node().getTotalLength();
                    if (i >= 33) {
                        d3.selectAll("#link-" + i)
                            .attr("stroke-dasharray", pathLength + " " + pathLength)
                            .attr("stroke-dashoffset", pathLength)
                            .attr("stroke-opacity", .4)
                            .transition("sankey")
                            .delay(500)
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                    } else if (i <= 16) {
                        d3.selectAll("#link-" + i)
                            .attr("stroke-dasharray", pathLength + " " + pathLength)
                            .attr("stroke-dashoffset", pathLength)
                            .attr("stroke-opacity", .4)
                            .transition("sankey")
                            .delay(1500)
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                    } else {
                        d3.selectAll("#link-" + i)
                            .attr("stroke-dasharray", pathLength + " " + pathLength)
                            .attr("stroke-dashoffset", pathLength)
                            .attr("stroke-opacity", .4)
                            .transition("sankey")
                            .delay(2500)
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                    }
                })
            // }
        })
        .addTo(controller);

    // Add nodes
    let nodes = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("id", d => "node" + d.node)
        .attr("cursor", "pointer")
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode);

    // Add extra rectangle to expand hover zone for small nodes
    nodes.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 - 5)
        .attr("height", 12)
        .attr("width", nodeWidth)
        .attr("cursor", "pointer")
        .style("opacity", 0)
        .attr("stroke", "none");

    // Add the rectangles for the nodes
    nodes.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", nodeWidth)
        .style("fill", d => color(d))
        .attr("stroke", d => color(d))
        .on("click", clickNode);

    // Add title for the nodes
    nodes.append("text")
        .attr("x", d => d.x1 + 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("class", "node-label")
        .attr("font-weight", "normal")
        .style("cursor", "pointer")
        .text(d => d.name)
        .on("click", clickNode);

    // Add tooltips
    svg.append("g").selectAll(".node-tooltip")
        .data(graph.nodes)
        .enter()
        .append("foreignObject")
        .attr("x", d => d.x1 + 6)
        .attr("y", function(d) {
            return Math.min((d.y1 + d.y0) / 2, 475);
        })
        .attr("class", "node-tooltip")
        .attr("id", function(d) {
            return "tooltip" + d.node;
        })
        .attr("height", "125px")
        .attr("width", "125px")
        .on("mouseover", function(event, d) {
            mouseoverNode(event, d);
            this.style.display = "block";
        })
        .on("mouseout", mouseoutNode)
        .style("border-color", d => color(d))
        .style("display", "none")
        .html(function(d) {
            return "<div>" +
                    "<p class='tooltip-title'>" + d.name.toUpperCase() + "</p>" +
                    `<p class='tooltip-value' style='color:${color(d)}'>`+ format(d.value) + "%</p>" +
                    "<p class='tooltip-value-subtitle'>of Total Global GHG Emissions</p>"  +
                    "</div>";
        });

    // Add mouseover functionality to nodes
    function mouseoverNode(event, d) {
        // get this node
        let node;
        let nodeId = "node";
        if (event["path"][1].className.baseVal === "node") {
            node = event["path"][1]["__data__"];
        } else {
            for (let i = 0; i < event["path"].length; i++) {
                if (event["path"][i].id.startsWith("tooltip")) {
                    nodeId += event["path"][i].id.slice(7);
                    break;
                }
            }
            node = document.getElementById(nodeId)["__data__"];
        }

        // Transition all links to be more transparent
        d3.selectAll(".link")
            .transition()
            .duration(300)
            .attr("stroke-opacity", .05);
            // .attr("stroke", "#000");

        // Highlight label if not total emission node
        if (this.id !== "node37") {
            d3.select("#" + this.id + " .node-label")
                .attr("font-weight", "bold");
        }

        description.text(d.info);

        // Highlight all links for this node
        highlightLinks(node.sourceLinks, "sourceLinks");
        highlightLinks(node.targetLinks, "targetLinks");
    }

    // Helper function to recursively highlight all parent/child links on mouseover
    function highlightLinks(links, type) {
        if (links === undefined) {
            return;
        }
        // Highlight each link and the links of all its parent or child links
        for (let i = 0; i < links.length; i++) {
            d3.selectAll("#link-" + links[i].index)
                .transition()
                .duration(500)
                .attr("stroke-opacity", .4);
            if (type === "sourceLinks") {
                highlightLinks(links[i].target.sourceLinks, "sourceLinks");
            } else {
                highlightLinks(links[i].source.targetLinks, "targetLinks")
            }
        }
    }

    // Reset diagram on node mouseout
    function mouseoutNode() {
        // Reset link opacity
        d3.selectAll(".link")
            .transition()
            .duration(300)
            .attr("stroke-opacity", .4)

        // Reset font weight
        d3.select("#" + this.id + " .node-label")
            .attr("font-weight", "normal");

        // Hide tooltips
        d3.selectAll(".node-tooltip")
            .style("display", "none");

        // Update sector description
        description.text("");
    }

    // Show and hide tooltip on click
    function clickNode(event, d) {
        // Get correct tooltip object
        let node = event.path[1].id.slice(4);
        let display = event.path[3].children[2].children[parseInt(node)].style.display;

        // Update sector description
        description.text((display === "none") ? d.info : "");

        // Hide all other tooltips
        d3.selectAll(".node-tooltip")
            .style("display", "none");

        // Toggle display of tooltip
        event.path[3].children[2].children[parseInt(node)].style.display = (display === "none") ? "block" : "none";

        event.stopPropagation();
    }

});
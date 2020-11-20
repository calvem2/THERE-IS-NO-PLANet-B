// Set the dimensions and margins of the graph
var margin = {top: 0, right: 200, bottom: 10, left: 0},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// Format variables
var formatNumber = d3.format(",.2f"); // zero decimal places
var format = function(d) { return formatNumber(d); };
var sectorColor = d3.scaleOrdinal(["#C25067", "#48AD92", "#4D6D8F", "#946D69"]);
var subSectorColor = d3.scaleOrdinal(["#000", "#cd6476", "#d87885", "#e28c94", "#ec9fa4", "#f6b3b4", "#ffc6c4",
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


// Append the svg object to the body of the page
var svg = d3.select("#overview-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .nodeAlign(d3.sankeyLeft)
    .size([width, height])
    .nodeSort(null);

// Load data and draw diagram
d3.json("Global-GHG-Emissions.json").then(function(ghgData) {
    // Set color domains
    sectorColor.domain(_.keys(_.countBy(ghgData.nodes, function(nodes) { return nodes["sector"]; })));
    subSectorColor.domain(_.keys(_.countBy(ghgData.nodes, function(nodes) { return nodes["sub-sector"]})));

    // Load nodes and links from data into sankey diagram
    var graph = sankey(ghgData);

    // Add the links
    var links = svg.append("g").selectAll("link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke-opacity", .2)
        .attr("stroke", d => color(d.target))
        .attr("stroke-width", d => Math.max(1, d.width));

    // Add link titles
    links.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value); });

    // Add nodes
    var nodes = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node");

    // Add the rectangles for the nodes
    nodes.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", d => color(d))
        .attr("stroke", d => color(d))
        .append("title")
        .text(function(d) {
            return d.name + "\n" + format(d.value); });

    // Add title for the nodes
    nodes.append("text")
        .attr("x", d => d.x1 + 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.name)
        // .filter(d => d.x0 < width / 2)
        // .attr("x", d => d.x1 + 6)
        // .attr("text-anchor", "start");
});
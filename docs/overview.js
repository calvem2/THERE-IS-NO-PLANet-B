// Set the dimensions and margins of the graph
var margin = {top: 0, right: 200, bottom: 10, left: 0},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    nodeWidth = 45;

// Format variables
var formatNumber = d3.format(",.1f"); // zero decimal places
var format = function(d) { return formatNumber(d); };
var sectorColor = d3.scaleOrdinal(["#C25067", "#48AD92", "#4D6D8F", "#946D69"]);
var subSectorColor = d3.scaleOrdinal(["#000", "#cd6476", "#d87885", "#e28c94", "#ec9fa4", "#f6b3b4", "#ffc6c4",
                                        "#61b795", "#76c097", "#8aca9a", "#9dd49c", "#afde9e", "#c1e8a1", "#d3f2a3",
                                        "#89a8cd", "#caeaff",
                                        "#b38476", "#d39c83"]);

// Sections for sector details
var sections = [{name: "Agriculture, Forestry & Land Use", id:"#agriculture"},
                {name: "Transport", id:"#transportation"},
                {name: "Buildings", id:"#building-energy"}]

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
    .nodeWidth(nodeWidth)
    .nodePadding(15)
    .nodeAlign(d3.sankeyLeft)
    .size([width, height])
    .nodeSort(null);

// Append tooltip
var div = d3.select("#overview-chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Append subtitle
d3.selectAll("#overview")
    .append("p")
    .attr("class", "subtitle")
    .text("Explore emission sectors by hovering over them. Click sector nodes with ** to explore more in depth.");

// Append subtitle for data info
d3.selectAll("#overview")
    .append("p")
    .attr("class", "subtitle")
    .text("Source: Climate Watch and the World Resources Institute's  latest breakdown of global emissions by sector.");

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
        .attr("id", d => "link-" + d.index)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke-opacity", .4)
        .attr("stroke", d => color(d.target))
        // .attr("stroke", "#000")
        .attr("stroke-width", d => Math.max(1, d.width))
        .sort(function(a, b) { return b.dy - a.dy; });

    // Add nodes
    var nodes = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("id", d => "node" + d.node)
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode);

    // Add extra rectangle to expand hover zone for small nodes
    nodes.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 - 5)
        .attr("height", 12)
        .attr("width", sankey.nodeWidth())
        .style("opacity", 0)
        .attr("stroke", "none");

    // Add the rectangles for the nodes
    nodes.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", d => color(d))
        .attr("stroke", d => color(d))
        .on("click", function(event, d) {
            if (_.some(sections, function(sections) { return sections.name === d.name; })) {
                var sectionId = _.find(sections, function (sections) { return sections.name === d.name}).id;
                document.location.href = document.location.href.toString().split("#")[0] + sectionId;
            }
        });
        // .attr("id", d => "node" + d.node)

    // Add title for the nodes
    nodes.append("text")
        .attr("x", d => d.x1 + 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("class", "label")
        .style("cursor", "default")
        .text(function(d) {
            return _.some(sections, function(sections) { return sections.name === d.name; }) ? d.name + "**" : d.name;
        })
        // .append("tspan")
        // .text('**')
        // .filter(d => d.x0 < width / 2)
        // .attr("x", d => d.x1 + 6)
        // .attr("text-anchor", "start");

    // Add mouseover functionality to nodes
    function mouseoverNode(event, d) {
        // get this node
        var node = event["path"][1]["__data__"];
        // var node = event["path"][1];

        updateTooltip(event, d);

        // Transition all links to be more transparent
        d3.selectAll(".link")
            .transition()
            .duration(300)
            .attr("stroke-opacity", .05);
            // .attr("stroke", "#000");

        // Highlight label if not total emission node
        if (this.id !== "node37") {
            d3.select("#" + this.id + " .label")
                .attr("font-weight", "bold");
        }

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
        for (var i = 0; i < links.length; i++) {
            d3.selectAll("#link-" + links[i].index)
                .transition()
                .duration(500)
                .attr("stroke-opacity", .4)
                // .attr("stroke", d => color(d.target));
            if (type === "sourceLinks") {
                highlightLinks(links[i].target.sourceLinks, "sourceLinks");
            } else {
                highlightLinks(links[i].source.targetLinks, "targetLinks")
            }
        }
    }

    // Reset diagram on node mouseout
    function mouseoutNode() {
        // Fade tooltip
        div.transition()
            .duration(200)
            .style("opacity", 0);

        // Reset link opacity
        d3.selectAll(".link")
            .transition()
            .duration(300)
            // .attr("stroke", "#000")
            // .attr("stroke", d => color(d.target))
            .attr("stroke-opacity", .4)

        // Reset font weight
        d3.select("#" + this.id + " .label")
            .attr("font-weight", "normal");
    }

    function updateTooltip(event, d) {
        // get svg container for positioning
        // var container = event["path"][0].getBoundingClientRect();
        var container = document.querySelector("#overview-chart svg").getBoundingClientRect();

        // Add tooltip
        var tooltipColor = color(d);
        div.transition()
            .duration(200)
            .style("opacity", 1)
            // .style("border", "5px")
            .style("border-color", tooltipColor)
            // .attr("stroke-width", 5);

        // Create tooltip text
        var tooltipText = "<p class='tooltip-title'>" + d.name.toUpperCase() + "</p>" +
            `<p class='tooltip-value' style='color:${tooltipColor}'>`+ format(d.value) + "%</p>" +
            "<p class='tooltip-value-subtitle'>of Total Global GHG Emissions</p>" +
            "<p class='tooltip-info'>"+ d.info + "</p>";

        // Add more info section to text if appropriate
        if (_.some(sections, function(sections) { return sections.name === d.name; })) {
            tooltipText += "<p class='more-details'>for more details, click on the node</p>";
        }

        // Set tooltip text and location
        div.html(tooltipText)
            .style("left", container.left + "px")
            .style("top", container.top + container.height - 150 + "px");
            // .style("left", (container.x + nodeWidth + 5) + "px")
            // .style("top", event.pageY + "px");
    }

});
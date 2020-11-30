// Set the dimensions and margins of the graph
let margin = {top: 0, right: 200, bottom: 10, left: 0},
    width = 1100 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    nodeWidth = 45;

// Format variables
let formatNumber = d3.format(",.1f"); // zero decimal places
let format = function(d) { return formatNumber(d); };
let sectorColor = d3.scaleOrdinal(["#C25067", "#48AD92", "#4D6D8F", "#946D69"]);
let subSectorColor = d3.scaleOrdinal(["#000", "#cd6476", "#d87885", "#e28c94", "#ec9fa4", "#f6b3b4", "#ffc6c4",
                                        "#61b795", "#76c097", "#8aca9a", "#9dd49c", "#afde9e", "#c1e8a1", "#d3f2a3",
                                        "#89a8cd", "#caeaff",
                                        "#b38476", "#d39c83"]);

// Sections for sector details
// TODO: change to correct ids/nodes (idk what to link for agriculture -- link transport, agriculture, food production?)
let sections = [{name: "Agriculture, Forestry & Land Use", id:"#featured"},
                {name: "Transport", id:"#video"}];
                // {name: "Buildings", id:"#projects"}];

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
d3.select("#overview-chart")
    .on("click", function() {d3.selectAll(".node-tooltip").style("display", "none")});

// Append the svg object to the body of the page
let svg = d3.select("#overview-chart").append("svg")
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

// Append subtitle
d3.selectAll("#overview")
    .append("p")
    .attr("class", "subtitle")
    .text("Explore the breakdown of emission by hovering over sectors. Click sectors to view (and hide) more information.");

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
    let graph = sankey(ghgData);

    // Add the links
    let links = svg.append("g").selectAll("link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("id", d => "link-" + d.index)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke-opacity", .4)
        .attr("stroke", d => color(d.target))
        .attr("stroke-width", d => Math.max(1, d.width))
        .sort(function(a, b) { return b.dy - a.dy; });

    // Add nodes
    let nodes = svg.append("g").selectAll(".node")
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
        .attr("width", nodeWidth)
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
        .style("cursor", "default")
        .text(d => d.name)
        .on("click", clickNode);

    // Add tooltips
    let tooltips = svg.append("g").selectAll(".node-tooltip")
        .data(graph.nodes)
        .enter()
        .append("foreignObject")
        .attr("x", d => Math.min(d.x1 + 6, 925))
        .attr("y", function(d) {
            return d.x1 + 6 > 925 ? Math.min(d.y1 + 5, 650) : Math.min((d.y1 + d.y0) / 2, 650);
        })
        .attr("class", "node-tooltip")
        .attr("height", "150px")
        .attr("width", "275px")
        .style("border-color", d => color(d))
        .style("display", "none")
        .html(function(d) {
            let tooltipText = "";
            // Add link to corresponding section if it exists
            if (_.some(sections, function(sections) { return sections.name === d.name; })) {
                let sectionId = _.find(sections, function (sections) { return sections.name === d.name}).id;
                tooltipText += `<a class='tooltip-title' href="${document.location.href.toString().split('#')[0] + sectionId}">${d.name.toUpperCase()}</a>`;
            } else {
                tooltipText += "<a class='tooltip-title no-hover'>" + d.name.toUpperCase() + "</a>";
            }

            tooltipText += `<p class='tooltip-value' style='color:${color(d)}'>`+ format(d.value) + "%</p>" +
                            "<p class='tooltip-value-subtitle'>of Total Global GHG Emissions</p>" +
                            "<p class='tooltip-info'>"+ d.info + "</p>";
            return tooltipText;
        });

    // Add mouseover functionality to nodes
    function mouseoverNode(event, d) {
        // get this node
        let node = event["path"][1]["__data__"];

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
    }

    // Show and hide tooltip on click
    function clickNode(event, d) {
        // get correct tooltip object
        let node = event.path[1].id.slice(4);
        let display = event.path[3].children[2].children[parseInt(node)].style.display;
        // hide all other tooltips
        d3.selectAll(".node-tooltip")
            .style("display", "none");
        // toggle display of tooltip
        event.path[3].children[2].children[parseInt(node)].style.display = (display === "none") ? "block" : "none";
        event.stopPropagation();
    }

});
const url =
    "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const tooltip = d3
    .select(".main")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "hidden");

const h = 500;
const w = 700;
const padding = 30;

const svg = d3.select(".main").append("svg").attr("height", h).attr("width", w);

// Define the range of the scales
const xScale = d3.scaleLinear();
xScale.range([0, w - padding]);

const yScale = d3.scaleTime();
yScale.range([0, h - padding]);

// Define and format the axies values
const xAxis = d3.axisBottom(xScale);
xAxis.tickFormat(d3.format("d"));

const yAxis = d3.axisLeft(yScale);
yAxis.tickFormat(d3.timeFormat("%M:%S"));

// Append the legend group
const dopingLegend = svg.append("g").attr("id", "legend");

const noDoping = dopingLegend.append("g");
noDoping
    .append("rect")
    .attr("height", 25)
    .attr("width", 25)
    .attr("fill", "blue")
    .attr("fill-opacity", 0.5)
    .attr("y", -15);
noDoping.append("text").text("No Doping").attr("dx", 30);

const doping = dopingLegend.append("g");
doping
    .append("rect")
    .attr("height", 25)
    .attr("width", 25)
    .attr("fill", "red")
    .attr("fill-opacity", 0.5)
    .attr("y", 15);
doping.append("text").text("Doping").attr("dy", 30).attr("dx", 30);

d3.json(url).then((data) => {
    // Determine the domain for the yScale and xScale
    const yearsMin = d3.min(data, (ele) => ele.Year - 1);
    const yearsMax = d3.max(data, (ele) => ele.Year + 1);

    const parseTime = d3.timeParse("%s");
    const times = data.map((ele) => parseTime(ele.Seconds.toString()));

    const xDomain = [yearsMin, yearsMax];
    const yDomain = d3.extent(times);

    xScale.domain(xDomain);
    yScale.domain(yDomain);

    // Append axies to the svg
    svg.append("g")
        .attr("transform", `translate(0,${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .attr("id", "y-axis")
        .call(yAxis);

    // Append points/circles to the svg
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => d3.timeParse("%s")(d.Seconds.toString()))
        .attr("fill", (d) => (d.Doping.length > 0 ? "red" : "blue"))
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1)
        .attr("r", 0)
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(parseTime(d.Seconds)))
        .on("mouseover", (event, d) => {
            tooltip.classed("hidden", false);
            tooltip.html(`Name: ${d.Name}<br>
                          Nationality: ${d.Nationality}<br>
                          Year: ${d.Year}<br> 
                          Time: ${d.Time}
                          ${d.Doping && "<br><br>" + d.Doping}
                          `);

            tooltip.attr("data-year", event.target.dataset.xvalue);

            tooltip.style("top", event.pageY + "px");
            tooltip.style("left", event.pageX + "px");
        })
        .on("mouseout", () => tooltip.classed("hidden", true));

    // Add transition
    svg.selectAll("circle")
        .transition()
        .ease(d3.easePoly)
        .duration(600)
        .delay((d, i) => i * 30)
        .attr("r", 7);
});

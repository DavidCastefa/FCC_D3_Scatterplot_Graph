// Much of the JavaScript used in this project is based on Ganesh H's YouTube walkthrough
// at https://www.youtube.com/watch?v=OvtT4X2L9Fo

let dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
let req = new XMLHttpRequest

let rawData = []

let xScale
let yScale 

let height = window.innerHeight * 0.9;
let width = window.innerWidth * 0.92;
let padding = 70

let timeFormat = d3.timeFormat('%M:%S');

let svg = d3.select("svg")

let drawCanvas = () => {
  svg.style("margin-top", 10)
  svg.attr("height", height)
  svg.attr("width", width)
}

let generateScales = () => {
  xScale = d3.scaleLinear()
              // extend an extra year on both sides
             .domain([d3.min(rawData, item => item['Year']) - 1,  //item.Year also OK.
                d3.max(rawData, item => item['Year']) + 1])
             .range([padding, width - padding])

  yScale = d3.scaleTime()
              // extend an extra 20 seconds on both sides
             .domain([d3.min(rawData, item => new Date(item['Seconds'] * 1000 - 20000)),
                d3.max(rawData, item => new Date(item['Seconds'] * 1000 + 20000))])
             .range([height - padding, padding])
                                      
}

let generateAxes = () => {
  let xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
  svg.append("g")
     .attr("id", "x-axis")
     .call(xAxis)
     .attr("transform", "translate(0, " + (height - padding) + ")");
  svg.append('text')
     .attr('x', width / 2)
     .attr('y', height - 25)
     .style('font-size', 15)
     .text('Year');

  let yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat("%M:%S"))
  svg.append("g")
     .attr("id", "y-axis")
     .call(yAxis)
     .attr("transform", "translate(" + padding + ", 0)");
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -300)
    .attr('y', 20)
    .style('font-size', 15)
    .text('Best Time in Minutes');
} 

let drawDots = () => {

  let tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("opacity", 0)

  svg.selectAll("circle")
    .data(rawData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", item => xScale(item['Year']))
    .attr("cy", item => yScale(new Date(item['Seconds'] * 1000)))
    .attr("data-xvalue", item => item['Year'])
    .attr("data-yvalue", item => new Date(item['Seconds'] * 1000))
    .attr("fill", item => item['Doping'] == "" ? "green" : "red")

    .on("mouseover", (event, item) => {
      tooltip.style("opacity", 1)
             .attr("data-year", item['Year']) //item.Year also OK.
             .html(
               item.Name + " (" +   //Or, item['Year'] 
               item.Nationality + ")<br>Year: " +
               item.Year + "&nbsp;&nbsp;&nbsp;Time: " + 
               timeFormat(item.Seconds * 1000) +
               (item.Doping ? '<br/>' + item.Doping : '')
              )
             .style("position", "absolute")
             .style("left", (event.pageX + 6) + "px")
             .style("top", (event.pageY + 6) + "px")
      })
    .on("mouseleave", (event, item) => {
      tooltip.style("opacity", 0)
             .html("")  // Avoid interference with other dots
      })

  // Create legend
  svg.append('rect')
    .attr('x', width - 40)
    .attr('y', height - padding - 50)
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', "red");
  svg.append('text')
    .attr('id', 'legend')
    .attr('x', width - 185)
    .attr('y', height - padding - 37)
    .attr('fill', 'darkred')
    .style('font-size', 10)
    .text('Cyclists with doping allegations');
    svg.append('rect')
    .attr('x', width - 40)
    .attr('y', height - padding - 30)
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', "green");
  svg.append('text')
    .attr('id', 'legend')
    .attr('x', width - 142)
    .attr('y', height - padding - 17)
    .attr('fill', 'darkgreen')
    .style('font-size', 10)
    .text('No doping allegations');

}

req.open("GET", dataUrl, true)
req.onload = () => {
  rawData = JSON.parse(req.responseText)
  console.log(rawData)

  drawCanvas()
  generateScales()
  generateAxes()
  drawDots()
 }
req.send()
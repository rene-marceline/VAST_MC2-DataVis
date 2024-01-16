var carID;

import { drawClockChart } from "./clockTree.js";

let Day;

function clock_Listener() {
  const dropdown = document.querySelector('#date-dropdown');
  dropdown.addEventListener('change', ()=>{console.log('alalalalala'); drawClockChart(carID, Day)});

  const amToggle = document.querySelector('#AM-toggle');
  amToggle.addEventListener('change', ()=>{ drawClockChart(carID, Day)});

  const pmToggle = document.querySelector('#PM-toggle');
  pmToggle.addEventListener('change', ()=>{ drawClockChart(carID, Day)});
}
clock_Listener();

import { drawTrajectoryOnAbilaMap,drawStopsOnAbilaMap } from "./scatter.js";

let ganttmargin = {top: 15, bottom:80, left: 50, right:50};
let height, width;

const timeFormat = d3.timeFormat("%H:%M:%S");  

function Dateify(d_date){
    let parseTime = d3.timeParse("%m/%d/%Y");
    return parseTime(`${d_date}`);
}
  
function Timeify(d_date){
  let time = d_date.split(":").map(Number);
  return new Date(2023, 3, 18, time[0], time[1], 0);
}

let gantt_tooltip = d3.select("#ganttchartdiv")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("width", "300px")
                    .style("box-shadow", "0 0 5px #999999")
                    .style("background", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    .style("text-align", "center");

let gantt = d3.select('#ganttchartdiv');
let ganttdivwidth = gantt.style('width').replace('px', '');
let ganttdivheight = gantt.style('height').replace('px', '');
let ganttsvg = gantt.append("svg")
                    .attr("width", ganttdivwidth)
                    .attr("height", ganttdivheight)
                    .attr("class", "ganttsvgclass");

let ganttg = ganttsvg.append('g')
                    .attr('transform', `translate(${ganttmargin.left}, ${ganttmargin.top})`);

function drawGanttChart(iparray, selectedTimes, selectedDay, locname, selectedColor){
  ganttg.selectAll('*').remove();

  let start = selectedTimes.startTime;
  let end =   selectedTimes.endTime;

  // const timeFormat = d3.timeFormat("%H:%M:%S");  

  height = ganttdivheight - ganttmargin.bottom - ganttmargin.top;
  width = ganttdivwidth - ganttmargin.right - ganttmargin.left;

  let timescale = d3.scaleTime()
      .domain([Timeify(start), Timeify(end)])
      .range([0, width]);

  // create the time axis
  var timeAxis = d3.axisBottom(timescale)
    .tickFormat(d3.timeFormat("%H:%M"))
    .ticks(d3.timeHour.every(1));

  let taskscale = d3.scaleBand()
                    .domain(iparray.map(function(d){return d.id;}))
                    .range([height, 0])
                    .padding(0.1);
        
  let x_axis = ganttg.append('g')
                      .attr('transform', `translate(0, ${height})`)
                      .attr("class", "ganttxaxis")
                      .call(timeAxis)
                      .selectAll("text")
                      .attr("transform", "rotate(-45)")
                      .style("text-anchor", "end");
        
  let y_axis = ganttg.append('g')
                      .attr("class", "ganttyaxis")
                      .call(d3.axisLeft(taskscale));

  // Set yAxis Label
  ganttg
    .append("text")
    .attr("class", "y-axis-label")
    .attr('transform', 'translate('+ (0 - ganttmargin.left) + ',' + (height/2  + 10) + ')rotate(-90)')
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Car ID");

  // Set xAxis Label
  ganttg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(0)")
    .attr("x", width/2 - 10)
    .attr("y", ganttdivheight - 50)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Time (Day "+ selectedDay.getDate() +" - "+ locname +")");
        
  ganttg.selectAll(".ganttbar")
          .data(iparray)
          .enter()
          .append("line")
          .attr("class", "ganttbar")
          .classed("selected", false)
          .attr("x1", function(d){ return timescale(Timeify(timeFormat(d.Timestamp1))) })
          .attr("y1", function(d){ return taskscale(d.id) + taskscale.bandwidth()/2})
          .attr("x2", (d) => timescale(Timeify(timeFormat(d.Timestamp2))))
          .attr("y2", function(d){ return taskscale(d.id) + taskscale.bandwidth()/2})
          .attr('stroke',selectedColor)
          // .attr('stroke','#57C5B6')
          // .attr('opacity', 0.8)
          .attr('stroke-width',"7px")
          .on("mouseover", function (event, d) {
            if(d3.select(this).classed("selected") == false){
              d3.select(this)
                .transition()
                .duration(150)
                .style("stroke", "#1A5F7A")
                .style("stroke-width", "10px");
            }
      
            gantt_tooltip
              .style("visibility", "visible")
              .html(
                `Car ID: ${d.id}<br>
                 Arrival: ${timeFormat(d.Timestamp1)}<br>
                 Departure: ${timeFormat(d.Timestamp2)}<br>
                 Day: ${selectedDay.toDateString()}<br>
                 Location: ${locname}<br>`
              )
              .style("background-color", 'white');
          })
          .on("mousemove", function (event) {
            gantt_tooltip
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY + 10}px`);
          })
          .on("mouseleave", function () {
            if(d3.select(this).classed("selected") == false){
              d3.select(this)
                .transition()
                .duration(150)
                .style("opacity", 1)
                // .style("stroke", "#57C5B6")
                .style("stroke", selectedColor)
                .style("stroke-width", "7px");
            }
            gantt_tooltip.style("visibility", "hidden").style("opacity", 0.9);
          })
          .on("mousedown", function (event, d) {
            if (d3.select(this).classed("selected") == false) {
              d3.selectAll('line.ganttbar')
                .classed("selected", false)
                .style("opacity", 1)
                // .style("stroke", "#57C5B6")
                .style("stroke", selectedColor)
                .style("stroke-width", "7px");

              d3.select(this)
                .classed("selected", true)
                .style("stroke", "red")
                .style("opacity", 1)
                .style("stroke-width", "10px");
            } 
            // else {
            //   d3.select(this)
            //     .classed("selected", false)
            //     .style("opacity", 1)
            //     .style("stroke", "#57C5B6")
            //     .style("stroke-width", "3px");
            // }
          })
          .on("mouseup", function (event, d) {
            // console.log(d.id)
            carID = d.id;
            drawTrajectoryOnAbilaMap(d.id, selectedDay);
            drawStopsOnAbilaMap(d.id, selectedDay);
            drawClockChart(d.id, selectedDay);

            // drawLegend();
            // drawShopsOnAbilaMap();
          });

  

}

function drawCreditInfo(filteredCreditData, selectedShop, selectedDay, selectedTimes){

  let start = selectedTimes.startTime;
  let end = selectedTimes.endTime;

  let timescale = d3.scaleTime()
      .domain([Timeify(start), Timeify(end)])
      .range([0, width]);
  
  // filter filtered credit data by date and shop name

  const filteredCreditDatabyDate = filteredCreditData.filter(function(d) { 
    const date = d.timestamp;
    return date.getDate()==selectedDay.getDate(); });
  // console.log("filter cc data last day: ", selectedShop, filteredCreditDatabyDate);

  const filteredCreditDatabyShop = filteredCreditDatabyDate.filter(function(d) { return d.location == selectedShop });
  console.log("filter cc data by shop name: ", selectedShop, filteredCreditDatabyShop);
  
  ganttg.selectAll(".cardbar")
    .data(filteredCreditDatabyShop)
    .enter()
    .append("line")
    .attr("class", "cardbar")
    .classed("selected", false)
    .attr("x1", function(d){ return timescale(Timeify(d.time));})
    .attr("y1", function(d){ return  0})
    .attr("x2", function(d){ return  timescale(Timeify(d.time));})
    .attr("y2", function(d){ return  height})
    .attr('stroke','black')
    // .attr('stroke','#57C5B6')
    .attr('opacity', 0.3)
    .attr('stroke-width',"2px")
    .on("mouseover", function (event, d) {
      console.log("ddsjahskjdhdasg", d);
      if(d3.select(this).classed("selected") == false){
        d3.select(this)
          .transition()
          // .duration(150)
          .style("stroke", 'red')
          .attr('opacity', 0.8)
          .style("stroke-width", "3px");
      }
      gantt_tooltip
        .style("visibility", "visible")
        .style("width", "130px")
        .style("font-size", "12px")
        .html(
          `Card number: ${d.last4ccnum} <br>
           Time: ${d.time}<br>
           Amount: ${d.price}<br>`
        )
        .style("background-color", 'white');
    })
    .on("mousemove", function (event) {
      gantt_tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseleave", function () {
      if(d3.select(this).classed("selected") == false){
        d3.select(this)
          .transition()
          // .duration(150)
          // .style("opacity", 1)
          // .style("stroke", "#57C5B6")
          .style("stroke", 'black')
          .attr('opacity', 0.3)
          .style("stroke-width", "2px");
      }
      gantt_tooltip.style("visibility", "hidden").style("opacity", 0.9);
    })
    




}

export {drawGanttChart, drawCreditInfo};


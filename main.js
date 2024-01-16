//=============================================================================================================

// import { drawPointsOnAbilaMap } from "./abilamap.js";
import {drawGanttChart, drawCreditInfo} from './gantt.js';

// drawPointsOnAbilaMap();
// drawGanttChart();

import {drawGridmap, drawShopsOnAbilaMap,drawLegend} from "./scatter.js";
drawGridmap();
drawShopsOnAbilaMap();
drawLegend();

// import {drawClockChart} from './clockTree.js';
// clock_Listener();

import {drawPolarChart} from './polar.js';


//=============================================================================================================


//TASK1 CALENDAR, TIMESLIDER, BAR, HEAT
// Using just the credit and loyalty card data, identify the most popular locations, and when they are popular. What anomalies do you see? What corrections would you recommend to correct these anomalies?
var bar_svg;
var heatmap_svg;
var bar_tooltip;
var heatmap_tooltip;

var stat_cc;
var cc_processed;
var stat_loyal;
var stoppoints;

var selectedDates = [];
var selectedDay = [];
var selectedLocation = [];

var selectedColor = "#BF5FFF"; // will be used in Gantt chart
var selectedShop = "Brew've Been Served";

var selectedColor; // will be used in Gantt chart
// var selectedShop = "Brew've Been Served";

var selectedColor; // will be used in Gantt chart
// var selectedShop = "Brew've Been Served";


var selectedTimes = {
  startTime: "00:00:00",
  endTime: "23:59:59",
};

const timeStamp = [
  { day: "Mon", date: "06/01/2014" },
  { day: "Tue", date: "07/01/2014" },
  { day: "Wed", date: "08/01/2014" },
  { day: "Thu", date: "09/01/2014" },
  { day: "Fri", date: "10/01/2014" },
  { day: "Sat", date: "11/01/2014" },
  { day: "Sun", date: "12/01/2014" },
  { day: "Mon", date: "13/01/2014" },
  { day: "Tue", date: "14/01/2014" },
  { day: "Wed", date: "15/01/2014" },
  { day: "Thu", date: "16/01/2014" },
  { day: "Fri", date: "17/01/2014" },
  { day: "Sat", date: "18/01/2014" },
  { day: "Sun", date: "19/01/2014" },
];

var filteredCreditData;

document.addEventListener("DOMContentLoaded", function () {
  bar_svg = d3.select("#barChart_svg");
  heatmap_svg = d3.select('#heatmap_svg');
  Promise.all([
    d3.csv("data/stat_cc.csv"),
    d3.csv("data/cc_processed.csv"),
    d3.csv("data/stat_loyal.csv"),
    d3.csv("data/merged_stoppoints_shop_cards_empname_v2.csv"),
  ]).then(function (values) {
    // Data Importing
    stat_cc = values[0];
    cc_processed = values[1];
    stat_loyal = values[2];
    stoppoints = values[3];    

    // Data Processing
    stat_processing(stat_cc);
    cc_processing(cc_processed);
    stat_processing(stat_loyal);
    stoppoints_processing(stoppoints);
    
    // Draw a calendar
    drawCalendar();

    // Draw a timeSlider
    drawTimeSlider();

    // Add a tooltip element for the bar chart
    bar_tooltip = d3.select("#barchart")
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
    
    // add a tooltip for the heatmap
    heatmap_tooltip = d3.select("#heatmap")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("width", "275px")
      .style("box-shadow", "0 0 5px #999999")
      .style("background", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("text-align", "center");

    // Filter data based on initial date
    const filteredData = filterDayAndTime(
      selectedTimes.startTime,
      selectedTimes.endTime
    );

    // Draw an initial barchart
    BarChart_Listener();
    drawBar(filteredData);
    

    // Draw the heatmap
    drawHeatmap(filteredData);


    // Initial filter of credit card data
    filteredCreditData = filterDayAndTime(
      selectedTimes.startTime,
      selectedTimes.endTime
    );

    drawPolarChart(selectedLocation[selectedLocation.length-1]);

    // Draw credit card info in Gantt
    // console.log("Initial drawing credit data:", filteredCreditData)
    drawCreditInfo(filteredCreditData, selectedLocation[selectedDay.length-1], selectedDay[selectedDay.length-1], selectedTimes);


  });
});

// Data processing
function cc_processing(cc_processed) {
  cc_processed.forEach((d) => {
    for (var key in d) {
      if (key === "timestamp") {
        d.timestamp = d3.timeParse("%m/%d/%Y")(d.timestamp);
      } else if (key === "time") {
        d.time = d.time;
      } else if (key === "location") {
        d[key] = d[key];
      } else if (key === "purchase_type") {
        d[key] = d[key];
      } else {
        d[key] = +d[key];
      }
    }
  });
}

// Data processing
function stat_processing(stat_cc) {
  stat_cc.forEach((d) => {
    for (var key in d) {
      if (key === "purchase_type") {
        d[key] = d[key];
      } else {
        d[key] = +d[key];
      }
    }
  });
}
// Data processing
function stoppoints_processing(stoppoints) {
  stoppoints.forEach((d) => {
    d.Timestamp1 = d3.timeParse("%m/%d/%Y %H:%M:%S")(d.Timestamp1);
    d.Timestamp2 = d3.timeParse("%m/%d/%Y %H:%M:%S")(d.Timestamp2);
    d.id = +d.id;
    d.lat1 = +d.lat1; 
    d.lat2 = +d.lat2;
    d.lat_center = +d.lat_center; 
    d.long1 = +d.long1; 
    d.long2 = +d.long2;
    d.long_center = +d.long_center; 
    d.time_threshold = +d.time_threshold;
  });
}

function filterDay(selectedDates, data) {
  let dayfilteredData = data.filter(function (d) {
    return selectedDates.some(function (selectedDate) {
      return (
        selectedDate.toDateString() === new Date(d.timestamp).toDateString()
      );
    });
  });
  return dayfilteredData;
}

function filterSingleDay(selectedDay, data) {
  console.log('aaaaaaaaaaaaa',data[0]);
  return data.filter(function (d) {
    const date = new Date(d.Timestamp1);
    const dateString = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;

    const selected = `${
      selectedDay[selectedDay.length-1].getMonth() + 1
    }/${selectedDay[selectedDay.length-1].getDate()}/${selectedDay[selectedDay.length-1].getFullYear()}`;

    return dateString === selected;
  });
}

// Filtering data in terms of selected dates and time range
function filterDayAndTime(startTime, endTime) {
  startTime = selectedTimes.startTime;
  endTime = selectedTimes.endTime;

  startTime = startTime.split(":").map(Number);
  endTime = endTime.split(":").map(Number);

  startTime = startTime[0] * 60 + startTime[1]; // * 60 + startTime[2];
  endTime = endTime[0] * 60 + endTime[1]; // * 60 + endTime[2];

  let dayfilteredData = filterDay(selectedDates, cc_processed);

  let filteredData = dayfilteredData.filter(function (d) {
    let dataTime = d.time.split(":").map(Number);
    dataTime = dataTime[0] * 60 + dataTime[1];
    return dataTime >= startTime && dataTime <= endTime;
  });
  return filteredData;
}

// Filtering data in terms of selected dates and time range
function filterGPSDayTimeLoc(data, selectedDay, location, startTime, endTime) {

  startTime = selectedTimes.startTime;
  endTime = selectedTimes.endTime;

  startTime = startTime.split(":").map(Number);
  endTime = endTime.split(":").map(Number);

  startTime = startTime[0] * 60 + startTime[1]; //* 60 + startTime[2];
  endTime = endTime[0] * 60 + endTime[1]; //* 60 + endTime[2];

  let dayfilteredGPSData = filterSingleDay(selectedDay, data);

  let filteredGPSData = dayfilteredGPSData.filter(function (d) {
    const timeFormat = d3.timeFormat("%H:%M:%S");
    let start_dataTime = timeFormat(d.Timestamp1).split(":").map(Number);
    let end_dataTime = timeFormat(d.Timestamp2).split(":").map(Number);

    start_dataTime = start_dataTime[0] * 60 + start_dataTime[1];
    end_dataTime = end_dataTime[0] * 60 + end_dataTime[1];

    return start_dataTime >= startTime && end_dataTime <= endTime;
  });
  // console.log('ibefore loc', filteredGPSData)

  let filteredGPSData_loc = filteredGPSData.filter(function (d) {
    // console.log('loc', location)
    if(d.location == location){
    // console.log(d.location)
    }
    return d.location == location;
  });
  
  // console.log('after loc', filteredGPSData_loc)
  
  return filteredGPSData_loc;
}

// Draw an interactive Calendar and set initial date (6th)
function drawCalendar() {
  const days = [
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const table = d3.select("#calendar");
  const header = table.append("thead");
  const body = table.append("tbody");

  timeStamp.forEach((d) => {
    for (var key in d) {
      if (key == "date") {
        d.date = d3.timeParse("%d/%m/%Y")(d.date);
      }
    }
  });

  header
    .append("tr")
    .selectAll("td")
    .data(dayNames)
    .enter()
    .append("td")
    .style("text-align", "center")
    .style('padding', '10px')
    .style('text-align', 'center')
    .text((d) => d);

  days.forEach((day) => {
    body
      .append("tr")
      .selectAll("td")
      .data(day)
      .enter()
      .append("td")
      .attr('id', d => ('day'+ d)) 
      .style('text-align', 'center')
      .attr("class", function (d) {
        return d > 0 ? "" : "empty";
      })
      .text(function (d) {
        return d > 0 ? d : "";
      })
      .on("mousedown", function (d, i) {
        const dateString = timeStamp[i - 6].date;
        const index = selectedDates.indexOf(dateString);
        d3.selectAll("td").style("border", "");
        if (index === -1) {
          selectedDates.push(dateString);
          selectedDay.push(dateString);

          d3.select(this).classed("selected", true);
          d3.select(this).style("border", "2px solid red");
        } else {
          selectedDates.splice(index, 1);
          selectedDay.splice(index, 1);
          
          d3.select(this).classed("selected", false);
          d3.select(this).style("border", "");

          if (selectedDay.length > 0) {
            d3.select('#day' + selectedDay[selectedDay.length-1].getDate()).style("border", "2px solid red");
          }
        }
      })
      .on('mouseup', function(d,i){
        filteredCreditData = filterDayAndTime(
          selectedTimes.startTime,
          selectedTimes.endTime
        );

        update_Charts(filteredCreditData);
      });
  });

  //initial date
  selectedDates.push(timeStamp[0].date);
  d3.select('#day6').classed("selected", true);
  d3.select('#day6').style("border", "2px solid red");

  selectedDay.push(timeStamp[0].date);
}

// draw a timeSlider
function drawTimeSlider() {
  const rangeMin = 0;
  const rangeMax = 1439; 
  const range = document.querySelector(".timerange-selected");
  const rangeInput = document.querySelectorAll(".timerange-input input");
  rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let minRange = parseInt(rangeInput[0].value);
      let maxRange = parseInt(rangeInput[1].value);
      if (maxRange - minRange < rangeMin) {
        if (e.target.className === "timestart") {
          rangeInput[0].value = maxRange - rangeMin;
        } else {
          rangeInput[1].value = minRange + rangeMin;
        }
      } else {
        range.style.left = ((minRange) / rangeMax) * 100 + '%';
        range.style.right = 100 - ((maxRange) / rangeMax) * 100 + "%";
      }
      const startTimeInMinutes = minRange;
      const endTimeInMinutes = maxRange;

      const formatTime = (timeInMinutes) => {
        const hours = Math.floor(timeInMinutes / 60);
        const minutes = timeInMinutes % 60;
        const paddedHours = hours.toString().padStart(2, "0");
        const paddedMinutes = minutes.toString().padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}`;
      };

      const startTime = formatTime(startTimeInMinutes);
      const endTime = formatTime(endTimeInMinutes);
      selectedTimes.startTime = startTime;
      selectedTimes.endTime = endTime;
      showTime();
    });

    input.addEventListener("mouseup", (e) => {
      filteredCreditData = filterDayAndTime(
        selectedTimes.startTime,
        selectedTimes.endTime
      );
    
      update_Charts(filteredCreditData);
    });
  });
}

// Showing start and end times, update seleted time to sohamTimeStamp in the form of JS Object
function showTime() {
  var startTime = selectedTimes.startTime;
  var endTime = selectedTimes.endTime;

  const start = startTime.split(":").map(Number);
  const end = endTime.split(":").map(Number);

  const selectedTimeElement = document.getElementById("selected-time");
  let paddedStartH = start[0].toString().padStart(2,"0")
  let paddedStartM = start[1].toString().padStart(2,"0")
  let paddedEndH = end[0].toString().padStart(2,"0")
  let paddedEndM = end[1].toString().padStart(2,"0")
  selectedTimeElement.innerHTML = `${paddedStartH}:${paddedStartM} - ${paddedEndH}:${paddedEndM}`;
}

// Draw a barchart and handle outputs for Task2
function drawBar(data) {
  selectedLocation = [];

// Set the colors and shapes for each location type
  const locationColors = {
    coffee: "#BF5FFF",
    restaurant: "#ffb54d",
    gas: "#e7ef5d",
    golf: "#66e066",
    hotel: "#5ca6e0",
    industrial: "#8e8e8e",
    museum: "#f9f4e4",
    store: "#007FFF",
    supply: "#4ad6e6"
  };

  var groupedByLocation = Array.from(d3.group(data, function(d) { return d.location; }));
  
  var barChart_data = groupedByLocation.map(function(d) {
    var features = {'location': d[0], 'purchase_type':d[1][0].purchase_type, 'num_purchases': d[1].length,'num_visted_people': 0, 'total_purchases': 0};

    d[1].forEach(function(e) {
      features.total_purchases += e.price; 
      features.num_visted_people += e.rounded;      
    });

    return  features;
  });

  // Select the svg element and remove it
  bar_svg.selectAll('*').remove();

  let dropDown = d3.select("#bar-dropdown").property('value');

  let barChart_div = d3.select("#barchart");
  let width = barChart_div.style('width').replace('px', '');
  let height = barChart_div.style('height').replace('px', '');

  bar_svg
    .style("width", `${width}px`)
    .style("height", `${height}px`);

  // Set the dimensions of the bar chart
  var margin = { top: 30, right: 120, bottom: 190, left: 60 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // Create the chart container
  var chart = bar_svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Data Filtering

  // Set the x-axis scale and label
  var xScale = d3
    .scaleBand()
    .range([0, width])
    .domain( groupedByLocation.map(function (d) { return d[0]; }))
    .padding(0.1);

  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Set the y-axis scale and label
  var yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(barChart_data, function (d) { 
      if (dropDown == "Number of Visited People") {
        return d.num_visted_people;
      } else if(dropDown == "Transaction Count") {
        return d.num_purchases;
      } else{
        return  d.total_purchases
      }
    })]);

  chart.append("g").call(d3.axisLeft(yScale));

  // Filtering Dates & Times Data

 // Three function that change the heatmap_tooltip when user hover / move / leave a cell
 const mouseover = function(event, d) {
    bar_tooltip.style("visibility", "visible");
    if (d3.select(this).classed("selected") == false){
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
    }
  }
  const mousemove = function(event, d) {
    bar_tooltip
      .html(
        `location: ${d.location}<br>
        Category: ${d.purchase_type}<br>
        Average Price: $${Math.round(d.total_purchases / d.num_visted_people)}<br>
        Number of purchases: ${d.num_purchases}<br>
        Estimation of number of people: ${d.num_visted_people}<br>
        Total transaction amount: $${Math.round(d.total_purchases)}<br>`
      )
      .style("background-color", locationColors[d.purchase_type])
      .style("left", event.layerX + 10 + "px")
      .style("top", event.layerY + 10 + "px");
  }
  const mouseleave = function(event, d) {
    bar_tooltip.style("visibility", "hidden");
    if (d3.select(this).classed("selected") == false){
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);
    }
  }

  const mousedown = function(event, d) {
    d3.selectAll('rect')
      .classed("selected", false)
      .style("stroke", "none")
      .style("opacity", 0.8);
    
    const index = selectedLocation.indexOf(d.location);
    
    if (index === -1) {
      selectedLocation.push(d.location);
      d3.select(this)
        .classed("selected", true)
        .style("stroke", "red")
        .style("opacity", 1);
    } else {
      selectedLocation.splice(index, 1);
      d3.select(this)
        .classed("selected", false)
        .style("stroke", "black");
  
      if (selectedLocation.length > 0) {
        d3.select('#location' + selectedLocation[selectedLocation.length-1].replace(/[^a-zA-Z]+/g, ""))
          .classed("selected", true)
          .style("stroke", "red")
          .style("opacity", 1);
      }
    }
  }

  const mouseup =  function(d,i){
    // to set color of gantt chart
    selectedColor = d.target.attributes.fill.value
    // selectedShop = d.target.__data__.location
    Run_Task2();

    //when choose shop, filter credit data by currently selectedTime.
    filteredCreditData = filterDayAndTime(
      selectedTimes.startTime,
      selectedTimes.endTime
    );
    // console.log("Choose shop on chart1:", filteredCreditData)
    drawCreditInfo(filteredCreditData, selectedLocation[selectedLocation.length-1], selectedDay[selectedDay.length-1], selectedTimes);
    drawPolarChart(selectedLocation[selectedLocation.length-1]);
  }
 
  // Create the bars
  chart
    .selectAll(".bar")
    .data(barChart_data)
    .enter()
    .append("rect")
    .attr('id', d => 'location' + d.location.replace(/[^a-zA-Z]+/g, "")) 
    .classed("selected", false)
    .style("opacity", 0.8)
    .attr("x", function (d) {
      return xScale(d.location);
    })
    .attr("y", function (d) {
      if (dropDown == "Number of Visited People") {
        return yScale(d.num_visted_people);
      } else if(dropDown == "Transaction Count") {
        return yScale(d.num_purchases);
      } else{
        return  yScale(d.total_purchases)
      }
    })
    .attr("width", xScale.bandwidth())
    .attr("fill", (d) => locationColors[d.purchase_type]) //////////////
    .attr("height", function (d) {
      console.log("here",d)
      if (dropDown == "Number of Visited People") {
        return height - yScale(d.num_visted_people);
      } else if(dropDown == "Transaction Count") {
        return height -yScale(d.num_purchases);
      } else{
        return height - yScale(d.total_purchases)
      }
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("mousedown", mousedown)
    //update task2 here (read last item of selected location)
    .on("mouseup", mouseup);

  // Set yAxis Label
  chart
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(`${dropDown}`);

  // Set xAxis Label
  chart
  .append("text")
  .attr("class", "y-axis-label")
  .attr("transform", "rotate(0)")
  .attr("x", width/2 + - 20)
  .attr("y", height + 100)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Location");

  const legend = bar_svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left + width + margin.right - 100}, ${margin.top + 10})`)
    .selectAll("g")
    .data(Object.keys(locationColors))
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);
  legend
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", -5)
    .attr("y", -5)
    .attr("fill", (d) => locationColors[d]);
  legend
    .append("text")
    .text((d) => d)
    .attr("x", 10)
    .attr("y", 5);

  if (data.length > 0) {
    selectedLocation[0] = data[0].location;
    d3.select('#location' + selectedLocation[0].replace(/[^a-zA-Z]+/g, ""))
      .classed("selected", true)
      .style("stroke", "red")
      .style("opacity", 1);
  }

  Run_Task2();
}

// Draw a Heatmap
function drawHeatmap(data) {
  var startTime = selectedTimes.startTime;
  var endTime = selectedTimes.endTime;
  
  startTime = startTime.split(":").map(Number);
  endTime = endTime.split(":").map(Number);

  heatmap_svg.selectAll('*').remove();
  
  let heatmap_div = d3.select("#heatmap");
  let width = heatmap_div.style('width').replace('px', '');
  let height = heatmap_div.style('height').replace('px', '');

  heatmap_svg
    .style("width", `${width}px`)
    .style("height", `${height}px`);

  // Set the dimensions of the chart
  var margin = { top: 20, right: 40, bottom: 150, left: 80 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // Create the chart container
  var heatmap = heatmap_svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // set the scale for the time axis
  var yScale = d3.scaleTime()
    .domain([new Date(2023, 3, 18, startTime[0], startTime[1]-59, -1), new Date(2023, 3, 18, endTime[0], endTime[1], 0)])
    .range([height, 0]);

  // create the time axis
  var timeAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%H:%M"))
    .ticks(d3.timeHour.every(1));

  // append the axis to the svg
  heatmap
    .append("g")
    .call(timeAxis);

  // Set the x-axis scale and label
  var xScale = d3.scaleBand()
    .range([0, width])
    .domain(data.map(function (d) { return d.location;}))
    .padding(0.1);
  
  heatmap
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Set yAxis Label
  heatmap
    .append("text")
    .attr("class", "y-axis-label")
    .attr('transform', 'translate('+ (0 - margin.left + 10) + ',' + (height/2  + 10) + ')rotate(-90)')
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Time");

  // Set xAxis Label
  heatmap
    .append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(0)")
    .attr("x", width/2 + - 50)
    .attr("y", height + 100)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Location");

  var groupedByLocation = d3.group(data, function(d) { return d.location; });
  var groupedByLocationTime = Array.from(groupedByLocation, ([key, value]) => ({ location: key, values: d3.group(value, d => {
    var Time = d.time.split(":").map(Number);
    return Time[0];
  })}));

  var heatmap_data = [];
  groupedByLocationTime.map(function(d) {
    d.values.forEach(function(e) {
      var countsBypurchase = {'location': d.location, 'startTime': 0, 'purchase_type':'', 'purchase_num': 0,'num_visted_people': 0, 'total_purchases': 0};
      countsBypurchase.startTime = e[0].time.split(":").map(Number)[0];
      countsBypurchase.purchase_type = e[0].purchase_type;
      countsBypurchase.purchase_num = e.length;

      e.forEach(function(f) {
        countsBypurchase.num_visted_people += f.rounded;
        countsBypurchase.total_purchases += f.price;
      });

      heatmap_data.push(countsBypurchase);
    });
  });    

  // Build color scale
  var heatmapColor = d3.scaleLinear()
    .range(["white", "rgb(0,0,255)"])
    .domain([-d3.max(heatmap_data, d => d.num_visted_people)/7, d3.max(heatmap_data, d => d.num_visted_people)]);

  // Three function that change the heatmap_tooltip when user hover / move / leave a cell
  const mouseover = function(event, d) {
    heatmap_tooltip.style("visibility", "visible");
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  }
  const mousemove = function(event, d) {
    heatmap_tooltip
      .html(`location: ${d.location}<br>
            Category: ${d.purchase_type}<br>
            Number of purchases: ${d.purchase_num}<br>
            Estimation of number of people: ${d.num_visted_people}
            Total transaction amount: $${Math.round(d.total_purchases)}<br>`)
      .style("left", event.layerX + 10 + "px")
      .style("top", event.layerY + 10 + "px");
  }
  const mouseleave = function(event,d) {
    heatmap_tooltip.style("visibility", "hidden");
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  heatmap.selectAll()
    .data(heatmap_data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return xScale(d.location) })
    .attr("y", function(d) { return yScale(new Date(2023, 3, 18, d.startTime, 30, 0)) })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("height", (height / (endTime[0] - startTime [0] + 1))-1.5)
    .attr("width", (width / Array.from(groupedByLocation).length)-1.5)
    .style("fill", function(d) { return heatmapColor(d.num_visted_people)})
    .style("stroke-width", 1)
    .style("stroke", "none")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // legend
  var legendWidth = 30;
  var part = 10;

  heatmap_svg.append("g")
    .attr("transform", "translate(" + (margin.left + (width/2) - (legendWidth*part/2)) + "," + (height+ margin.top + margin.bottom -25) + ")")
    .selectAll('rect')
    .data(heatmapColor.ticks(part))
    .enter()
    .append('rect')
    .attr('fill', function(d) { return heatmapColor(d)})
    .attr('x', (d, i) => legendWidth * i)
    .attr('width', legendWidth)
    .attr('height', 15);

  heatmap
    .append("text")
    .attr("transform", "translate(" + (margin.left + (width/2) - (legendWidth*part/2)-200) + "," + (height+ margin.top + margin.bottom -35) + ")")
    .style("text-anchor", "middle")
    .text("Number of Visted People: ");
}

function Run_Task2() {
  //update task2 here (read last item of selected location)
  let filteredGpsData;
  if (selectedDay.length>0) {
    filteredGpsData = filterGPSDayTimeLoc(
      stoppoints,
      selectedDay,
      selectedLocation[selectedLocation.length-1],
      selectedTimes.startTime,
      selectedTimes.endTime
    );
    drawGanttChart(filteredGpsData, selectedTimes, selectedDay[selectedDay.length-1], selectedLocation[selectedLocation.length-1], selectedColor);
  }
  
  // console.log(selectedTimes);
  // console.log(selectedLocation);
  console.log("filteredGPSData", filteredGpsData);
}

// Update all charts
function update_Charts(filteredCreditData) {
  drawBar(filteredCreditData);
  drawHeatmap(filteredCreditData);
  // console.log("When update date or time:", filteredCreditData)
  drawCreditInfo(filteredCreditData, selectedLocation[selectedLocation.length-1], selectedDay[selectedDay.length-1], selectedTimes);
}

function BarChart_Listener(){
  filteredCreditData = filterDayAndTime(
    selectedTimes.startTime,
    selectedTimes.endTime
  );
  
  const dropdown_barChart = document.querySelector('#bar-dropdown');
  console.log(dropdown_barChart);
  dropdown_barChart.addEventListener('change', ()=>{
    drawBar(filteredCreditData);
  });
}

// function clock_Listener() {
//   const dropdown = document.querySelector('#date-dropdown');
//   dropdown.addEventListener('change', drawClockChart);

//   const amToggle = document.querySelector('#AM-toggle');
//   amToggle.addEventListener('change', drawClockChart);

//   const pmToggle = document.querySelector('#PM-toggle');
//   pmToggle.addEventListener('change', drawClockChart);
// }
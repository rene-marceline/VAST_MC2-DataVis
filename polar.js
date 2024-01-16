// let polar = d3.select('#polardiv');

// let polardivwidth = polar.style('width').replace('px', '');
// let polardivheight = polar.style('height').replace('px', '');


// var polar_margin = { top: 300, right: 20, bottom: 20, left: 400 };
// var circle_margin = 50;
// var polar_width = polardivwidth - polar_margin.left - polar_margin.right;
// var polar_height = polardivheight - polar_margin.top - polar_margin.bottom - 20;
// // var polar_radius = 200/1.5;

// var polarsvg = d3.select("#polar")
//     .append("svg")
//     .attr("class","svgclock")
//     .attr("width", polar_width + polar_margin.left + polar_margin.right)
//     .attr("height", polar_height + polar_margin.top + polar_margin.bottom);

const polarsvg = d3.select("#polardiv").append("svg").attr("width", 800).attr("height", 600);


let circle_tooltip = d3.select("#polardiv")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("width", "auto")
        .style("box-shadow", "0 0 5px #999999")
        .style("background", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("text-align", "center");


// document.addEventListener("DOMContentLoaded", function() {

//     Promise.all([d3.csv('./data/task4_data.csv', d3.autoType)])
//     .then(function (values) {
//         //console.log('loaded task4_data.csv')
//         data = values[0];

//         var Time = []
//         data.map(function (d) {
//             const count = (d.Time)
//             Time.push(count)
//         })
    
//         drawPolarChart(data);
//     });

// });

// function clearChart()
// {   
//     d3.select("#polar").select("polarsvg").remove();
// }

function drawPolarChart(selectedLocation)
{   
        //console.log(data,"gd")
        // clearChart();
        // set the dimensions and margins of the graph
        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        // const radius = Math.min(1660, 750) / 2 - margin

        // var location="Frydos Autosupply n' More";
        // console.log("selected location for vis6", selectedLocation);



        d3.csv("data/task4_data.csv").then(function(data) {
            // console.log("jisoo:", data);
            var Time = []
            data.map(function (d) {
                const count = (d.Time)
                Time.push(count)
            })

            // Set the dimensions and margins of the chart
            var width = 1600;
            var height = 750;
            var margin = 50;

            polarsvg.selectAll("*").remove()
            

            // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
            const radius = Math.min(width, height) / 2 - margin

            // var location="Frydos Autosupply n' More";

            //filtering data based on odd hours
            const filteroddhoursdata = data.filter(function(d) { //console.log(d);
                const hour1 = d.Time;
                const AM_PM = d.AM_PM;
                //console.log(hour1);
                return (((hour1 >= "10:00" && hour1 <="11:59") && (AM_PM =="PM"))  || (hour1 < "07:00" && AM_PM =="AM"));
            });

            //console.log(filteroddhoursdata,"oddhours");

            //filtering data based on location
            var filterlocdata = filteroddhoursdata.filter(function (d) { //console.log(d);
                return d.Location == selectedLocation;
            })

            //console.log(filterlocdata,"locdata");

            var data = [];

            const dates = d3.timeDays(new Date(2014, 0, 6), new Date(2014, 0, 19)); // get an array of dates between 01/06/14 and 01/19/14

            dates.forEach(function(date) {
            const dateString = d3.timeFormat('%m/%d/%y')(date); // format date as a string
            const dataForDate = filterlocdata.filter(function(d) { // filter data for the current date
                return d.Date === dateString;
            });
            const carIds = dataForDate.map(function(d) { // get an array of car IDs for the current date
                // console.log("dddddddd", d.Car_ID);
                // let temp = new Set(d.Car_ID);
                return d.Car_ID;
            });

            const uniqueCar = new Set(carIds);
            // console.log("this:", Math.min(Array.from(uniqueCar)));


            const Time = dataForDate.map(function(d) { // get an array of car IDs for the current date
                return d.Time;
            });
            
            const carCount = uniqueCar.size; // get the number of cars for the current date
            data.push({ date: dateString, count: carCount, carIds: carIds, time: Time }); // add an object with car count, car IDs, and time to the array
            });

            console.log(data,"dr");

            

            
            
            // Create a function to convert the dates to angles
            var angleScale = d3.scaleTime()
                .domain([new Date("01/06/14"), new Date("01/19/14")])
                .range([0, 2 * Math.PI]);

            // Create a function to convert the car counts to radii
            var radiusScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return d.count; })])
                .range([0, width / 2 - margin*2]);

            // Define a color scale to map dates to colors
            var colorScale = d3.scaleOrdinal()
                .domain((data.map(function(d) { return d.date; })))
                .range(["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
                "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928",
                "#8dd3c7", "#bebada"]);

            

            // // Create the SVG element
            // var svg = d3.select("#polar")
            //     .append("svg")
            //     .attr("width", width)
            //     .attr("height", height);

            // Add a group element for the chart
            var chart = polarsvg.append("g")
                .attr("transform", "translate(" + (width / 3) + "," + (height / 3 - 20) + ") scale(0.55,0.55)")

            // Add the axes
            var axes = chart.selectAll("g")
                .data(data)
                .enter()
                .append("g");

            axes.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", function(d) { return 0.7*radiusScale(d.count ) * Math.sin(angleScale(new Date(d.date))); })
                .attr("y2", function(d) { return 0.7*-radiusScale(d.count ) * Math.cos(angleScale(new Date(d.date))); })
                .style("stroke", function(d) { return colorScale(d.date); })
                .style("stroke-width", 1);
            
  
            // Add the data points
            // var points = chart.selectAll("circle")
            console.log("final data:", data);
            chart.selectAll(".circle")
                .data(data)
                .join("circle")
                .attr("class","pcircle")
                .attr("cx", function(d) { return 0.7 * radiusScale(d.count ) * Math.sin(angleScale(new Date(d.date))); })
                .attr("cy", function(d) { return 0.7 * -radiusScale(d.count) * Math.cos(angleScale(new Date(d.date))); })
                .attr("r", 20)
                .style("fill", function(d) { return colorScale(d.date); })
                .on("mouseover", function (event, d) {
        
                    const myList = d.carIds;
                    const carList = [];
                    const seen = {};
                    for (let i = 0; i < myList.length; i++) {
                        const item = myList[i];
                        if (seen[item] !== 1) {
                            seen[item] = 1;
                            carList.push(item);
                        }
                        
                    }
                    // console.log("car list:", carList, );
                    // console.log(d);

                    console.log("mousehover on shop:",d);
                    d3.select(this)
                      .transition()
                      .duration(200)
                      .style("stroke", "black")
                      .style("stroke-width", "2px");
                    circle_tooltip
                      .style("visibility", "visible")
                      .style("width", "200px")
                      .style("text-align", "left")
                      .html(
                            `Car ID:  ${carList}<br>`
                            // Time:  ${d.time} <br>`
                        );
                  })
                  .on("mousemove", function (event) {
                    circle_tooltip
                      .style("left", `${event.pageX + 10}px`)
                      .style("top", `${event.pageY + 10}px`);
                  })
                  .on("mouseleave", function () {
                    d3.select(this)
                      .transition()
                      .duration(200)
                      .style("opacity", 1)
                      .style("stroke", "black")
                      .style("stroke-width", "0px");
              
                      circle_tooltip.style("visibility", "hidden").style("opacity", 0.9);
                  });
                

            var legend = polarsvg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(0,120)");

            var legendRect = legend.selectAll("legendRect")
                .data(colorScale.domain())
                .enter().append("rect")
                .attr("class", "legendRect")
                .attr("x", width / 1.5  )
                .attr("y", function(d, i) { return i * 25 - 6; })
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function(d) { return colorScale(d); });

            var legendText = legend.selectAll("legendText")
                .data(colorScale.domain())
                .enter().append("text")
                .attr("class", "legendText")
                .attr("x", width / 1.5 +25)
                .attr("y", function(d, i) { return i * 25; })
                .attr("dy",".35em")
                .text(function(d) { return d; })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");

            //Add the legend
            var legend1 = chart.selectAll(".legend")
                .data(data)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d) { return "translate(" + 0.7*radiusScale(d.count) * Math.sin(angleScale(new Date(d.date))) + "," + 0.7*(-radiusScale(d.count) * Math.cos(angleScale(new Date(d.date)))) + ")"; });

            // legend1.append("circle")
            //     .attr("r", 5)
            //     .style("fill", function(d) { return colorScale(d.date); });
            //     //.style("fill", "blue");

            legend1.append("text")
                .attr("x", 25)
                .attr("dy", ".35em")
                .text(function(d) { return "Car count: " + d.count; })
                .style("font-size", "20px"); 

            // Add the title
            polarsvg.append("text")
                .attr("x", (width / 3))
                .attr("y", margin)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text(function(d) { return "The number of cars in " + selectedLocation + " between 10PM to 7AM"; }); 
                // .text("Car Count of Odd Hour Stops by Date");


        

        })


        
            

            
}

export {drawPolarChart};
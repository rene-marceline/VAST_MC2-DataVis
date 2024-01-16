import { drawClockChart } from "./clockTree.js";


const mapsvg = d3.select("#abilamapdiv").append("svg").attr("width", 800).attr("height", 600);
mapsvg.append("image")
  .attr("xlink:href", "/data/MC2-tourist-edited.jpg")
  .attr("width", "760")
  .attr("height", "545px")
  .attr("transform", "translate(" + 36 + "," + 22.5 + ")")
  .style("opacity", "0.7");

const projection = d3.geoMercator().scale(498000).center([25,36]).translate([800+760+11, 600+450]);
const pathGenerator = d3.geoPath().projection(projection);

// const carid = '101';
// 28 is weird

function drawGridmap(){

  //drawing grid map
  d3.json("/data/Abila.json").then(data => {
    mapsvg.selectAll("path")
      .data(data.features)
      .enter().append("path")
      .attr("d", pathGenerator)
      .attr("fill", "lightgray")
      .attr("stroke", "black")
      .attr("stroke-width", 0.1);
  });
}

export {drawGridmap};


let point_tooltip = d3.select("#abilamapdiv")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("width", "200px")
                    .style("box-shadow", "0 0 5px #999999")
                    .style("background", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "2px")
                    .style("text-align", "left")
                    .style("font-size", "10px");



// const colorScale = d3.scaleOrdinal()
//   .domain(["60", "300", "1800", "3600", "7200", "10800"])
//   .range(["#FFFFFF","#b9c9fe","#809cff","#3763ff","#002bc3", "#001459"]);

const colorScale = d3.scaleOrdinal()
  .domain(["60", "300", "1800", "3600", "7200", "10800"])
  .range(["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8", "#253494"]);

// draw car trajectory 
function drawTrajectoryOnAbilaMap(carID, selectedDay){
  
  let t = d3.selectAll('.path');
  if(t){t.remove();}

  var date = selectedDay.getDate()
  if(parseInt(selectedDay.getDate())<10){
    date = "0"+selectedDay.getDate()
  }

  d3.csv("data/gps.csv").then(function(data) {

    var date = selectedDay.getDate()
    if(parseInt(selectedDay.getDate())<10){
      date = "0"+selectedDay.getDate()
    }
  
    // console.log("before filter",data)
    data = data.filter(function(d) { return d.id == carID });
    // console.log("after filter by id",data);
    const filtered_data = data.filter(d => d.Timestamp.startsWith("01/"+date));
    // console.log("after filter by date",filtered_data);

    // set up the line generator
    const lineGenerator = d3
      .line()
      .x(d => {
        let coords = projection([+d.long, +d.lat])
        return coords[0];
      })
      .y(d => {
        let coords = projection([d.long, d.lat])
          return coords[1];
      });

    mapsvg
      .append("path")
      .datum(filtered_data)
      .attr("class", "path")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("d", lineGenerator);

    // //plot dots of trajectory
    // mapsvg.selectAll('path')
    // .data(data)
    // .join('circle')
    // .attr('class', 'trajectory')
    // .attr('r', 0.5)
    // .attr('cx', (d)=>{
    //     let coords = projection([+d.long, +d.lat])
    //     return coords[0];
    // })
    // .attr('cy', (d)=>{
    //     let coords = projection([d.long, d.lat])
    //     return coords[1];
    // })
    // .style('fill', 'black')


  });


}

function drawLegend(){
  const ldata = ['1-5min', '5-30min', '30min-1hour', '1-2hour', '2-3hour','3hour-'];
  const ldata2 = ['shop', '1-5min', '5-30min', '30min-1hour', '1-2hour', '2-3hour','3hour-'];

  mapsvg.selectAll('.legend')
      .data(ldata)
      .join('circle')
      .attr('class', 'legend')
      .attr('r', 5)
      .attr('cx', 710)
      .attr('cy', (d, i) => 160+(i+1) * 15)
      .attr("fill", (d, i) => colorScale(ldata[i]))
      .attr("stroke", "black")
      .style("stroke-width", "0.5px")

  mapsvg.selectAll("text")
      .data(ldata2)
      .join("text")
      .attr("x", 720)
      .attr("y", (d, i) => 160+i * 15)
      .attr("dy", "0.35em")
      .text((d, i) => ldata2[i])
      .style("font-size", "10px");

  mapsvg.selectAll("text2")
      .data(ldata2)
      .join("text")
      .attr("x", 700)
      .attr("y", 270)
      .attr("dy", "0.35em")
      .text("Duration of Stay")
      .style("font-size", "12px");

  
  mapsvg.selectAll('.shoplegend')
      .data(ldata2)
      .join('circle')
      .attr('class', 'shoplegend')
      .attr('r', 5.5)
      .attr('cx', 710)
      .attr('cy', 160)
      .attr("fill", 'red')
      .attr('fill-opacity', 0.1)
      // .attr("stroke", "black")
      // .style("stroke-width", "0.5px")

      

    
  

      

}

export {drawLegend};

// plot car stop points
function drawStopsOnAbilaMap(carID, selectedDay){
  // console.log("selected date: ", selectedDay);
  
  var date = selectedDay.getDate()
  if(parseInt(selectedDay.getDate())<10){
    date = "0"+selectedDay.getDate()
  }

  var file_name = "data/stop_points_final_v2/gps" + carID + "_stoppoints.csv";
  // var file_name = "data/merged_stoppoints.csv"

  d3.csv(file_name).then(function(data) {
    
    const filtered_data = data.filter(d => d.Timestamp1.startsWith("01/"+date));
    // console.log(filtered_data);

    let t = d3.selectAll('.trajectory');
    if(t){t.remove();}

    // Set xAxis Label
    mapsvg
    .append("text")
    .attr("class", "path")
    .attr("transform", "rotate(0)")
    .attr("x", 400)
    .attr("y", 570)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Car "+carID+" route (Day "+ selectedDay.getDate() + ")");


    mapsvg.selectAll('.trajectory')
      .data(filtered_data)
      .join("circle")
      .attr('class', 'trajectory')
      .attr("r", 5)
      .attr('cx', (d)=>{
        let coords = projection([+d.long_center, +d.lat_center])
        return coords[0];
      })
      .attr('cy', (d)=>{
          let coords = projection([d.long_center, d.lat_center])
          return coords[1];
      })
      .attr("fill", d => colorScale(d.time_threshold))
      .attr("stroke", "black")
      .style("stroke-width", "0.5px")
      // .style('fill', 'blue');
      .on("mouseover", function (event, d) {
        // console.log("mousehover:",d.cc, d.lc);
        // console.log("credit card", d.cc[0])
        // console.log("loyalty card")
        // console.log("test jisoo:", d.lat_center, parseFloat(d.lat_center)<36.05);
        
        var purchase_lst = "";
        var outputStr = "";
        var location =d.location;
        if(d.cc!='[]'){
          purchase_lst = purchase_lst + d.cc
        }
        if(d.lc!='[]'){
          if(d.cc!='[]'){
            purchase_lst = purchase_lst.slice(0, -1) + ", " + d.lc.slice(1)
          }
          else{
            purchase_lst = purchase_lst + d.lc
          }
        }
        console.log(purchase_lst)
        if(purchase_lst!=''){
          const inputArr = JSON.parse(purchase_lst.replace(/'/g, '"'));
          // Map the array to the desired output format
          const outputArr = inputArr.map(arr => `[${arr[0]}] ${arr[1]} : ${arr[2]}`);
          // Join the array into a single string with line breaks
          outputStr = outputArr.join('<br>&nbsp;&nbsp;&nbsp;');
          outputStr = "&bull; Purchase records at this shop :<br>&nbsp;&nbsp;&nbsp;" + outputStr;
          // console.log(outputStr);
        }
        if (parseFloat(d.lat_center)<36.05){
          location = "GAStech";
        }
        if (location==""){
          location = "Other";
        }
        
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", "0.5px");
        point_tooltip
          .style("visibility", "visible")
          .style("width", "200px")
          .style("text-align", "left")
          .html(
            `&bull; Employee name: ${d.emp_name}<br>
            &bull; Car ID: ${d.id}<br>
            &bull; Arrival: ${d.Timestamp1}<br>
            &bull; Departure: ${d.Timestamp2}<br>
            &bull; Location: ${location}<br>
            ${outputStr}
            `
          );
      })
      .on("mousemove", function (event) {
        point_tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black")
          .style("stroke-width", "0.5px");

        point_tooltip.style("visibility", "hidden").style("opacity", 0.9);

    });
  })
  
}


 

export {drawTrajectoryOnAbilaMap};
export {drawStopsOnAbilaMap};


let trajectorydata = [

    {
      name: "Brew've Been Served",
      longitude: '24.903365',
      latitude: '36.056071'
    },
    {
      name: "Hallowed Grounds",
      longitude: '24.8847645',
      latitude: '36.0638375'
    },
    {
      name: "Coffee Cameleon",
      longitude: '24.8903855',
      latitude: '36.055571'
    },
    {
      name: "Nationwide Refinery",
      longitude: '24.8864705',
      latitude: '36.057034'
    },
    {
      name: "Maximum Iron and Steel",
      longitude: '24.837663',
      latitude: '36.065208'
    }
]





// plot shops on map
function drawShopsOnAbilaMap(iparray=trajectorydata){

  // var shopdata;
  d3.csv("data/shoplocation_v4.csv").then(function(data) {
    // console.log("shop data", data);
    // shopdata = data;
    mapsvg.selectAll('.shoplocs')
      .data(data)
      .join('circle')
      .attr('class', 'shoplocs')
      .attr('r', 10)
      .attr('cx', (d)=>{
          let coords = projection([+d.long_center, +d.lat_center])
          return coords[0];
      })
      .attr('cy', (d)=>{
          let coords = projection([d.long_center, d.lat_center])
          return coords[1];
      })
      .style('fill', 'red')
      .attr('fill-opacity', 0.3)
      .on("mouseover", function (event, d) {
        // console.log("mousehover on shop:",d);
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", "0.5px");
        point_tooltip
          .style("visibility", "visible")
          .style("width", "150px")
          .style("text-align", "center")
          .html(
            `${d.shopname}`
            // Transactions: ${0}<br>`
          );
      })
      .on("mousemove", function (event) {
        point_tooltip
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
  
        point_tooltip.style("visibility", "hidden").style("opacity", 0.9);
      });


  });
  

    mapsvg.selectAll('.shoplocs')
      .data(trajectorydata)
      .join('circle')
      .attr('class', 'shoplocs')
      .attr('r', 10)
      .attr('cx', (d)=>{
          let coords = projection([+d.longitude, +d.latitude])
          return coords[0];
      })
      .attr('cy', (d)=>{
          let coords = projection([d.longitude, d.latitude])
          return coords[1];
      })
      .style('fill', 'red')
      .attr('fill-opacity', 0.5)
      .on("mouseover", function (event, d) {
        // console.log("mousehover on shop:",d);
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "black")
          .style("stroke-width", "0.5px");
        point_tooltip
          .style("visibility", "visible")
          .html(
            `Location: ${d.name}<br>
            Transactions: ${0}<br>`
          );
      })
      .on("mousemove", function (event) {
        point_tooltip
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
  
        point_tooltip.style("visibility", "hidden").style("opacity", 0.9);
      });
      
      
}

export {drawShopsOnAbilaMap};
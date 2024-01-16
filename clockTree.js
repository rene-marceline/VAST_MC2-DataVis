var globalData;

let clock = d3.select('#clockchartdiv');

let clockdivwidth = clock.style('width').replace('px', '');
let clockdivheight = clock.style('height').replace('px', '');

var clock_margin = { top: 300, right: 20, bottom: 20, left: 400 };
var clock_width = clockdivwidth - clock_margin.left - clock_margin.right;
var clock_height = clockdivheight - clock_margin.top - clock_margin.bottom - 20;
var clock_radius = 200/1.5;

let clock_tooltip = d3.select("#clockchartdiv")
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

var clock_svg = d3.select("#clock")
    .append("svg")
    .attr("class","svgclock")
    .attr("width", clock_width + clock_margin.left + clock_margin.right)
    .attr("height", clock_height + clock_margin.top + clock_margin.bottom);

var clock_g = clock_svg.append("g")
    .attr("transform", "translate(" + clock_margin.left + "," + clock_margin.top + ")");

document.addEventListener("DOMContentLoaded", function() {

    // Define the start and end dates
    var startDate = new Date("2014-01-06T00:00:00Z");
    var endDate = new Date("2014-01-20T00:00:00Z");

    // var startDate = new Date("2014-01-06");
    // var endDate = new Date("2014-01-19");

    // Define the date format
    var formatDate = d3.timeFormat("%m/%d/%Y");

    // Create the date dropdown
    var date = d3.select("#date-dropdown")
        .selectAll("option")
        .data(d3.timeDays(startDate, endDate))
        .enter()
        .append("option")
        .text(function(d) { return formatDate(d); })
        .attr("value", function(d) { return formatDate(d); });

    Promise.all([d3.csv('./data/t4data/task4_data.csv', d3.autoType)])
    .then(function (values) {
        globalData = values[0];
        drawClockChart();
    });
});

function getCheckedAMPM() {   
    var ampmToggle;
    var amToggle = document.getElementById("AM-toggle");
    var pmToggle = document.getElementById("PM-toggle");
    if (amToggle.checked == true) {
        ampmToggle=amToggle.value
    } else {
        ampmToggle=pmToggle.value
    }
    return ampmToggle;
}

function getSelectedDate() {
    var e = document.getElementById("date-dropdown");
    var seldate = e.value;

    return seldate;
}

function createTree(filterData) {  
    var tree = {};

    // iterate through filterData array and organize data into nested object structure
    filterData.forEach(function(d) {
        var location = d.Location;
        var time = d.Time;
        var carID = d.Car_ID;
        var employee = d.Employee_Name;
        
        
        if (!tree[time]) {
        tree[time] = {};
        }
        
        if (!tree[time][carID]) {
        tree[time][carID] = { data: [], employee: employee, location: location };
        }
        // console.log(tree[time][carID])
        tree[time][carID].data.push(d);
    });

    Object.values(tree).forEach(function(timeNode) {
        Object.values(timeNode).forEach(function(carNode) {
            carNode.data.sort(function(a, b) {
                return d3.ascending(a.location,b.location);
            });
        });
    });

    // console.log(tree,"hi")
    return tree;
}

function convertToDendrogramFormat(tree) {
    var rootNode = { name: "root", children: [] };

    Object.keys(tree).forEach((time) => {
        var timeNode = { name: time, children: [] };
        rootNode.children.push(timeNode);

        var carIDs = Object.keys(tree[time]);
        carIDs.forEach((carID) => {
        var carNode = { name: carID, children: [], employee: tree[time][carID].employee, location: tree[time][carID].location };
        //const data = tree[time][carID].data;

        timeNode.children.push(carNode);
        });
    });
    return rootNode;
}

function filterDataByCarId(carId, data) {
    const carTimes = data
        .filter((item) => item.Car_ID === carId)
        .map((item) => item.Time);
    //console.log(data,"hi")

    const filteredData = data.filter((item) => {
        const itemTime = new Date(`01/01/2014 ${item.Time}`);
        return carTimes.some((time) => {
            const timeDiff = Math.abs(new Date(`01/01/2014 ${time}`) - itemTime);
            const timeDiffInMinutes = timeDiff / (1000 * 60);
            return timeDiffInMinutes <= 5;
        });
    });
    return filteredData;
}

function drawClockChart(carId, selectedDay) {   
    console.log(selectedDay)

    clock_g.selectAll('*').remove();

    var ampmval;
    var dateval;

    const locationColors = d3.scaleOrdinal()
        .domain(["Brew've Been Served", "Hallowed Grounds",
        "Coffee Cameleon", "Abila Airport", "Kronos Pipe and Irrigation",
        "Nationwide Refinery", "Maximum Iron and Steel", "Stewart and Sons Fabrication",
        "Carlyle Chemical Inc.", "Coffee Shack", "Bean There Done That",
        "Brewed Awakenings", "Jack's Magical Beans", "Katerina's Cafe",
        "Hippokampos", "Abila Zacharo", "Gelatogalore", "Kalami Kafenion",
        "Ouzeri Elian", "Guy's Gyros", "U-Pump", "Frydos Autosupply n' More",
        "Albert's Fine Clothing", "Shoppers' Delight", "Abila Scrapyard",
        "Frank's Fuel", "Chostus Hotel", "General Grocer", "Kronos Mart",
        "Octavio's Office Supplies", "Roberts and Sons", "Ahaggo Museum",
        "Desafio Golf Course", "Daily Dealz"])
        .range(["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
        "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928",
        "#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69",
        "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#1f78b4",
        "#33a02c", "#e31a1c", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99",
        "#b15928", "#e41a1c", "#377eb8", "#4daf4a"]);
    
    ampmval=getCheckedAMPM();
    dateval=getSelectedDate();
    //carval=getSelectedCarId();
    
    //console.log(globalData,"gd");

    const twelve = d3
        .scaleLinear()
        .range([0, 360])
        .domain([0, 12]);

    const sixty = d3
        .scaleLinear()
        .range([0, 360])
        .domain([0, 60]);

    const radians = Math.PI/180;

    // Create the clock face
    var face = clock_g.append("g")
        .attr("class", "clock-face");

    face.append("circle")
        .attr("class", "clock-face")
        .attr("r", clock_radius * 0.95)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", "3px");

    face.selectAll(".hour-number")
        .data(d3.range(1, 13))
        .enter()
        .append("text")
        .attr("class", "hour-number")
        .attr("text-anchor", "middle")
        .attr("x", d => 0.75 * clock_radius * Math.sin(twelve(d) *radians))
        .attr("y", d => -0.75 * clock_radius * Math.cos(twelve(d)* radians)+5)
        .text(d => d)
        .style("stroke-width","1px")

    face.selectAll(".hour-tick")
        .data(d3.range(12))
        .enter().append("line")
        .attr("class", "hour-tick")
        .attr("x1", 0)
        .attr("y1", -clock_radius * 0.9)
        .attr("x2", 0)
        .attr("y2", -clock_radius)
        .attr("transform", d => `rotate(${twelve(d)})`)
        .style("stroke", "black")
        .style("stroke-width","2px")
        .style("stroke-linecap","square");


    face.selectAll(".minute-tick")
        .data(d3.range(60))
        .enter().append("line")
        .attr("class", "minute-tick")
        .attr("x1", 0)
        .attr("y1", (-clock_radius * 0.95))
        .attr("x2", 0)
        .attr("y2", -clock_radius )
        .attr("transform", d => `rotate(${sixty(d)})`)
        .style("stroke", "black")
        .style("stroke-width","2px")
        .style("stroke-linecap","square");
        
    var filterData = globalData.filter(function (d) { 
        // console.log(d, d.AM_PM, ampmval, d.Date, dateval);
        return d.Date == dateval && d.AM_PM == ampmval && d.Location != null;
    })
    .sort(function(a, b) {
        // console.log(a,b);
        // sort by location ascending
        return a.Location.localeCompare(b.Location)
    });

    console.log("filterData",filterData)

    const filteredData = filterDataByCarId(carId, filterData);

    console.log(filteredData,"filteredData");
    
    var tree = createTree(filteredData);

    var rootNode = convertToDendrogramFormat(tree);

    //console.log("rootNode",rootNode);

    // console.log("tree",tree)

    var hourScale = d3.scaleLinear()
        .domain([0, 12])
        .range([0, 360]);

    var minuteScale = d3.scaleLinear()
        .domain([0, 59])
        .range([0, 2 * Math.PI]);

    // Set the root node
    var root = d3.hierarchy(rootNode);

    //console.log(root)

    // Set the size of the tree
    var treeLayout = d3.tree()
        .size([200, 200]);

    // Compute the layout of the tree
    treeLayout(root);
    //console.log("hi",root)

    // Add color legend
    var legend = clock_g.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0,-250)");

    var legendRect = legend.selectAll("legendRect")
        .data(locationColors.domain())
        .enter().append("rect")
        .attr("class", "legendRect")
        .attr("x", function(d, i) { return clock_width + Math.floor(i/17) * 250 - 550;})
        .attr("y", function(d, i) { return (i%17) * 25; })
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d) { return locationColors(d); });

    var legendText = legend.selectAll("legendText")
        .data(locationColors.domain())
        .enter().append("text")
        .attr("class", "legendText")
        .attr("x", function(d, i) { return clock_width + Math.floor(i/17) * 250 - 520;})
        .attr("y", function(d, i) { return (i%17) * 25 + 15; })
        .text(function(d) { return d; })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    // Create the links
    var links = clock_g.selectAll(".link")
        .data(root.links())
        .enter()
        .filter(function(d) { return d.source.depth >0; })
        .append("path")
        .attr("class", "link")
        .style("fill", "none")
        .style("stroke-width","3px")
        .style("stroke-linecap","square")
        .style("stroke",function(d){
            //console.log(d);
            //console.log(d,d.target.data.name,d.target.data.location, locationColors(d.target.data.location));
            return locationColors(d.target.data.location);
        })
        .attr("d", d3.linkRadial()
            .angle(function(d) { 
                //console.log(d)
                var hr = d.data.name.split(":")[0]*60;
                var min= parseInt(d.data.name.split(":")[1]);
                var hrmin= hr+min;
                //console.log(hr,min,hrmin,"hrmin")
                if (d.depth < 2) {
                    //var lala =hourScale(bala);
                    //console.log(hrmin*3.14/360,"hi")
                    return hrmin*3.14/360;
                } else {
                    var hr = d.parent.data.name.split(":")[0]*60;
                    var min= parseInt(d.parent.data.name.split(":")[1]);
                    var hrmin= hr+min;
                    var cent_time = hrmin*3.14/360;
                    var siblings = d.parent.children.length;
                    for (var i = 0; i < siblings; i++) {
                        if (d.parent.children[i].data.name == d.data.name) {
                            var sibling_no = i
                        }
                    }  
                    
                    var split = 3.14/120*(siblings+1);
                    //console.log(split,"split")
                    var ref_time = cent_time - (split*siblings/2);
                    //console.log(ref_time+(sibling_no*split),"ri");
                    return ref_time+(sibling_no*split);
                }
            })
            .radius(function(d) { return (d.y*4/3-6); }))
    
    // Create the nodes
    var nodes = clock_g.selectAll(".node")
        .data(root.descendants().slice(1))
        .attr("class","node")
        .enter()
        .append("g")
        .attr("class", function(d) { 
            // console.log('aaa',d);
            return "node-" + (d.children ? "internal" : "leaf"); })
        .attr("transform", function(d) {  
            //console.log(d.data.name.split(":")[0]*60)
            var hr = d.data.name.split(":")[0]*60;
            var min= parseInt(d.data.name.split(":")[1]);
            var hrmin= hr+min;
            //console.log(d,"d")
            if (d.depth < 2)
            {
                //var lala =hourScale(bala);
                //console.log((hrmin/2)-90,"h")
                return "rotate(" + ((hrmin/2)-90) + ")translate(" + (d.y*4/3-6) + ")"; 
            }
            else {
                var hr = d.parent.data.name.split(":")[0]*60;
                var min= parseInt(d.parent.data.name.split(":")[1]);
                var hrmin= hr+min;
                var cent_time = hrmin;
                var siblings = d.parent.children.length;
                for (var i = 0; i < siblings; i++)
                {
                    if (d.parent.children[i].data.name == d.data.name)
                    {
                        var sibling_no = i
                        //console.log(sibling_no,"no")
                    }
                }  
                
                var split = 3*(siblings+1);
                var ref_time = cent_time - (split*((siblings/2)));
                var group_time = (ref_time+(sibling_no*split));
                //console.log(split, sibling_no, ref_time,group_time,"ref_time")
                return  "rotate(" + ((group_time/2)-90) + ")translate(" + (d.y*4/3-6) + ")"; 
            }
        
        });
        
    // Create the circles for the nodes
    nodes.append("circle")
        .attr("r", 5)

    // Create the text labels for the nodes
    nodes.append("text")
        .filter(function(d) {//console.log('bbb',!d.children);
            return !d.children; })
        .attr("dy", ".35em")
        .attr("x", function(d) { //console.log(d);
            var min = (d.parent.data.name.split(":")[0]*60)+parseInt(d.parent.data.name.split(":")[1]);
            return ((min > 360 && min <= 720)?-6:50); })
        .style("text-anchor", "end")
        .attr("transform", function(d) {
            var min = (d.parent.data.name.split(":")[0]*60)+parseInt(d.parent.data.name.split(":")[1]);
            if (min > 360 && min <= 720) {
                return "rotate(" + 180 + ")";
            }
            else {
                return "rotate(" + 0 + ")";
            }
            
        })
        .style("font-size","12px")
        .style("font-weight","bold")
        .text(function(d) { return "Car " + d.data.name; });

    //Interactions
    d3.selectAll(".node-leaf")
        .on("mouseover", function (event, d) {
            clock_tooltip
            .style("visibility", "visible")
            .html(
                `Employee Name:  ${d.data.employee}<br>
                Location:  ${d.data.location} <br>`
            )
            .style("background-color", 'white');
        })
        .on("mousemove", function(event, d) {
            clock_tooltip
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseleave", function () {
            clock_tooltip.style("visibility", "hidden").style("opacity", 0.9);
        });
}

export {drawClockChart};
const mapsvg = d3.select("#abilamapdiv").append("svg").attr("width", 800).attr("height", 600);
const projection = d3.geoMercator().scale(498000).center([25,36]).translate([800+760+11, 600+450]);
const pathGenerator = d3.geoPath().projection(projection);
d3.json("/data/Abila.json").then(data => {
  mapsvg.selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", pathGenerator)
    .attr("fill", "lightgray")
    .attr("stroke", "black")
    .attr("stroke-width", 0.1)
    .on('mouseover', function(e,d){
      console.log(e.target.__data__)
    });
});

let trajectorydata = [
    {
      name: 'A',
      longitude: '24.89824296',
      latitude: '36.06555977'
    },
    {
      name: 'B',
      longitude: '24.89824296',
      latitude: '36.06555071'
    }
]

function drawPointsOnAbilaMap(iparray=trajectorydata){
    mapsvg.selectAll('.trajectory')
            .data(iparray)
            .join('circle')
            .attr('class', 'trajectory')
            .attr('r', 5)
            .attr('cx', (d)=>{
                let coords = projection([+d.longitude, +d.latitude])
                return coords[0];
            })
            .attr('cy', (d)=>{
                let coords = projection([d.longitude, d.latitude])
                return coords[1];
            })
            .style('fill', 'red')
}

export {drawPointsOnAbilaMap};
const isMobile = $(window).width() < 770;

let offsetWidth, widthChart;

 if (isMobile){
   offsetWidth = 16 + 22;
   widthChart = document.getElementById("chart").offsetWidth;
 } else {
   offsetWidth = 280;
   widthChart = document.getElementById("chart").offsetWidth + offsetWidth;
 }

let margin, svg, g, gs, xScale, yScale, tickValues, totalHeight, yRange, stickyHeight;

if (isMobile){
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 100};
} else {
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 150};
}

let width = widthChart - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


Promise.all([
  d3.csv('data/Data for data viz.csv'),
]).then(function(data) {
  var schools = data[0];

  console.log(schools);
})

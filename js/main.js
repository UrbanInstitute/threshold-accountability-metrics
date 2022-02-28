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

  const metrics = ['completion_rate_150', 'share_outstanding_ug_5', 'cdr3_wgtd', 'pct25_earn_wne_p10'];

  schools.forEach(s => {
    metrics.forEach(m => {
      s[m] = +s[m]
    })
  })

  const sliders = d3.select("#sliders").selectAll("div")
    .data(metrics)
    .join("div")
      .html(d => `<span>${d}</span>`)

  const steps = 100.0;

  sliders.selectAll("svg")
    .data(d => {
      let obj = {};
      [obj.min, obj.max] = d3.extent(schools, s => s[d]);
      obj.slider = d3.sliderHorizontal()
        .min(obj.min)
        .max(obj.max)
        .step((obj.max-obj.min)/steps)
        .width(300)
        .on("onchange", (val) => {
          console.log(val)
        });
      return [obj]
    })
    .join('svg')
      .attr("viewBox", [-20, -20, 500, 60])
      .attr("width", 500)
      .attr("height", 60)
      // .append("g")
      // .attr("transform", "translate(0,0)")
      // .style("opacity", d => {
      //   console.log(d)
      //   return 1
      // })
      .each((d,i,j) => {
        d3.select(j[0]).call(d.slider)
      })
})

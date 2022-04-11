const isMobile = $(window).width() < 770;

let offsetWidth, widthChart;

 // if (isMobile){
 //   offsetWidth = 16 + 22;
 //   widthChart = document.getElementById("chart").offsetWidth;
 // } else {
 //   offsetWidth = 280;
 //   widthChart = document.getElementById("chart").offsetWidth + offsetWidth;
 // }

let margin, svg, g, gs, xScale, yScale, tickValues, totalHeight, yRange, stickyHeight;

if (isMobile){
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 100};
} else {
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 150};
}

let width = widthChart - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


let thresholds = {
  'completion_rate_150': null,
  'share_outstanding_ug_5': null,
  'cdr3_wgtd': null,
  'pct25_earn_wne_p10': null
}

const transitionTime = 500;

function getUniquesMenu(df, thisVariable) {

  var thisList = df.map(function(o) {
    return o[thisVariable]
  })

  // uniq() found here https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
  function uniq(a) {
      return a.sort().filter(function(item, pos, ary) {
          return !pos || item != ary[pos - 1];
      });
  }

  var uniqueList = uniq(thisList);

  return uniqueList;
}

Promise.all([
  d3.csv('data/Data for data viz v2.csv'),
]).then(function(data) {
  var schools = data[0];

  console.log(schools);

  const metrics = ['completion_rate_150', 'share_outstanding_ug_5', 'cdr3_wgtd', 'pct25_earn_wne_p10'];
  const schoolTypes = ['Nonprofit', 'Public', 'For-profit'];
  const institutionTypes = ['4-year', '2-year', 'Less-than-2-year'];
  const ySpace = metrics.length + 1;

  schools.forEach(s => {
    metrics.forEach(m => {
      s[m] = +s[m]
    })
  })

  function updatePositions() {

    schools.forEach(function(d){
      d.pass = metrics.reduce((a,b) => +(d[b] >= thresholds[b]) + a, 0);
    })
    let passes = d3.range(0, metrics.length + 1);

    let passesDiv = d3.select("#right-col").selectAll(".pass-div")
      .data(passes)
      .join("div")
        .attr("class", "pass-div")

    passesDiv.selectAll(".pass-name")
      .data(function(d){
        return [d];
      })
      .join("div")
        .attr("class", "pass-name")
        .html(function(d){
          return "Pass " + d;
        })

    let institutionsDiv = passesDiv.selectAll(".institution-div")
      .data([institutionTypes])
      .join("div")
        .attr("class", "institution-div");

    institutionsDiv.selectAll(".institution-type")
      .data(function(d){
        return d;
      })
      .join("div")
        .attr("class", "institution-type")
        .html(function(d){
          return d;
        })

  }

  const sliders = d3.select("#sliders").selectAll("div")
    .data(metrics)
    .join("div")
      .attr("class", "slider")
      .html(d => `<div class="slider-name"><input type="checkbox" id="${d}" value="first_checkbox"><span>${d}</span><span class="info">i</span></div>`)

  const steps = 100.0;

  sliders.selectAll("svg")
    .data(function(d) {
      let obj = {};
      [obj.min, obj.max] = d3.extent(schools, function(s){
        return s[d];
      });
      thresholds[d] = obj.min; // INITIALIZE THRESHOLDS
      obj.slider = d3.sliderHorizontal()
        .min(obj.min)
        .max(obj.max)
        .step((obj.max-obj.min)/steps)
        .width(300)
        .on("end", function(val) {
          thresholds[d] = val;
          updatePositions();
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
      .each(function(d,i,j) {
        d3.select(j[0]).call(d.slider);
      });

  const filters = d3.select("#filters-buttons").selectAll("span")
    .data(schoolTypes)
    .join("span")
      .attr("class", "filter")
      .html(function(d) {
        return `${d}`;
      })
      .on("click", function(event, d){
        console.log(d);
      })

  updatePositions();
})

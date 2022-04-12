const isMobile = $(window).width() < 770;

let offsetWidth, widthChart;

let state = {
  filters: [],
  metrics: ['cdr3_wgtd']
}

 // if (isMobile){
 //   offsetWidth = 16 + 22;
 //   widthChart = document.getElementById("chart").offsetWidth;
 // } else {
 //   offsetWidth = 280;
 //   widthChart = document.getElementById("chart").offsetWidth + offsetWidth;
 // }

let margin, svg, g, gs, yScale, tickValues, totalHeight, yRange, stickyHeight;

if (isMobile){
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 100};
} else {
  margin = {top: 20, right: offsetWidth, bottom: 20, left: 150};
}

let width = widthChart - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

let svgWidth = 200,
    svgHeight = 20;

let xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, svgWidth])

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
  const levels = ['4-year', '2-year', 'less-than-2-year'];

  state.filters  = schoolTypes;

  let totals = {};
  const ySpace = metrics.length + 1;

  schools.forEach(s => {
    metrics.forEach(m => {
      s[m] = +s[m]
    })
  })

  function updateRects() {

    schools.forEach(function(d){
      d.pass = state.metrics.reduce((a,b) => +(d[b] >= thresholds[b]) + a, 0);
    })
    let passes = d3.range(0, state.metrics.length + 1);
    schoolTypes.forEach(function(st){
      totals[st] = schools.filter(function(s){
        return s["sector"].includes(st);
      }).length
    })

    let passesDiv = d3.select("#right-col").selectAll(".pass-div")
      .data(passes)

    passesDiv.attr("class", "pass-div");

    passesDiv.enter().append("div")
      .attr("class", "pass-div");

    passesDiv.exit().remove();

    let passesName = d3.selectAll(".pass-div").selectAll(".pass-name")
      .data(function(d){
        return [d];
      })

    passesName.attr("class", "pass-name")
      .html(function(d){
        return "Pass " + d;
      })

    passesName.enter().append("div")
      .attr("class", "pass-name")
      .html(function(d){
        return "Pass " + d;
      });

    passesName.exit().remove();


    let institutionsDiv = d3.selectAll(".pass-div").selectAll(".institution-div")
      .data(function(d){
        let institutions = levels.map(function(it){
          let obj = {};
          obj.pass = d;
          obj.level = it;
          return obj;
        })
        return [institutions]
      })

    institutionsDiv.attr("class", "institution-div");

    institutionsDiv.enter().append("div")
      .attr("class", "institution-div");

    institutionsDiv.exit().remove();

    let institutionLevels = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level")
      .data(function(d){
        return d;
      })

    institutionLevels.attr("class", "institution-level");

    institutionLevels.enter().append("div")
      .attr("class", "institution-level");

    institutionLevels.exit().remove();

    let levelName = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-name")
      .data(function(d){
        return [d];
      });

    levelName.attr("class", "institution-level-name")
      .html(function(d){
        return d.level;
      });

    levelName.enter().append("div")
      .attr("class", "institution-level-name")
      .html(function(d){
        return d.level;
      });

    levelName.exit().remove();

    let institutionLevelBars = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar")
      .data(function(d){
        return [d];
      });

    institutionLevelBars.attr("class", "institution-level-bar");

    institutionLevelBars.enter().append("div")
      .attr("class", "institution-level-bar");

    institutionLevelBars.exit().remove();

    let svgRects = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar").selectAll("svg")
      .data(function(d){
        return state.filters.map(function(st){
          let obj = {}
          obj.pass = d.pass;
          obj.level = d.level;
          obj.type = st;
          let theseSchools = schools.filter(function(s){
            return ((s.pass === d.pass) && (s.sector.includes(d.level)) && (s.sector.includes(st)))
          })
          obj.n = theseSchools.length;
          return obj;
        })
      })

    svgRects.attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("class", "svg-bar")

    svgRects.enter().append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("class", "svg-bar")

    svgRects.exit().remove();

    let rects = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar").selectAll("svg").selectAll("rect")
      .data(function(d){
        return [d];
      })

    rects.attr("fill", "steelblue")
      .attr("height", svgHeight)
      .attr("x", xScale(0))
      .attr("y", 0)
      .attr("width", function(d){
        return xScale(d.n/totals[d.type] * 100);
      })

    rects.enter().append("rect")
      .attr("fill", "steelblue")
      .attr("height", svgHeight)
      .attr("x", xScale(0))
      .attr("y", 0)
      .attr("width", function(d){
        return xScale(d.n/totals[d.type] * 100);
      })

    rects.exit().remove();

  }

  const sliders = d3.select("#sliders").selectAll("div")
    .data(metrics)
    .join("div")
      .attr("class", "slider")

  let sliderName = sliders.selectAll(".slider-name")
    .data(function(d){
      return [d];
    })
    .join("div")
      .attr("class", "slider-name")

  sliderName.append("input")
    .attr("type", "checkbox")
    .property("checked", function(d){
      return state.metrics.indexOf(d) >= 0;
    })
    .attr("value", function(d){
      return d
    })
    .on("click", function(event, d){
      console.log(d)
      let thisChecked = d3.select(this).property("checked");
      console.log(thisChecked)
      if (thisChecked === true){
        state.metrics.push(d);
      } else {
        state.metrics = state.metrics.filter(function(m){
          return m !== d;
        });
      }
      updateRects();
    })

    // .on("click", function(event, d){
    //   let thisSelected = d3.select(this).classed("selected");
    //   if (thisSelected === true) {
    //     state.filters = state.filters.filter(function(f){
    //       return f !== d;
    //     });
    //   } else {
    //     state.filters.push(d);
    //   }
    //   d3.select(this).classed("selected", !thisSelected);
    //   updateRects()
    // })

  sliderName.append("span")
    .html(function(d){
      return d;
    })

  sliderName.append("span")
    .attr("class", "info")
    .html("i")

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
          updateRects();
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
      .classed("selected", true)
      .html(function(d) {
        return `${d}`;
      })
      .on("click", function(event, d){
        let thisSelected = d3.select(this).classed("selected");
        if (thisSelected === true) {
          state.filters = state.filters.filter(function(f){
            return f !== d;
          });
        } else {
          state.filters.push(d);
        }
        d3.select(this).classed("selected", !thisSelected);
        updateRects()
      })

  updateRects();
})

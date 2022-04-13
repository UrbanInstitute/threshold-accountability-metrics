const isMobile = $(window).width() < 770;

let offsetWidth, widthChart;

const metrics = ['completion_rate_150', 'share_outstanding_ug_5', 'cdr3_wgtd', 'pct25_earn_wne_p10'];
const schoolTypes = ['Nonprofit', 'Public', 'For-profit'];
const levels = ['4-year', '2-year', 'less-than-2-year'];
const buttons = ['Students', 'Institutions'];

let state = {
  filters: [],
  metrics: ['cdr3_wgtd'],
  button: 'Students'
}

let levelLabels = {
  '4-year': '4-year institutions',
  '2-year': '2-year institutions',
  'less-than-2-year': 'Less-than-2-year institutions'
}

let metricLabels = {
  'completion_rate_150': 'Completion Rate',
  'share_outstanding_ug_5': 'Successful Loan Repayment',
  'cdr3_wgtd': 'Loan Default Rate',
  'pct25_earn_wne_p10': 'Post-college Earnings'
}

let tooltipText = {
  'completion_rate_150': 'We define “completion” as students who earn their degree at their first institution within 150 percent of the normal time expected to finish (i.e., three years for associate degrees and six years for bachelor’s degrees).',
  'share_outstanding_ug_5': 'We measure the share of the dollars students borrowed that have been repaid after five years.',
  'cdr3_wgtd': 'We measure the share of all students attending the institution who default on their loans—not just the share of borrowers who default.',
  'pct25_earn_wne_p10': 'We measure whether three-quarters of students earn more than a specified threshold.'
}

let filterLabels = {
  'Nonprofit': 'Private',
  'Public': 'Public',
  'For-profit': 'For profit'
}

let colors = {
  'Nonprofit': '#1696D2',
  'Public': '#0A4C6A',
  'For-profit': '#FDBF11'
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

  state.filters  = schoolTypes;

  let totals = {};
  const ySpace = metrics.length + 1;

  schools.forEach(s => {
    metrics.forEach(m => {
      s[m] = +s[m]
    })
    s['est_fte'] = +s['est_fte'];
  })

  function updateRects() {

    schools.forEach(function(d){
      d.pass = state.metrics.reduce((a,b) => +(d[b] >= thresholds[b]) + a, 0);
    })
    let passes = d3.range(0, state.metrics.length + 1);
    schoolTypes.forEach(function(st){
      let filteredSchools = schools.filter(function(s){
        return s["sector"].includes(st);
      });
      if (state.button === 'Students') {
        totals[st] = filteredSchools.reduce(function(a,b){
          return a + b['est_fte']
        }, 0);
      } else {
        totals[st] = filteredSchools.length;
      }
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
        return levelLabels[d.level];
      });

    levelName.enter().append("div")
      .attr("class", "institution-level-name")
      .html(function(d){
        return levelLabels[d.level];
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
          if (state.button === 'Institutions') {
            obj.n = theseSchools.length;
          } else {
            obj.n = theseSchools.reduce(function(a,b){
              return a + b['est_fte']
            }, 0)
          }
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

    rects.transition().duration(transitionTime)
      .attr("fill", function(d){
        return colors[d.type];
      })
      .attr("height", svgHeight)
      .attr("x", xScale(0))
      .attr("y", 0)
      .attr("width", function(d){
        return xScale(d.n/totals[d.type] * 100);
      })

    rects.enter().append("rect")
      .transition().duration(transitionTime)
      .attr("fill", function(d){
        return colors[d.type];
      })
      .attr("height", svgHeight)
      .attr("x", xScale(0))
      .attr("y", 0)
      .attr("width", function(d){
        return xScale(d.n/totals[d.type] * 100);
      })

    rects.exit().transition().duration(transitionTime).remove();

  }

  // ADD BUTTONS

  const buttonsSpan = d3.select("#buttons").selectAll("span")
    .data(buttons)
    .join("span")
      .attr("class", "button")
      .classed("selected", function(d){
        return d === state.button;
      })
      .html(function(d){
        return d;
      })
      .on("click", function(event, d){
        if (d !== state.button){
          state.button = d;
          d3.select("#buttons").selectAll("span")
            .classed("selected", function(d){
              return d === state.button;
            })
          updateRects();
        }
      })

  // ADD SLIDERS

  const sliders = d3.select("#sliders").selectAll("div")
    .data(metrics)
    .join("div")
      .attr("class", "slider")
      .classed("faded", function(d){
        return state.metrics.indexOf(d) < 0;
      })

  function updateSliders() {
    sliders.classed("faded", function(d){
      return state.metrics.indexOf(d) < 0;
    });
  }

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
      let thisChecked = d3.select(this).property("checked");
      if (thisChecked === true){
        state.metrics.push(d);
      } else {
        state.metrics = state.metrics.filter(function(m){
          return m !== d;
        });
      }
      updateRects();
      updateSliders();
    })

  sliderName.append("span")
    .attr("class", "slider-name")
    .html(function(d){
      return metricLabels[d];
    })

  sliderName.append("span")
    .attr("class", "info")
    .on("mouseover", function(d){
      d3.select(this).select("p")
        .classed("show", true);
    })
    .on("mouseleave", function(d){
      d3.select(this).select("p")
        .classed("show", false);
    })
    .append("p")
    .html(function(d){
      return tooltipText[d];
    })

  sliderName.selectAll(".info")
    .each(function(g){
      let thisInfo = d3.select(this).selectAll(".info p")
        .classed("show", true);
      thisInfo.style("top", -(thisInfo.node().getBoundingClientRect().height + 10 + 15) + 'px');
      thisInfo.classed("show", false)
    });

  const steps = 100.0;

  sliders.selectAll("svg")
    .data(function(d) {
      let obj = {};
      obj.metric = d;
      [obj.min, obj.max] = d3.extent(schools, function(s){
        return s[d];
      });
      thresholds[d] = obj.min; // INITIALIZE THRESHOLDS
      obj.slider = d3.sliderHorizontal()
        .min(obj.min)
        .max(obj.max)
        .step((obj.max-obj.min)/steps)
        .width(300)
        .handle("M -10, 0 m 0, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0")
        .on("end", function(val) {
          thresholds[d] = val;
          updateRects();
        });
      return [obj]
    })
    .join('svg')
      .attr("viewBox", [-20, -20, 340, 60])
      .attr("width", 300)
      .attr("height", 60)
      .each(function(d,i,j) {
        d3.select(j[0]).call(d.slider);
        d3.select(j[0]).select(".track-inset").remove();
      });

  // ADD FILTERS

  const filters = d3.select("#filters-buttons").selectAll("span")
    .data(schoolTypes)
    .join("span")
      .attr("class", "filter")
      .classed("selected", true)
      .html(function(d) {
        return filterLabels[d];
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

  updateSliders();
  updateRects();
})

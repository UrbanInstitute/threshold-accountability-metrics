let pymChild = null;

var onWindowLoaded = function() {
  pymChild = new pym.Child({
      renderCallback: drawBars
  });
}

function drawBars() {
  const isMobile = $(window).width() < 970;

  let offsetWidth, widthChart;

  const metrics = ['cdr3_wgtd', 'share_outstanding_ug_5', 'completion_rate_150', 'pct25_earn_wne_p10'];
  const schoolTypes = ['Public', 'Nonprofit', 'For-profit'];
  const levels = ['4-year', '2-year', 'less-than-2-year'];
  const buttons = ['institutions', 'students'];

  let state = {
    filters: ['Public', 'Nonprofit', 'For-profit'],
    metrics: ['cdr3_wgtd', 'share_outstanding_ug_5', 'completion_rate_150', 'pct25_earn_wne_p10'],
    button: 'institutions',
    showingSliders: false
  }

  let levelLabels = {
    '4-year': '4-year institutions',
    '2-year': '2-year institutions',
    'less-than-2-year': 'Less-than-2-year institutions'
  }

  let metricLabels = {
    'completion_rate_150': 'Completion Rate',
    'share_outstanding_ug_5': 'Remaining Loan Balance',
    'cdr3_wgtd': 'Loan Default Rate',
    'pct25_earn_wne_p10': 'Postcollege Earnings'
  }

  let tooltipText = {
    'completion_rate_150': 'We define “completion” as students who earn their credential at their first institution within 150 percent of the normal time expected to finish (i.e., three years for associate degrees and six years for bachelor’s degrees). This slider sets the minimum allowable completion rate for an institution.',
    'share_outstanding_ug_5': 'We measure the outstanding loan balance after five years relative to the amount students owed when they entered repayment. The slider sets the maximum allowable ratio for an institution after five years.',
    'cdr3_wgtd': 'We measure the share of all students attending the institution who default on their loans within three years—not just the share of borrowers who default. This slider sets the maximum allowable loan default rate for an institution.',
    'pct25_earn_wne_p10': 'We measure whether three-quarters of students earn more than a specified threshold. This slider sets the minimum allowable earnings threshold for an institution.'
  }

  let passMetric = {
    'completion_rate_150': 'above',
    'share_outstanding_ug_5': 'below',
    'cdr3_wgtd': 'below',
    'pct25_earn_wne_p10': 'above'
  }

  let defaultMetric = {
    'completion_rate_150': 0.16,
    'share_outstanding_ug_5': 1.17,
    'cdr3_wgtd': 0.08,
    'pct25_earn_wne_p10': 16700
  }

  let filterLabels = {
    'Nonprofit': 'Private nonprofit',
    'Public': 'Public',
    'For-profit': 'For profit'
  }

  let colors = {
    'Nonprofit': '#1696D2',
    'Public': '#0A4C6A',
    'For-profit': '#FDBF11'
  }

  let margin, svg, g, gs, yScale, tickValues, totalHeight, yRange, stickyHeight;

  if (isMobile){
    margin = {top: 20, right: offsetWidth, bottom: 20, left: 100};
  } else {
    margin = {top: 20, right: offsetWidth, bottom: 20, left: 150};
  }

  let width = widthChart - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;

  let barWidth = isMobile ? 80 : 120,
      svgWidth = isMobile ? 320 : 350,
      svgHeight = 20,
      sliderHeight = isMobile ? 55 : 50;

  let xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, barWidth]);

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
        d.pass = state.metrics.reduce((a,b) => passMetric[b] === 'above' ? +(d[b] >= thresholds[b]) + a : +(d[b] <= thresholds[b]) + a, 0);
      })
      let passes;
      if (state.metrics.length === 0){
        passes = [];
      } else {
        passes = d3.range(0, state.metrics.length + 1);
      }
      schoolTypes.forEach(function(st){
        levels.forEach(function(level){
          let subset = st + ' ' + level
          let filteredSchools = schools.filter(function(s){
            return s.sector === subset;
          });
          if (state.button === 'students') {
            totals[subset] = filteredSchools.reduce(function(a,b){
              return a + b['est_fte']
            }, 0);
          } else {
            totals[subset] = filteredSchools.length;
          }
        })
      })

      d3.select("#right-col").selectAll(".pass-div").remove();
      // d3.select("#right-col")
      //   .style("height", window.outerHeight + 'px')

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
          if (d === 0){
            if (state.metrics.length === 1) {
              return "Fail";
            } else if (state.metrics.length === 2) {
              return "Fail both";
            } else {
              return "Fail all";
            }
          }
          if (d === state.metrics.length) {
            if (state.metrics.length === 1) {
              return "Pass";
            } else if (state.metrics.length === 2) {
              return "Pass both";
            } else {
              return "Pass all";
            }
          }
          return "Pass " + d;
        })

      passesName.enter().append("div")
        .attr("class", "pass-name")
        .html(function(d){
          if (d === 0){
            if (state.metrics.length === 1) {
              return "Fail";
            } else if (state.metrics.length === 2) {
              return "Fail both";
            } else {
              return "Fail all";
            }
          }
          if (d === state.metrics.length) {
            if (state.metrics.length === 1) {
              return "Pass";
            } else if (state.metrics.length === 2) {
              return "Pass both";
            } else {
              return "Pass all";
            }
          }
          return "Pass " + d;
        })

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

      let svgRects = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar").selectAll(".svg-bar")
        .data(function(d){
          return state.filters.map(function(st){
            let obj = {}
            obj.pass = d.pass;
            obj.level = d.level;
            obj.type = st;
            obj.subset = obj.type + ' ' + obj.level;
            let theseSchools = schools.filter(function(s){
              return ((s.pass === d.pass) && (s.sector === st + ' ' + d.level));
            })
            if (state.button === 'institutions') {
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

      let rects = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar").selectAll(".svg-bar").selectAll(".bar")
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
          return xScale(d.n / totals[d.subset] * 100);
        })

      rects.enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function(d){
          return colors[d.type];
        })
        .attr("height", svgHeight)
        .attr("x", xScale(0))
        .attr("y", 0)
        .attr("width", function(d){
          return xScale(d.n / totals[d.subset] * 100);
        })

      rects.exit().transition().duration(transitionTime).remove();

      let xOffset = 8;

      let text = d3.selectAll(".pass-div").selectAll(".institution-div").selectAll(".institution-level").selectAll(".institution-level-bar").selectAll(".svg-bar").selectAll("text")
        .data(function(d){
          return [d];
        })

      text.html(function(d){
          let nLabel = d.n > 999999 ? d3.format(",.1s")(d.n) : d.n > 9999 ? d3.format(".2s")(d.n).replace('k', 'K') : d.n > 999 ? d3.format(",.2r")(d.n) : d.n;
          let totalLabel = totals[d.subset] > 999999 ?  d3.format(",.1s")(totals[d.subset]) : totals[d.subset] > 9999 ? d3.format(".2s")(totals[d.subset]).replace('k', 'K') : totals[d.subset] > 999 ? d3.format(",.2r")(totals[d.subset]) : totals[d.subset];
          return '<tspan class="primary-metric">' + (d.n / totals[d.subset] * 100).toFixed(0) + '%</tspan> <tspan class="secondary-metric">(' + nLabel + '/' + totalLabel + ' ' + state.button + ')</tspan>';
        })
        .transition().duration(transitionTime)
        .attr("x", function(d){
          return xScale(d.n / totals[d.subset] * 100) + xOffset;
        })
        .attr("y", 14 + (svgHeight - 16)/2);

      text.enter().append("text")
        .html(function(d){
          let nLabel = d.n > 999999 ? d3.format(",.1s")(d.n) : d.n > 9999 ? d3.format(".2s")(d.n).replace('k', 'K') : d.n > 999 ? d3.format(",.2r")(d.n) : d.n;
          let totalLabel = totals[d.subset] > 999999 ?  d3.format(",.1s")(totals[d.subset]) : totals[d.subset] > 9999 ? d3.format(".2s")(totals[d.subset]).replace('k', 'K') : totals[d.subset] > 999 ? d3.format(",.2r")(totals[d.subset]) : totals[d.subset];
          return '<tspan class="primary-metric">' + (d.n / totals[d.subset] * 100).toFixed(0) + '%</tspan> <tspan class="secondary-metric">(' + nLabel + '/' + totalLabel + ' ' + state.button + ')</tspan>';
        })
        .attr("x", function(d){
          return xScale(d.n / totals[d.subset] * 100) + xOffset;
        })
        .attr("y", 14 + (svgHeight - 16)/2)
        .attr("fill", "black");

      text.exit().transition().duration(transitionTime).remove();

      let institutionLevelLegend, svgLegend, legendRects, legendText, svgLegendWidth;

      if (isMobile) {
        institutionLevelLegend = d3.select("#button-description").selectAll(".institution-level-legend")
          .data([filters]);

        institutionLevelLegend.attr("class", "institution-level-legend");

        institutionLevelLegend.enter().append("div")
          .attr("class", "institution-level-legend");

        institutionLevelLegend.exit().remove();
      } else {
        institutionLevelLegend = d3.selectAll(".pass-div").selectAll(".institution-level-legend")
          .data(function(d,i){
            if (i === 0) {
              return [filters];
            } else {
              return [];
            }
          });

        institutionLevelLegend.attr("class", "institution-level-legend");

        institutionLevelLegend.enter().append("div")
          .attr("class", "institution-level-legend");

        institutionLevelLegend.exit().remove();
      }

      if (isMobile) {
        svgLegend = d3.select("#button-description").selectAll(".institution-level-legend").selectAll(".legend-svg")
          .data(state.filters);

        svgLegendWidth = 140;
      } else {
        svgLegend = d3.selectAll(".pass-div").selectAll(".institution-level-legend").selectAll(".legend-svg")
          .data(state.filters);

        svgLegendWidth = 140;

        d3.selectAll(".pass-div")
          .selectAll(".institution-div")
          .selectAll(".institution-level")
          .selectAll(".institution-level-legend")
          .style("position", "absolute")
          .style("right", (svgLegendWidth + 10) + 'px');
      }

      svgLegend.attr("width", svgLegendWidth)
        .attr("height", svgHeight)
        .attr("class", "legend-svg");

      svgLegend.enter().append("svg")
        .attr("width", svgLegendWidth)
        .attr("height", svgHeight)
        .attr("class", "legend-svg");

      svgLegend.exit().remove();

      if (isMobile) {
        legendRects = d3.select("#button-description").selectAll(".institution-level-legend").selectAll(".legend-svg").selectAll(".square")
          .data(function(d){
            return [d];
          })
      } else {
        legendRects = d3.selectAll(".pass-div").selectAll(".institution-level-legend").selectAll(".legend-svg").selectAll(".square")
          .data(function(d){
            return [d];
          })
      }

      legendRects.transition().duration(transitionTime)
        .attr("fill", function(d){
          return colors[d];
        })
        .attr("height", svgHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", svgHeight);

      legendRects.enter().append("rect")
        .attr("class", "bar")
        .attr("fill", function(d){
          return colors[d];
        })
        .attr("height", svgHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", svgHeight);

      legendRects.exit().remove();

      if (isMobile) {
        legendText = d3.select("#button-description").selectAll(".institution-level-legend").selectAll(".legend-svg").selectAll("text")
          .data(function(d){
            return [d];
          })
      } else {
        legendText = d3.selectAll(".pass-div").selectAll(".institution-level-legend").selectAll(".legend-svg").selectAll("text")
          .data(function(d){
            return [d];
          })
      }

      legendText.html(function(d){
          return filterLabels[d];
        })
        .attr("x", svgHeight + 5)
        .attr("y", 14 + (svgHeight - 16)/2);

      legendText.enter().append("text")
        .attr("class", "legend-text")
        .html(function(d){
          return filterLabels[d];
        })
        .attr("x", svgHeight + 5)
        .attr("y", 14 + (svgHeight - 16)/2)
        .attr("fill", "black");

      legendText.exit().remove();

      // SET LINE HEIGHT FOR pass-name

      if (!isMobile){
        d3.selectAll(".pass-div")
          .each(function(d){
            let thisDiv = d3.select(this);
            let thisHeight = thisDiv.select(".institution-div").node().getBoundingClientRect().height;
            thisDiv.select(".pass-name")
              .style("line-height", thisHeight + 'px')
          })
      }
    }

    // ADD BUTTONS
    d3.select("#buttons").selectAll("span").remove();

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

    // Adjust their width
    let buttonsWidth = buttonsSpan._groups[0].map(function(b){
          return d3.select(b).node().getBoundingClientRect().width;
        }).reduce(function(a,b){
          return a + b;
        }, 0);
    let buttonsDivWidth = d3.select("#buttons").node().getBoundingClientRect().width;

    d3.select("#buttons").selectAll("span")
      .style("padding-left", (buttonsDivWidth - buttonsWidth)/4 + 'px')
      .style("padding-right", (buttonsDivWidth - buttonsWidth)/4 + 'px')

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

    let step;

    sliders.selectAll("svg")
      .data(function(d) {
        if (d == 'pct25_earn_wne_p10') {
          step = 500;
        } else {
          step = 0.01;
        }
        let thisSlider = d3.select(this);
        let obj = {};
        obj.metric = d;
        [obj.min, obj.max] = d3.extent(schools, function(s){
          return s[d];
        });
        obj.max = (Math.floor(obj.max/step) + 1) * step;
        let delta = (obj.max - obj.min) / 10.;
        let tickValues = d3.range(obj.min, obj.max + delta, delta);
        obj.slider = d3.sliderHorizontal()
          .min(obj.min)
          .max(obj.max)
          .step(step)
          .width(290)
          .tickValues(tickValues)
          .tickFormat(function(t, i){
            if (i === 0 || i === tickValues.length - 1) {
              if (d === 'pct25_earn_wne_p10') {
                return d3.format(",")(t);
              } else {
                return (t * 100).toFixed(0) + '%';
              }
            } else {
              return "";
            }
          })
          .displayFormat(function(t){
            if (d === 'pct25_earn_wne_p10') {
              return d3.format(",")(t);
            } else {
              return (t * 100).toFixed(0) + '%';
            }
          })
          .handle("M -10, 0 m 0, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0")
          .on("end", function(val) {
            let leftOffset = thisSlider.select(".parameter-value").node().transform.baseVal.getItem(0).matrix.e;
            if (passMetric[d] === 'below') {
              thisSlider.select(".track-inset")
                .attr("x1", leftOffset);
            } else {
              thisSlider.select(".track-inset")
                .attr("x2", leftOffset);
            }
            thresholds[d] = val;
            updateRects();
          })
          .on("drag", function(val) {
            let leftOffset = thisSlider.select(".parameter-value").node().transform.baseVal.getItem(0).matrix.e;
            if (passMetric[d] === 'below') {
              thisSlider.select(".track-inset")
                .attr("x1", leftOffset);
            } else {
              thisSlider.select(".track-inset")
                .attr("x2", leftOffset);
            }
          });

        obj.slider.default(defaultMetric[d])
        thresholds[d] = defaultMetric[d];
        return [obj]
      })
      .join('svg')
        .attr("viewBox", [-20, -20, 340, sliderHeight])
        .attr("width", "93%")
        .attr("height", sliderHeight)
        .each(function(d,i,j) {
          d3.select(j[0]).call(d.slider);
          let leftOffset = d3.select(j[0]).select(".parameter-value").node().transform.baseVal.getItem(0).matrix.e;
          if (passMetric[d.metric] === 'below') {
            d3.select(j[0]).select(".track-inset")
              .attr("x1", leftOffset);
          } else {
            d3.select(j[0]).select(".track-inset")
              .attr("x2", leftOffset);
          }
          d3.select(j[0]).selectAll(".tick").selectAll("line")
            .attr("y2", 11)
            .attr("stroke", "#D2D2D2");
          d3.select(j[0]).selectAll(".axis")
            .attr("transform", "translate(0,2)");
          d3.select(j[0]).selectAll(".slider")
            .attr("transform", "translate(0,-5)");

        });

    d3.select("#reset")
      .on("click", function(d){
        // RESET FILTERS
        sliders.selectAll("svg")
          .each(function(s,i,j){
            state.metrics = metrics;
            sliders.selectAll(".slider-name")
              .select("input")
              .property("checked", function(d){
                return state.metrics.indexOf(d) >= 0;
              });

            thresholds[s.metric] = defaultMetric[s.metric];
            s.slider.value(thresholds[s.metric]);
            d3.select(j[0]).call(s.slider);

            d3.select(j[0]).selectAll(".axis")
              .attr("transform", "translate(0,2)");
            d3.select(j[0]).selectAll(".slider")
              .attr("transform", "translate(0,-5)");

            let thisSlider = d3.select(this);
            let leftOffset = thisSlider.select(".parameter-value").node().transform.baseVal.getItem(0).matrix.e;
            if (passMetric[s.metric] === 'below') {
              thisSlider.select(".track-inset")
                .attr("x1", leftOffset);
            } else {
              thisSlider.select(".track-inset")
                .attr("x2", leftOffset);
            }
          })

        // RESET FILTERS
        state.filters = schoolTypes;
        d3.select("#filters-buttons").selectAll("span")
          .classed("selected", true);

        updateRects();
        updateSliders();
      })

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
            state.filters = schoolTypes.filter(function(f){
              return state.filters.includes(f);
            })
          }
          d3.select(this).classed("selected", !thisSelected);
          updateRects()
        })

    // SHOW/HIDE SLIDERS FOR MOBILE

    function hideSliders() {
      d3.select("#slider-filters").style("display", "none");
      d3.select("#show-button").html("Show sliders");
    }

    function showSliders() {
      d3.select("#slider-filters").style("display", "block");
      d3.select("#show-button").html("Hide sliders");
    }

    if (isMobile) {
      d3.select("#slider-filters").style("display", "none");
      d3.select("#show-sliders").style("display", "inline-block");
      d3.select("#interactive").style("height", window.outerHeight + 'px');
      d3.select("#show-button")
        .html(function(){
          if (state.showingSliders === true) {
            return "Hide sliders";
          } else {
            return "Show sliders";
          }
        })
        .on("click", function(){
          if (state.showingSliders === true) {
            hideSliders();
          } else {
            showSliders();
          }
          state.showingSliders = !state.showingSliders;
        })
    }

    updateSliders();
    updateRects();

    if(pymChild) {
      setTimeout(() => {
        pymChild.sendHeight();
        pymChild.remove();
      }, "2000")
    }
  })
}

window.onload = setTimeout(() => {
  onWindowLoaded();
}, "2000");

var graph1, graph2;
function setIncomeMap() {
  income2000 = "";
  income2010 = "";
  quantizeRange = 9;
  incomeColor = d3.scale.category20b().domain(d3.range(quantizeRange-1));
  console.log(incomeColor.domain().length);
  active = d3.select(null);
  // Create projection and path
  off = [width/2, height/2],
  s   = 140000;
  projection = d3.geo.mercator()
      .scale(s)
      .center([-73.938, 40.6545])
      .translate(off);
  
  // Create zoom behavior
  zoom = d3.behavior.zoom()
    .translate([0,0])
    .scale(1)
    .scaleExtent([1,8])
    .on("zoom", zoomed);
  width = 550;
  height = 350;
  path.projection(projection);

  // Create 2000/2010 Income Map
  income2000_svg = d3.select("#data2000").append("svg")
      .attr('class', "income")
      .attr("width", width)
      .attr("height", height)
      .attr("border", border)
      .attr("align", "center")
      .on("click", stopped, true);
  income2010_svg = d3.select("#data2010").append("svg")
      .attr('class', "income")
      .attr("width", width)
      .attr("height", height)
      .attr("border", border)
      .attr("align", "center")
      .on("click", stopped, true);

  // Add rect for zooming to each graph
  income2000_svg.append("rect")
      .attr("class", "background")
      .attr("height", height)
      .attr("width", width)
      .on("click", reset);
  income2010_svg.append("rect")
      .attr("class", "background")
      .attr("height", height)
      .attr("width", width)
      .on("click", reset);

  // Add div to each graph
  graph1 = d3.select("#graph2000").append("div")
    .attr("id", "dataGraph1")
    .attr("float", "left")
    .attr("width", 500)
    .attr("height", 200);

  graph2 = d3.select("#graph2010").append("div")
    .attr("float", "left")
    .attr("id", "dataGraph2")
    .attr("width", 500)
    .attr("height", 200);


  // Append group to each svg
  g1 = income2000_svg.append("g")
    .attr("width", width)
    .attr("height", height);
  g2 = income2010_svg.append("g")
    .attr("width", width)
    .attr("height", height);
  
  // Call Zoom event
  income2000_svg.call(zoom).call(zoom.event);
  income2010_svg.call(zoom).call(zoom.event);


  // load income data to maps
  loadIncomeMapData();
  //buildIncomeGraphs();
}

// Uses queue to load json and csv files in order
function loadIncomeMapData() {
  queue() 
      .defer(d3.json, file2000)
      .defer(function(url, callback) { 
          d3.csv(url, function(d) { 
            return {
              id: d.GEOid,
              geography: d.GEOdisplay_label,
              num_hd: d.HC01_VC02,
              avg_hd_income: d.HC01_VC20
            };
          }, function(error, rows) {
            income2000 = rows;
            maxMinMedian2000 = getIncomeInfo(income2000); // from choropleth.js
          })
          callback();
        }, "Average_Income/incomeCensus2000_2.csv")

      .defer(d3.json, file2010)
      .defer(function(url, callback) { 
          d3.csv(url, function(d) { 
            return {
              id: d.GEOid,
              geography: d.GEOdisplay_label,
              num_hd: d.HC01_EST_VC02,
              avg_hd_income: d.HC02_EST_VC02
            };
          }, function (error, rows) {
            income2010 = rows;
            maxMinMedian2010 = getIncomeInfo(income2010); // from choropleth.js
          })
          callback();
        }, "Average_Income/incomeCensus2010_2.csv")
      .await(processIncomeData);
}

// Called once processing csv and json is complete
function processIncomeData(error,ct2000,income2000,ct2010,income2010) {
  if (error) return console.error(error);
  processIncome2000(ct2000);
  processIncome2010(ct2010);
}

function processIncome2000(map) {
	var tracts = topojson.feature(map, map.objects.tracts).features;

  // quantize function to determine range of class
  var quantize = d3.scale.quantize()
    .domain([maxMinMedian2000[0], maxMinMedian2000[1]])
    .range(d3.range(quantizeRange).map(function(i) { return "q"+i; }));
  
 var borderPath = income2000_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");

	g1.selectAll("path")
		.data(tracts)
		.enter()
		.append("path")
		.attr("class", function(d) { 
      return createTractClass(d, quantize, income2000, false); 
    })
    .on("click", clicked)
		.attr("d", path);
    //create legend
  iter=1;
  income2000legend = income2000_svg.selectAll('.legend')
    .data(incomeColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * (incomeColor.domain().length) / 2;
      var horz =  width-legendRectSize-90;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });

    income2000legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
        num = iter;
        iter++;
        return "q"+num;
      }));

    iter = 1;
    income2000legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { 
        switch(iter) {
          case 1:
            minRange = 0;
            maxRange = "1k";
            break;
          case 2:
            minRange =  "10k";
            maxRange = "25k";
            break;
          case 3:
            minRange = "25k";
            maxRange = "50k";
            break;
          case 4:
            minRange = "50k";
            maxRange =  "75k";
            break;
          case 5:
            minRange =  "75k";
            maxRange = "100k";
            break;
          case 6:
            minRange = "100k";
            maxRange = "150k";
            break;
          case 7:
            minRange = "150k";
            maxRange = "200k";
            break;
          case 8:
            minRange = "200k";
            maxRange = ">";
            break;
        }
        iter++;
        return minRange + " - " + maxRange;
      });

}

function processIncome2010(map) {
  var tracts = topojson.feature(map, map.objects.tracts).features;
  
  // quantize function to determine range of class
  var quantize = d3.scale.quantize()
      .domain([maxMinMedian2010[0], maxMinMedian2010[1]])
      .range(d3.range(quantizeRange).map(function(i) { return "q"+i; }));

 var borderPath = income2010_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");

	g2.selectAll("path")
		.data(tracts)
		.enter()
		.append("path")
		.attr("class", function(d) {
      return createTractClass(d, quantize, income2010, true);
    })
    .on("click", clicked)
		.attr("d", path);

  //create legend
  iter=1;
  income2010legend = income2010_svg.selectAll('.legend')
    .data(incomeColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * incomeColor.domain().length / 2;
      var horz =  width-legendRectSize-90;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });

    income2010legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
        num = iter;
        iter++;
        return  "q"+num;
        
      }));

    iter = 1;

  income2010legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { 
      switch(iter) {
        case 1:
          minRange = 0;
          maxRange = "1k";
          break;
        case 2:
          minRange =  "10k";
          maxRange = "25k";
          break;
        case 3:
          minRange = "25k";
          maxRange = "50k";
          break;
        case 4:
          minRange = "50k";
          maxRange =  "75k";
          break;
        case 5:
          minRange =  "75k";
          maxRange = "100k";
          break;
        case 6:
          minRange = "100k";
          maxRange = "150k";
          break;
        case 7:
          minRange = "150k";
          maxRange = "200k";
          break;
        case 8:
          minRange = "200k";
          maxRange = ">";
          break;
      }
        iter++;
      return minRange + " - " + maxRange;
      });
}

// Used to add class based on income
function createTractClass(d, quantize, incomeArray, is2010) {
  if(d.id != 3) {
    d.properties.classVal = "tract";
    return "tract";
  }
  
  for (i = 0; i< incomeArray.length; i++) {
    var ct = incomeArray[i].geography;
    var income = incomeArray[i].avg_hd_income;
    ct = ct.match( /Census Tract (.*?),/ )[1];
    if (ct == d.properties.ct) {
      d.properties.income = incomeArray[i]; // Add income to properties
      if (income == "-" || isNaN(income)) {
        d.properties.classVal = "q9";
        return "q9";  // There is no data for this tract
      }
      if(is2010) {(d.properties.year = 2010)} else d.properties.year = 2000;
      var quantVal = getClassValue(income);
      d.properties.classVal = quantVal;
      return quantVal;
    } 
  }
  d.properties.classVal = "tract";
  return "tract";
}

function buildIncomeGraphs(active){

  console.log(active);
  var floatMedian2000 = maxMinMedian2000[2];
  var floatMedian2010 = maxMinMedian2010[2];
  var alternateIncome = 0;
  var avgTractIncome = active[0][0].__data__.properties.income.avg_hd_income;
  var currentTract = active[0][0].__data__.properties.ct;
  var activeMapYear = active[0][0].__data__.properties.year;
  if(activeMapYear == 2000) {
    for(var i=0; i<income2010.length; i++){
      var ct = income2010[i].geography;
      ct = ct.match( /Census Tract (.*?),/ )[1];
      if(ct == currentTract){
        tractIncome2010 = parseFloat(income2010[i].avg_hd_income);
        tractIncome2000 = parseFloat(avgTractIncome);
      }
    }
  } else {
    for(var i=0; i<income2000.length; i++){
      var ct = income2000[i].geography;
      ct = ct.match( /Census Tract (.*?),/ )[1];
      if(ct == currentTract){
        tractIncome2000 = parseFloat(income2000[i].avg_hd_income);
        tractIncome2010 = parseFloat(avgTractIncome);
      }
    }
  }
  var maxIdentifier = Math.max(floatMedian2000, floatMedian2010, tractIncome2000, tractIncome2010);
  var barChart1 = new Highcharts.Chart({
        chart: {
            type: 'column',
            renderTo: 'dataGraph1',
            width: 400,
            height:250
        },
        title: {
            text: 'Average Household Income, 2000'
        },
        subtitle: {
            text: 'Source: US Census, 2000'
        },
        xAxis: {
            categories: [
                ''
            ]
        },
        yAxis: {
            min: 0,
            max: maxIdentifier,
            title: {
                text: 'Household Income (Dollars)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Brooklyn Average',
            data: [floatMedian2000]

        }, {
            name: 'This Tract',
            data: [tractIncome2000]

        }]
    });
  var barChart2 = new Highcharts.Chart({
        chart: {
            type: 'column',
            renderTo: 'dataGraph2',
            width: 400,
            height: 250
        },
        title: {
            text: 'Average Household Income, 2010'
        },
        subtitle: {
            text: 'Source: US Census, 2010'
        },
        xAxis: {
            categories: [
                ''
            ]
        },
        yAxis: {
            min: 0,
            max: maxIdentifier,
            title: {
                text: 'Household Income (Dollars)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Brooklyn Average',
            data: [floatMedian2010]

        }, {
            name: 'This Tract',
            data: [tractIncome2010]

        }]
    });
    /*var piechart2 = new Highcharts.Chart({
    chart: {
        renderTo: 'dataGraph2',
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false,
            width: 400,
            align: "center",
            height: 250
        },
        title: {
            text: 'Income Data, 2000'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: [
                ['Firefox',   45.0],
                ['IE',       26.8],
                {
                    name: 'Chrome',
                    y: 12.8,
                    sliced: true,
                    selected: true
                },
                ['Safari',    8.5],
                ['Opera',     6.2],
                ['Others',   0.7]
            ]
        }]
    });*/

}

function resetIncomeGraphs() {
  graph1[0][0].innerHTML = null;
  graph2[0][0].innerHTML = null;
}

function getClassValue(income) {
  switch(true) {
    case income > 0 && income <= 10000:
      return "q1";
    case income > 10000 && income < 25000:
      return "q2";
    case income >= 25000 && income < 50000:
      return "q3";
    case income >= 50000 && income < 75000:
      return "q4";
    case income >= 75000 && income < 100000:
      return "q5";
    case income >= 100000 && income < 150000:
      return "q6";
    case income >= 150000 && income < 200000:
      return "q7";
    case income >= 200000:
      return "q8";
    default:
      return "q9";
  }
}

function findDumbo(){

}

var eduGraph1, eduGraph2;

function setEducationMap() {
  active = d3.select(null);
  eduColor =  eduColor = d3.scale.category20b().domain(d3.range(5));
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

  path.projection(projection);

  // Create 2000/2010 Edu Map
  edu2000_svg = d3.select("#eduData2000").append("svg")
  		.attr('class', "education")
  		.attr("width", width)
  		.attr("height", height)
      .attr("align", "center")
  		.on("click", stopped, true);
  edu2010_svg = d3.select("#eduData2010").append("svg")
      .attr('class', "education")
      .attr("width", width)
      .attr("height", height)
      .attr("border", border)
      .attr("align", "center")
      .on("click", stopped, true);

  // Add rect for zooming to each graph
  edu2000_svg.append("rect")
  		.attr("class", "background")
  		.attr("width", width)
  		.attr("height", height)
  		.on("click", reset);
  edu2010_svg.append("rect")
      .attr("class", "background")
      .attr("height", height)
      .attr("width", width)
      .on("click", reset);

  // Add div to each group
  eduGraph1 = d3.select("#eduGraph2000").append("div")
      .attr("id", "eduDataGraph1")
      .attr("float", "left")
      .attr("width", 500)
      .attr("height", 200);
  eduGraph2 = d3.select("#eduGraph2010").append("div")
      .attr("id", "eduDataGraph2")
      .attr("float", "left")
      .attr("width", 500)
      .attr("height", 200);

  // Append group to each svg
  g3 = edu2000_svg.append("g")
      .attr("width", width)
      .attr("height", height);
  g4 = edu2010_svg.append("g")
      .attr("width", width)
      .attr("height", height);

  // Call zoom event
  edu2000_svg.call(zoom).call(zoom.event);
  edu2010_svg.call(zoom).call(zoom.event);   

  // load education data to maps
  loadEducationMap();
}

function loadEducationMap() {
	queue()
		.defer(d3.json, file2000)
		.defer(function(url, callback) { 
		  d3.csv(url, function(d) { 
		    return {
		      id: d.GEOdisplay_label.match( /Census Tract (.*?),/ )[1],
		      geoId: d.GEOid,
		      geography: d.GEOdisplay_label,
		      // pop_18_24: d.pop_18_24,
		      // edu_less_high: d.edu_less_high,
		      // edu_high: d.edu_high,
		      // edu_some_coll: d.edu_some_coll,
		      // edu_bachelor: d.edu_bachelor,
		      pop_25_older: d.pop_25_older,
		      edu_9_12_25_older: d.edu_9_12_25_older,
		      edu_high_25_older: d.edu_high_25_older,
		      edu_some_coll_25_older: d.edu_some_coll_25_older,
		      edu_associates_25_older: d.edu_associates_25_older,
		      edu_bachelors_25_older: d.edu_bachelors_25_older
		    };
		  }, function(error, rows) {
		    edu2000 = rows;
		    //maxMin2000 = getIncomeInfo(income2000); // from choropleth.js
		  })
		  callback();
		}, "education/2000education.csv")

		.defer(d3.json, file2010)
		.defer(function(url, callback) { 
		  d3.csv(url, function(d) { 
		    return {
		      id: d.GEOdisplay_label.match( /Census Tract (.*?),/ )[1],
		      geoId: d.GEOid,
		      geography: d.GEOdisplay_label,
		      // pop_18_24: d.total_pop_18_24,
		      // edu_less_high: d.edu_less_high,
		      // edu_high: d.edu_high,
		      // edu_some_coll: d.edu_some_coll,
		      // edu_bachelor: d.edu_bachelor,
		      pop_25_older: d.total_pop_25_older,
		      edu_9_12_25_older: d.edu_9_12_no_diploma_25_older,
		      edu_high_25_older: d.edu_high_25_older,
		      edu_some_coll_25_older: d.edu_some_coll_25_older,
		      edu_associates_25_older: d.edu_associates_25_older,
		      edu_bachelors_25_older: d.edu_bachelors_25_older
		    };
		  }, function(error, rows) {
		  	edu2010 = rows;
		    //maxMin2010 = getIncomeInfo(income2010); // from choropleth.js
		  })
		  callback();
		}, "education/2010education.csv")
		.await(processEducationData);
}

function processEducationData(err,ct2000,edu2000,ct2010,edu2010) {
	if(err) return console.log(err);
	processEducation2000(ct2000);
	processEducation2010(ct2010);
}

function processEducation2000(map) {
	var tracts = topojson.feature(map, map.objects.tracts).features;

 var borderPath = edu2000_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");

	g3.selectAll("path")
		.data(tracts)
		.enter()
		.append("path")
		.attr("class", function(d) {
	      return createEducationTractClass(d, edu2000, false);
	    })
    	.on("click", clicked)
		.attr("d", path);
  legend = edu2000_svg.selectAll('.legend')
    .data(eduColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height *eduColor.domain().length / 2;
      var horz =  width - 115 -legendRectSize;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });
    iter = 1;
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
       switch(iter++) {
        case 1:
          return "edu_9_12_25_older";     
        case 2:
          return "edu_high_25_older";
        case 3:
          return "edu_some_coll_25_older";
        case 4:
          return "edu_associates_25_older";
        case 5:
          return "edu_bachelors_25_older";         
       }
      }));

    iter = 1;

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { 
        switch(iter++) {
        case 1:
          return "No HS Diploma";     
        case 2:
          return "High School";
        case 3:
          return "Some College";
        case 4:
          return "Associates";
        case 5:
          return "Bachelors";         
       }
      });
}

function processEducation2010(map) {
	var tracts = topojson.feature(map, map.objects.tracts).features;

 var borderPath = edu2010_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");

	g4.selectAll("path")
		.data(tracts)
		.enter()
		.append("path")
		.attr("class", function(d) {
	      return createEducationTractClass(d, edu2010, true);
	    })
    	.on("click", clicked)
		.attr("d", path);
   legend = edu2010_svg.selectAll('.legend')
    .data(eduColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height *eduColor.domain().length / 2;
      var horz =  width - 115 -legendRectSize;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });
    iter = 1;
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
       switch(iter++) {
        case 1:
          return "edu_9_12_25_older";     
        case 2:
          return "edu_high_25_older";
        case 3:
          return "edu_some_coll_25_older";
        case 4:
          return "edu_associates_25_older";
        case 5:
          return "edu_bachelors_25_older";         
       }
      }));

    iter = 1;

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { 
        switch(iter++) {
        case 1:
          return "No HS Diploma";     
        case 2:
          return "High School";
        case 3:
          return "Some College";
        case 4:
          return "Associates";
        case 5:
          return "Bachelors";         
       }
      });
}

function createEducationTractClass(d, eduArray, is2010) {
	if (d.id != 3) {
		d.properties.classVal = "tract";
		return "tract";
	}

	for (var i = 0; i < eduArray.length; i++) {
		var tract = eduArray[i].id;
		if (tract == d.properties.ct) {
			d.properties.education = eduArray[i];
			var eduClass = getEducationInfo(d.properties.education);
			if(eduClass === undefined) {
				d.properties.classVal = "tract";
				return "tract";
			} else {
        if(is2010) {(d.properties.year = 2010)} else d.properties.year = 2000;
				d.properties.classVal = eduClass;
				return eduClass;
			}
		}
	};
	d.properties.classVal = "tract";
	return "tract";
}

function resetEducationGraphs() {
  eduGraph1[0][0].innerHTML = null;
  eduGraph2[0][0].innerHTML = null;
}

function buildEducationGraphs(active){
  var activeEducationArray = active[0][0].__data__.properties.education;
  var currentTract = active[0][0].__data__.properties.ct;
  var activeMapYear = active[0][0].__data__.properties.year;
    if(activeMapYear == 2000) {
    for(var i=0; i<edu2010.length; i++){
      var ct = edu2010[i].geography;
      ct = ct.match( /Census Tract (.*?),/ )[1];
      if(ct == currentTract){
        tractEducationBreakdown2010 = edu2010[i];
        tractEducationBreakdown2000 = activeEducationArray;
      }
    }
  } else {
    for(var i=0; i<edu2000.length; i++){
      var ct = edu2000[i].geography;
      ct = ct.match( /Census Tract (.*?),/ )[1];
      if(ct == currentTract){
        tractEducationBreakdown2000 = edu2000[i];
        tractEducationBreakdown2010 = activeEducationArray;
      }
    }
  }
  var noHS2000 = parseInt(tractEducationBreakdown2000.edu_9_12_25_older);
  var hs2000 = parseInt(tractEducationBreakdown2000.edu_high_25_older);
  var someCollege2000 = parseInt(tractEducationBreakdown2000.edu_some_coll_25_older);
  var associates2000 = parseInt(tractEducationBreakdown2000.edu_associates_25_older);
  var bachelors2000 = parseInt(tractEducationBreakdown2000.edu_bachelors_25_older);

  var noHS2010 = parseInt(tractEducationBreakdown2010.edu_9_12_25_older);
  var hs2010 = parseInt(tractEducationBreakdown2010.edu_high_25_older);
  var someCollege2010 = parseInt(tractEducationBreakdown2010.edu_some_coll_25_older);
  var associates2010 = parseInt(tractEducationBreakdown2010.edu_associates_25_older);
  var bachelors2010 = parseInt(tractEducationBreakdown2010.edu_bachelors_25_older);

  var piechart1 = new Highcharts.Chart({
    chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false,
            width: 450,
            align: "center",
            height: 250,
            renderTo: "eduDataGraph1"
        },
        title: {
            text: 'Education Data, 2000'
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
            name: 'Education Level by Census Tract',
            data: [
                ['No HS Diploma',     noHS2000],
                ['High School Diploma',     hs2000],
                ['Some College',           someCollege2000],
                ['Associates Degree',     associates2000],
                ['Bachelors Degree',  bachelors2000],
            ]
        }]
    });
  var piechart2 = new Highcharts.Chart({
    chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false,
            width: 450,
            align: "center",
            height: 250,
            renderTo: "eduDataGraph2"
        },
        title: {
            text: 'Education Data, 2010'
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
            name: 'Education Level by Census Tract',
            data: [
                ['No HS Diploma',     noHS2010],
                ['High School Diploma',     hs2010],
                ['Some College',           someCollege2010],
                ['Associates Degree',     associates2010],
                ['Bachelors Degree',  bachelors2010],
            ]
        }]
    });
}







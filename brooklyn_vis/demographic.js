// load dem data to maps
var demGraph1, demGraph2;

function setDemMap() {
  demQuantizeRange = 9;
  active = d3.select(null);
  demColor = d3.scale.category20b().domain(d3.range(demQuantizeRange));
  // Create projection and path
  demOff = [width/2, height/2],
  demS   = 140000;
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

  // Create 2000/2010 Demographic Map
  dem2000_svg = d3.select("#demData2000").append("svg")
      .attr('class', "demographics")
			.attr("width", width)
			.attr("height", height)
			.attr("border", border)
      .attr("align", "center")
      .on("click", stopped, true);
  dem2010_svg = d3.select("#demData2010").append("svg")
      .attr('class', "demographics")
      .attr("width", width)
      .attr("height", height)
      .attr("border", border)
      .attr("align", "center")
      .on("click", stopped, true);

  // Add rect for zooming to each graph
  dem2000_svg.append("rect")
      .attr("class", "background")
      .attr("height", height)
      .attr("width", width)
      .on("click", reset);
  dem2010_svg.append("rect")
      .attr("class", "background")
      .attr("height", height)
      .attr("width", width)
      .on("click", reset);

  // Add div to each group
  demGraph1 = d3.select("#demGraph2000").append("div")
      .attr("id", "demDataGraph1")
      .attr("float", "left")
      .attr("width", 500)
      .attr("height", 200)
  demGraph2 = d3.select("#demGraph2010").append("div")
      .attr("id", "demDataGraph2")
      .attr("float", "left")
      .attr("width", 500)
      .attr("height", 200)

  // Append group to each svg
  demG1 = dem2000_svg.append("g")
      .attr("width", width)
      .attr("height", height);
  demG2 = dem2010_svg.append("g")
      .attr("width", width)
      .attr("height", height);

  dem2000_svg.call(zoom).call(zoom.event);
  dem2010_svg.call(zoom).call(zoom.event);  

  loadDemMapData(race);
}

// Uses queue to load json and csv files in order
function loadDemMapData(set_race) {
  race = set_race;
  queue() 
    .defer(d3.json, file2000)
    .defer(function(url, callback) { 
      d3.csv(url, function (d) {
        return {
          id: d.GEOid,
          geography: d.GEOdisplay_label.match( /Census Tract (.*?),/ )[1],
          total_ppl: d.HC01_VC01,
          white: d.HC02_VC29,
          black: d.HC02_VC30,
          indian_alaskan: d.HC02_VC31,
          asian: d.HC02_VC32,
          hawaiian_pacific:d.HC02_VC40,
          other: d.HC02_VC45,
          multiple: d.HC02_VC46,
          hispanic: d.HC02_VC56
        };
    }, function(error, rows) {
        demData2000 = rows;
        demMaxMin2000 = getDemInfo(demData2000, race);
    })
    callback();
    },"demData/2000demographic.csv")

    .defer(d3.json, file2010)
    .defer(function(url, callback) { 
      d3.csv(url, function (d) {
        return {
          id: d.GEOid,
          geography: d.GEOdisplay_label.match( /Census Tract (.*?),/ )[1],
          total_ppl: d.HD01_S076,
          white: d.HD02_S078,
          black: d.HD02_S079,
          indian_alaskan: d.HD02_S080,
          asian: d.HD02_S081,
          hawaiian_pacific:d.HD02_S089,
          other: d.HD02_S094,
          multiple: d.HD02_S095,
          hispanic: d.HD02_S114
        };
    }, function(error, rows) {
        demData2010 = rows;
        demMaxMin2010 = getDemInfo(demData2010, race);
    })
    callback();
    },"demData/2010demographic.csv")
    .await(processDemData);
}

// Called once processing csv and json is complete
function processDemData(error,ct2000,demData2000,ct2010,demData2010) {
  if (error) return console.error(error);
  demCSV2000 = ct2000;
  demCSV2010 = ct2010;
  processDem2000(ct2000);
  processDem2010(ct2010);
}

function processDem2000(map) {
	var tracts = topojson.feature(map, map.objects.tracts);

  // quantize function to determine range of class
 var quantize = d3.scale.quantize()
    .domain([demMaxMin2000[0], demMaxMin2000[1]])
    .range(d3.range(demQuantizeRange).map(function(i) { return "d"+i; }));

 var borderPath = dem2000_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");
  
	demG1.selectAll("path")
		.data(tracts.features)
		.enter()
		.append("path")
		.attr("class", function(d) { 
      return createDemTractClass(d, quantize, demData2000, race, false); 
    })
    .on("click", clicked)
		.attr("d", path);
  
  
  
  dem2000legend = dem2000_svg.selectAll('.legend')
    .data(demColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * demColor.domain().length / 2;
      var horz =  width-90-legendRectSize;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });
      
    iter = 1;
    dem2000legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
        num = iter;
        iter++;
        return  quantize((num)/(demQuantizeRange)*demMaxMin2000[1]);
      }));

    iter = 1;

    dem2000legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .data(tracts.features)
      .text(function(d) { 
        minRange = ((iter-1)/(demQuantizeRange)*demMaxMin2000[1]);
        maxRange = (iter/(demQuantizeRange)*demMaxMin2000[1]);
        if (iter<0)
          minRange = 0.00;
        var str = minRange.toFixed(0) + "% - " + maxRange.toFixed(0)+"%";
        iter++;
        return str;
        });
    /*  demG1.selectAll("text")
		.data(tracts.features)
    .enter()
    .append("svg:text")
    .attr("class", "incomeHover")
    .text(function(d) {
      for (i = 0; i< demData2000.length; i++) {
        var map_ct = d.properties.ct;
        var ct = demData2000[i].geography;
        if (parseFloat(ct) == parseFloat(map_ct)) {
           return getDemographic(demData2000[i], race);
          } 
        }
      return "";
     })
    .attr("x", function(d){
      return path.centroid(d)[0];
    })
    .attr("y", function(d){
      return  path.centroid(d)[1];
    })
    .attr("text-anchor","middle")
    .attr('font-size','6pt');*/
}

function processDem2010(map) {
	var tracts = topojson.feature(map, map.objects.tracts);
  
  // quantize function to determine range of class
  var quantize = d3.scale.quantize()
    .domain([demMaxMin2010[0], demMaxMin2010[1]])
    .range(d3.range(demQuantizeRange).map(function(i) { return "d"+i; }));

 var borderPath = dem2010_svg.append("rect")
   .attr("x", 1)
   .attr("y", 1)
   .attr("height", height-2)
   .attr("width", width-2)
   .attr("class", "rect-border")
   .style("fill", "None");

	demG2.selectAll("path")
		.data(tracts.features)
		.enter()
		.append("path")
		.attr("class", function(d) {
      return createDemTractClass(d, quantize, demData2010, race, true);
    })
    .on("click", clicked)
		.attr("d", path);
  
  dem2010legend = dem2010_svg.selectAll('.legend')
    .data(demColor.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * demColor.domain().length / 2;
      var horz =  width-90-legendRectSize;
      var vert = i * height+10;
      return 'translate(' + horz + ',' + vert + ')';
    });
    iter = 1;
    dem2010legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('stroke', "#000")
      .attr('class', (function (d) {
        num = iter;
        iter++;
        return  quantize(num/(demQuantizeRange)*demMaxMin2000[1]);
      }));

    iter = 1;

    dem2010legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .data(tracts.features)
      .text(function(d) { 
        minRange = ((iter-1)/(demQuantizeRange)*demMaxMin2000[1]);
        maxRange = (iter/(demQuantizeRange)*demMaxMin2000[1]);
        if (iter<0)
          minRange = 0.00;
        var str = minRange.toFixed(0) + "% - " + maxRange.toFixed(0)+"%";
        iter++;
        return str;
        });

 /* demG2.selectAll("text")
    .data(tracts.features)
    .enter()
    .append("svg:text")
    .attr("class", "incomeHover")
    .text(function(d) {
      for (i = 0; i< demData2010.length; i++) {
        var map_ct = d.properties.ct; //strip leading 0
        var ct = demData2010[i].geography; //remove special chars
      
          if (parseFloat(ct) == parseFloat(map_ct)) {
                return getDemographic(demData2010[i], race);
          } 
        }
      return "";
     })
    .attr("x", function(d){
      return path.centroid(d)[0];
    })
    .attr("y", function(d){
      return  path.centroid(d)[1];
    })
    .attr("text-anchor","middle")
    .attr('font-size','6pt');*/
}

// Used to add class based on Demographics 
function createDemTractClass(d, quantize, demArray, race, is2010) {
   if(d.id != 3) {
    d.properties.classVal = "tract";
    return "tract";
  }
  var dem;
  for (i = 0; i< demArray.length; i++) {
    var ct = demArray[i].geography;
    dem = getDemographic(demArray[i], race);
    if (parseFloat(ct) == parseFloat(d.properties.ct)) {
      d.properties.demographic = demArray[i]; // Add income to properties
      
      if (dem == "-" || isNaN(dem)) {
        d.properties.classVal = "d9";
        return "d9";  // There is no data for this tract
      }
      if(is2010) {(d.properties.year = 2010)} else d.properties.year = 2000;
      var quantVal = quantize(parseFloat(dem));
      //console.log(quantVal);
      d.properties.classVal = quantVal;
      return quantVal;
    } 
  }
}


//return population of given tract and race - mo words
function getDemographic(t, r) {
   switch(r) {
      case ("white"):
        dem = t.white;
        break;
      case ("black"):
        dem = t.black;
        break;
      case ("indian_alaskan"):
        dem = t.indian_alaskan;
      break;
      case ("asian"):
        dem = t.asian;
        break;
      case ("hawaiian_pacific"):
        dem = t.hawaiian_pacific;
        break;
      case ("other"):
        dem = t.other;
        break;
      case ("multiple"):
        dem = t.multiple;
        break;
      case ("hispanic"):
        dem = t.hispanic;
        break;
    }
    return dem;
}
  
function buildDemographicGraphs(active){
  var activeDemArray = active[0][0].__data__.properties.demographic;
  var currentTract = active[0][0].__data__.properties.ct;
  var activeMapYear = active[0][0].__data__.properties.year;
    if(activeMapYear == 2000) {
    for(var i=0; i<demData2010.length; i++){
      var ct = demData2010[i].geography;
      if(ct == currentTract){
        tractRaceBreakdown2010 = demData2010[i];
        tractRaceBreakdown2000 = activeDemArray;
      }
    }
  } else {
    for(var i=0; i<demData2000.length; i++){
      var ct = demData2000[i].geography;
      if(ct == currentTract){
        tractRaceBreakdown2000 = demData2000[i];
        tractRaceBreakdown2010 = activeDemArray;
      }
    }
  }
  var white2000 = parseFloat(tractRaceBreakdown2000.white);
  var black2000 = parseFloat(tractRaceBreakdown2000.black);
  var asian2000 = parseFloat(tractRaceBreakdown2000.asian);
  var hispanic2000 = parseFloat(tractRaceBreakdown2000.hispanic);
  var total2000 = white2000-black2000-asian2000-hispanic2000;
  var other2000 = 100.0-(white2000+black2000+asian2000+hispanic2000);
  var white2010 = parseFloat(tractRaceBreakdown2010.white);
  var black2010 = parseFloat(tractRaceBreakdown2010.black);
  var asian2010 = parseFloat(tractRaceBreakdown2010.asian);
  var hispanic2010 = parseFloat(tractRaceBreakdown2010.hispanic);
  var total2010 = 1;
  var other2010 = 100.0-(white2010+black2010+asian2010+hispanic2010);

  var piechart1 = new Highcharts.Chart({
    chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false,
            width: 400,
            align: "center",
            height: 250,
            renderTo: "demDataGraph1"
        },
        title: {
            text: 'Demographic Data, 2000'
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
            name: 'Racial Breakdown by Census Tract',
            data: [
                ['White',     white2000],
                ['Black',     black2000],
                ['Asian',     asian2000],
                ['Hispanic',  hispanic2000],
                ['Others',    other2000]
            ]
        }]
    });
  var piechart2 = new Highcharts.Chart({
    chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false,
            width: 400,
            align: "center",
            height: 250,
            renderTo: "demDataGraph2"
        },
        title: {
            text: 'Demographic Data, 2010'
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
            name: 'Racial Breakdown by Census Tract',
            data: [
                ['White',   white2010],
                ['Black',   black2010],
                ['Asian',   asian2010],
                ['Hispanic',hispanic2010],
                ['Others',  other2010]
            ]
        }]
    });
}

function resetDemGraphs() {
  demGraph1[0][0].innerHTML = null;
  demGraph2[0][0].innerHTML = null;
}

 

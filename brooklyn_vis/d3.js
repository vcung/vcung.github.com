// Globals
var width, height, border, bordercolor, path, svg, 
	file2000, file2010, active, zoom;

// Income Globals
var income2010, income2000, income2000_svg, income2010_svg, maxMin2000, maxMin2010, 
    quantizeRange, off, s, projection, zoom, g1, g2;
var currentID, income2000ID, income2010ID,income2000legend, income2010legend, incomeColor;

// Education Globals
var edu2000, edu2010, edu2000_svg, edu2010_svg, edu2000ID, edu2010ID,
	g3, g4, eduColor;

// Demographi global Variables
var demData2010, demData2000, dem2000_svg, dem2010_svg, demG1, demG2, demMaxMin2000, 
    demMaxMin2010, demQuantizeRange, demOff, demS, demProjection, demZoom,
    demCurrentID, dem2000ID, dem2010ID, dem2000legend, dem2010legend, demColor, demCSV2000,demCSV2010; 
var race = "white";
var legendRectSize = 18;
var legendSpacing = 4;
var iter = 0;

// Called in onload body
// Put initial set up here
function init() {
  setFirstMap();
  setIncomeMap();
  setEducationMap();
  setDemMap(race);

  $('.slider').slick({
    dots:true,
    infinite:true,
    speed: 300,
    slidesToShow: 1,
    adaptiveHeight: false,
    arrows: true,
    draggable: false
  });
}

function setFirstMap() {
	width = 400;
	height = 400;
	border = 1;
	bordercolor = 'black'; 
	path = d3.geo.path();
	svg = d3.select("#brooklynMap").append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("border", border);
	file2000 = "ct2000/allnyc2000geo.json";
	file2010 = "ct2010/allnycgeo.json";

	loadFirstMapData();
}

// Uses queue to load json and csv files in order
function loadFirstMapData() {
	queue()
		.defer(d3.json, file2000)
		.defer(d3.json, file2010)
		.await(processData);
}

function processData(error, ct2000, ct2010) {
	// if (error) return console.error(error);
	// process2000(ct2000);
	// process2010(ct2010);
}

// ZOOM FUNCTIONS
function clicked(d, i) {
  if (active.node() === this) {
    return reset();
  } else {
    if (active !== undefined && active[0][0] !== null) {
      var classVal = active[0][0].__data__.properties.classVal;
      d3.select(active[0][0])
        .text(function(d, i) { 
          if (d !== undefined) {
            if (d.properties.ct == active[0][0].__data__.properties.ct) {
              d3.select(this).attr("class", classVal);
            }
          }
      });
    }
  }
  active.classed("active", false);
  active = d3.select(this).classed("active", true);
  var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .15 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

  // Determine which map to zoom into
  currentID = $(this.parentNode.parentNode).attr('class');
  var selSvg = null;

  switch(currentID) {
    case "income":
      buildIncomeGraphs(active);
      selSvg = income2000_svg;
   	  selSvg.transition().duration(750)
       .call(zoom.translate(translate).scale(scale).event);
      selSvg = income2010_svg;
      selSvg.transition().duration(750)
       .call(zoom.translate(translate).scale(scale).event);
      break;
    case "education":
      buildEducationGraphs(active);
      selSvg = edu2000_svg;
      selSvg.transition().duration(750)
        .call(zoom.translate(translate).scale(scale).event);
      selSvg = edu2010_svg;
      selSvg.transition().duration(750)
       .call(zoom.translate(translate).scale(scale).event);
      break;
    case "demographics":
      buildDemographicGraphs(active);
      selSvg = dem2000_svg;
      selSvg.transition().duration(750)
       .call(zoom.translate(translate).scale(scale).event);
      selSvg = dem2010_svg;
      selSvg.transition().duration(750)
       .call(zoom.translate(translate).scale(scale).event);
      break;
    default:
      selSvg = null;
      break;
  }


  d3.select(this).attr("class","tract-highlight");
}

// Resets map view from zoomed map
function reset() {
  var selSvg = null;

  switch(currentID) {
    case "income":
      selSvg = income2000_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      selSvg = income2010_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      resetIncomeGraphs();
      break;
    case "education":
      selSvg = edu2000_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      selSvg = edu2010_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      resetEducationGraphs();
      break;
    case "demographics":
      selSvg = dem2000_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      selSvg = dem2010_svg;
      selSvg.transition().duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
      resetDemGraphs();
      break;
    default:
      selSvg = null;
      break;
  }

  var classVal = active[0][0].__data__.properties.classVal;
  d3.select(active[0][0])
    .text(function(d, i) { 
      if (d !== undefined) {
        if (d.properties.ct == active[0][0].__data__.properties.ct) {
          d3.select(this).attr("class", classVal);
        }
      }
  })

  active.classed("active", false);
  active = d3.select(null);
}

function zoomed() {
  currentID = $(this).attr('class');
  var group = null;

  // Determine which group to apply zoom transformations
  switch(currentID) {
    case "income":
    	g1.style("stroke-width", 1.5 / d3.event.scale + "px");
    	g1.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    	g2.style("stroke-width", 1.5 / d3.event.scale + "px");
    	g2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      break;
    case "education":
      g3.style("stroke-width", 1.5 / d3.event.scale + "px");
    	g3.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    	g4.style("stroke-width", 1.5 / d3.event.scale + "px");
    	g4.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      break;
    case "demographics":
      demG1.style("stroke-width", 1.5 / d3.event.scale + "px");
    	demG1.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    	demG2.style("stroke-width", 1.5 / d3.event.scale + "px");
    	demG2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      break;
    default:
      group = null;
      break;
  }
}

function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

$(".race_btn").on("click",(function (e) {
  var r = $(this).attr('id').toLowerCase();
  $("p span").html(r[0].toUpperCase()+r.substring(1, r.length));
  updateDemMaps(r);
}));


// ** Update data section (Called from the onclick)
function updateDemMaps(new_race) {

    race = new_race;  
    var tracts2000 = topojson.feature(demCSV2000, demCSV2000.objects.tracts);
    var tracts2010 = topojson.feature(demCSV2010, demCSV2010.objects.tracts);

    var quantize = d3.scale.quantize()
    .domain([demMaxMin2010[0], demMaxMin2010[1]])
    .range(d3.range(demQuantizeRange).map(function(i) { return "d"+i; }));

    //Update color by changing class
    demG1.selectAll("path").attr("class", function(d) { 
      return createDemTractClass(d, quantize, demData2000, race); 
    })

    demG2.selectAll("path").attr("class", function(d) { 
      return createDemTractClass(d, quantize, demData2010, race); 
    })
  
}


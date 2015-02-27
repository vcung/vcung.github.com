var max, min;

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

function getKeyByValue(value, array) {
    for( var prop in array ) {
        if(array.hasOwnProperty(prop)) {
             if(array[prop] == value)
                 return prop;
        }
    }
}

function getIncomeInfo(input) {
	var max = -Infinity;
	var min = Infinity;
  	for (var i = 0; i < input.length; i++) {
  		if (parseInt(input[i].avg_hd_income) > max)
  			max = parseInt(input[i].avg_hd_income);
  		else if (parseInt(input[i].avg_hd_income) < min)
  			min = parseInt(input[i].avg_hd_income);
  	}
    input.sort(function(a,b){ return a.avg_hd_income - b.avg_hd_income});
    var index = parseInt((input.length)/2);
    var median = parseInt(input[index].avg_hd_income);
  	return [min, max, median];
}

function getEducationInfo(edu) {

	var temp = [];
	for (var k in edu) {
		if (edu.hasOwnProperty(k)) {
			if (k === "edu_9_12_25_older" || k === "edu_associates_25_older" ||
				k === "edu_bachelors_25_older" || k === "edu_high_25_older" ||
				k === "edu_some_coll_25_older") {
				temp.push(edu[k]);
			}
		}
	}
	var maxv = getMaxOfArray(temp);
	return getKeyByValue(maxv, edu);
}
 
function getDemInfo(input, race) {
  	return [0, 100];
}

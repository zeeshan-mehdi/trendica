
function populateData(){
	// show loading wheel and perform some background query
	setTimeout(function () {
		$(".loader").fadeOut("fast");
	}, 1200);
	
	// update logged in user at top bar
	getSession();
	// populate category drop down list
	populateCatList();
	plotCategoryChart();
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		// Trigger map resize when tab is shown
		google.maps.event.trigger(map, "resize");
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 1.352083, lng: 103.81983600000001},
			zoom: 11
		});
	  
		forecastmap = new google.maps.Map(document.getElementById('forecastmap'), {
			center: {lat: 1.352083, lng: 103.81983600000001},
			zoom: 11
		});
	  
		// register click event for forecast map
		google.maps.event.addDomListenerOnce(document.getElementById('forecastmap'), 'click', initMap);
	});
	
	// register click event for forecast map
	google.maps.event.addDomListenerOnce(document.getElementById('forecastmap'), 'click', initMap);
	
	// scroll to top
	$(window).scroll(function() {
		if ($(this).scrollTop() >= 300) {        // if page is scrolled more than 300px
			$('#return-to-top').fadeIn(200);    // fade in the arrow
		} else {
			$('#return-to-top').fadeOut(200);   // else fade out the arrow
		}
	});
	$('#return-to-top').click(function() {      // when arrow is clicked
		$('body,html').animate({
			scrollTop : 0                       // scroll to top of body
		}, 500);
	});
	
	$('#btnSurvey').click(function(){
		$('#surveyRow').fadeOut('fast');
	});
}

function getSession(){
	var email = localStorage.getItem("userSession");
	var userName = email.substr(0, email.indexOf('@')); 
		
	document.getElementById("topbar_userSession").innerHTML = 'Welcome,  ' + userName;
	//document.getElementById("topbar_dropdown_userSession").innerHTML = userName;
	//document.getElementById("topbar_dropdown_email").innerHTML = email;
	
	// only admins can download the csv file for forecast
	if(email == 'testdashboard@gmail.com'){
		document.getElementById("csvDownloadRow").style.display = "block";
	}
}

// function to format the currency format
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function to capitalize the first character of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// function to return formatted month string based on month index parameter
function getMonthStr(month){
	switch(month) {
		case 1:monthStr = 'Jan'; break;
		case 2: monthStr = 'Feb'; break;
		case 3: monthStr = 'Mar'; break;
		case 4: monthStr = 'Apr'; break;
		case 5: monthStr = 'May'; break;
		case 6: monthStr = 'Jun'; break;
		case 7: monthStr = 'July'; break;
		case 8: monthStr = 'Aug'; break;
		case 9: monthStr = 'Sept'; break;
		case 10: monthStr = 'Oct'; break;
		case 11: monthStr = 'Nov'; break;
		case 12: monthStr = 'Dec'; break;
	}
	return monthStr;
}

// function to format the date label to 'month day' format Eg. Jan 02
function formatDateLabel(date){
	var month = date.substring(5, 7);
	var day = date.substring(8, 10);
	var monthStr = getMonthStr(parseInt(month));
	return (monthStr + ' ' + day);
}

// function to get current year
function getCurrentYear(){
	return new Date().getFullYear();
}

/*// function to forecast with best fit line
function bestfitRegression(amountData){
	// show data without prediction
	var data_weight = [];
	for(var i = 0; i < amountData.length; i++){
		data_weight.push({"month": (i+1), "weight": amountData[i]});
	}

	console.table(data_weight.sort(function(a, b) { return +a.month - b.month; }));	
	
	var data_x = [1,2,3,4,5,6,7,8,9,10,11,12];
	var data_y = amountData;

	var cubic = function(params,x) {
	  return params[0] * x*x*x +
		params[1] * x*x +
		params[2] * x +
		params[3];
	};

	var objective = function(params) {
	  var total = 0.0;
	  for(var i=0; i < data_x.length; ++i) {
		var resultThisDatum = cubic(params, data_x[i]);
		var delta = resultThisDatum - data_y[i];
		total += (delta*delta);
	  }
	  return total;
	};

	var initial = [1,1,1,1];
	var minimiser = numeric.uncmin(objective,initial);

	console.log("initial:");
	for(var j=0; j<initial.length; ++j) {
	  console.log(initial[j]);  
	}

	console.log("minimiser:");
	for(var j=0; j<minimiser.solution.length; ++j) {
	  console.log(minimiser.solution[j]);
	}
	
	console.log('Prediction');
	// formula: y = ax^3 + bx^2 + cx + d.
	for(var i = 0; i < 12; i++){
		var m = i + 1;
		var a = minimiser.solution[0] * (m*m*m);
		var b = minimiser.solution[1] * (m*m);
		var c = minimiser.solution[2] * m;
		var d = minimiser.solution[3];

		var result = a + b + c + d;
		console.log(m + ' , ' + result);
	}
}*/

/*function linearRegressionTest(amountData){
	//amountData = [30, 500, 215, 70, 90, 200, 30, 100, 174, 250, 150, 400];
	var linear_regression = function(X, y) {
		var m = y.length;

		X = math.concat(math.ones(m,1), X);
		y = math.matrix(y);

		var tr = math.transpose(X);
		var tr_X = math.multiply(tr, X);
		var tr_y = math.multiply(tr, y);
		var theta = math.multiply( math.inv(tr_X), tr_y );

		return function() {
			var args = Array.prototype.slice.call(arguments);
			return math.multiply(math.matrix(math.concat([1], args)), theta);
		}
	}
		
	console.group("lineal");

	var data_weight = [];
	var value;
	for(var i = 0; i < amountData.length; i++){
		data_weight.push({"month": (i+1), "weight": amountData[i]});
	}
		
	//var age_weight = [{"age":12,"weight":20},{"age":8,"weight":10},{"age":10,"weight":151},{"age":11,"weight":70},{"age":7,"weight":40},{"age":14,"weight":56}];

	var X = data_weight.map(function(d){ return [+d.month]; }),
		y = data_weight.map(function(d){ return [+d.weight]; }),
		f = linear_regression(X , y);

	console.table(data_weight.sort(function(a, b) { return +a.month - b.month; }));	

	console.log("Weight for Jan: ",f(1));
	console.log("Weight for Feb: ",f(2));	
	console.log("Weight for March: ",f(3));
	console.log("Weight for April: ",f(4));
	console.log("Weight for May: ",f(5));	
	console.log("Weight for June: ",f(6));	
	console.log("Weight for July:",f(7));
	console.log("Weight for Aug:",f(8));
	console.log("Weight for September:",f(9));
	console.log("Weight for Oct:",f(10));
	console.log("Weight for Nov: ",f(11));
	console.log("Weight for December:",f(12));
		
	console.groupEnd();
}*/


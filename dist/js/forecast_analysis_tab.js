
// function to write data to csv file
// option 1 forecast profit, 2 forecast product, 3 forecast branch
function writeToCSV(option, subtype, itemName, amountData){
	var data, filename, link;
	var result = [];

	// randomized profit for previous 2 years, shortcuts
	for(var i = 0; i < amountData.length; i++){
		// random binary to determine plus or minus
		var y = Math.random();
		var bin = (y < 0.5 ? Math.floor(y) : Math.ceil(y));
		// randomized value based on the profit for most recent year
		var randValue = Math.floor(Math.random() * amountData[i]) + 1;
		var profit = (bin == 0 ? amountData[i] - randValue : amountData[i] + randValue);
		// reset 0 to 1 to fit into forecast model in python
		if(profit < 0) profit = 1;
		result.push({Month: '1-'+ (i+1), Total: profit.toFixed(2)});
	}
	
	// randomized profit for previous 1 year, shortcuts
	for(var i = 0; i < amountData.length; i++){
		var bin = Math.floor(Math.random() * 1) + 0;
		var randValue = Math.floor(Math.random() * amountData[i]) + 1;
		var profit = (bin == 0 ? amountData[i] - randValue : amountData[i] + randValue);
		if(profit < 0) profit = 1;
		result.push({Month: '2-'+ (i+1), Total: profit.toFixed(2)});
	}
	
	// profit for current year
	for(var i = 0; i < amountData.length; i++){
		// set to 1 for forecast purpose
		if(amountData[i] == 0){
			amountData[i] = 1;
		}
		result.push({Month: '3-'+ (i+1), Total: amountData[i].toFixed(2)});
	}
	var csv = convertArrayOfObjectsToCSV({
		data: result
	});
	if (csv == null) return;
	
	// format the file name for excel spread sheet		
	if(option == 1){
		filename = subtype + '.csv';
	}else if(option == 2 || option == 3){
		filename = subtype + '_' + itemName + '.csv';
	}
						
	// created and prepends a special string that tells the browser that our content is CSV and it needs to be downloaded
	if (!csv.match(/^data:text\/csv/i)) {
		csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();
}

// function to populate subtype dropdown for forecast tab
function populateForecastTypeDropdown(){
	var catdropdown = document.getElementById("ddlforecastCategory");
	var category = catdropdown.options[catdropdown.selectedIndex].value;
	category = category.toLowerCase();
	
	// refresh subtype dropdown
	var typedropdown = document.getElementById("ddlforecastSubtype");
	typedropdown.options.length = 1;
	// set selected default to hint message
	typedropdown.selectedIndex = 0;
	
	// refresh chart upon reselect category
	document.getElementById("txtFTimelineWarning").style.display = "block";
	document.getElementById("forecastTimelineChart").style.display = "none";
	// product row
	document.getElementById("txtTopFProductWarning").style.display = "block";
	document.getElementById("bestSellingFTableWrap").style.visibility = "hidden";
	document.getElementById("forecastProductText").innerHTML = '';
	document.getElementById("txtFTopProductWarning1").style.display = "block";
	document.getElementById("topFProductChart").style.display = 'none';
	// branch row
	document.getElementById("txtTopFBranchWarning").style.display = "block";
	document.getElementById("fBranchTableWrap").style.visibility = "hidden";
	document.getElementById("forecastBranchText").innerHTML = '';
	document.getElementById("txtFTopBranchWarning1").style.display = "block";
	document.getElementById("topFBranchChart").style.display = 'none';
	// clear heatmap layer
	deleteForecastCluster();
	document.getElementById("txtFHotspotWarning").style.display = "block";
	document.getElementById("forecastHotspotChart").style.display = 'none';
	// clear market basket analysis table
	document.getElementById("txtMBAWarning").style.display = "block";
	document.getElementById("MBATableWrap").style.visibility = 'hidden';
	// clear forecast product by age gender
	document.getElementById("txtFProductAGWarning").style.display = "block";
	document.getElementById("FProductAGChart").style.display = 'none';
	document.getElementById("txtFProductGenWarning").style.display = "block";
	document.getElementById("FProductGenChart").style.display = 'none';
	// clear forecast branch by age gender
	document.getElementById("txtFBranchAGWarning").style.display = "block";
	document.getElementById("FBranchAGChart").style.display = 'none';
	document.getElementById("txtFBranchGenWarning").style.display = "block";
	document.getElementById("FBranchGenChart").style.display = 'none';
	
	var ritemlist = [];
	var datasetarr = [];
	// get all receipt item ID which under selected category rather than all receipt item ID
	getAllReceiptItemIDByCategory(category).then((ritemIDlist) => {
		// get all related receipt item details
		let promiseKey = new Promise((resolve, reject) => {
			// loop through the IDs and get its detail
			for(var i = 0; i < ritemIDlist.length; i++){
				getReceiptItemByID(ritemIDlist[i].receiptItemID).then((ritem) => {
					ritemlist.push(ritem);
				});
			}
			resolve(ritemlist);
		});
		
		promiseKey.then((ritemlist) => {
			getAllReceipts().then((receiptlist) => {
				var unique = [];
				// use Set for unique values, after mapping only the type of the objects
				// spread syntax ... for collecting the items in a new array
				unique = [...new Set(ritemlist.map(a => a.type))];
				for(var i = 0; i < unique.length; i++){
					// add new drop down options for subtype according to selected category
					var option = document.createElement("option");
					option.text = capitalizeFirstLetter(unique[i]);
					typedropdown.add(option);
				}
			});		
		});
	});
}

/** forecast profit starts here **/

// function to create and download separate csv file for forecast in python
function forecastTimeline(){
	var subtypelist = [];
	var monthIndex, amountData;

	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			// use Set for unique values, after mapping only the type of the objects
			subtypelist = [...new Set(ritemlist.map(a => a.type))];
			// loop thru list of subtype, if receipt item type is same as subtype, then get receipt date by receiptID
			for(var i = 0; i < subtypelist.length; i++){
				// reset amount data to zero for each subtype
				amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				for(var j = 0; j < ritemlist.length; j++){
					// if matching subtype then get the receipt date by receiptID
					if(ritemlist[j].type == subtypelist[i]){
						for(var k = 0; k < receiptlist.length; k++){
							// get receipt date
							if(ritemlist[j].receiptID == receiptlist[k].receiptID){
								// get current year data only
								//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
									monthIndex = receiptlist[k].date.substring(5, 7);
									// remove truncate or leading zero for month
									monthIndex = monthIndex.replace(/^0+/, '');
									amountData[monthIndex - 1] += ritemlist[j].total;
								//}
							}
						}
					}
				}
				// for each subtype, create a new csv file
				writeToCSV(1, subtypelist[i], '', amountData);
			}
		});
	});
}

// function to plot timeline grouped by month for selected subtype
var forecastTimelineChart;
function plotForecastTimeline(){
	// get selected subtype
	var dropdown = document.getElementById("ddlforecastSubtype");
	var subtype = dropdown.options[dropdown.selectedIndex].value;
	subtype = subtype.toLowerCase();

	// show chart and hide warning message upon selecting subtype
	document.getElementById("txtFTimelineWarning").style.display = "none";
	document.getElementById("forecastTimelineChart").style.display = "block";
	// hide product and branch chart and show warning message upon selecting subtype
	document.getElementById("txtFTopProductWarning1").style.display = "block";
	document.getElementById("topFProductChart").style.display = 'none';
	document.getElementById("txtFTopBranchWarning1").style.display = "block";
	document.getElementById("topFBranchChart").style.display = 'none';
	// clear heatmap layer
	deleteForecastCluster();
	document.getElementById("txtFHotspotWarning").style.display = "block";
	document.getElementById("forecastHotspotChart").style.display = 'none';
	// clear forecast product by age gender
	document.getElementById("txtFProductAGWarning").style.display = "block";
	document.getElementById("FProductAGChart").style.display = 'none';
	document.getElementById("txtFProductGenWarning").style.display = "block";
	document.getElementById("FProductGenChart").style.display = 'none';
	// clear forecast branch by age gender
	document.getElementById("txtFBranchAGWarning").style.display = "block";
	document.getElementById("FBranchAGChart").style.display = 'none';
	document.getElementById("txtFBranchGenWarning").style.display = "block";
	document.getElementById("FBranchGenChart").style.display = 'none';

	// populate array for chart plotting
	getForecastProfitBySubtype(subtype).then((arr) => {
		var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		var expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		// group forecasted and current year profit by month
		for(var i = 0; i < arr.length; i++){
			for (var key in arr[i].forecastData) {
				var month = key;
				var item = arr[i].forecastData[key];
				amountData[month - 1] = item;
			}

			for (var key in arr[i].expectedData) {
				var month = key;
				var item = arr[i].expectedData[key];
				expectedData[month - 1] = item;
			}
		}

		var ctx = document.getElementById('forecastTimelineChart').getContext("2d");
		var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient1.addColorStop(0, '#E91E63');
		gradient1.addColorStop(1, '#2196F3');

		var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient2.addColorStop(0, '#FF9800');
		gradient2.addColorStop(1, '#4CAF50');

		var options = {
			layout: {
				padding: {
					top: 5
				}
			},
			// enforce these two to prevent chart auto expand
			responsive: true,
			maintainAspectRatio: false,
			// set line chart to no curves
			elements: {
				line: {
					tension: 0
				}
			},
			scales: {
				xAxes: [{
					gridLines: {
						display:false
					},
					ticks: {
						fontSize: 11
					}
				}],
				yAxes: [{
					ticks: {
						fontSize: 11,
						callback : function (value) { return numberWithCommas(value); }
					},
				}]
			},
			legend: {
				display: false,
				position: 'right',
				// disable legend onclick remove slice
				onClick: null
			},
			animation: {
				animateScale: true,
				animateRotate: true
			},
			// show percentage of slice when hover
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						var allData = data.datasets[tooltipItem.datasetIndex].data;
						var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
						var tooltipData = allData[tooltipItem.index];
						var total = 0;
						for (var i=0; i<allData.length; i++) {
								total += allData[i];
						}
						return datasetLabel + 'Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
					}
				}
				}
			};

			var opt = {
				type: "line",
				data: {
					labels: labelData,
					datasets: [{
						label: 'Forecast ',
						data: amountData,
						fill: false,
						borderDash: [10,5],
						borderWidth: 1.5,
						pointHoverRadius: 5,
						pointBackgroundColor: gradient1,
						pointHoverBackgroundColor: gradient1,
						borderColor: gradient1
					},
					{
						label: 'Current Year ',
						data: expectedData,
						fill: false,
						borderWidth: 1.5,
						pointHoverRadius: 5,
						pointBackgroundColor: gradient2,
						pointHoverBackgroundColor: gradient2,
						borderColor: gradient2
					}]
				},
				options: options
			};

			if (forecastTimelineChart) forecastTimelineChart.destroy();
			forecastTimelineChart = new Chart(ctx, opt);

			forecastTimelineChart.update();
	});

	plotMarketBasketAnalysis(subtype);
	sortForecastHeatmap(subtype);
	// function to plot forecasted branches with most profit
	plotForecastBranch(subtype);

	// function to plot forecasted best selling products
	plotForecastProduct(subtype);
}

/** forecast profit ends here **/

/** forecast product starts here **/

// function to create and download separate csv file for forecast in python
function forecastProduct(){
	var subtypelist = [];
	
	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			getAllItems().then((itemlist) => {
				// use Set for unique values, after mapping only the type of the objects
				subtypelist = [...new Set(ritemlist.map(a => a.type))];

				// loop thru list of subtype, if receipt item type is same as subtype, then get receipt date by receiptID
				for(var i = 0; i < subtypelist.length; i++){
					// reinitialize to store data for each subtype
					var datasetarr = [], topProductList = [];
		
					for(var j = 0; j < ritemlist.length; j++){
						// if matching subtype then get the receipt date by receiptID
						if(ritemlist[j].type == subtypelist[i]){
							for(var k = 0; k < receiptlist.length; k++){
								// get receipt date
								if(ritemlist[j].receiptID == receiptlist[k].receiptID){
									// get current year data only
									//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
										for(var h = 0; h < itemlist.length; h++){
											// if matching item ID with receipt item details, push to datasetarr
											if(ritemlist[j].itemID == itemlist[h].itemID){
												datasetarr.push({type: ritemlist[j].type, total: (ritemlist[j].quantity * ritemlist[j].price), brand: ritemlist[j].brand, date: receiptlist[k].date, itemName: itemlist[h].name});
											}
										}
									//}
								}
							}
						}
					}
					
					// clone to prevent mutaton to original array
					var temparr = datasetarr.slice(0);
					// use reduce to sort by sum up total of same itemName
					var result = temparr.reduce(function(items, item) {
						var existing = items.find(function(i) {
							return i.itemName === item.itemName;
						});
						  
						// if exist sum up the total
						if (existing) {
							existing.total += item.total;
						} else {
							// if not exist add new entry
							items.push(item);
						}
					return items;
					}, []);
					
					// loop thru all records to find top 5 products with most profit
					topProductList = getTopForecastProduct(result);
					// get the sales record of top product then write to csv
					getSalesRecord(subtypelist[i], topProductList, datasetarr);
				}
			});
		});
	});
}

// function to loop thru to find top 5 products with most total profit
function getTopForecastProduct(result){
	var topProductList = [];
	// use reduce to find max quantity
	Array.prototype.hasMax = function(attrib) {
		return this.reduce(function(prev, curr){ 
			return prev[attrib] > curr[attrib] ? prev : curr; 
		});
	}
	
	// limit to top 5 products
	var topCounter = result.length;
	if(topCounter >= 5){
		topCounter = 5;
	}
	
	// loop to find top 5 products with highest total profit
	for(var i = 0; i < topCounter; i++){
		// sort by finding max total
		topProduct = result.hasMax('total');
		// push object with max total to a new array before popping it off
		topProductList.push(topProduct);
		var index = result.indexOf(topProduct);
		if (index != -1) result.splice(index, 1);
	}
	return topProductList;
}

// after identified top 5 products, get their sales record grouped by month and write to csv
function getSalesRecord(subtype, topProductList, datasetarr){
	for(var i = 0; i < topProductList.length; i++){
		// reset amountData for each product
		var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		
		for(var j = 0; j < datasetarr.length; j++){
			if(topProductList[i].itemName == datasetarr[j].itemName){
				monthIndex = datasetarr[j].date.substring(5, 7);
				// remove truncate or leading zero for month
				monthIndex = monthIndex.replace(/^0+/, '');
				amountData[monthIndex - 1] += datasetarr[j].total;
			}
		}
		
		// for each top product, create a new csv file
		writeToCSV(2, subtype, topProductList[i].itemName, amountData);
	}				
}

// function to show top 5 forecasted best selling product in table
function plotForecastProduct(subtype){
	// show chart and hide warning message upon selecting subtype
	document.getElementById("txtTopFProductWarning").style.display = "none";
	document.getElementById("bestSellingFTableWrap").style.visibility = 'visible';
	
	var sortedlist = [];

	getForecastProductBySubtype(subtype).then((arr) => {
		document.getElementById("forecastProductText").innerHTML = arr.length;
		
		// loop thru to get the total of forecast for each products
		for(var j = 0; j < arr.length; j++){
			var bestSellingMonth;
			var bestSellingAmount = 0;
			var total = 0;
			var forecastAmount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var expectedAmount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			
			for (var key in arr[j].forecastData) {
				var month = key;
				var item = arr[j].forecastData[key];
				total += item;
				
				// set the amount for first month to best selling amount
				if(month == 1) bestSellingAmount = item;
				
				// if current month is larger than best selling month, reset
				if(item > bestSellingAmount){
					bestSellingAmount = item;
					bestSellingMonth = month;
				}
				
				// need to customize this since array starts from 0 and data from database starts from 1
				forecastAmount[month - 1] = item;
			}
			
			// loop thru to sort data for expected
			for (var key in arr[j].expectedData) {
				var month = key;
				var item = arr[j].expectedData[key];

				expectedAmount[month - 1] = item;
			}

			// convert to proper monthStr for display
			switch(bestSellingMonth) {
				case '1':monthStr = 'Jan'; break;
				case '2': monthStr = 'Feb'; break;
				case '3': monthStr = 'Mar'; break;
				case '4': monthStr = 'Apr'; break;
				case '5': monthStr = 'May'; break;
				case '6': monthStr = 'Jun'; break;
				case '7': monthStr = 'July'; break;
				case '8': monthStr = 'Aug'; break;
				case '9': monthStr = 'Sept'; break;
				case '10': monthStr = 'Oct'; break;
				case '11': monthStr = 'Nov'; break;
				case '12': monthStr = 'Dec'; break;
			}
			sortedlist.push({itemName: arr[j].itemName,  forecastData: forecastAmount, expectedData: expectedAmount, total: parseFloat(total).toFixed(2), bestMonth: monthStr, bestAmount: bestSellingAmount});
		}
		// sort total in descending order
		sortedlist.sort((a, b) => Number(b.total) - Number(a.total));
		
		// clear previous row but keep header row before populating new results
		$('#bestSellingFTable tr').slice(1).remove();
		
		// optimzed code to formulate table data
		var table = document.getElementById("bestSellingFTable");
			
		// insert data
		sortedlist.forEach(function (item) {
			var row = table.insertRow();
			
			// button is an Object Element, need to use appendChild
			var button = document.createElement("button");
			button.innerHTML= "view";
			button.style.background = "#2E2E2E";
			button.style.borderRadius = "4px";
			button.style.border = "none";
			button.style.color = "#FFFFFF";
			
			var cell0 = row.insertCell(0)
			var cell1 = row.insertCell(1);
			var cell2 = row.insertCell(2);
			var cell3 = row.insertCell(3);

			cell0.innerHTML = item.itemName;
			cell1.innerHTML = '$ ' + numberWithCommas(item.total); 
			cell2.innerHTML = item.bestMonth + ' ($ ' + numberWithCommas(item.bestAmount.toFixed(2)) + ')';
			cell3.appendChild(button);
			
			// button on click listener
			button.onclick = function(){
				// plot forecasted profit of selected product
				viewForecastProduct(this, item.forecastData, item.expectedData);
				// plot forecasted age group and gender of selected product
				plotForecastProductAgeGroup(subtype, item.itemName);
			};
 
		});
	});
}

var topFProductChart;
var previousrow = null;
// function to plot timeline for selected product
// function viewForecastProduct(row, forecast, expected){
// 	// highlight selected row
// 	row.parentElement.parentElement.style.backgroundColor= "#E0ECF8";
// 	// remove previous highlight to limit the table to single selection only
// 	if(previousrow != null){
// 		previousrow.style.backgroundColor="";
// 	}
// 	previousrow = row.parentElement.parentElement;
//
// 	// hide warning message and show chart upon select product
// 	document.getElementById("txtFTopProductWarning1").style.display = "none";
// 	document.getElementById("topFProductChart").style.display = 'block';
//
// 	var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
//
// 	var ctx = document.getElementById('topFProductChart').getContext("2d");
// 	var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
// 	gradient1.addColorStop(0, '#E91E63');
// 	gradient1.addColorStop(1, '#2196F3');
//
// 	var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
// 	gradient2.addColorStop(0, '#FF9800');
// 	gradient2.addColorStop(1, '#4CAF50');
//
// 	var options = {
// 		layout: {
// 			padding: {
// 				top: 5
// 			}
// 		},
// 		// enforce these two to prevent chart auto expand
// 		responsive: true,
// 		maintainAspectRatio: false,
// 		// set line chart to no curves
// 		elements: {
// 			line: {
// 				tension: 0
// 			}
// 		},
// 		scales: {
// 			xAxes: [{
// 				gridLines: {
// 					display:false
// 				},
// 				ticks: {
// 					fontSize: 11
// 				}
// 			}],
// 			yAxes: [{
// 				ticks: {
// 					fontSize: 11,
// 					callback : function (value) { return numberWithCommas(value); }
// 				},
// 			}]
// 		},
// 		legend: {
// 			display: false,
// 			position: 'right',
// 			// disable legend onclick remove slice
// 			onClick: null
// 		},
// 		animation: {
// 			animateScale: true,
// 			animateRotate: true
// 		},
// 		// show percentage of slice when hover
// 		tooltips: {
// 			callbacks: {
// 				label: function(tooltipItem, data) {
// 					var allData = data.datasets[tooltipItem.datasetIndex].data;
// 					var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
// 					var tooltipData = allData[tooltipItem.index];
// 					var total = 0;
// 					for (var i=0; i<allData.length; i++) {
// 						total += allData[i];
// 					}
// 					return datasetLabel + 'Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
// 				}
// 			}
// 			}
// 		};
//
// 		var opt = {
// 			type: "line",
// 			data: {
// 				labels: labelData,
// 				datasets: [{
// 					label: 'Forecast ',
// 					data: forecast,
// 					fill: false,
// 					borderDash: [10,5],
// 					borderWidth: 1.5,
// 					pointHoverRadius: 5,
// 					pointBackgroundColor: gradient1,
// 					pointHoverBackgroundColor: gradient1,
// 					borderColor: gradient1
// 				},
// 				{
// 					label: 'Current Year ',
// 					data: expected,
// 					fill: false,
// 					borderWidth: 1.5,
// 					pointHoverRadius: 5,
// 					pointBackgroundColor: gradient2,
// 					pointHoverBackgroundColor: gradient2,
// 					borderColor: gradient2
// 				}]
// 			},
// 			options: options
// 		};
//
// 		if (topFProductChart) topFProductChart.destroy();
// 		topFProductChart = new Chart(ctx, opt);
//
// 		topFProductChart.update();
// }

/** forecast product ends here **/

/** forecast product age gender group stats here **/

// function to write age group and gender data to csv files to be used as inputs for Python forecast
function writeAgeGenderToCSV(gender, subtype, itemName, amountData){
	var data, filename, link;
	var result = [];

	// randomized amount of people for previous 2 years
	for(var i = 0; i < amountData.length; i++){
		// if current year data not zero, then randomized by add or minus
		if(amountData[i] > 0){
			// random binary to determine plus or minus
			var y = Math.random();
			var bin = (y < 0.5 ? Math.floor(y) : Math.ceil(y));
			// randomized value based on the profit for most recent year
			var randValue = Math.floor(Math.random() * amountData[i]) + 1;
			var amount = (bin == 0 ? amountData[i] - randValue : amountData[i] + randValue);
			result.push({Month: '1-'+ (i+1), Total: amount.toFixed(2)});
		}else if(amountData[i] == 0){
			// if current year data is zero, randomized between 1 to 10
			var randValue = Math.floor(Math.random() * 10) + 1;
			result.push({Month: '1-'+ (i+1), Total: randValue.toFixed(2)});
		}
	}
	
	// randomized amount of people for previous 1 year
	for(var i = 0; i < amountData.length; i++){
		if(amountData[i] > 0){
			// random binary to determine plus or minus
			var y = Math.random();
			var bin = (y < 0.5 ? Math.floor(y) : Math.ceil(y));
			// randomized value based on the profit for most recent year
			var randValue = Math.floor(Math.random() * amountData[i]) + 1;
			var amount = (bin == 0 ? amountData[i] - randValue : amountData[i] + randValue);
			result.push({Month: '2-'+ (i+1), Total: amount.toFixed(2)});
		}else if(amountData[i] == 0){
			var randValue = Math.floor(Math.random() * 10) + 1;
			result.push({Month: '2-'+ (i+1), Total: randValue.toFixed(2)});
		}
	}
	
	// amount of people for current year
	for(var i = 0; i < amountData.length; i++){
		result.push({Month: '3-'+ (i+1), Total: amountData[i].toFixed(2)});
	}
	
	var csv = convertArrayOfObjectsToCSV({
		data: result
	});
	if (csv == null) return;
	
	// format the file name for excel spread sheet		
	filename = subtype + '_' + itemName + '!' + gender + '.csv';
						
	// created and prepends a special string that tells the browser that our content is CSV and it needs to be downloaded
	if (!csv.match(/^data:text\/csv/i)) {
		csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();
}

// function to create and download separate csv file for forecast in python
function forecastAgeGenderforProduct(){
	var subtypelist = [];
	
	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			getAllItems().then((itemlist) => {
				getAllAccounts().then((accountlist) => {
					// use Set for unique values, after mapping only the type of the objects
					subtypelist = [...new Set(ritemlist.map(a => a.type))];

					// loop thru list of subtype, if receipt item type is same as subtype, then get receipt date by receiptID
					for(var i = 0; i < subtypelist.length; i++){
						// reinitialize to store data for each subtype
						var datasetarr = [], topProductList = [];
			
						for(var j = 0; j < ritemlist.length; j++){
							// if matching subtype then get the receipt date by receiptID
							if(ritemlist[j].type == subtypelist[i]){
								for(var k = 0; k < receiptlist.length; k++){
									// get receipt date
									if(ritemlist[j].receiptID == receiptlist[k].receiptID){
										// get current year data only
										//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
											for(var h = 0; h < itemlist.length; h++){
												// if matching item ID with receipt item details, push to datasetarr
												if(ritemlist[j].itemID == itemlist[h].itemID){
													for(var m = 0; m < accountlist.length; m++){
														if(accountlist[m].accountID == receiptlist[k].accountID){
															datasetarr.push({total: (ritemlist[j].quantity * ritemlist[j].price), date: receiptlist[k].date, itemName: itemlist[h].name, 
															accountID: accountlist[m].accountID, age: accountlist[m].age, gender: accountlist[m].gender});
														}
													}
												}
											}
										}
									//}
								}
							}
						}
						
						// clone to prevent mutaton to original array
						var temparr = datasetarr.slice(0);
						// use reduce to sort by sum up total of same itemName
						var result = temparr.reduce(function(items, item) {
							var existing = items.find(function(i) {
								return i.itemName === item.itemName;
							});
							  
							// if exist sum up the total to ease the searching for top 5 products purpose
							if (existing) {
								existing.total += item.total;
							} else {
								// if not exist add new entry
								items.push(item);
							}
						return items;
						}, []);
						
						// loop thru all records to find top 5 products with most profit
						topProductList = getTopForecastProduct(result);
						// get the age gender details of top products then write to csv
						getForecastAgeGender(subtypelist[i], topProductList, datasetarr);
					}
				});
			});
		});
	});
}

// function to sort the age gender details of top products and write to csv
function getForecastAgeGender(subtype, topProductList, datasetarr){
	var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
	var arr = [];
	
	// loop thru the top 5 products
	for(var i = 0; i < topProductList.length; i++){
		// for each of the products, reset the male and female array
		var maleData = new Array(ageGroup.length).fill(0);
		var femaleData = new Array(ageGroup.length).fill(0);
		// get product item name
		var itemName = topProductList[i].itemName;
		
		for(var j = 0; j < datasetarr.length; j++){
			if(topProductList[i].itemName == datasetarr[j].itemName){
				// datasetarr contains all records, if matching item name with the item name of top product, then push the data to another array
				arr.push(datasetarr[j]);
			}
		}
		
		// loop thru filtered array to sort by gender and age group
		for(var k = 0; k < arr.length; k++){
			var age = arr[k].age;
			var ageIndex = Math.floor(age/10);
			
			if(arr[k].gender == 'male'){
				maleData[ageIndex]++;
			}else{
				femaleData[ageIndex]++
			}
		}

		// write to csv files
		writeAgeGenderToCSV('male', subtype, itemName, maleData);
		writeAgeGenderToCSV('female', subtype, itemName, femaleData);
	}
}

var FProductAGChart;
// function to plot the chart for product forecast by age group
function plotForecastProductAgeGroup(subtype, itemName){
	// hide warning message and show chart upon select product
	document.getElementById("txtFProductAGWarning").style.display = "none";
	document.getElementById("FProductAGChart").style.display = 'block';
	
	var forecastarr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var expectedarr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var forecastMale = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var forecastFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
	
	getForecastProductByItem(subtype, itemName).then((itemarr) => {
		// loop thru each items arrays returned from query
		for(var i = 0; i < itemarr.length; i++){
			// for each of the item in item array returned, push the data to relevant array
			for (var key in itemarr[i].forecastMaleData) {
				var forecastMaleAmount = itemarr[i].forecastMaleData[key];
				// need to customize this since array starts from 0 and data from database starts from 
				// skips negative forecasted value
				if(forecastMaleAmount >= 0){
					forecastarr[key-1] += forecastMaleAmount;
					forecastMale[key-1] += forecastMaleAmount;
				}
			}
			// forecast female data
			for (var key in itemarr[i].forecastFemaleData) {
				var forecastFemaleAmount = itemarr[i].forecastFemaleData[key];
				// skips negative forecasted value
				if(forecastFemaleAmount >= 0){
					forecastarr[key-1] += forecastFemaleAmount;
					forecastFemale[key-1] += forecastFemaleAmount;
				}
			}
			// current year male data
			for (var key in itemarr[i].expectedMaleData) {
				var expectedMaleAmount = itemarr[i].expectedMaleData[key];
				expectedarr[key-1] += expectedMaleAmount;
			}
			// current year female data
			for (var key in itemarr[i].expectedFemaleData) {
				var expectedFemaleAmount = itemarr[i].expectedFemaleData[key];
				expectedarr[key-1] += expectedFemaleAmount;
			}
		}

		// forecasted amount should be no lower than 0 since person cannot be in -ve value
		for(var i = 0; i < forecastarr.length; i++){
			if(forecastarr[i] < 0) forecastarr[i] = 0;
		}
		
		// call the function to plot for forecast data by gender
		plotForecastProductGender(ageGroup, forecastMale, forecastFemale);
		
		var ctx = document.getElementById('FProductAGChart').getContext("2d");
		var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient1.addColorStop(0, '#E91E63');
		gradient1.addColorStop(1, '#2196F3');

		var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient2.addColorStop(0, '#FF9800');
		gradient2.addColorStop(1, '#4CAF50');
									
		var options = {
			layout: {
				padding: {
					top: 5
				}
			},
			// enforce these two to prevent chart auto expand
			responsive: true,
			maintainAspectRatio: false,
			// set line chart to no curves
			elements: {
				line: {
					tension: 0
				}
			},
			scales: {
				xAxes: [{
					gridLines: {
						display:false
					},
					barPercentage: 0.4,
					ticks: {
						fontSize: 11 
					}
				}],
				yAxes: [{
					ticks: {
						fontSize: 11,
						callback : function (value) { return numberWithCommas(value); }
					},
				}]
			},
			legend: {
				display: false,
				position: 'right',
				// disable legend onclick remove slice
				onClick: null
			},
			animation: {
				animateScale: true,
				animateRotate: true
			},
			// show percentage of slice when hover
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						var allData = data.datasets[tooltipItem.datasetIndex].data;
						var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
						var tooltipData = allData[tooltipItem.index];
						var total = 0;
						for (var i=0; i<allData.length; i++) {
							total += allData[i];
						}
						return datasetLabel + 'Amount: ' + numberWithCommas(tooltipData) + ' person(s)';
					}
				}
				}
			};
								
			var opt = {
				type: "bar",
				data: { 
					labels: ageGroup, 
					datasets: [{ 
						type: "line",
						label: 'Forecast ',
						data: forecastarr, 
						fill: false,
						borderDash: [10,5],
						borderWidth: 1.5,
						pointHoverRadius: 5,
						pointBackgroundColor: gradient1,
						pointHoverBackgroundColor: gradient1,
						borderColor: gradient1
					},
					{ 
						label: 'Current Year ',
						data: expectedarr, 
						backgroundColor: '#fff',
						borderWidth: 1.5,
						hoverBackgroundColor: gradient2,
						borderColor: gradient2
					}] 
				}, 
				options: options
			};
								
			if (FProductAGChart) FProductAGChart.destroy();
			FProductAGChart = new Chart(ctx, opt);						
			FProductAGChart.update();	
	});
}

var FProductGenChart;
// function to plot for gender distribution horizontal bar
function plotForecastProductGender(ageGroup, forecastMale, forecastFemale){
	// hide warning message and show chart upon select product
	document.getElementById("txtFProductGenWarning").style.display = "none";
	document.getElementById("FProductGenChart").style.display = 'block';
	
	// set all female data positive value to negative to plot the bar towards left
	for(var i = 0; i < forecastFemale.length; i++){
		forecastFemale[i] = -Math.abs(forecastFemale[i]);
	}
	
	var ctx = document.getElementById('FProductGenChart').getContext("2d");					
	var options = {
		layout: {
			padding: {
				top: 5,
			}
		},
		scales:
		{
			yAxes: [{
				display: true,
				barPercentage: 0.4,
				ticks: {
					fontSize: 11 // set y-axis label size
				},
				stacked: true, 
			}],
			xAxes: [{ 
				ticks: {
					fontSize: 11,
					// show positive value on x-axis
					callback: function(t, i) {
						return t < 0 ? Math.abs(t) : t;
					},
					// position y-axis to center
					//min: -2.0
					stepSize: 1
				},
				stacked: true, 
			}]
		},
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: false,
		},
		animation: {
			animateScale: true,
			animateRotate: true
		},
		tooltips: {
			callbacks: {
				label: function(t, d) {
					// show positive value on tooltip
					var datasetLabel = d.datasets[t.datasetIndex].label;
					var xLabel = Math.abs(t.xLabel);
					return datasetLabel + ': ' + xLabel + ' person(s)';
				}
			}
		}, 
		};
					
		var opt = {
			type: "horizontalBar",
			data: { 
			labels: ageGroup, 
			datasets: [{ 
				label: 'Male',
				data: forecastMale, 
				backgroundColor: '#fff',
				borderColor: '#2196F3',
				borderWidth: 1.5,
				hoverBackgroundColor: '#2196F3'
			},
			{
				label: 'Female',
				data: forecastFemale,
				backgroundColor: '#fff',
				borderColor: '#E91E63',
				borderWidth: 1.5,
				hoverBackgroundColor: '#E91E63'
			}] 
			}, 
			options: options
		};
				
		if (FProductGenChart) FProductGenChart.destroy();
		FProductGenChart = new Chart(ctx, opt);					
		FProductGenChart.update();	
}

/** forecast product age gender group ends here **/

/** forecast branch starts here **/

// function to create and download separate csv file for forecast in python
function forecastBranch(){
	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			// use Set for unique values, after mapping only the type of the objects
			subtypelist = [...new Set(ritemlist.map(a => a.type))];
			// loop thru list of subtype, if receipt item type is same as subtype, then get receipt date by receiptID
			for(var i = 0; i < subtypelist.length; i++){
				// reset list for each subtype
				datasetarr = [];
				for(var j = 0; j < ritemlist.length; j++){
					// if matching subtype then get the receipt date by receiptID
					if(ritemlist[j].type == subtypelist[i]){
						for(var k = 0; k < receiptlist.length; k++){
							// get receipt date
							if(ritemlist[j].receiptID == receiptlist[k].receiptID){
								// get current year data only
								//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
									datasetarr.push({merchantName: receiptlist[k].merchantName, branchName: receiptlist[k].branchName, amount: ritemlist[j].total, date: receiptlist[k].date});
								//}
							}
						}
					}
				}
				
				var temparr = datasetarr.slice(0);
				// remove duplicate branch name by summing up the total
				var result = temparr.reduce(function(items, item) {
					var existing = items.find(function(i) {
						return i.branchName === item.branchName;
					});
					  
					// if exist sum up the total
					if (existing) {
						existing.amount += item.amount;
					} else {
						// if not exist add new entry
						items.push(item);
					}
				return items;
				}, []);
				
				// loop thru all records to find top 5 branches with most profit
				topBranchList = getTopForecastBranch(result);
				// get the sales record of top branch then write to csv
				getBranchSalesRecord(subtypelist[i], topBranchList, datasetarr);
			}
		});
	});
}

// function to loop thru to find top 5 branches with most total profit
function getTopForecastBranch(result){
	var topBranchList = [];
	// use reduce to find max quantity
	Array.prototype.hasMax = function(attrib) {
		return this.reduce(function(prev, curr){ 
			return prev[attrib] > curr[attrib] ? prev : curr; 
		});
	}
	
	// limit to top 5 branches
	var topCounter = result.length;
	if(topCounter >= 5){
		topCounter = 5;
	}
	
	// loop to find top 5 branches with highest total profit
	for(var i = 0; i < topCounter; i++){
		// sort by finding max total
		topBranch = result.hasMax('amount');
		// push object with max total to a new array before popping it off
		topBranchList.push(topBranch);
		var index = result.indexOf(topBranch);
		if (index != -1) result.splice(index, 1);
	}
	return topBranchList;
}

// after identified top 5 branches, get their sales record grouped by month and write to csv
function getBranchSalesRecord(subtype, topBranchList, datasetarr){
	for(var i = 0; i < topBranchList.length; i++){
		// reset amountData for each branch
		var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		
		// loop thru to get the branch sales records grouped by month
		for(var j = 0; j < datasetarr.length; j++){
			if(topBranchList[i].branchName == datasetarr[j].branchName){
				monthIndex = datasetarr[j].date.substring(5, 7);
				// remove truncate or leading zero for month
				monthIndex = monthIndex.replace(/^0+/, '');
				amountData[monthIndex - 1] += datasetarr[j].amount;
				
				// format the branch name together with its merchant name
				if (topBranchList[i].branchName.indexOf(datasetarr[j].merchantName) + 1 )
					formattedBranchName = topBranchList[i].branchName;
				else 
					formattedBranchName = datasetarr[j].merchantName + ' ' + topBranchList[i].branchName;
			}
		}
						
		// for each top product, create a new csv file
		writeToCSV(3, subtype, formattedBranchName, amountData);
	}				
}

// function to show top 5 forecasted branches with most profit in table
function plotForecastBranch(subtype){
	// show chart and hide warning message upon selecting subtype
	document.getElementById("txtTopFBranchWarning").style.display = "none";
	document.getElementById("fBranchTableWrap").style.visibility = 'visible';
	
	var sortedlist = [];

	getForecastBranchBySubtype(subtype).then((arr) => {
		document.getElementById("forecastBranchText").innerHTML = arr.length;
		
		// loop thru to get the total of forecast for each products
		for(var j = 0; j < arr.length; j++){
			var bestSellingMonth;
			var bestSellingAmount = 0;
			var total = 0;
			var forecastAmount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			var expectedAmount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			
			for (var key in arr[j].forecastData) {
				var month = key;
				var item = arr[j].forecastData[key];
				total += item;
				
				// set the amount for first month to best selling amount
				if(month == 1) bestSellingAmount = item;
				
				// if current month is larger than best selling month, reset
				if(item > bestSellingAmount){
					bestSellingAmount = item;
					bestSellingMonth = month;
				}
				// need to customize this since array starts from 0 and data from database starts from 1
				forecastAmount[month - 1] = item;
			}
			
			// loop thru to sort data for expected
			for (var key in arr[j].expectedData) {
				var month = key;
				var item = arr[j].expectedData[key];

				expectedAmount[month - 1] = item;
			}
			
			// convert to proper monthStr for display
			switch(bestSellingMonth) {
				case '1':monthStr = 'Jan'; break;
				case '2': monthStr = 'Feb'; break;
				case '3': monthStr = 'Mar'; break;
				case '4': monthStr = 'Apr'; break;
				case '5': monthStr = 'May'; break;
				case '6': monthStr = 'Jun'; break;
				case '7': monthStr = 'July'; break;
				case '8': monthStr = 'Aug'; break;
				case '9': monthStr = 'Sept'; break;
				case '10': monthStr = 'Oct'; break;
				case '11': monthStr = 'Nov'; break;
				case '12': monthStr = 'Dec'; break;
			}
			sortedlist.push({branchName: arr[j].branchName, forecastData: forecastAmount, expectedData: expectedAmount, total: parseFloat(total).toFixed(2), bestMonth: monthStr, bestAmount: bestSellingAmount});
		}
		// sort total in descending order
		sortedlist.sort((a, b) => Number(b.total) - Number(a.total));
		
		// clear previous row but keep header row before populating new results
		$('#fBranchTable tr').slice(1).remove();
		
		// optimzed code to formulate table data
		var table = document.getElementById("fBranchTable");

		// insert data
		sortedlist.forEach(function (item) {
			var row = table.insertRow();
			
			// button is an Object Element, need to use appendChild
			var button = document.createElement("button");
			button.innerHTML= "view";
			button.style.background = "#2E2E2E";
			button.style.borderRadius = "4px";
			button.style.border = "none";
			button.style.color = "#FFFFFF";
			
			var cell0 = row.insertCell(0)
			var cell1 = row.insertCell(1);
			var cell2 = row.insertCell(2);
			var cell3 = row.insertCell(3);

			cell0.innerHTML = item.branchName;
			cell1.innerHTML = '$ ' + numberWithCommas(item.total); 
			cell2.innerHTML = item.bestMonth + ' ($ ' + numberWithCommas(item.bestAmount.toFixed(2)) + ')';
			cell3.appendChild(button);

			// button on click listener
			button.onclick = function(){
				// plot forecasted profit of selected branch
				viewForecastBranch(this, item.forecastData, item.expectedData);
				// plot forecasted age group and gender of selected branch
				plotForecastBranchAgeGroup(subtype, item.branchName);
			};
 
		});
	});
}

var topFBranchChart;
var previousBranchrow = null;
// function to plot timeline for selected branch
function viewForecastBranch(row, forecast, expected){
	// highlight selected row
	row.parentElement.parentElement.style.backgroundColor= "#E0ECF8";
	// remove previous highlight to limit the table to single selection only
	if(previousBranchrow != null){
		previousBranchrow.style.backgroundColor="";
	}
	previousBranchrow = row.parentElement.parentElement;
	
	// hide warning message and show chart upon select branch
	document.getElementById("txtFTopBranchWarning1").style.display = "none";
	document.getElementById("topFBranchChart").style.display = 'block';
	
	var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		
	var ctx = document.getElementById('topFBranchChart').getContext("2d");
	var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
	gradient1.addColorStop(0, '#E91E63');
	gradient1.addColorStop(1, '#2196F3');

	var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
	gradient2.addColorStop(0, '#FF9800');
	gradient2.addColorStop(1, '#4CAF50');
								
	var options = {
		layout: {
			padding: {
				top: 5
			}
		},
		// enforce these two to prevent chart auto expand
		responsive: true,
		maintainAspectRatio: false,
		// set line chart to no curves
		elements: {
			line: {
				tension: 0
			}
		},
		scales: {
			xAxes: [{
				gridLines: {
					display:false
				},
				ticks: {
					fontSize: 11 
				}
			}],
			yAxes: [{
				ticks: {
					fontSize: 11,
					callback : function (value) { return numberWithCommas(value); }
				},
			}]
		},
		legend: {
			display: false,
			position: 'right',
			// disable legend onclick remove slice
			onClick: null
		},
		animation: {
			animateScale: true,
			animateRotate: true
		},
		// show percentage of slice when hover
		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					var allData = data.datasets[tooltipItem.datasetIndex].data;
					var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
					var tooltipData = allData[tooltipItem.index];
					var total = 0;
					for (var i=0; i<allData.length; i++) {
						total += allData[i];
					}
					return datasetLabel + 'Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
				}
			}
			}
		};
							
		var opt = {
			type: "line",
			data: { 
				labels: labelData, 
				datasets: [{ 
					label: 'Forecast ',
					data: forecast, 
					fill: false,
					borderDash: [10,5],
					borderWidth: 1.5,
					pointHoverRadius: 5,
					pointBackgroundColor: gradient1,
					pointHoverBackgroundColor: gradient1,
					borderColor: gradient1
				},
				{ 
					label: 'Current Year ',
					data: expected, 
					fill: false,
					borderWidth: 1.5,
					pointHoverRadius: 5,
					pointBackgroundColor: gradient2,
					pointHoverBackgroundColor: gradient2,
					borderColor: gradient2
				}] 
			}, 
			options: options
		};
							
		if (topFBranchChart) topFBranchChart.destroy();
		topFBranchChart = new Chart(ctx, opt);
								
		topFBranchChart.update();	
}

// function to randomized google API key
(function($) {
	$.rand = function(arg) {
		if ($.isArray(arg)) {
			return arg[$.rand(arg.length)];
		} else if (typeof arg === "number") {
			return Math.floor(Math.random() * arg);
		} else {
			return 4;  // chosen by fair dice roll
		}
	};
})(jQuery);

//function get url parameter from url string
getParameterByName = function ( name,href )
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( href );
	if( results == null )
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// fire 20 ajax request at a time and other will keep in queue
var queuCounter = 0, setLimit = 20; 

//make an array of geocode keys to avoid the overlimit error
/*var geoCodKeys = [
	'AIzaSyCF82XXUtT0vzMTcEPpTXvKQPr1keMNr_4',
	'AIzaSyAYPw6oFHktAMhQqp34PptnkDEdmXwC3s0',
	'AIzaSyAwd0OLvubYtKkEWwMe4Fe0DQpauX0pzlk',
	'AIzaSyDF3F09RkYcibDuTFaINrWFBOG7ilCsVL0',
	'AIzaSyC1dyD2kzPmZPmM4-oGYnIH_0x--0hVSY8'					
];*/

// my own API keys
var geoCodKeys = [
	'AIzaSyB8FCbF9L3IAjh62uXXyqeUCLqNCG0Fr2Q',
	'AIzaSyCjx0dqWwEn9_b8TIKa_oh7gb_9ehcMi9A',
	'AIzaSyB9wSV4SJM_ayzpk8iJQLoa0awWTPeT9x8',
	'AIzaSyCqh-bi502bpcZx2biLKP3dVNJKRzeQDE4',
	'AIzaSyB9x5zYuE7sszgjWl-i3mHfZ7sYxftfMjY'
];

var forecastsetarr = [];
function sortForecastHeatmap(subtype){

	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			for(var j = 0; j < ritemlist.length; j++){
				// if matching subtype then get the receipt date by receiptID
				if(ritemlist[j].type == subtype){
					for(var k = 0; k < receiptlist.length; k++){
						// get receipt date
						if(ritemlist[j].receiptID == receiptlist[k].receiptID){
							// get current year data only
							//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
								// format the branch name together with merchant name
								branch = receiptlist[k].branchName;
								merchant = receiptlist[k].merchantName;
								var formattedBranch = ((branch.indexOf(merchant) + 1) ? formattedBranch = branch : formattedBranch = merchant + ' ' + branch);
								
								forecastsetarr.push({branchName: formattedBranch, branchAddress: receiptlist[k].branchAddress, amount: ritemlist[j].total, date: receiptlist[k].date});
							//}
						}
					}
				}
			}
				
			var temparr = forecastsetarr.slice(0);
			// remove duplicate branch address by summing up the total
			var result = temparr.reduce(function(items, item) {
				var existing = items.find(function(i) {
					return i.branchAddress === item.branchAddress;
				});
				  
				// if exist sum up the total
				if (existing) {
					existing.amount += item.amount;
				} else {
					// if not exist add new entry
					items.push(item);
				}
			return items;
			}, []);
		
		
			let promiseKey = Promise.all(
				// pass an array of promises to promise.all, which resolves to an array of results
				// allow racing for faster performance (all promises starting at once, then continue if all finished)
				result.map(el=>getBranchLatLng(el.branchAddress, el.branchName, el.amount, el.date))
			);

			var addedMarkers = promiseKey.then(
				markers => Promise.all(
					// plot the marker one by one
					markers.map(marker => addForecastMarker(marker))
				)
			)
			// once finish plotting all markers, pass populated global array as argument to .then() to draw cluster map and heatmap
			.then(drawForecastCluster)
			.then(plotHotspotHeatmap)
		});
	});
}

// function to get the branch lat lng
function getBranchLatLng(address, branchName, total, date, queKey) {
	return new Promise(function(resolve, reject) {
		var key = jQuery.rand(geoCodKeys);
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?key='+key+'&address='+address+'&sensor=false';
		
		// randomized API key to bypass query_over_limit error
		var qyName = '';
		if( queKey ) {
			qyName = queKey;
		} else {
			qyName = 'MyQueue'+queuCounter;
		}

		$.ajaxq (qyName, {
			url: url,
			dataType: 'json'
		}).done(function( data ) {
			
			try{
				var p = data.results[0].geometry.location;
				var latlng = new google.maps.LatLng(p.lat, p.lng);

				var markerItem =
					{
						'lat': p.lat,
						'lng': p.lng,
						'address': address,
						'branchName': branchName,
						'total': total,
					};
				resolve(markerItem);

			}catch(e) {
				var markerItem =
				{
					'lat': 1.434889,
					'lng': 103.836926,
					'address': address,
					'branchName': branchName,
					'total': total,
				};
				resolve(markerItem);
			}
		})
		.catch(function(e) {
			var markerItem =
			{
				'lat': 1.434889,
				'lng': 103.836926,
				'address': address,
				'branchName': branchName,
				'total': total,
			};
			resolve(markerItem);
		});

		//mentain ajax queue set
		queuCounter++;
		if( queuCounter == setLimit ){
			queuCounter = 0;
		}
	}
)};
	
// array to store marker object for cluster map
var clusterData = [];
// layer for cluster map
var markerCluster;
// array to store all plotted markers
var allMarkers = [];

// function to plot the markers for forecast branch
function addForecastMarker(marker) {
    var newMarker = new google.maps.Marker({
        position: new google.maps.LatLng(marker['lat'], marker['lng']),
		icon: 'dist/img/marker.png',
        animation: google.maps.Animation.DROP,
        map: forecastmap
    });

    content = '<h5><b>' + marker['branchName'] + '</b></h5><br/>'
         + '<b>Address: </b>' + marker['address'] + '<br/>'
         + '<b>Forecast Revenue:</b> $ ' + numberWithCommas(marker['total'].toFixed(2)) + '<br/>';

    google.maps.event.addListener(newMarker, 'click', (function (newMarker, content, infowindow) {
        return function () {
            infowindow.setContent(content);
            infowindow.open(forecastmap, newMarker);
    };
    })(newMarker, content, infowindow));
	
	// push data to this array for buffer radius purpose
	allMarkers.push({branchName: marker['branchName'], address: marker['address'], total: marker['total'], lat: marker['lat'], lng: marker['lng']});
	// push data to this array for clsutered map purpose
	clusterData.push(newMarker);
}

// function to draw clustered map
function drawForecastCluster(){
	markerCluster = new MarkerClusterer(forecastmap, clusterData, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}

var circle;
var amountData;
// variable to store the number of branch within buffer for Jun to Dec values
var buffCount;
// function to draw buffer radius
function createBuffer(pos, forecastmap) {
	// reset when placing new buffer
	buffCount = 0;
	// clear previously drawn circle
	if(circle != null){
		circle.setMap(null);
	}
	// reset the counter and monthly amount for branch within radius every time redraw buffer circle
	bufferCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	circle = new google.maps.Circle({
        strokeColor : '#151515',
		strokeOpacity : 0.8,
		strokeWeight : 4,
		fillColor : '#6E6E6E',
		fillOpacity : 0.5,
		center : pos,
		radius : 1000,
		map : forecastmap
    });
    clusterData.push(circle);

	for(var i = 0; i < allMarkers.length; i++){
		var p1 = pos;
		// Passing p1 and marker item as parameters to calculate distance within buffer radius
		calculateBuffer(p1, allMarkers[i]);
	}
	
	var finalData = [];

	// find max value
	Array.prototype.max = function() {
		return Math.max.apply(null, this);
	};
	// check if array is all zero
	var flag = 0;
	for(i = 0; i < amountData.length; ++i) {
	  if(amountData[i] !== 0) {
		flag = 1;
		break;
	  }
	} 
	
	// loop thru to calculate for the average data
	for(var i = 0; i < amountData.length; i++){
		// get the maximum value in the array
		var max = amountData.max();
		for(var j = 0; j < bufferCounter.length; j++){
			if(i == j){
				// if not all zero then proceed to randomize values, otherwise do nothing
				if(flag){
					if(amountData[i] == 0){
						// for Jun to Dec data, randomized value and divided by the total number of branch within buffer
						var randValue = Math.floor(Math.random() * max) + 1;
						finalData.push((randValue/buffCount).toFixed(2));
					}else{
						finalData.push((amountData[i]/bufferCounter[j]).toFixed(2));
					}
				}
			}
		}
	}
	plotForecastHotspotChart(finalData);
}

// function to plot the monthly revenue based on the profit for branch outlets within buffer radius
var hotspotChart;
function plotForecastHotspotChart(finalData){
	// hide warning message and show chart upon drawing buffer
	document.getElementById("txtFHotspotWarning").style.display = "none";
	document.getElementById("forecastHotspotChart").style.display = 'block';
	
	var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		
	var ctx = document.getElementById('forecastHotspotChart').getContext("2d");
	var gradient = ctx.createLinearGradient(0, 0, 0, 350);
	gradient.addColorStop(0, '#E91E63');
	gradient.addColorStop(1, '#2196F3');
								
	var options = {
		layout: {
			padding: {
				top: 5
			}
		},
		// enforce these two to prevent chart auto expand
		responsive: true,
		maintainAspectRatio: false,
		scales:
		{
			yAxes: [{
				display: true,
				barPercentage: 0.4, // set bar thickness
				ticks: {
					fontSize: 11 // set y-axis label size
				},
			}],
			xAxes: [{
				gridLines: {
					display:false
				},
				ticks: {
					fontSize: 11,
					callback : function (value) { return numberWithCommas(value); }
				},
			}]
		},
		legend: {
			display: false,
			position: 'right',
			// disable legend onclick remove slice
			onClick: null
		},
		animation: {
			animateScale: true,
			animateRotate: true
		},
		// show percentage of slice when hover
		tooltips: {
		callbacks: {
			label: function(tooltipItem, data) {
				var allData = data.datasets[tooltipItem.datasetIndex].data;
				var tooltipLabel = data.labels[tooltipItem.index];
				var tooltipData = allData[tooltipItem.index];
				var total = 0;
				for (var i=0; i<allData.length; i++) {
					total += allData[i];
				}
				var tooltipPercentage = Math.round((tooltipData / total) * 100);
				return 'Forecast Revenue: $ ' + numberWithCommas(tooltipData);
			}
		}
		}
		};
							
		var opt = {
			type: "bar",
			data: { 
				labels: labelData, 
				datasets: [{ 
					data: finalData, 
					backgroundColor: "rgba(220,220,220,0)",
					borderColor: gradient,
					borderWidth: 1.5,
					hoverBackgroundColor: gradient,
				}] 
			}, 
			options: options
		};
							
		if (hotspotChart) hotspotChart.destroy();
		hotspotChart = new Chart(ctx, opt);
								
		hotspotChart.update();	
}

var heatmap;
var hotspotHeatmap = [];
var hotspotLayer = [];
var gradient = ['rgba(185, 185, 203, 0)', 'rgba(145, 145, 192, 0)',
			'rgba(65, 65, 207, 0)', 'rgba(30, 30, 229, 1)',
			'rgba(0, 185, 255, 1)', 'rgba(0, 255, 215, 1)',
			'rgba(0, 255, 15, 1)', 'rgba(0, 255, 0, 1)',
			'rgba(255, 255, 0, 1)', 'rgba(255, 235, 0, 1)',
			'rgba(255, 0, 0, 1)'];

// function to provide hot spot recommendation based on the branch location and the total profit of branches within 1000 meter radius	
function plotHotspotHeatmap(){
	var hotspotarr = [];
	var compareToArr = allMarkers.slice(0);
	// loop thru array to calculate distance
	for(var i = 0; i < allMarkers.length; i++){
		var hotspotTotal = 0;
		
		for(var j = 0; j < compareToArr.length; j++){
			p1 = allMarkers[i];
			p2 = compareToArr[j];
			
			var p1 = new google.maps.LatLng(p1.lat, p1.lng);
			var p2 = new google.maps.LatLng(p2.lat, p2.lng);
			var distance = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);

			// buffer radius set to 1000m so if distance less than 1, it is in the buffer radius
			if (distance < 1) {
				// if within radius, sum up the total profit
				hotspotTotal += compareToArr[j].total;
			}
		}
		hotspotarr.push({branchName: allMarkers[i].branchName, address: allMarkers[i].address, lat: allMarkers[i].lat, lng: allMarkers[i].lng, total: hotspotTotal});
	}
	
	var topSpot;
	var topSpotList = [];
	// use reduce to find max total
	Array.prototype.hasMax = function(attrib) {
		return this.reduce(function(prev, curr){ 
			return prev[attrib] > curr[attrib] ? prev : curr; 
		});
	}
	
	// find top hotspot with highest profit
	// sort by finding max total
	topSpot = hotspotarr.hasMax('total');
	// push object with max total to a new array before popping it off
	hotspotHeatmap.push({location: new google.maps.LatLng(topSpot.lat, topSpot.lng), weight: topSpot.total.toFixed(2)});	

	var pointArray = new google.maps.MVCArray(hotspotHeatmap);
	heatmap = new google.maps.visualization.HeatmapLayer({
	  data: pointArray,
	  gradient : gradient,
	  map : forecastmap,
	  radius : 60,
	  dissipating: true,
	});
	// push layer of heat map into array to ease the clearing of layers
	hotspotLayer.push(heatmap);
	heatmap.setMap(forecastmap);
}

// function to loop thru each event coordinates and determine if it's within buffer radius and calculate average forecast
function calculateBuffer(p1, object) {
	// calculation for distance between two points
	var p2 = new google.maps.LatLng(object.lat, object.lng);
	var distance = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);

	// buffer radius set to 1000m so if distance less than 1, it is in the buffer radius
	if (distance < 1) {
		buffCount++;
		// set previous branch and month in order to calculate average
		var prevBranch, prevMonth;
		// loop thru to find matching branch name which is within radius, then populate the monthly amount
		for(var i = 0; i < forecastsetarr.length; i++){
			// first round set first item
			if(i == 0){
				prevBranch = forecastsetarr[i].branchName;
				prevMonth = Number(forecastsetarr[i].date.substr(5,2));
			}
			
			// if same name, sum up the monthly amount
			if(forecastsetarr[i].branchName == object.branchName){
				var month = Number(forecastsetarr[i].date.substr(5,2));
				amountData[month-1] += forecastsetarr[i].amount;
				// if not same branch or month, then increase the buffer counter
				// so that same branch same month wont be added twice
				if(prevBranch != forecastsetarr[i].branchName || prevMonth != month){
					bufferCounter[month-1] += 1;
				}
				
				// set current branch and month as previous data to compare with next one
				prevBranch = forecastsetarr[i].branchName;
				prevMonth = month;
			}
		}
		
	}
}
	
// function to refresh map upon reselecting category/subtype
function deleteForecastCluster(){
	forecastmap.setZoom(11);
	forecastmap.panTo(new google.maps.LatLng(1.352083, 103.819836));
	// clear cluster map
	if(markerCluster != null){
		clusterData = [];
		markerCluster.clearMarkers();
	}
	// clear previously drawn circle
	if(circle != null){
		circle.setMap(null);
	}
	
	for (var k = 0; k < hotspotLayer.length; k++) {
         hotspotLayer[k].setMap(null);
    }
	// clear all heat map layers
    hotspotLayer = [];
	// clear all heat map data
	hotspotHeatmap = [];
}

/** forecast branch ends here **/

/** forecasst branch by age & gender starts here **/

// function to create and download separate csv file for forecast in python
function forecastAgeGenderforBranch(){
	var subtypelist = [];
	
	getAllReceiptItems().then((ritemlist) => {
		getAllReceipts().then((receiptlist) => {
			getAllAccounts().then((accountlist) => {
				// use Set for unique values, after mapping only the type of the objects
				subtypelist = [...new Set(ritemlist.map(a => a.type))];

				// loop thru list of subtype, if receipt item type is same as subtype, then get receipt date by receiptID
				for(var i = 0; i < subtypelist.length; i++){
					// reinitialize to store data for each subtype
					var datasetarr = [], topBranchList = [];
		
					for(var j = 0; j < ritemlist.length; j++){
						// if matching subtype then get the receipt date by receiptID
						if(ritemlist[j].type == subtypelist[i]){
							for(var k = 0; k < receiptlist.length; k++){
								// get receipt date
								if(ritemlist[j].receiptID == receiptlist[k].receiptID){
									// get current year data only
									//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
										// if matching accountID with receipt details, push to datasetarr
										for(var m = 0; m < accountlist.length; m++){
											if(accountlist[m].accountID == receiptlist[k].accountID){
												datasetarr.push({merchantName: receiptlist[k].merchantName, branchName: receiptlist[k].branchName, amount: ritemlist[j].total,
													accountID: accountlist[m].accountID, age: accountlist[m].age, gender: accountlist[m].gender});
											}
										}
									//}
								}
							}
						}
					}
					
					// clone to prevent mutaton to original array
					var temparr = datasetarr.slice(0);
					// use reduce to sort by sum up total from same branch
					var result = temparr.reduce(function(items, item) {
						var existing = items.find(function(i) {
							return i.branchName === item.branchName;
						});
						  
						// if exist sum up the total to ease the searching for top 5 branch purpose
						if (existing) {
							existing.amount += item.amount;
						} else {
							// if not exist add new entry
							items.push(item);
						}
					return items;
					}, []);
					
					// loop thru all records to find top 5 branches with most profit
					topBranchList = getTopForecastBranch(result);
					// get the age gender details of top branches then write to csv
					getForecastAgeGenderBranch(subtypelist[i], topBranchList, datasetarr);
				}
			});
		});
	});
}

// function to sort the age gender details of top branch and write to csv
function getForecastAgeGenderBranch(subtype, topBranchList, datasetarr){
	var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
	var arr = [];
	
	// loop thru the top 5 branches
	for(var i = 0; i < topBranchList.length; i++){
		// for each of the products, reset the male and female array
		var maleData = new Array(ageGroup.length).fill(0);
		var femaleData = new Array(ageGroup.length).fill(0);
		// get product item name
		var formattedBranchName;
		
		for(var j = 0; j < datasetarr.length; j++){
			if(topBranchList[i].branchName == datasetarr[j].branchName){
				// datasetarr contains all records, if matching branch name with the branch name of top braches, then push the data to another array
				// format the branch name together with its merchant name
				if (topBranchList[i].branchName.indexOf(datasetarr[j].merchantName) + 1 )
					formattedBranchName = topBranchList[i].branchName;
				else 
					formattedBranchName = datasetarr[j].merchantName + ' ' + topBranchList[i].branchName;

				arr.push(datasetarr[j]);
			}
		}
		
		// loop thru filtered array to sort by gender and age group
		for(var k = 0; k < arr.length; k++){
			var age = arr[k].age;
			var ageIndex = Math.floor(age/10);
			
			if(arr[k].gender == 'male'){
				maleData[ageIndex]++;
			}else{
				femaleData[ageIndex]++
			}
		}

		// write to csv files
		writeAgeGenderToCSV('male', subtype, formattedBranchName, maleData);
		writeAgeGenderToCSV('female', subtype, formattedBranchName, femaleData);
	}
}

var FBranchAGChart;
// function to plot the chart for branch forecast by age group
function plotForecastBranchAgeGroup(subtype, branchName){
	// hide warning message and show chart upon select product
	document.getElementById("txtFBranchAGWarning").style.display = "none";
	document.getElementById("FBranchAGChart").style.display = 'block';
	
	var forecastarr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var expectedarr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var forecastMale = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var forecastFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
	
	getForecastBranchByBranchname(subtype, branchName).then((itemarr) => {
		// loop thru each items arrays returned from query
		for(var i = 0; i < itemarr.length; i++){
			// for each of the item in item array returned, push the data to relevant array
			for (var key in itemarr[i].forecastMaleData) {
				var forecastMaleAmount = itemarr[i].forecastMaleData[key];
				// need to customize this since array starts from 0 and data from database starts from 
				// skips negative forecasted value
				if(forecastMaleAmount >= 0){
					forecastarr[key-1] += forecastMaleAmount;
					forecastMale[key-1] += forecastMaleAmount;
				}
			}
			// forecast female data
			for (var key in itemarr[i].forecastFemaleData) {
				var forecastFemaleAmount = itemarr[i].forecastFemaleData[key];
				// skips negative forecasted value
				if(forecastFemaleAmount >= 0){
					forecastarr[key-1] += forecastFemaleAmount;
					forecastFemale[key-1] += forecastFemaleAmount;
				}
			}
			// current year male data
			for (var key in itemarr[i].expectedMaleData) {
				var expectedMaleAmount = itemarr[i].expectedMaleData[key];
				expectedarr[key-1] += expectedMaleAmount;
			}
			// current year female data
			for (var key in itemarr[i].expectedFemaleData) {
				var expectedFemaleAmount = itemarr[i].expectedFemaleData[key];
				expectedarr[key-1] += expectedFemaleAmount;
			}
		}

		// forecasted amount should be no lower than 0 since person cannot be in -ve value
		for(var i = 0; i < forecastarr.length; i++){
			if(forecastarr[i] < 0) forecastarr[i] = 0;
		}
		
		// call the function to plot for forecast data by gender
		plotForecastBranchGender(ageGroup, forecastMale, forecastFemale);
		
		var ctx = document.getElementById('FBranchAGChart').getContext("2d");
		var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient1.addColorStop(0, '#E91E63');
		gradient1.addColorStop(1, '#2196F3');

		var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
		gradient2.addColorStop(0, '#FF9800');
		gradient2.addColorStop(1, '#4CAF50');
									
		var options = {
			layout: {
				padding: {
					top: 5
				}
			},
			// enforce these two to prevent chart auto expand
			responsive: true,
			maintainAspectRatio: false,
			// set line chart to no curves
			elements: {
				line: {
					tension: 0
				}
			},
			scales: {
				xAxes: [{
					gridLines: {
						display:false
					},
					barPercentage: 0.4,
					ticks: {
						fontSize: 11 
					}
				}],
				yAxes: [{
					ticks: {
						fontSize: 11,
						callback : function (value) { return numberWithCommas(value); }
					},
				}]
			},
			legend: {
				display: false,
				position: 'right',
				// disable legend onclick remove slice
				onClick: null
			},
			animation: {
				animateScale: true,
				animateRotate: true
			},
			// show percentage of slice when hover
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						var allData = data.datasets[tooltipItem.datasetIndex].data;
						var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
						var tooltipData = allData[tooltipItem.index];
						var total = 0;
						for (var i=0; i<allData.length; i++) {
							total += allData[i];
						}
						return datasetLabel + 'Amount: ' + numberWithCommas(tooltipData) + ' person(s)';
					}
				}
				}
			};
								
			var opt = {
				type: "bar",
				data: { 
					labels: ageGroup, 
					datasets: [{ 
						type: "line",
						label: 'Forecast ',
						data: forecastarr, 
						fill: false,
						borderDash: [10,5],
						borderWidth: 1.5,
						pointHoverRadius: 5,
						pointBackgroundColor: gradient1,
						pointHoverBackgroundColor: gradient1,
						borderColor: gradient1
					},
					{ 
						label: 'Current Year ',
						data: expectedarr, 
						backgroundColor: '#fff',
						borderWidth: 1.5,
						hoverBackgroundColor: gradient2,
						borderColor: gradient2
					}] 
				}, 
				options: options
			};
								
			if (FBranchAGChart) FBranchAGChart.destroy();
			FBranchAGChart = new Chart(ctx, opt);						
			FBranchAGChart.update();	
	});
}

var FBranchGenChart;
// function to plot for gender distribution horizontal bar
function plotForecastBranchGender(ageGroup, forecastMale, forecastFemale){
	// hide warning message and show chart upon select product
	document.getElementById("txtFBranchGenWarning").style.display = "none";
	document.getElementById("FBranchGenChart").style.display = 'block';
	
	// set all female data positive value to negative to plot the bar towards left
	for(var i = 0; i < forecastFemale.length; i++){
		forecastFemale[i] = -Math.abs(forecastFemale[i]);
	}
	
	var ctx = document.getElementById('FBranchGenChart').getContext("2d");					
	var options = {
		layout: {
			padding: {
				top: 5,
			}
		},
		scales:
		{
			yAxes: [{
				display: true,
				barPercentage: 0.4,
				ticks: {
					fontSize: 11 // set y-axis label size
				},
				stacked: true, 
			}],
			xAxes: [{ 
				ticks: {
					fontSize: 11,
					// show positive value on x-axis
					callback: function(t, i) {
						return t < 0 ? Math.abs(t) : t;
					},
					// position y-axis to center
					//min: -2.0
					stepSize: 1
				},
				stacked: true, 
			}]
		},
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: false,
		},
		animation: {
			animateScale: true,
			animateRotate: true
		},
		tooltips: {
			callbacks: {
				label: function(t, d) {
					// show positive value on tooltip
					var datasetLabel = d.datasets[t.datasetIndex].label;
					var xLabel = Math.abs(t.xLabel);
					return datasetLabel + ': ' + xLabel + ' person(s)';
				}
			}
		}, 
		};
					
		var opt = {
			type: "horizontalBar",
			data: { 
			labels: ageGroup, 
			datasets: [{ 
				label: 'Male',
				data: forecastMale, 
				backgroundColor: '#fff',
				borderColor: '#2196F3',
				borderWidth: 1.5,
				hoverBackgroundColor: '#2196F3'
			},
			{
				label: 'Female',
				data: forecastFemale,
				backgroundColor: '#fff',
				borderColor: '#E91E63',
				borderWidth: 1.5,
				hoverBackgroundColor: '#E91E63'
			}] 
			}, 
			options: options
		};
				
		if (FBranchGenChart) FBranchGenChart.destroy();
		FBranchGenChart = new Chart(ctx, opt);					
		FBranchGenChart.update();	
}

/** forecast branch by age & gender ends here **/

/** market basket analysis starts here**/
	function forecastMarketBasket(){
	var datasetarr = [];
	// sort the subtype by each account for association rule
	getAllReceipts().then((receiptlist) => {
		getAllReceiptItems().then((ritemlist) => {
			
			let promiseKey = new Promise((resolve, reject) => {
				for(var i = 0; i < receiptlist.length; i++){
					for(var k = 0; k < ritemlist.length; k++){
						//if(receiptlist[i].date.substring(0, 4) == getCurrentYear()){
							if(ritemlist[k].receiptID == receiptlist[i].receiptID){
								// check if accountID and subtype got duplicate before insert
								// find return undefined if there is no occurrence of your data; so what you have to do is to check whether the value returned is undefined and then you do your computation
								var found = datasetarr.find(o => o.accountID === receiptlist[i].accountID && o.subtype === ritemlist[k].type)
								if (found === undefined){
									datasetarr.push({accountID: receiptlist[i].accountID, subtype: ritemlist[k].type});
								}
								
							}
						//}
					}
				}
			resolve(datasetarr);
			});
			
			promiseKey.then((arr) => {
				
				var temparr = [];
				var writearr = [];
				
				// group list of subtypes belonged to an accountID together
				var items = {};
				arr.forEach(function(item) {
					if(!items.hasOwnProperty(item.accountID)) {
						items[item.accountID] = [];
					}

					items[item.accountID].push("'" + item.subtype + "'");
				});
				
				Object.keys(items).forEach(function(account) {
					var accountItems = items[account];
					// push the grouped items into another array to be written to text file
					temparr.push(accountItems);
				});
				
				// format temparr to add the square bracket
				for(var i = 0; i < temparr.length; i++){
					writearr.push('[' + temparr[i] + '],');
				}
				
				// create text document
				 var textDoc = document.createElement('a');

				textDoc.href = 'data:attachment/text,' + encodeURI(writearr.join('\n'));
				textDoc.target = '_blank';
				textDoc.download = 'market_basket_analysis_input.txt';
				textDoc.click();
			});
		});
	});
	}
	
	// function to display data in table format
	function plotMarketBasketAnalysis(subtype){
		// show chart and hide warning message upon selecting subtype
		document.getElementById("txtMBAWarning").style.display = "none";
		document.getElementById("MBATableWrap").style.visibility = 'visible';
	
		getMarketBasketBySubtype(subtype).then((arr) => {
			// use reduce to find max coefficients
			Array.prototype.hasMax = function(attrib) {
				return this.reduce(function(prev, curr){ 
					return prev[attrib] > curr[attrib] ? prev : curr; 
				});
			}
			
			// limit to top 5 only
			var topCounter = arr.length;
			if(topCounter >= 5){
				topCounter = 5;
			}
			
			var topSubtypeList = [];
			for(var i = 0; i < topCounter; i++){
				// sort by finding max coefficients
				topSubtype = arr.hasMax('mbaConf');
				// push object with max coefficients to a new array before popping it off
				topSubtypeList.push(topSubtype);
				var index = arr.indexOf(topSubtype);
				if (index != -1) arr.splice(index, 1);
			}
			
			// clear previous row but keep header row before populating new results
			$('#MBATable tr').slice(1).remove();
			
			// optimzed code to formulate table data
			var table = document.getElementById("MBATable");

			// helper function        
			function addMBACell(tr, text) {
				var td = tr.insertCell();
				td.innerHTML = text;
				return td;
			}
			
			// insert data
			if(topSubtypeList.length == 0){
				// if no relevant industry show error message
				var row = table.insertRow();
				addMBACell(row, 'No relevant purchase from other industries.');
				addMBACell(row, '<span class="label label-danger" style="font-size: 11px;">- %</span>');
			}else{
				// otherwise, loop thru each item and display
				topSubtypeList.forEach(function (item) {
					var row = table.insertRow();
					// add subtype name
					addMBACell(row, capitalizeFirstLetter(item.mbaName));
					
					var coefficient = (item.mbaConf * 100).toFixed(2);
					// if coefficient larger than 80, show green label
					if(coefficient > 80){
						addMBACell(row, '<span class="label label-success" style="font-size: 11px;">' + coefficient + ' % </span>');
					}else if(coefficient < 80 && coefficient > 60){
						// blue label
						addMBACell(row, '<span class="label label-info" style="font-size: 11px;">' + coefficient + ' % </span>');
					}else {
						// yellow label
						addMBACell(row, '<span class="label label-warning" style="font-size: 11px;">' + coefficient + ' % </span>');
					}
				});
			}
			
		});

	}
/** market basket analysis ends here **/
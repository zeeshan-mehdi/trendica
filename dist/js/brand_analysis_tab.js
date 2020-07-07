
// function to refresh components upon reselecting
function refreshBrandTab(){
	// repopulate brand dropdown options upon reselect subtype
	var branddropdown = document.getElementById("ddlBrand1");
	// clear previous drop down options by keeping the dropdown hint message
	branddropdown.options.length = 1;
	// set selected default to hint message
	branddropdown.selectedIndex = 0;
	// repopulate brand dropdown options upon reselect subtype
	var branddropdown2 = document.getElementById("ddlBrand2");
	branddropdown2.options.length = 1;
	branddropdown2.selectedIndex = 0;
	
	// brands comparison timeline
	document.getElementById("txtBrandTimelineWarning").style.display = "block";
	document.getElementById("brandTimelineChart").style.display = "none";
	// brands comparison detail timeline
	document.getElementById("txtBrandTimelineWarning1").style.display = "block";
	document.getElementById("brandTimelineChart1").style.display = "none";
	document.getElementById("txtBrandTimelineWarning2").style.display = "block";
	document.getElementById("brandTimelineChart2").style.display = "none";
	document.getElementById("brand1TimelineText").innerHTML = '';
	document.getElementById("brand2TimelineText").innerHTML = '';
	// top products for brand
	document.getElementById("txtTopProductBrandWarning").style.display = "block";
	document.getElementById("topProductBrandChart").style.display = "none";
	document.getElementById("txtTopProductBrandWarning1").style.display = "block";
	document.getElementById("topProductBrandChart1").style.display = "none";
	document.getElementById("productBrandTopText").innerHTML = '';
	document.getElementById("productBrandTopText1").innerHTML = '';
	// worse products for brand
	document.getElementById("txtWorseProductBrandWarning").style.display = "block";
	document.getElementById("worseProductBrandChart").style.display = "none";
	document.getElementById("txtWorseProductBrandWarning1").style.display = "block";
	document.getElementById("worseProductBrandChart1").style.display = "none";
	document.getElementById("productBrandWorseText").innerHTML = '';
	document.getElementById("productBrandWorseText1").innerHTML = '';
	// age group and gender for brand
	document.getElementById("txtdpAgeGenderWarning").style.display = "block";
	document.getElementById("dpAgeGenderChart").style.display = "none";
	document.getElementById("txtdpAgeGenderWarning1").style.display = "block";
	document.getElementById("dpAgeGenderChart1").style.display = "none";
	document.getElementById("overviewTable").style.visibility = "hidden";
	document.getElementById("overviewTable1").style.visibility = "hidden";
	document.getElementById("dpAgeGenderText").innerHTML = '';
	document.getElementById("dpAgeGenderText1").innerHTML = '';
	// average purchasing power for brand
	document.getElementById("txtAvgPowerWarning").style.display = "block";
	document.getElementById("avgPowerChart").style.display = "none";
	document.getElementById("txtAvgPowerWarning1").style.display = "block";
	document.getElementById("avgPowerChart1").style.display = "none";
	document.getElementById("avgPowerBrandText").innerHTML = '';
	document.getElementById("avgPowerBrandText1").innerHTML = '';
	document.getElementById("frequencyTableWrap").style.display = "none";
	document.getElementById("frequencyTableWrap1").style.display = "none";
	// top branches for brand
	document.getElementById("txtTopBranchBrandWarning").style.display = "block";
	document.getElementById("topBranchBrandChart").style.display = "none";
	document.getElementById("txtTopBranchBrandWarning1").style.display = "block";
	document.getElementById("topBranchBrandChart1").style.display = "none";
	document.getElementById("branchBrandTopText").innerHTML = '';
	document.getElementById("branchBrandTopText1").innerHTML = '';
	document.getElementById("branchBrandLegend").style.display = "none";
	document.getElementById("branchBrandLegend1").style.display = "none";
}

// function to populate subtype dropdown for brand comparison tab
function populateTypeDropdown(){
	document.body.classList.add("loading");
	var catdropdown = document.getElementById("ddlbrandCategory");
	var category = catdropdown.options[catdropdown.selectedIndex].value;
	category = category.toLowerCase();
	
	// refresh subtype and brand dropdown
	var typedropdown = document.getElementById("ddlbrandSubtype");
	typedropdown.options.length = 1;
	// set selected default to hint message
	typedropdown.selectedIndex = 0;
	
	document.getElementById("txtBrandWarning").style.display = "block";
	document.getElementById("brandChart").style.display = "none";
	document.getElementById("brandLegend").style.display = "none";
	document.getElementById("txtBrandProductWarning").style.display = "block";
	document.getElementById("brandProductChart").style.display = "none";
	document.getElementById("brandProductLegend").style.display = "none";
	
	// upon reselect subtype, refresh components
	refreshBrandTab();
	
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
				// loop through receipt items to get receipt details
				let promiseKey = new Promise((resolve, reject) => {
					for(var j = 0; j < ritemlist.length; j++){
						for(var k = 0; k < receiptlist.length; k++){
							if(ritemlist[j].receiptID == receiptlist[k].receiptID){
								datasetarr.push({type: ritemlist[j].type, quantity: ritemlist[j].quantity});
							}
						}
					}
				resolve(datasetarr);
				});
				
				promiseKey.then((arr) => {
					// use reduce to sort by sum up quantity of same subtype
					var result = arr.reduce(function(items, item) {
						var existing = items.find(function(i) {
						  return i.type === item.type;
						});
					  
						// if exist sum up the quantity
						if (existing) {
						  existing.quantity += item.quantity;
						} else {
						  // if not exist add new entry
						  items.push(item);
						}
					return items;
					}, []);
					
					for(var i = 0; i < result.length; i++){
						// add new drop down options for subtype according to selected category
						var option = document.createElement("option");
						option.text = capitalizeFirstLetter(result[i].type);
						typedropdown.add(option);
					}
                    document.body.classList.remove("loading");
				});
			});
		});
	});
}

// function to plot top 10 brands based on selected subtype
var brandChart;
function plotBrandChart(){
	document.getElementById("txtBrandWarning").style.display = "none";
	document.getElementById("txtBrandProductWarning").style.display = "none";
	
	setTimeout(function () {
		document.getElementById("brandChart").style.display = "block";
		document.getElementById("brandLegend").style.display = "block";		
		document.getElementById("brandProductChart").style.display = "block";
		document.getElementById("brandProductLegend").style.display = "block";	
	}, 700);
	
	refreshBrandTab();

	document.body.classList.add("loading");
	
	// get selected category
	var catdropdown = document.getElementById("ddlbrandCategory");
	var category = catdropdown.options[catdropdown.selectedIndex].value;
	category = category.toLowerCase();
	
	// get selected subtype
	var dropdown = document.getElementById("ddlbrandSubtype");
	var subtype = dropdown.options[dropdown.selectedIndex].value;
	subtype = subtype.toLowerCase();
	
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
				// loop through receipt items to check if receipt date is within current year
				let promiseKey = new Promise((resolve, reject) => {
					for(var j = 0; j < ritemlist.length; j++){
						// check if reicept item type same as selected subtype
						if(ritemlist[j].type == subtype){
							for(var k = 0; k < receiptlist.length; k++){
								if(ritemlist[j].receiptID == receiptlist[k].receiptID){
									// check if receipt date is within current year before push to datasetarr
									//if(receiptlist[k].date.substring(0, 4) == getCurrentYear() ){
										datasetarr.push({brand: ritemlist[j].brand, total: ritemlist[j].total});
									//}
								}
							}
						}
					}
				resolve(datasetarr);
				});
			
				promiseKey.then((arr) => {
					var labelData = [];
					var priceData = [];
					//var colorArr = ["#E91E63","#2196F3","#FFEB3B","#9C27B0","#4CAF50","#FF9800","#616161","#5D4037",];
					var colorArr = ['#e91e63','#d35085','#b66ca9','#8b82cd','#2196f3', '#ff9800','#dca121','#b4a834','#8aac42','#4caf50'];
					
					// use reduce to sort by sum up total of same brand
					var result = arr.reduce(function(items, item) {
						var existing = items.find(function(i) {
						  return i.brand === item.brand;
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

					for(var i = 0; i < result.length; i++){
						// sort brands to be displayed in dropdown alphabetically
						result.sort((a, b) => a.brand !== b.brand ? a.brand < b.brand ? -1 : 1 : 0);
						
						// populate both drop down for brands, execute this first as the top 10 brand part is popping the result array
						var option = document.createElement("option");
						option.text = result[i].brand;
						document.getElementById('ddlBrand1').add(option);
						
						var option2 = document.createElement("option");
						option2.text = result[i].brand;
						document.getElementById('ddlBrand2').add(option2);
					}
					
					var topBrand;
					var topBrandList = [];
					// get the maximum value
					Array.prototype.hasMax = function(attrib) {
						return this.reduce(function(prev, curr){ 
							return prev[attrib] > curr[attrib] ? prev : curr; 
						});
					}
					
					// limit the counter to 10. if data is less than 10, set the value to maximum
					var topCounter = result.length;
					if(topCounter >= 10){
						topCounter = 10;
					}
					document.getElementById('brandTopCounter').textContent = topCounter;
					
					// loop to find top brands with highest profit
					for(var i = 0; i < topCounter; i++){
						// sort by finding max profit
						topBrand = result.hasMax('total');
						// push object with max profit to a new array before popping it off
						topBrandList.push(topBrand);
						var index = result.indexOf(topBrand);
						if (index != -1) result.splice(index, 1);
					}
					
					for(var i = 0; i < topBrandList.length; i++){
						// populate axis data
						labelData.push(topBrandList[i].brand);
						priceData.push(topBrandList[i].total);
						
						// randomized color
						r = Math.floor(Math.random() * 256); 
						g = Math.floor(Math.random() * 256); 
						b = Math.floor(Math.random() * 256); 
						c = 'rgb(' + r + ', ' + g + ', ' + b + ')'; 
						colorArr.push(c); 
					}	
					
					plotBrandProductChart(topBrandList, colorArr);
					
					var ctx = document.getElementById('brandChart').getContext("2d");
					
					var options = {
						layout: {
							padding: {
							  top: 5
							}
						},
						cutoutPercentage: 70,
						responsive: true,
						maintainAspectRatio: false,
						legend: false,
						legendCallback: function(chart) {
						   var ul = document.createElement('ul');
						   var borderColor = chart.data.datasets[0].borderColor;
						   chart.data.labels.forEach(function(label, index) {
							  ul.innerHTML += `
								<li>
									<span style="background-color: ${borderColor[index]}"></span>
									${label}
								 </li>
							  `; // ^ ES6 Template String
						   });
						   return ul.outerHTML;
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
								return tooltipLabel + ' Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2)) + ' (' + tooltipPercentage + '%)';
							}
						}
						}
					};
					
					var opt = {
					  type: "doughnut",
					  data: { 
						labels: labelData, 
						datasets: [{ 
						data: priceData, 
						backgroundColor: 'rgba(0, 0, 0, 0)',
						borderColor: colorArr,
						borderWidth: 1.5,
						hoverBackgroundColor: colorArr
						}] 
					  }, 
					  options: options
					};
                    //document.body.classList.remove("loading");
					
					if (brandChart) brandChart.destroy();
					brandChart = new Chart(ctx, opt);
						
					brandChart.update();	
					brandLegend.innerHTML = brandChart.generateLegend();
				});	
			});	
		});
	});
}

// function to total number of products for the top 10 brands
var brandProductChart;
function plotBrandProductChart(topBrandList, colorArr){
	
	var labelData = [];
	var amountData = [];
	
	// get all items
	getAllItems().then((itemlist) => {
		for(var j = 0; j < topBrandList.length; j++){
			var counter = 0;
			var brandName = topBrandList[j].brand;
			
			for(var i = 0; i < itemlist.length; i++){
				// if matching brand from the top brand list, increment counter
				if(brandName == itemlist[i].brand){
					counter++;
				}
			}
			
			labelData.push(brandName);
			amountData.push(counter);
		}
		
		var ctx = document.getElementById('brandProductChart').getContext("2d");
						
		var options = {
			layout: {
				padding: {
					top: 5
				}
			},
			cutoutPercentage: 70,
			responsive: true,
			maintainAspectRatio: false,
			legend: false,
			legendCallback: function(chart) {
			   var ul = document.createElement('ul');
			   var borderColor = chart.data.datasets[0].borderColor;
			   chart.data.labels.forEach(function(label, index) {
				  ul.innerHTML += `
					<li>
						<span style="background-color: ${borderColor[index]}"></span>
						${label}
					 </li>
				  `; // ^ ES6 Template String
			   });
			   return ul.outerHTML;
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
						return tooltipLabel + ': ' + tooltipData + ' products (' + tooltipPercentage + '%)';
					}
				}
				}
			};
						
			var opt = {
				type: "polarArea",
				data: { 
					labels: labelData, 
					datasets: [{ 
						data: amountData, 
						backgroundColor: 'rgba(0, 0, 0, 0)',
						borderColor: colorArr,
						borderWidth: 1.5,
						hoverBackgroundColor: colorArr
					}] 
				}, 
				options: options
			};
        	document.body.classList.remove("loading");
			if (brandProductChart) brandProductChart.destroy();
			brandProductChart = new Chart(ctx, opt);
							
			brandProductChart.update();	
			brandProductLegend.innerHTML = brandProductChart.generateLegend();
	});
}

// function to plot brand comparison timeline
var brandTimelineChart;
function plotBrandTimeline(){
	var dropdown = document.getElementById("ddlbrandSubtype");
	var subtype = dropdown.options[dropdown.selectedIndex].value;
	subtype = subtype.toLowerCase();
	
	// get selected brand from both drop down
	var dropdown1 = document.getElementById("ddlBrand1");
	var brand1 = dropdown1.options[dropdown1.selectedIndex].value;
	
	var dropdown2 = document.getElementById("ddlBrand2");
	var brand2 = dropdown2.options[dropdown2.selectedIndex].value;
	
	// arrays for multiple series line chart
	var datasetarr = [];
	var datasetarr2 = [];


	// only populate when both dropdown selected a brand
	if(brand1 != '' && brand2 != ''){
        document.body.classList.add("loading");
		// hide warning message & show the chart canvas
		document.getElementById("txtBrandTimelineWarning").style.display = "none";
		document.getElementById("txtdpAgeGenderWarning").style.display = "none";
		document.getElementById("txtdpAgeGenderWarning1").style.display = "none";
		document.getElementById('txtBrandTimelineWarning1').style.display = 'none';
		document.getElementById('txtBrandTimelineWarning2').style.display = 'none';
		document.getElementById('txtTopProductBrandWarning').style.display = 'none';
		document.getElementById('txtTopProductBrandWarning1').style.display = 'none';
		document.getElementById("txtAvgPowerWarning").style.display = "none";
		document.getElementById("txtAvgPowerWarning1").style.display = "none";
		document.getElementById("txtTopBranchBrandWarning").style.display = "none";
		document.getElementById("txtTopBranchBrandWarning1").style.display = "none";
		document.getElementById('txtWorseProductBrandWarning').style.display = 'none';
		document.getElementById('txtWorseProductBrandWarning1').style.display = 'none';
		
		setTimeout(function () {
			document.getElementById("brandTimelineChart").style.display = "block";
		}, 700);
	
		var ritemlist = [];
		var ritemlist2 = [];
		var datasetarr = [];
		// get all receipt item ID which under selected category and brand rather than all receipt item ID
		getAllReceiptItemIDByBrand(brand1).then((ritemIDlist) => {
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
				// get receipt and account details
				getAllReceipts().then((receiptlist) => {
					getAllAccounts().then((accountlist) => {
					// loop through receipt items to get receipt details
					let promiseKey = new Promise((resolve, reject) => {
						// get list of receipt items details by brand
						for(var i = 0; i< ritemlist.length; i++){
							// if matching with selected subtype
							if(ritemlist[i].type == subtype){
								for(var j = 0; j < receiptlist.length; j++){
									// check if matching receipt ID to get receipt date
									if(ritemlist[i].receiptID == receiptlist[j].receiptID){
										//if(receiptlist[j].date.substring(0, 4) == getCurrentYear() ){
											for(var h = 0; h < accountlist.length; h++){
												// check if matching account ID to get account details
												if(receiptlist[j].accountID == accountlist[h].accountID){
													datasetarr.push({accountID: accountlist[h].accountID, age: accountlist[h].age, gender: accountlist[h].gender,
													brand: ritemlist[i].brand, date: receiptlist[j].date, total: ritemlist[i].total,
													branchName: receiptlist[j].branchName, merchantName: receiptlist[j].merchantName});
												}
											}
										}
									//}
								}
							}
						}
					resolve(datasetarr);
					});
					
					promiseKey.then((arr) => {
						// fetch for second brand starts
						// get all receipt item ID which under selected category and brand rather than all receipt item ID
						getAllReceiptItemIDByBrand(brand2).then((ritemIDlist) => {
							// get all related receipt item details
							let promiseKey = new Promise((resolve, reject) => {
								// loop through the IDs and get its detail
								for(var i = 0; i < ritemIDlist.length; i++){
									getReceiptItemByID(ritemIDlist[i].receiptItemID).then((ritem) => {
										ritemlist2.push(ritem);
									});
								}
								resolve(ritemlist2);
							});
							
							promiseKey.then((ritemlist) => {
								// get receipt and account details
								getAllReceipts().then((receiptlist) => {
									getAllAccounts().then((accountlist) => {
									// loop through receipt items to get receipt details
									let promiseKey = new Promise((resolve, reject) => {
										// get list of receipt items details by brand
										for(var i = 0; i< ritemlist.length; i++){
											// if matching with selected subtype
											if(ritemlist[i].type == subtype){
												for(var j = 0; j < receiptlist.length; j++){
													// check if matching receipt ID to get receipt date
													if(ritemlist[i].receiptID == receiptlist[j].receiptID){
														//if(receiptlist[j].date.substring(0, 4) == getCurrentYear() ){
														for(var h = 0; h < accountlist.length; h++){
															// check if matching account ID to get account details
															if(receiptlist[j].accountID == accountlist[h].accountID){
																datasetarr2.push({accountID: accountlist[h].accountID, age: accountlist[h].age, gender: accountlist[h].gender,
																brand: ritemlist[i].brand, date: receiptlist[j].date, total: ritemlist[i].total,
																branchName: receiptlist[j].branchName, merchantName: receiptlist[j].merchantName});
															}
														}
														//}
													}
												}
											}
										}
									resolve(datasetarr2);
									});
									
									promiseKey.then((arr2) => {

										var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
										var monthIndex;
										var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
										var amountData2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
										
										// use reduce to sort & group by date for first brand
										var result = arr.reduce(function(items, item) {
											var existing = items.find(function(i) {
												return i.date === item.date;
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
										
										// execute the populate overview function based on selected brand and passing in HTML DOM
										populateOverview(result, 'todayProfit', 'yesterdayProfit', 'thisweekProfit', 'lastweekProfit', 'thismonthProfit', 'lastmonthProfit',
										'todayPercentage', 'yesterdayPercentage', 'thisweekPercentage', 'lastweekPercentage', 'thismonthPercentage', 'lastmonthPercentage', 
										'imgToday', 'imgYesterday', 'imgThisweek', 'imgLastweek', 'imgThismonth', 'imgLastmonth');
										
										// show the table and set the title
										document.getElementById('overviewTable').style.visibility = 'visible';
										document.getElementById('revenueText').innerHTML = brand1;
										document.getElementById('dpAgeGenderText').innerHTML = brand1;
										document.getElementById('avgPowerBrandText').innerHTML = brand1;
										
											
										// loop through grouped date to group by month
										result.forEach(obj => {
											var month = Number(obj.date.substr(5,2));
											amountData[month-1] += obj.total;
										})
											
										// use reduce to sort & group by date for second brand
										var result2 = arr2.reduce(function(items, item) {
											var existing = items.find(function(i) {
												return i.date === item.date;
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
										
										// execute the populate overview function based on selected brand and passing in HTML DOM
										populateOverview(result2, 'todayProfit1', 'yesterdayProfit1', 'thisweekProfit1', 'lastweekProfit1', 'thismonthProfit1', 'lastmonthProfit1',
										'todayPercentage1', 'yesterdayPercentage1', 'thisweekPercentage1', 'lastweekPercentage1', 'thismonthPercentage1', 'lastmonthPercentage1', 
										'imgToday1', 'imgYesterday1', 'imgThisweek1', 'imgLastweek1', 'imgThismonth1', 'imgLastmonth1');
										
										// show the table and set the title
										document.getElementById('overviewTable1').style.visibility = 'visible';
										document.getElementById('revenueText1').innerHTML = brand2;
										document.getElementById('dpAgeGenderText1').innerHTML = brand2;
										document.getElementById('avgPowerBrandText1').innerHTML = brand2;
										
										// loop through grouped date to group by month
										result2.forEach(obj => {
											var month = Number(obj.date.substr(5,2));
											 amountData2[month-1] += obj.total;
										})
											
										var ctx = document.getElementById('brandTimelineChart').getContext("2d");
										var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
										gradient1.addColorStop(0, '#E91E63');
										gradient1.addColorStop(1, '#2196F3');
											
										var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
										gradient2.addColorStop(0, '#FF9800');
										gradient2.addColorStop(1, '#4CAF50');
											
										populateBrandTimeline(result, gradient1, brand1, "brandTimelineChart1");
										populateBrandTimeline(result2, gradient2, brand2, "brandTimelineChart2");
										
										
										//bestfitRegression(amountData);
								
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
													}
												}],
											yAxes: [{
												ticks: {
													callback : function (value) { return numberWithCommas(value); }
												},
											}]
											},
											legend: {
												display: false,
											},
											animation: {
												animateScale: true,
												animateRotate: true
											},
											// customize hover tooltip
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
													return datasetLabel + ' Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
												}
											}
											}
											};
												
											var opt = {
												type: "line",
												data: { 
													labels: labelData, 
													datasets: [{ 
														label: brand1,
														data: amountData, 
														fill: false,
														borderWidth: 1.5,
														pointHoverRadius: 5,
														pointBackgroundColor: gradient1,
														pointHoverBackgroundColor: gradient1,
														borderColor: gradient1
													},
													{ 
														label: brand2,
														data: amountData2, 
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
                                        	document.body.classList.remove("loading");
											if (brandTimelineChart) brandTimelineChart.destroy();
											brandTimelineChart = new Chart(ctx, opt);
													
											brandTimelineChart.update();
											
											// pass the array with populated account details as parameter
											plotdpAgeGenderChart(arr, 'dpAgeGenderChart');
											plotdpAgeGenderChart(arr2, 'dpAgeGenderChart1');
											
											// calculate the average purchasing power of certain brand for each age group
											plotPurchasingPower(arr, 'avgPowerChart', gradient1);
											plotPurchasingPower(arr2, 'avgPowerChart1', gradient2);
											
											// pass the brand as parameter to get list of top products
											getTopProductBrand(brand1, 'topProductBrandChart', gradient1, 'productBrandTopCounter', 'worseProductBrandChart', 'productBrandWorseCounter');
											getTopProductBrand(brand2, 'topProductBrandChart1', gradient2, 'productBrandTopCounter1', 'worseProductBrandChart1', 'productBrandWorseCounter1');
											
											plotTopBranchForBrand(arr, 'topBranchBrandChart', 'branchBrandTopCounter', brand1);
											plotTopBranchForBrand(arr2, 'topBranchBrandChart1', 'branchBrandTopCounter1', brand2);
										});
								});
								});
							});
						}); // fetch for second brand ends
					});
				});
				});
			});
		});
	}
}

function isThisWeek(d) {
  // start and end of this week
  var thisWeek = [moment().utc().startOf('week'),
                  moment().utc().endOf('week')];
  return d.isBetween(thisWeek[0],thisWeek[1])||
  d.isSame(thisWeek[0])||
  d.isSame(thisWeek[1]);
}

function isLastWeek(d) {
  // start and end of this week minus 1, which is last week
  var lastWeek = [moment().utc().subtract(1,'weeks').startOf('week'),
                  moment().utc().subtract(1,'weeks').endOf('week')];
  return d.isBetween(lastWeek[0],lastWeek[1])||
  d.isSame(lastWeek[0])||
  d.isSame(lastWeek[1]);
}

function isLastTwoWeek(d) {
  // start and end of this week minus 2, which is last two week
  var lastTwoWeek = [moment().utc().subtract(2,'weeks').startOf('week'),
                  moment().utc().subtract(2,'weeks').endOf('week')];
  return d.isBetween(lastTwoWeek[0],lastTwoWeek[1])||
  d.isSame(lastTwoWeek[0])||
  d.isSame(lastTwoWeek[1]);
}

function isThisMonth(d) {
  // start and end of this month
  var thisMonth = [moment().utc().startOf('month'),
                   moment().utc().endOf('month')];
  return d.isBetween(thisMonth[0],thisMonth[1])||
  d.isSame(thisMonth[0])||
  d.isSame(thisMonth[1]);
}

function isLastMonth(d) {
  // start and end of this month minus 1, which is last month
  var lastMonth = [moment().subtract(1,'months').utc().startOf('month'),
                   moment().subtract(1,'months').utc().endOf('month')];
  return d.isBetween(lastMonth[0],lastMonth[1])||
  d.isSame(lastMonth[0])||
  d.isSame(lastMonth[1]);
}

function isLastTwoMonth(d) {
  // start and end of this month minus 2, which is last two month
  var lastTwoMonth = [moment().subtract(2,'months').utc().startOf('month'),
                   moment().subtract(2,'months').utc().endOf('month')];
  return d.isBetween(lastTwoMonth[0],lastTwoMonth[1])||
  d.isSame(lastTwoMonth[0])||
  d.isSame(lastTwoMonth[1]);
}

// function to display revenue over a certain period of time
function populateOverview(result, todayProfit, yesterdayProfit, thisweekProfit, lastweekProfit, thismonthProfit, lastmonthProfit,
						todayPercentage, yesterdayPercentage, thisweekPercentage, lastweekPercentage, thismonthPercentage, lastmonthPercentage,
						imgToday, imgYesterday, imgThisweek, imgLastweek, imgThismonth, imgLastmonth){
	
	let profit = {
	  today:0,
	  yesterday:0,
	  lasttwoday:0,
	  thisweek:0,
	  lastweek:0,
	  lasttwoweek:0,
	  thismonth:0,
	  lastmonth:0,
	  lasttwomonth:0
	 };

	var today = moment();
	var date;
	result.forEach(function(e){
	  date = moment.utc(e.date,'YYYY-MM-DD');

	  if (today.diff(date, 'days') === 0) {
		// get profit for today
		profit.today += e.total;
	  } else if (today.diff(date, 'days') === 1) {
		// get profit for yesterday
		profit.yesterday += e.total;
	  } else if (today.diff(date, 'days') === 2) {
		// get profit for last two day
		profit.lasttwoday += e.total;
	  }
	  
	  if (isThisWeek(date)) { // if this week
		// get profit for current week
		profit.thisweek += e.total;
	  } else if (isLastWeek(date)) { // if last week
		// get profit for last week
		profit.lastweek += e.total;
	  } else if (isLastTwoWeek(date)) { // if last two week
		// get profit for last two week
		profit.lasttwoweek += e.total;
	  }
	  
	  if (isThisMonth(date)) { // if this month
		// get profit for current month
		profit.thismonth += e.total;
	  } else if (isLastMonth(date)) { // if last month
		// get profit for last month
		profit.lastmonth += e.total;
	  } else if (isLastTwoMonth(date)) { // if last two month
		// get profit for last two month
		profit.lasttwomonth += e.total;
	  }
	});
	
	document.getElementById(todayProfit).innerHTML = '$ ' + numberWithCommas(profit.today.toFixed(2));
	document.getElementById(yesterdayProfit).innerHTML = '$ ' + numberWithCommas(profit.yesterday.toFixed(2));
	document.getElementById(thisweekProfit).innerHTML = '$ ' + numberWithCommas(profit.thisweek.toFixed(2));
	document.getElementById(lastweekProfit).innerHTML = '$ ' + numberWithCommas(profit.lastweek.toFixed(2));
	document.getElementById(thismonthProfit).innerHTML = '$ ' + numberWithCommas(profit.thismonth.toFixed(2));
	document.getElementById(lastmonthProfit).innerHTML = '$ ' + numberWithCommas(profit.lastmonth.toFixed(2));
	
	// calculate increase or decrease of percentage over two different period of times
	populateUpDown(todayPercentage, imgToday, profit.today, profit.yesterday, 'yesterday');
	populateUpDown(yesterdayPercentage, imgYesterday, profit.yesterday, profit.lasttwoday, 'the day before yesterday');
	populateUpDown(thisweekPercentage, imgThisweek, profit.thisweek, profit.lastweek, 'last week');
	populateUpDown(lastweekPercentage, imgLastweek, profit.lastweek, profit.lasttwoweek, 'the week before last');
	populateUpDown(thismonthPercentage, imgThismonth, profit.thismonth, profit.lastmonth, 'last month');
	populateUpDown(lastmonthPercentage, imgLastmonth, profit.lastmonth, profit.lasttwomonth, 'the month before last');
}

function populateUpDown(percentageDOM, imageDOM, compareFrom, compareTo, timeText){
	var percentage = 0;
	
	// if both number same, means maintained
	if(compareFrom == compareTo){
		document.getElementById(imageDOM).src = 'dist/img/maintain_yellow.png';
		percentage = 0;
		// set font color to yellow
		document.getElementById(percentageDOM).style.color = '#f1c40f';
	}
	// if today < yesterday, yesterday < lasttwoday, means decreased
	else if(compareFrom < compareTo){
		document.getElementById(imageDOM).src = 'dist/img/down_arrow_red.png';
		// if both number are not zero, wont have division over zero error
		if(compareFrom != 0 && compareTo != 0){
			percentage = Math.round((compareTo - compareFrom) / compareFrom * 100);
		}
		// if either one zero, just multiply the other one with 100
		else if(compareFrom == 0){
			percentage = Math.round(compareTo * 100);
		}
		else if(compareTo == 0){
			percentage = Math.round(compareFrom * 100);
		}
		// set font color to dark red
		document.getElementById(percentageDOM).style.color = '#B40404';
	}
	// if today > yesterday, yesterday < lasttwoday, means increased
	else{
		document.getElementById(imageDOM).src = 'dist/img/up_arrow_green.png';
		// if both number are not zero, wont have division over zero error
		if(compareFrom != 0 && compareTo != 0){
			percentage = Math.round((compareFrom - compareTo) /compareTo * 100);
		}
		// if either one zero, just multiply the other one with 100
		else if(compareFrom == 0){
			percentage = Math.round(compareTo * 100);
		}
		else if(compareTo == 0){
			percentage = Math.round(compareFrom * 100);
		}
		// set font color to green
		document.getElementById(percentageDOM).style.color = '#088A08';
	}
	// set the percentage value
	document.getElementById(percentageDOM).innerHTML = ' ' + percentage + ' % (over $ ' + numberWithCommas(compareTo.toFixed(2)) + ' from ' + timeText + ' )';
}

// function to plot brand timeline in details
var dpBrandTimeline1;
var dpBrandTimeline2;
function populateBrandTimeline(arr, gradient, brand, chartDOM){
	document.getElementById(chartDOM).style.display = 'block';
	
	var labelData = [];
	var amountData = [];
											
	// use reduce to sort & group by date for brand
	var result = arr.reduce(function(items, item) {
		var existing = items.find(function(i) {
			return i.date === item.date;
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
			
	// sort the date in ascending order
	result.sort(function(a, b) {
		da = new Date(a.date);
		db = new Date(b.date);
		if (da == db) {
			return 0;
		}
		return da > db ? 1 : -1;
		});

		// populate data for x-axis and y-axis
		for(var i = 0; i < result.length; i++){	
			var date = formatDateLabel(result[i].date);
			labelData.push(date);
			amountData.push(result[i].total);
		}
					
		var ctx = document.getElementById(chartDOM).getContext("2d");
											
		var options = {
			layout: {
				padding: {
					top: 5
				}
			},
			// enforce these two to prevent chart auto expand
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					gridLines: {
						display:false
					},
					ticks: {
						fontSize: 11 
					},
					display: false
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
			},
			animation: {
				animateScale: true,
				animateRotate: true
			},
			// customize hover tooltip
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
						return 'Total Revenue: $ ' + tooltipData.toFixed(2);
					}
				}
			}
			};
												
			var opt = {
				type: "line",
				data: { 
					labels: labelData, 
					datasets: [{ 
						label: brand,
						data: amountData, 
						fill: false,
						borderWidth: 1.5,
						pointHoverRadius: 5,
						pointBackgroundColor: '#fff',
						pointStrokeColor: '#4e4e4e',
						pointHoverBackgroundColor: '#fff',
						borderColor: gradient
					}] 
				}, 
				options: options
			};
						
			if(chartDOM == 'brandTimelineChart1'){
				if (dpBrandTimeline1) dpBrandTimeline1.destroy();
				dpBrandTimeline1 = new Chart(ctx, opt);
									
				dpBrandTimeline1.update();	
				document.getElementById("brand1TimelineText").innerHTML = brand;
			}else {
				if (dpBrandTimeline2) dpBrandTimeline2.destroy();
				dpBrandTimeline2 = new Chart(ctx, opt);
									
				dpBrandTimeline2.update();
				document.getElementById("brand2TimelineText").innerHTML = brand;				
			}
}

// function to plot top branches for selected brand
var topBranchBrandChart, topBranchBrandChart1;
function plotTopBranchForBrand(arr, chartDOM, topCounterDOM, brand){
	document.getElementById(chartDOM).style.display = 'block';
	document.getElementById("branchBrandLegend").style.display = "block";
	document.getElementById("branchBrandLegend1").style.display = "block";
	
	var topBranchList = [];
	var topBranch;
	var labelData = [];
	var amountData = [];
	var colorArr = [];
						
	if(chartDOM == 'topBranchBrandChart'){
		colorArr = ['#e91e63','#d35085','#b66ca9','#8b82cd','#2196f3'];
	}else{
		colorArr = ['#ff9800','#dca121','#b4a834','#8aac42','#4caf50'];
	}
										
	// use reduce to sort by sum up total of same branchName
	var result = arr.reduce(function(items, item) {
		var existing = items.find(function(i) {
			return i.branchName === item.branchName;
		});
						  
		// if exist sum up the quantity
		if (existing) {
			existing.total += item.total;
		} else {
			// if not exist add new entry
			items.push(item);
		}
		return items;
	}, []);
						
	// use reduce to find max total
	Array.prototype.hasMax = function(attrib) {
		return this.reduce(function(prev, curr){ 
			return prev[attrib] > curr[attrib] ? prev : curr; 
		});
	}
						
	var topCounter = result.length;
	if(topCounter >= 5){
		topCounter = 5;
	}
	document.getElementById(topCounterDOM).textContent = topCounter;
	
	// loop to find top 5 branches with highest profit
	for(var i = 0; i < topCounter; i++){
		// sort by finding max total
		topBranch = result.hasMax('total');
		// push object with max total to a new array before popping it off
		topBranchList.push(topBranch);
		var index = result.indexOf(topBranch);
		if (index != -1) result.splice(index, 1);
	}
						
	for(var i = 0 ; i < topBranchList.length; i++){
		// format branchName to check if merchantName exists in branchName
		if (topBranchList[i].branchName.indexOf(topBranchList[i].merchantName) + 1 )
			formattedBranchName = topBranchList[i].branchName;
		else 
			formattedBranchName = topBranchList[i].merchantName + ' ' + topBranchList[i].branchName;
						
		labelData.push(formattedBranchName);
		amountData.push(topBranchList[i].total);
	}
						
	var ctx = document.getElementById(chartDOM).getContext("2d");
											
	var options = {
		layout: {
			padding: {
				top: 5
			}
		},
		cutoutPercentage: 70,
		responsive: true,
		maintainAspectRatio: false,
		legend: false,
		legendCallback: function(chart) {
			var ul = document.createElement('ul');
			var borderColor = chart.data.datasets[0].borderColor;
			chart.data.labels.forEach(function(label, index) {
				ul.innerHTML += `
					<li>
						<span style="background-color: ${borderColor[index]}"></span>
						${label}
					 </li>
				`; // ^ ES6 Template String
			});
			return ul.outerHTML;
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
					return tooltipLabel + ' Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2)) + ' (' + tooltipPercentage + '%)';
				}
			}
		}
	};
																
	var opt = {
		type: "polarArea",
			data: { 
				labels: labelData, 
				datasets: [{ 
					data: amountData, 
					backgroundColor: 'rgba(0, 0, 0, 0)',
					borderColor: colorArr,
					borderWidth: 1.5,
					hoverBackgroundColor: colorArr
				}] 
			}, 
		options: options
	};
										
	if(chartDOM == 'topBranchBrandChart'){
		if (topBranchBrandChart) topBranchBrandChart.destroy();
		topBranchBrandChart = new Chart(ctx, opt);
													
		topBranchBrandChart.update();	
		document.getElementById("branchBrandTopText").innerHTML = brand;
			branchBrandLegend.innerHTML = topBranchBrandChart.generateLegend();
	}else {
		if (topBranchBrandChart1) topBranchBrandChart1.destroy();
		topBranchBrandChart1 = new Chart(ctx, opt);
													
		topBranchBrandChart1.update();
		document.getElementById("branchBrandTopText1").innerHTML = brand;
		branchBrandLegend1.innerHTML = topBranchBrandChart1.generateLegend();								
	}									
}

// function to plot top products for selected brand
var topProductBrandChart1;
var topProductBrandChart2;
function getTopProductBrand(brand, chartDOM, gradient, topCounterDOM, worseChartDOM, worseCounterDOM){
	document.getElementById(chartDOM).style.display = 'block';
	
	var ritemlist = [];
	var datasetarr = [];
	// get all receipt item ID which under selected category rather than all receipt item ID
	getAllReceiptItemIDByBrand(brand).then((ritemIDlist) => {
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
				getAllItems().then((itemlist) => {
					// loop through receipt items to check if receipt date is within current year
					let promiseKey = new Promise((resolve, reject) => {
						for(var j = 0; j < ritemlist.length; j++){
							for(var k = 0; k < receiptlist.length; k++){
								if(ritemlist[j].receiptID == receiptlist[k].receiptID){
									// if receipt date within current year, get item detail
									//if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
										for(var h = 0; h < itemlist.length; h++){
											// if matching item ID with receipt item details, push to datasetarr
											if(ritemlist[j].itemID == itemlist[h].itemID){
												datasetarr.push({type: ritemlist[j].type, quantity: ritemlist[j].quantity, price: ritemlist[j].price, brand: ritemlist[j].brand, itemName: itemlist[h].name});
											}
										}
									//}
								}
							}
						}
						resolve(datasetarr);
					});
					
					promiseKey.then((arr) => {
						//console.log(JSON.stringify(arr));
						var topProductList = [];
						var topProduct;
						var labelData = [];
						var amountData = [];
						var quantityData = [];
						
						// use reduce to sort by sum up quantity of same itemName
						var result = arr.reduce(function(items, item) {
							var existing = items.find(function(i) {
							  return i.itemName === item.itemName;
							});
						  
							// if exist sum up the quantity
							if (existing) {
							  existing.quantity += item.quantity;
							} else {
							  // if not exist add new entry
							  items.push(item);
							}
						return items;
						}, []);
						
						// use reduce to find max total
						Array.prototype.hasMax = function(attrib) {
							return this.reduce(function(prev, curr){ 
								return prev[attrib] > curr[attrib] ? prev : curr; 
							});
						}
						
						var topCounter = result.length;
						if(topCounter >= 5){
							topCounter = 5;
						}
						document.getElementById(topCounterDOM).textContent = topCounter;
						
						// loop through result array to add in new attribute for total 
						for(var i = 0; i < result.length; i++){
							result[i]['total'] = result[i].price * result[i].quantity;
						}
						
						// cloning array to prevent original array getting mutated
						var result1 = result.slice(0);
						getWorseProductBrand(result1, brand, worseChartDOM, gradient, worseCounterDOM);
						
						// loop to find top 5 products with highest total
						for(var i = 0; i < topCounter; i++){
							// sort by finding max total
							topProduct = result.hasMax('total');
							// push object with max total to a new array before popping it off
							topProductList.push(topProduct);
							var index = result.indexOf(topProduct);
							if (index != -1) result.splice(index, 1);
						}
						
						for(var i = 0 ; i < topProductList.length; i++){
							// replace empty space with \n to format the width of x-axis label
							labelData.push(topProductList[i].itemName.replace(/(.{1,20})(?:\n|$| )/g, "$1\n"));
							amountData.push((topProductList[i].price * topProductList[i].quantity).toFixed(2));
							quantityData.push(topProductList[i].quantity);
						}
						
						var ctx = document.getElementById(chartDOM).getContext("2d");
											
						var options = {
							layout: {
								padding: {
									top: 5
								}
							},
							// enforce these two to prevent chart auto expand
							responsive: true,
							maintainAspectRatio: false,
							scales: {
								xAxes: [{
									gridLines: {
										display:false
									},
									ticks: {
										fontSize: 11, // set y-axis label size
										callback: function(tick) {
											return tick.split(/\n/); // break the x-axis label
									    }
									},
									barPercentage: 0.4, // set bar thickness
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
							},
							animation: {
								animateScale: true,
								animateRotate: true
							},
							// customize hover tooltip
							tooltips: {
							   callbacks: {
									// callback function to merge the label back
									title: function(t, d) {
										return d.labels[t[0].index].replace(/\n/, ' ');
									},
									// show different tooltip labels when hovered on different graphs
									label: function(t, d) {
										 var xLabel = d.datasets[t.datasetIndex].label;
										 var yLabel = t.yLabel;
										 // if bar chart
										 if (t.datasetIndex === 1) return xLabel + ': ' + yLabel + ' unit(s)';
										 // if line chart
										 else if (t.datasetIndex === 0){
											return xLabel + ': $ ' + numberWithCommas(yLabel.toFixed(2));
										 }
									}		
							   }
							}
							};
																
							var opt = {
								type: "bar",
								data: { 
									labels: labelData, 
									datasets: [{ 
										type: "bar",
										label: 'Total Revenue',
										data: amountData, 
										backgroundColor: "rgba(220,220,220,0)",
										borderColor: gradient,
										borderWidth: 1.5,
										hoverBorderColor: gradient,
									},{
										type: "line",
										label: 'Quantity Sold ',
										data: quantityData, 
										fill: false,
										borderColor: gradient,
										borderWidth: 1.5,
										pointHoverRadius: 5,
										pointBackgroundColor: gradient,
										pointHoverBackgroundColor: gradient
									}] 
								}, 
								options: options
							};
										
							if(chartDOM == 'topProductBrandChart'){
								if (topProductBrandChart1) topProductBrandChart1.destroy();
								topProductBrandChart1 = new Chart(ctx, opt);
													
								topProductBrandChart1.update();	
								document.getElementById("productBrandTopText").innerHTML = brand;
							}else {
								if (topProductBrandChart2) topProductBrandChart2.destroy();
								topProductBrandChart2 = new Chart(ctx, opt);
													
								topProductBrandChart2.update();
								document.getElementById("productBrandTopText1").innerHTML = brand;				
							}
		
					});
				});
			});
		});			
	});
}

// function to plot products with minimum revenue for selected brand
var worseProductBrandChart1;
var worseProductBrandChart2;
function getWorseProductBrand(result, brand, chartDOM, gradient, worseCounterDOM){
	document.getElementById(chartDOM).style.display = 'block';
	var labelData = [];
	var amountData = [];
	var quantityData = [];
	var worseProduct;
	var worseProductList = [];
						
	// use reduce to find min total
	Array.prototype.hasMin = function(attrib) {
		return this.reduce(function(prev, curr){ 
			return prev[attrib] < curr[attrib] ? prev : curr; 
		});
	}
						
	var worseCounter = result.length;
	if(worseCounter >= 5){
		worseCounter = 5;
	}
	document.getElementById(worseCounterDOM).textContent = worseCounter;
										
	// loop to find top 5 products with minimum total
	for(var i = 0; i < worseCounter; i++){
		// sort by finding min total
		worseProduct = result.hasMin('total');
		// push object with min total to a new array before popping it off
		worseProductList.push(worseProduct);
		var index = result.indexOf(worseProduct);
		if (index != -1) result.splice(index, 1);
	}
						
	for(var i = 0 ; i < worseProductList.length; i++){
		// replace empty space with \n to format the width of x-axis label
		labelData.push(worseProductList[i].itemName.replace(/(.{1,20})(?:\n|$| )/g, "$1\n"));
		amountData.push((worseProductList[i].price * worseProductList[i].quantity).toFixed(2));
		quantityData.push(worseProductList[i].quantity);
	}
						
	var ctx = document.getElementById(chartDOM).getContext("2d");
											
	var options = {
		layout: {
			padding: {
				top: 5
			}
		},
		// enforce these two to prevent chart auto expand
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			xAxes: [{
				gridLines: {
					display:false
				},
				ticks: {
					fontSize: 11, // set y-axis label size
					callback: function(tick) {
						return tick.split(/\n/); // break the x-axis label
					}
				},
				barPercentage: 0.4, // set bar thickness
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
		},
		animation: {
			animateScale: true,
			animateRotate: true
		},
		// customize hover tooltip
		tooltips: {
			callbacks: {
				// callback function to merge the label back
				title: function(t, d) {
					return d.labels[t[0].index].replace(/\n/, ' ');
				},
				// show different tooltip labels when hovered on different graphs
				label: function(t, d) {
					var xLabel = d.datasets[t.datasetIndex].label;
					var yLabel = t.yLabel;
					// if bar chart
					if (t.datasetIndex === 1) return xLabel + ': ' + yLabel + ' unit(s)';
					// if line chart
					else if (t.datasetIndex === 0){
						return xLabel + ': $ ' + numberWithCommas(yLabel.toFixed(2));
					}
				}		
			}
		}
	};
																
	var opt = {
		type: "bar",
		data: { 
			labels: labelData, 
			datasets: [{ 
				type: "bar",
				label: 'Total Revenue',
				data: amountData, 
				backgroundColor: "rgba(220,220,220,0)",
				borderColor: gradient,
				borderWidth: 1.5,
				hoverBorderColor: gradient,
			},{
				type: "line",
				label: 'Quantity Sold ',
				data: quantityData, 
				fill: false,
				borderColor: gradient,
				borderWidth: 1.5,
				pointHoverRadius: 5,
				pointBackgroundColor: gradient,
				pointHoverBackgroundColor: gradient
			}] 
		}, 
		options: options
		};
										
		if(chartDOM == 'worseProductBrandChart'){
			if (worseProductBrandChart1) worseProductBrandChart1.destroy();
			worseProductBrandChart1 = new Chart(ctx, opt);
													
			worseProductBrandChart1.update();	
			document.getElementById("productBrandWorseText").innerHTML = brand;
		}else {
			if (worseProductBrandChart2) worseProductBrandChart2.destroy();
			worseProductBrandChart2 = new Chart(ctx, opt);
													
			worseProductBrandChart2.update();
			document.getElementById("productBrandWorseText1").innerHTML = brand;				
		}
}

// function to plot age group and gender based on selected brand
var dpAgeGenderChart;
var dpAgeGenderChart1;
function gender(elem) { return elem.gender }
function plotdpAgeGenderChart(arr, chartDOM){
		document.getElementById(chartDOM).style.display = 'block';
	
		var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
		var ageIndex;
		var maleData = new Array(ageGroup.length).fill(0);
		var femaleData = new Array(ageGroup.length).fill(0);
						
		// use an object as hash table and check against the duplicate accountID
		var hash = Object.create(null),
		res = [];
		// to remove duplicate accountID
		for (i = 0; i < arr.length; i++) {
			if (!hash[arr[i].accountID]) {
				hash[arr[i].accountID] = true;
				res.push(arr[i]);
			}
		}

		// sort by age group followed by gender
		for(var i = 0; i < res.length; i++){
			// get index position in ageGroup
			var age = res[i].age;
			ageIndex = Math.floor(age / 10);
			// age sorted in reverse order so need to minus
			ageIndex = 8 - ageIndex;
							
			// populate gender data accordingly
			if (gender(res[i]) == "male") maleData[ageIndex]++;
			else femaleData[ageIndex]++;
		}
						
		// set all female data positive value to negative to plot the bar towards left
		for(var i = 0; i < femaleData.length; i++){
			femaleData[i] = -Math.abs(femaleData[i]);
		}
						
		var ctx = document.getElementById(chartDOM).getContext("2d");
						
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
				data: maleData, 
				backgroundColor: '#fff',
				borderColor: '#2196F3',
				borderWidth: 1.5,
				hoverBackgroundColor: '#2196F3'
			},
			{
				label: 'Female',
				data: femaleData,
				backgroundColor: '#fff',
				borderColor: '#E91E63',
				borderWidth: 1.5,
				hoverBackgroundColor: '#E91E63'
			}] 
			}, 
			options: options
		};
				
		if(chartDOM == 'dpAgeGenderChart'){
			if (dpAgeGenderChart) dpAgeGenderChart.destroy();
			dpAgeGenderChart = new Chart(ctx, opt);
								
			dpAgeGenderChart.update();	
		}else {
			if (dpAgeGenderChart1) dpAgeGenderChart1.destroy();
			dpAgeGenderChart1 = new Chart(ctx, opt);
								
			dpAgeGenderChart1.update();	
		}
}

// function to plot average purchasing power and frequency of purchase based on selected brand
var avgPowerChart, avgPowerChart1;
function plotPurchasingPower(arr, chartDOM, gradient){

	document.getElementById(chartDOM).style.display = 'block';
	
	var ageGroup = ['>=80', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
	var ageIndex;
	var amountData = new Array(ageGroup.length).fill(0);
	var priceData = new Array(ageGroup.length).fill(0);
	var datasetarr = [],
		frequentarr = [],
		frequentdataset = [];
		
	// clone from original array to prevent mutation
	frequentarr = arr.slice(0);
	
	// check if the date is greater than stored. If not, take the actual date.
	var datearr = new Array(ageGroup.length).fill(0);
	frequentarr.forEach(function (o) {
		var ageIndex = Math.floor(o.age / 10);
		ageIndex = 8 - ageIndex;

		if (datearr[ageIndex] >= o.date) {
			return;
		}
		datearr[ageIndex] = o.date;
	});
	
	// loop through largest date of each age group and compare with today date
	for(var i = 0; i < datearr.length; i++){
		var date1 = new Date(datearr[i]);
		var date2 = new Date();
		var daydiff = 0;
		
		if(datearr[i] != 0){
			var timediff = Math.abs(date2.getTime() - date1.getTime());
			daydiff = Math.ceil(timediff / (1000 * 3600 * 24)); 
		}	
		frequentdataset.push(daydiff);
	}
		
	var res = arr.reduce(function(items, item) {
		var existing = items.find(function(i) {
			return i.accountID === item.accountID;
		});

		if (existing) {
			existing.total += item.total;
		} else {
			items.push({...item}); // shallow copy to avoid mutating to the original arr
		}
		return items;
	}, []);
	
	// sort by age group followed by gender
	for(var i = 0; i < res.length; i++){
		// get index position in ageGroup
		var age = res[i].age;
		ageIndex = Math.floor(age / 10);
		// age sorted in reverse order so need to minus
		ageIndex = 8 - ageIndex;
		
		amountData[ageIndex]++;
		priceData[ageIndex] += res[i].total;
	}
	
	for(var i = 0; i < amountData.length; i++){
		for(var j = 0; j < priceData.length; j++){
			if(i == j){
				var avg = 0;
				if(priceData[j] != 0 || amountData[i] != 0){
					avg = priceData[j] / amountData[i];
				}
				datasetarr.push(avg);
			}
		}
	}
	
	var ctx = document.getElementById(chartDOM).getContext("2d");
						
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
				gridLines: {
					display: false
				} 
			}],
			xAxes: [{ 
				ticks: {
					fontSize: 11,
					callback : function (value) { return numberWithCommas(value); }
				},
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
						return datasetLabel + ': $ ' + numberWithCommas(xLabel.toFixed(2));
					}
				}
			}, 
			};
						
		var opt = {
			type: "horizontalBar",
			data: { 
			labels: ageGroup, 
			datasets: [{ 
				label: 'Average Revenue ',
				data: datasetarr, 
				backgroundColor: '#fff',
				borderColor: gradient,
				borderWidth: 1.5,
				hoverBackgroundColor: gradient
			}] 
			}, 
			options: options
		};
				
		if(chartDOM == 'avgPowerChart'){
			if (avgPowerChart) avgPowerChart.destroy();
			avgPowerChart = new Chart(ctx, opt);
								
			avgPowerChart.update();	
			
			$('#frequencyTable tr').slice(1).remove();
			document.getElementById('frequencyTableWrap').style.display = 'block';
			var table = document.getElementById("frequencyTable");
		
			var counter = 0;
			// insert data
			frequentdataset.forEach(function (item) {
				var row = table.insertRow();
				if(item == 0){ // dark red
					row.style.color = "#B40404";
					addFrequencyCell(row, '<b>Age ' + ageGroup[counter] + '</b>: No purchase');
				}else{
					if(item >= 100){ // yellow
						row.style.color = "#f1c40f";
					}
					else{ // dark green
						row.style.color = "#088A08";
					}
					addFrequencyCell(row, '<b>Age ' + ageGroup[counter] + '</b>: ' + item + ' days ago');
				}
				counter++;
			});

			
		}else {
			if (avgPowerChart1) avgPowerChart1.destroy();
			avgPowerChart1 = new Chart(ctx, opt);
								
			avgPowerChart1.update();
			
			$('#frequencyTable1 tr').slice(1).remove();
			document.getElementById('frequencyTableWrap1').style.display = 'block';
			var table = document.getElementById("frequencyTable1");
		
			var counter = 0;
			// insert data
			frequentdataset.forEach(function (item) {
				var row = table.insertRow();
				if(item == 0){ // dark red
					row.style.color = "#B40404";
					addFrequencyCell(row, '<b>Age ' + ageGroup[counter] + '</b>: No purchase');
				}else{
					if(item >= 100){ // yellow
						row.style.color = "#f1c40f";
					}
					else{ // dark green
						row.style.color = "#088A08";
					}
					addFrequencyCell(row, '<b>Age ' + ageGroup[counter] + '</b>: ' + item + ' days ago');
				}
				counter++;
			});

		}
}

// helper function to create table dynamically      
function addFrequencyCell(tr, text) {
	var td = tr.insertCell();
	td.innerHTML = text;
	return td;
}

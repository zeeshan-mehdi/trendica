// function to reset the heatmap and merchant branch dropdowns
function refreshBranchTab() {
    // refresh subtype and brand dropdown
    var merchantdropdown = document.getElementById("ddlmerchant");
    merchantdropdown.options.length = 1;
    // set selected default to hint message
    merchantdropdown.selectedIndex = 0;

    var branchdropdown = document.getElementById("ddlbranch");
    branchdropdown.options.length = 1;
    // set selected default to hint message
    branchdropdown.selectedIndex = 0;

    var merchantdropdown1 = document.getElementById("ddlmerchant1");
    merchantdropdown1.options.length = 1;
    // set selected default to hint message
    merchantdropdown1.selectedIndex = 0;

    var branchdropdown1 = document.getElementById("ddlbranch1");
    branchdropdown1.options.length = 1;
    // set selected default to hint message
    branchdropdown1.selectedIndex = 0;

    //clear markers on map upon reselect subtype
    for (var i = 0; i < g_markers.length; i++) {
        g_markers[i].markerObj.setMap(null);
    }
    g_markers.length = 0;
    // clear previous heat map layer upon reselect subtype
    deleteHeatmap();
    refreshBranchTabLowerPart();
}

// function to reset the components for branch comparison part upon reselect merchant/branch
function refreshBranchTabLowerPart() {
    document.getElementById("txtBranchTimelineWarning").style.display = "block";
    document.getElementById("txtBranchTimelineWarning1").style.display = "block";
    document.getElementById("txtBranchTimelineWarning2").style.display = "block";
    document.getElementById("txtBranchAgeGenderWarning").style.display = "block";
    document.getElementById("txtBranchAgeGenderWarning1").style.display = "block";
    document.getElementById("txtBranchPowerWarning").style.display = "block";
    document.getElementById("txtBranchPowerWarning1").style.display = "block";
    document.getElementById("txtTopProductBranchWarning").style.display = "block";
    document.getElementById("txtTopProductBranchWarning1").style.display = "block";
    document.getElementById("txtWorseProductBranchWarning").style.display = "block";
    document.getElementById("txtWorseProductBranchWarning1").style.display = "block";
    document.getElementById("txtTopBrandByBranchWarning").style.display = "block";
    document.getElementById("txtTopBrandByBranchWarning1").style.display = "block";

    document.getElementById("branch1TimelineText").innerHTML = '';
    document.getElementById("branch2TimelineText").innerHTML = '';
    document.getElementById("branchAgeGenderText").innerHTML = '';
    document.getElementById("branchAgeGenderText1").innerHTML = '';
    document.getElementById("powerBranchText").innerHTML = '';
    document.getElementById("powerBranchText1").innerHTML = '';
    document.getElementById("productBranchTopText").innerHTML = '';
    document.getElementById("productBranchTopText1").innerHTML = '';
    document.getElementById("productBranchWorseText").innerHTML = '';
    document.getElementById("productBranchWorseText1").innerHTML = '';
    document.getElementById("topBrandTextByBranch").innerHTML = '';
    document.getElementById("topBrandTextByBranch1").innerHTML = '';

    document.getElementById("branchTimelineChart").style.display = "none";
    document.getElementById("branchTimelineChart1").style.display = "none";
    document.getElementById("branchTimelineChart2").style.display = "none";
    document.getElementById("branchAgeGenderChart").style.display = "none";
    document.getElementById("branchAgeGenderChart1").style.display = "none";
    document.getElementById("powerBranchChart").style.display = "none";
    document.getElementById("powerBranchChart1").style.display = "none";
    document.getElementById("topProductBranchChart").style.display = "none";
    document.getElementById("topProductBranchChart1").style.display = "none";
    document.getElementById("worseProductBranchChart").style.display = "none";
    document.getElementById("worseProductBranchChart1").style.display = "none";
    document.getElementById("topBrandByBranchChart").style.display = "none";
    document.getElementById("topBrandByBranchChart1").style.display = "none";
    document.getElementById("topBrandByBranchLegend").style.display = "none";
    document.getElementById("topBrandByBranchLegend1").style.display = "none";
}

// function to populate subtype dropdown for second tab
function populateCompanyTypeDropdown() {

    document.body.classList.add("loading");
    var catdropdown = document.getElementById("ddlCompanyCategory");
    var category = catdropdown.options[catdropdown.selectedIndex].value;
    category = category.toLowerCase();

    // reset subtype dropdown upon reselect category
    var typedropdown = document.getElementById("ddlSubtype");
    typedropdown.options.length = 1;
    // set selected default to hint message
    typedropdown.selectedIndex = 0;

    // show warning message and hide charts
    document.getElementById("txtMerchantWarning").style.display = "block";
    document.getElementById("txtMerchantBranchWarning").style.display = "block";
    document.getElementById("txtBranchWarning").style.display = "block";

    document.getElementById("branchChart").style.visibility = "hidden";
    document.getElementById("merchantChart").style.display = "none";
    document.getElementById("merchantBranchChart").style.display = "none";
    document.getElementById("merchantLegend").style.display = "none";
    document.getElementById("merchantBranchLegend").style.display = "none";

    // upon reselect subtype, refresh merchant and branches dropdown
    refreshBranchTab();

    var ritemlist = [];
    var datasetarr = [];
    // get all receipt item ID which under selected category rather than all receipt item ID
    getAllReceiptItemIDByCategory(category).then((ritemIDlist) => {
        // get all related receipt item details
        let promiseKey = new Promise((resolve, reject) => {
            // loop through the IDs and get its detail
            for (var i = 0; i < ritemIDlist.length; i++) {
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
                    for (var j = 0; j < ritemlist.length; j++) {
                        for (var k = 0; k < receiptlist.length; k++) {
                            if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                datasetarr.push({ type: ritemlist[j].type, quantity: ritemlist[j].quantity });
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

                    for (var i = 0; i < result.length; i++) {
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

// function to plot top 10 branches based on selected subtype
var branchChart;

function plotBranchChart() {


    document.body.classList.add("loading");
    // get selected category
    var catdropdown = document.getElementById("ddlCompanyCategory");
    var category = catdropdown.options[catdropdown.selectedIndex].value;
    category = category.toLowerCase();

    // get selected subtype
    var dropdown = document.getElementById("ddlSubtype");
    var subtype = dropdown.options[dropdown.selectedIndex].value;
    subtype = subtype.toLowerCase();

    // hide warning message
    document.getElementById("txtMerchantWarning").style.display = "none";
    document.getElementById("txtMerchantBranchWarning").style.display = "none";
    document.getElementById("txtBranchWarning").style.display = "none";

    // upon reselect subtype, refresh merchant and branches dropdown
    refreshBranchTab();

    // use timeout to delay and cover the refreshment of the chart
    setTimeout(function() {
        document.getElementById("branchChart").style.visibility = "visible";
        document.getElementById("merchantChart").style.display = "block";
        document.getElementById("merchantBranchChart").style.display = "block";
        document.getElementById("merchantLegend").style.display = "block";
        document.getElementById("merchantBranchLegend").style.display = "block";
    }, 700);

    var ritemlist = [];
    var datasetarr = [];
    // get all receipt item ID which under selected category rather than all receipt item ID
    getAllReceiptItemIDByCategory(category).then((ritemIDlist) => {
        // get all related receipt item details
        let promiseKey = new Promise((resolve, reject) => {
            // loop through the IDs and get its detail
            for (var i = 0; i < ritemIDlist.length; i++) {
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
                    // nested for loop to find matching receipt item ID
                    for (var j = 0; j < ritemlist.length; j++) {
                        // check if receipt item type is same as the selected subtype
                        if (ritemlist[j].type == subtype) {
                            for (var k = 0; k < receiptlist.length; k++) {
                                if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                    // check if receipt date is within current year before push data to datasetarr
                                    //if(receiptlist[k].date.substring(0, 4) == getCurrentYear() ){
                                    datasetarr.push({ merchantName: receiptlist[k].merchantName, branchName: receiptlist[k].branchName, branchAddress: receiptlist[k].branchAddress, total: ritemlist[j].total });
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
                    var mapData = [];
                    var topBranch;
                    var topBranchList = [];

                    // use reduce to sort
                    var result = arr.reduce(function(items, item) {
                        var existing = items.find(function(i) {
                            return i.branchName === item.branchName;
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

                    populateMerchantDropdown(result);

                    var formattedBranchName;
                    // find maximum value
                    Array.prototype.hasMax = function(attrib) {
                        return this.reduce(function(prev, curr) {
                            return prev[attrib] > curr[attrib] ? prev : curr;
                        });
                    }

                    // limit counter to 10. if data less than 10 records, set the value to maximum
                    var topCounter = result.length;
                    if (topCounter >= 10) {
                        topCounter = 10;
                    }
                    document.getElementById('branchTopCounter').textContent = topCounter;

                    // loop to find top branches with highest profit
                    for (var i = 0; i < topCounter; i++) {
                        // sort by finding max total
                        topBranch = result.hasMax('total');
                        // push object with max total to a new array before popping it off
                        topBranchList.push(topBranch);
                        var index = result.indexOf(topBranch);
                        if (index != -1) result.splice(index, 1);
                    }

                    for (var i = 0; i < topBranchList.length; i++) {
                        // format branchName to check if merchantName exists in branchName
                        if (topBranchList[i].branchName.indexOf(topBranchList[i].merchantName) + 1)
                            formattedBranchName = topBranchList[i].branchName;
                        else
                            formattedBranchName = topBranchList[i].merchantName + ' ' + topBranchList[i].branchName;

                        labelData.push(formattedBranchName);
                        priceData.push(topBranchList[i].total);

                        // formulate data to be shown on the map
                        mapData.push({ branchName: formattedBranchName, branchAddress: topBranchList[i].branchAddress, total: topBranchList[i].total });
                    }

                    // show branch sales data on map
                    sortHeatmapData(mapData);
                    // show sales distribution by merchants
                    plotMerchantChart(result);

                    var ctx = document.getElementById('branchChart').getContext("2d");
                    var gradient = ctx.createLinearGradient(0, 0, 0, 240);
                    gradient.addColorStop(0, '#FF9800');
                    gradient.addColorStop(1, '#9C27B0');

                    var options = {
                        layout: {
                            padding: {
                                top: 5,
                            }
                        },
                        scales: {
                            yAxes: [{
                                display: true,
                                barPercentage: 0.4, // set bar thickness
                                ticks: {
                                    fontSize: 8 // set y-axis label size
                                },
                                gridLines: {
                                    display: false
                                }
                            }],
                            xAxes: [{
                                ticks: {
                                    fontSize: 11,
                                    callback: function(value) { return numberWithCommas(value); }
                                },
                            }]
                        },
                        responsive: true,
                        maintainAspectRatio: false,
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
                                    for (var i in allData) {
                                        total += allData[i];
                                    }
                                    var tooltipPercentage = Math.round((tooltipData / total) * 100);
                                    return 'Total Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
                                }
                            }
                        }
                    };

                    var opt = {
                        type: "horizontalBar",
                        data: {
                            labels: labelData,
                            datasets: [{
                                data: priceData,
                                backgroundColor: "rgba(220,220,220,0)",
                                borderColor: gradient,
                                borderWidth: 1.5,
                                hoverBackgroundColor: gradient,
                            }]
                        },
                        options: options
                    };
                    //document.body.classList.remove("loading");
                    if (branchChart) branchChart.destroy();
                    branchChart = new Chart(ctx, opt);

                    branchChart.update();
                });
            });
        });
    });
}

// function to plot top 10 merchants based on selected subtype
var merchantChart;

function plotMerchantChart(arr) {
    // use reduce to sort
    var result = arr.reduce(function(items, item) {
        var existing = items.find(function(i) {
            return i.merchantName === item.merchantName;
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

    var topMerchant;
    var topMerchantList = [];
    // find maximum value
    Array.prototype.hasMax = function(attrib) {
        return this.reduce(function(prev, curr) {
            return prev[attrib] > curr[attrib] ? prev : curr;
        });
    }

    // limit counter to 10. if data is less than 10 records, set the value to maximum
    var topCounter = result.length;
    if (topCounter >= 10) {
        topCounter = 10;
    }
    document.getElementById('merchantTopCounter').textContent = topCounter + ' ';

    // loop to find top merchants with highest profit
    for (var i = 0; i < topCounter; i++) {
        // sort by finding max total
        topMerchant = result.hasMax('total');
        // push object with max total to a new array before popping it off
        topMerchantList.push(topMerchant);
        var index = result.indexOf(topMerchant);
        if (index != -1) result.splice(index, 1);
    }

    var labelData = [];
    var priceData = [];
    //var colorArr = ["#4CAF50","#2196F3","#FFEB3B","#9C27B0","#E91E63","#FF9800","#616161","#5D4037",];
    var colorArr = ['#e91e63', '#d35085', '#b66ca9', '#8b82cd', '#2196f3', '#ff9800', '#dca121', '#b4a834', '#8aac42', '#4caf50'];

    for (var i = 0; i < topMerchantList.length; i++) {
        // randomized color
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
        c = 'rgb(' + r + ', ' + g + ', ' + b + ')';

        labelData.push(topMerchantList[i].merchantName);
        priceData.push(topMerchantList[i].total);
        colorArr.push(c);
    }

    // plot the number of branches for the top 10 merchants
    plotMerchantBranchChart(topMerchantList, colorArr);

    var ctx = document.getElementById('merchantChart').getContext("2d");

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
                    for (var i = 0; i < allData.length; i++) {
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

    if (merchantChart) merchantChart.destroy();
    merchantChart = new Chart(ctx, opt);

    merchantChart.update();
    merchantLegend.innerHTML = merchantChart.generateLegend();
}

// function to plot total number of branches for the top 10 merchants
var merchantBranchChart;

function plotMerchantBranchChart(topMerchantList, colorArr) {
    var labelData = [];
    var amountData = [];

    // get all merchants
    getAllMerchant().then((merchantlist) => {
        for (var j = 0; j < topMerchantList.length; j++) {
            var counter = 0;
            var merchantName = topMerchantList[j].merchantName;

            for (var i = 0; i < merchantlist.length; i++) {
                // if equal name as the top merchant list, increment counter
                if (merchantName == merchantlist[i].merchantName) {
                    counter++;
                }
            }

            labelData.push(merchantName);
            amountData.push(counter);
        }

        var ctx = document.getElementById('merchantBranchChart').getContext("2d");
        var gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, '#E91E63');
        gradient.addColorStop(1, '#2196F3');

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
                        for (var i = 0; i < allData.length; i++) {
                            total += allData[i];
                        }
                        var tooltipPercentage = Math.round((tooltipData / total) * 100);
                        return tooltipLabel + ': ' + tooltipData + ' branches (' + tooltipPercentage + '%)';
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

        if (merchantBranchChart) merchantBranchChart.destroy();
        merchantBranchChart = new Chart(ctx, opt);

        merchantBranchChart.update();
        merchantBranchLegend.innerHTML = merchantBranchChart.generateLegend();
    });
}

var map, forecastmap;
var geocoder;
var infoWindow;
var g_markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 1.352083, lng: 103.81983600000001 },
        zoom: 11
    });

    forecastmap = new google.maps.Map(document.getElementById('forecastmap'), {
        center: { lat: 1.352083, lng: 103.81983600000001 },
        zoom: 11
    });

    forecastmap.addListener('click', function(e) {
        createBuffer(e.latLng, forecastmap);
    });

    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();
}

function sortHeatmapData(mapData) {
    let promiseKey = Promise.all(
        // pass an array of promises to promise.all, which resolves to an array of results
        // allow racing for faster performance (all promises starting at once, then continue if all finished)
        mapData.map(el => getLatLng(el.branchAddress, el.branchName, el.total))
    );

    var addedMarkers = promiseKey.then(
            markers => Promise.all(
                // plot the marker one by one
                markers.map(marker => addMarker(marker))
            )
        )
        // once finish plotting all markers, pass drawHeatmap as argument to .then() to draw heat map
        .then(drawHeatmap);
}

function getLatLng(address, branchName, total) {
    return new Promise(function(resolve) {
        // use geocode to get latitude and longitude based on address
        setTimeout(geocoder.geocode({ 'address': address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                // format marker item and return as object
                var markerItem = {
                    'lat': latitude,
                    'lng': longitude,
                    'address': address,
                    'branchName': branchName,
                    'total': total,
                };
                resolve(markerItem);

            } else {
                //alert('Geocode was not successful for the following reason: ' + status);
                // hardcode value if geocode resulting in error
                var markerItem = {
                    'lat': 1.434889,
                    'lng': 103.836926,
                    'address': address,
                    'branchName': branchName,
                    'total': total,
                };
                resolve(markerItem);
            }
        }), 250);
    });
}

var heatmap;
var heatmapData = [];
var heatmapLayer = [];
var gradient = ['rgba(185, 185, 203, 0)', 'rgba(145, 145, 192, 0)',
    'rgba(65, 65, 207, 0)', 'rgba(30, 30, 229, 1)',
    'rgba(0, 185, 255, 1)', 'rgba(0, 255, 215, 1)',
    'rgba(0, 255, 15, 1)', 'rgba(0, 255, 0, 1)',
    'rgba(255, 255, 0, 1)', 'rgba(255, 235, 0, 1)',
    'rgba(255, 0, 0, 1)'
];

function addMarker(marker) {
    //console.log(marker['lat'] + marker['lng'] + marker['branchName'] + marker['address'] + marker['total']);

    var newMarker = new google.maps.Marker({
        position: new google.maps.LatLng(marker['lat'], marker['lng']),
        icon: 'dist/img/marker.png',
        animation: google.maps.Animation.DROP,
        map: map
    });

    g_markers.push({ markerObj: newMarker });

    content = '<h5><b>' + marker['branchName'] + '</b></h5><br/>' +
        '<b>Address: </b>' + marker['address'] + '<br/>' +
        '<b>Total Revenue:</b> $ ' + numberWithCommas(marker['total'].toFixed(2)) + '<br/>';

    google.maps.event.addListener(newMarker, 'click', (function(newMarker, content, infowindow) {
        return function() {
            infowindow.setContent(content);
            infowindow.open(map, newMarker);
        };
    })(newMarker, content, infowindow));

    // add the marker one by one into global heatmap array
    heatmapData.push({ location: new google.maps.LatLng(marker['lat'], marker['lng']), weight: marker['total'].toFixed(2) });
}

function drawHeatmap() {
    var pointArray = new google.maps.MVCArray(heatmapData);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray,
        gradient: gradient,
        map: map,
        radius: 40,
        dissipating: true,
    });
    // push layer of heat map into array to ease the clearing of layers
    heatmapLayer.push(heatmap);
    heatmap.setMap(map);
}

function deleteHeatmap() {
    // reset to default zoom level
    map.setZoom(11);
    map.panTo(new google.maps.LatLng(1.352083, 103.819836));

    for (var k = 0; k < heatmapLayer.length; k++) {
        heatmapLayer[k].setMap(null);
    }
    // clear all heat map layers
    heatmapLayer = [];
    // clear all heat map data
    heatmapData = [];
}

function toggleMarkers() {
    var checkbox = document.getElementById('cbToggleMarker');
    if (checkbox.checked == true) {
        for (var i = 0; i < g_markers.length; i++) {
            g_markers[i].markerObj.setVisible(true);
        }
    } else {
        for (var i = 0; i < g_markers.length; i++) {
            g_markers[i].markerObj.setVisible(false);
        }
    }
}

// function to populate merchant dropdown for branch comparison analysis
function populateMerchantDropdown(arr) {
    var dropdown = document.getElementById("ddlmerchant");
    var dropdown1 = document.getElementById("ddlmerchant1");

    // use reduce to remove duplicate merchantName
    var result = arr.reduce(function(items, item) {
        var existing = items.find(function(i) {
            return i.merchantName === item.merchantName;
        });

        if (existing) {} else {
            // if not exist add new entry
            items.push(item);
        }
        return items;
    }, []);

    // sort merchant to be displayed in dropdown alphabetically
    result.sort((a, b) => a.merchantName !== b.merchantName ? a.merchantName < b.merchantName ? -1 : 1 : 0);

    for (var i = 0; i < result.length; i++) {
        var option = document.createElement("option");
        option.text = result[i].merchantName;
        dropdown.add(option);

        var option1 = document.createElement("option");
        option1.text = result[i].merchantName;
        dropdown1.add(option1);
    }
}

// function to populate left hand side branch dropdown upon reselected merchant
function populateBranchDropdown() {

    document.body.classList.add("loading");
    // reset branch drop down and charts upon reselect merchant
    var branchdropdown = document.getElementById("ddlbranch");
    branchdropdown.options.length = 1;
    // set selected default to hint message
    branchdropdown.selectedIndex = 0;

    // reset components
    refreshBranchTabLowerPart();

    var dropdown = document.getElementById("ddlmerchant");
    var merchant = dropdown.options[dropdown.selectedIndex].value;

    var branchdropdown = document.getElementById("ddlbranch");

    getAllMerchant().then((merchantlist) => {
        // sort branch to be displayed in dropdown alphabetically
        merchantlist.sort((a, b) => a.branchName !== b.branchName ? a.branchName < b.branchName ? -1 : 1 : 0);
        for (var i = 0; i < merchantlist.length; i++) {
            if (merchant == merchantlist[i].merchantName) {
                var option = document.createElement("option");
                option.text = merchantlist[i].branchName;
                branchdropdown.add(option);
            }
        }
        document.body.classList.remove("loading");
    });
}

// function to populate right hand side branch dropdown upon reselected merchant
function populateBranchDropdown1() {
    document.body.classList.add("loading");
    // reset branch drop down and charts upon reselect merchant
    var branchdropdown1 = document.getElementById("ddlbranch1");
    branchdropdown1.options.length = 1;
    // set selected default to hint message
    branchdropdown1.selectedIndex = 0;

    // reset components
    refreshBranchTabLowerPart();

    var dropdown = document.getElementById("ddlmerchant1");
    var merchant = dropdown.options[dropdown.selectedIndex].value;

    var branchdropdown = document.getElementById("ddlbranch1");

    getAllMerchant().then((merchantlist) => {
        // sort branch to be displayed in dropdown alphabetically
        merchantlist.sort((a, b) => a.branchName !== b.branchName ? a.branchName < b.branchName ? -1 : 1 : 0);
        for (var i = 0; i < merchantlist.length; i++) {
            if (merchant == merchantlist[i].merchantName) {
                var option = document.createElement("option");
                option.text = merchantlist[i].branchName;
                branchdropdown.add(option);
            }
        }
        document.body.classList.remove("loading");
    });
}

// function to plot branches comparison timeline group by month
var branchTimelineChart;

function plotBranchTimelineChart() {


    var catdropdown = document.getElementById("ddlCompanyCategory");
    var category = catdropdown.options[catdropdown.selectedIndex].value;
    category = category.toLowerCase();

    var dropdown = document.getElementById("ddlSubtype");
    var subtype = dropdown.options[dropdown.selectedIndex].value;
    subtype = subtype.toLowerCase();

    // get selected merchant from both drop down
    var merchantdropdown = document.getElementById("ddlmerchant");
    var merchant1 = merchantdropdown.options[merchantdropdown.selectedIndex].value;

    var merchantdropdown1 = document.getElementById("ddlmerchant1");
    var merchant2 = merchantdropdown1.options[merchantdropdown1.selectedIndex].value;

    // get selected branch from both drop down
    var dropdown1 = document.getElementById("ddlbranch");
    var branch1 = dropdown1.options[dropdown1.selectedIndex].value;

    var dropdown2 = document.getElementById("ddlbranch1");
    var branch2 = dropdown2.options[dropdown2.selectedIndex].value;

    // arrays for multiple series line chart
    var datasetarr = [];
    var datasetarr2 = [];

    // only populate when both dropdown selected a brand
    if (branch1 != '' && branch2 != '') {

        document.body.classList.add("loading");
        // hide warning message & show the chart canvas
        document.getElementById("txtBranchTimelineWarning").style.display = "none";
        document.getElementById("txtBranchTimelineWarning1").style.display = "none";
        document.getElementById("txtBranchTimelineWarning2").style.display = "none";
        document.getElementById("txtBranchAgeGenderWarning").style.display = "none";
        document.getElementById("txtBranchAgeGenderWarning1").style.display = "none";
        document.getElementById("txtBranchPowerWarning").style.display = "none";
        document.getElementById("txtBranchPowerWarning1").style.display = "none";
        document.getElementById("txtTopProductBranchWarning").style.display = "none";
        document.getElementById("txtTopProductBranchWarning1").style.display = "none";
        document.getElementById("txtWorseProductBranchWarning").style.display = "none";
        document.getElementById("txtWorseProductBranchWarning1").style.display = "none";
        document.getElementById("txtTopBrandByBranchWarning").style.display = "none";
        document.getElementById("txtTopBrandByBranchWarning1").style.display = "none";

        setTimeout(function() {
            document.getElementById("branchTimelineChart").style.display = "block";
        }, 700);

        var ritemlist = [];
        var datasetarr = [];
        var datasetarr1 = [];
        var datasetarr2 = [];

        // get all receipt item ID which under selected category and brand rather than all receipt item ID
        getAllReceiptItemIDByCategory(category).then((ritemIDlist) => {
            // get all related receipt item details
            let promiseKey = new Promise((resolve, reject) => {
                // loop through the IDs and get its detail
                for (var i = 0; i < ritemIDlist.length; i++) {
                    getReceiptItemByID(ritemIDlist[i].receiptItemID).then((ritem) => {
                        ritemlist.push(ritem);
                    });
                }
                resolve(ritemlist);
            });

            promiseKey.then((ritemlist) => {
                // get receipt, account and item details
                getAllReceipts().then((receiptlist) => {
                    getAllAccounts().then((accountlist) => {
                        getAllItems().then((itemlist) => {
                            // loop through receipt items to get receipt details
                            let promiseKey = new Promise((resolve, reject) => {
                                // get list of receipt items details
                                for (var i = 0; i < ritemlist.length; i++) {
                                    // if matching with selected subtype
                                    if (ritemlist[i].type == subtype) {
                                        for (var j = 0; j < receiptlist.length; j++) {
                                            // check if matching receipt ID to get receipt date
                                            if (ritemlist[i].receiptID == receiptlist[j].receiptID) {
                                                //if (receiptlist[j].date.substring(0, 4) == getCurrentYear()) {
                                                for (var h = 0; h < accountlist.length; h++) {
                                                    // check if matching account ID to get account details
                                                    if (receiptlist[j].accountID == accountlist[h].accountID) {
                                                        for (var m = 0; m < itemlist.length; m++) {
                                                            // if matching item ID with receipt item details, push to datasetarr
                                                            if (ritemlist[i].itemID == itemlist[m].itemID) {
                                                                datasetarr.push({
                                                                    accountID: accountlist[h].accountID,
                                                                    age: accountlist[h].age,
                                                                    gender: accountlist[h].gender,
                                                                    brand: ritemlist[i].brand,
                                                                    date: receiptlist[j].date,
                                                                    total: ritemlist[i].total,
                                                                    itemName: itemlist[m].name,
                                                                    quantity: ritemlist[i].quantity,
                                                                    price: ritemlist[i].price,
                                                                    merchantName: receiptlist[j].merchantName,
                                                                    branchName: receiptlist[j].branchName
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                                                //}
                                            }
                                        }
                                    }
                                }
                                resolve(datasetarr);
                            });

                            promiseKey.then((arr) => {
                                // separate data for different branch into different array
                                for (var i = 0; i < arr.length; i++) {
                                    if (arr[i].branchName == branch1) {
                                        datasetarr1.push(arr[i]);
                                    } else if (arr[i].branchName == branch2) {
                                        datasetarr2.push(arr[i]);
                                    }
                                }

                                var ctx = document.getElementById('branchTimelineChart').getContext("2d");

                                var gradient1 = ctx.createLinearGradient(0, 0, 0, 150);
                                gradient1.addColorStop(0, '#E91E63');
                                gradient1.addColorStop(1, '#2196F3');

                                var gradient2 = ctx.createLinearGradient(0, 0, 0, 150);
                                gradient2.addColorStop(0, '#FF9800');
                                gradient2.addColorStop(1, '#4CAF50');

                                // format branch together with its merchant for chart title
                                var formattedBranch1 = ((branch1.indexOf(merchant1) + 1) ? formattedBranch1 = branch1 : formattedBranch1 = merchant1 + ' - ' + branch1);
                                var formattedBranch2 = ((branch2.indexOf(merchant2) + 1) ? formattedBranch2 = branch2 : formattedBranch2 = merchant2 + ' - ' + branch2);

                                var temp1 = datasetarr1.slice(0);
                                var temp2 = datasetarr2.slice(0);
                                plotTopBrandsByBranch(temp1, 'topBrandByBranchChart', 'topBrandCounterByBranch', formattedBranch1);
                                plotTopBrandsByBranch(temp2, 'topBrandByBranchChart1', 'topBrandCounterByBranch1', formattedBranch2);

                                var temp3 = datasetarr1.slice(0);
                                var temp4 = datasetarr2.slice(0);
                                // plot the top products for selected branch
                                plotBranchTopProduct(temp3, formattedBranch1, 'topProductBranchChart', gradient1, 'productBranchTopCounter');
                                plotBranchTopProduct(temp4, formattedBranch2, 'topProductBranchChart1', gradient2, 'productBranchTopCounter1');

                                var temp5 = datasetarr1.slice(0);
                                var temp6 = datasetarr2.slice(0);
                                // plot the products with minimum revenue for selected branch
                                getWorseProductBranch(temp5, formattedBranch1, 'worseProductBranchChart', gradient1, 'productBranchWorseCounter');
                                getWorseProductBranch(temp6, formattedBranch2, 'worseProductBranchChart1', gradient2, 'productBranchWorseCounter1');

                                // plot the age and gender distribution by selected branch
                                plotBranchAgeGenderChart(datasetarr1, 'branchAgeGenderChart', formattedBranch1);
                                plotBranchAgeGenderChart(datasetarr2, 'branchAgeGenderChart1', formattedBranch2);

                                // plot the total revenue earn group by each age group based on selected branch
                                plotBranchPurchasingPower(datasetarr1, 'powerBranchChart', gradient1, formattedBranch1);
                                plotBranchPurchasingPower(datasetarr2, 'powerBranchChart1', gradient2, formattedBranch2);

                                var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                                var monthIndex;
                                var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                var amountData2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                                // use reduce to sort & group by date for first branch
                                var result = datasetarr1.reduce(function(items, item) {
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

                                // loop through grouped date to group by month
                                result.forEach(obj => {
                                    var month = Number(obj.date.substr(5, 2));
                                    amountData[month - 1] += obj.total;
                                })

                                // use reduce to sort & group by date for second branch
                                var result2 = datasetarr2.reduce(function(items, item) {
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

                                // loop through grouped date to group by month
                                result2.forEach(obj => {
                                    var month = Number(obj.date.substr(5, 2));
                                    amountData2[month - 1] += obj.total;
                                })

                                // plot the in depth timeline detail of branch sales history
                                populateBranchTimeline(result, gradient1, formattedBranch1, "branchTimelineChart1");
                                populateBranchTimeline(result2, gradient2, formattedBranch2, "branchTimelineChart2");


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
                                                display: false
                                            }
                                        }],
                                        yAxes: [{
                                            ticks: {
                                                callback: function(value) { return numberWithCommas(value); }
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
                                                for (var i = 0; i < allData.length; i++) {
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
                                                label: branch1,
                                                data: amountData,
                                                fill: false,
                                                borderWidth: 1.5,
                                                pointHoverRadius: 5,
                                                pointBackgroundColor: gradient1,
                                                pointHoverBackgroundColor: gradient1,
                                                borderColor: gradient1
                                            },
                                            {
                                                label: branch2,
                                                data: amountData2,
                                                fill: false,
                                                borderWidth: 1.5,
                                                pointHoverRadius: 5,
                                                pointBackgroundColor: gradient2,
                                                pointHoverBackgroundColor: gradient2,
                                                borderColor: gradient2
                                            }
                                        ]
                                    },
                                    options: options
                                };
                                document.body.classList.remove("loading");
                                if (branchTimelineChart) branchTimelineChart.destroy();
                                branchTimelineChart = new Chart(ctx, opt);

                                branchTimelineChart.update();
                            });
                        });
                    });
                });
            });
        });
    }
}

// function to plot the branch sales history in detailed timeline
var dpBranchTimeline1;
var dpBranchTimeline2;

function populateBranchTimeline(arr, gradient, branch, chartDOM) {
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
    for (var i = 0; i < result.length; i++) {
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
                    display: false
                },
                ticks: {
                    fontSize: 11
                },
                display: false
            }],
            yAxes: [{
                ticks: {
                    fontSize: 11,
                    callback: function(value) { return numberWithCommas(value); }
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
                    for (var i = 0; i < allData.length; i++) {
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
                label: branch,
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

    if (chartDOM == 'branchTimelineChart1') {
        if (dpBranchTimeline1) dpBranchTimeline1.destroy();
        dpBranchTimeline1 = new Chart(ctx, opt);

        dpBranchTimeline1.update();
        document.getElementById("branch1TimelineText").innerHTML = branch;
    } else {
        if (dpBranchTimeline2) dpBranchTimeline2.destroy();
        dpBranchTimeline2 = new Chart(ctx, opt);

        dpBranchTimeline2.update();
        document.getElementById("branch2TimelineText").innerHTML = branch;
    }
}

// function to plot top brands based on selected branch
var topBrandByBranchChart;
var topBrandByBranchChart1;

function plotTopBrandsByBranch(arr, chartDOM, topCounterDOM, branch) {
    document.getElementById(chartDOM).style.display = 'block';
    document.getElementById("topBrandByBranchLegend").style.display = "block";
    document.getElementById("topBrandByBranchLegend1").style.display = "block";

    var topBrandList = [];
    var topBrand;
    var labelData = [];
    var amountData = [];
    var colorArr = [];

    // set the gradient color
    if (chartDOM == 'topBrandByBranchChart') {
        colorArr = ['#e91e63', '#d35085', '#b66ca9', '#8b82cd', '#2196f3'];
    } else {
        colorArr = ['#ff9800', '#dca121', '#b4a834', '#8aac42', '#4caf50'];
    }

    var labelData = [];
    var amountData = [];

    // use reduce to sort & group by date for brand
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

    // use reduce to find max total
    Array.prototype.hasMax = function(attrib) {
        return this.reduce(function(prev, curr) {
            return prev[attrib] > curr[attrib] ? prev : curr;
        });
    }

    var topCounter = result.length;
    if (topCounter >= 5) {
        topCounter = 5;
    }
    document.getElementById(topCounterDOM).textContent = topCounter;

    // loop to find top 5 brands with highest profit
    for (var i = 0; i < topCounter; i++) {
        // sort by finding max total
        topBrand = result.hasMax('total');
        // push object with max total to a new array before popping it off
        topBrandList.push(topBrand);
        var index = result.indexOf(topBrand);
        if (index != -1) result.splice(index, 1);
    }

    // populate arrays to be plotted to chart
    for (var i = 0; i < topBrandList.length; i++) {
        labelData.push(topBrandList[i].brand);
        amountData.push(topBrandList[i].total);
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
        // customer tooltip hover
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var allData = data.datasets[tooltipItem.datasetIndex].data;
                    var tooltipLabel = data.labels[tooltipItem.index];
                    var tooltipData = allData[tooltipItem.index];
                    var total = 0;
                    for (var i = 0; i < allData.length; i++) {
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

    if (chartDOM == 'topBrandByBranchChart') {
        if (topBrandByBranchChart) topBrandByBranchChart.destroy();
        topBrandByBranchChart = new Chart(ctx, opt);

        topBrandByBranchChart.update();
        document.getElementById("topBrandTextByBranch").innerHTML = branch;
        topBrandByBranchLegend.innerHTML = topBrandByBranchChart.generateLegend();
    } else {
        if (topBrandByBranchChart1) topBrandByBranchChart1.destroy();
        topBrandByBranchChart1 = new Chart(ctx, opt);

        topBrandByBranchChart1.update();
        document.getElementById("topBrandTextByBranch1").innerHTML = branch;
        topBrandByBranchLegend1.innerHTML = topBrandByBranchChart1.generateLegend();
    }
}

// function to plot the top products based on selected branch
var topProductBranchChart1;
var topProductBranchChart2;

function plotBranchTopProduct(arr, branch, chartDOM, gradient, topCounterDOM) {
    document.getElementById(chartDOM).style.display = 'block';

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
        return this.reduce(function(prev, curr) {
            return prev[attrib] > curr[attrib] ? prev : curr;
        });
    }

    var topCounter = result.length;
    if (topCounter >= 5) {
        topCounter = 5;
    }
    document.getElementById(topCounterDOM).textContent = topCounter;

    // loop to find top 5 products with highest total
    for (var i = 0; i < topCounter; i++) {
        // sort by finding max total
        topProduct = result.hasMax('total');
        // push object with max total to a new array before popping it off
        topProductList.push(topProduct);
        var index = result.indexOf(topProduct);
        if (index != -1) result.splice(index, 1);
    }

    for (var i = 0; i < topProductList.length; i++) {
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
                    display: false
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
                    callback: function(value) { return numberWithCommas(value); }
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
                    else if (t.datasetIndex === 0) {
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
            }, {
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

    if (chartDOM == 'topProductBranchChart') {
        if (topProductBranchChart1) topProductBranchChart1.destroy();
        topProductBranchChart1 = new Chart(ctx, opt);

        topProductBranchChart1.update();
        document.getElementById("productBranchTopText").innerHTML = branch;
    } else {
        if (topProductBranchChart2) topProductBranchChart2.destroy();
        topProductBranchChart2 = new Chart(ctx, opt);

        topProductBranchChart2.update();
        document.getElementById("productBranchTopText1").innerHTML = branch;
    }
}

// function to plot the products with worst selling based on selected branch
var worseProductBranchChart1;
var worseProductBranchChart2;

function getWorseProductBranch(result, brand, chartDOM, gradient, worseCounterDOM) {
    document.getElementById(chartDOM).style.display = 'block';

    var labelData = [];
    var amountData = [];
    var quantityData = [];
    var worseProduct;
    var worseProductList = [];

    // use reduce to find min total
    Array.prototype.hasMin = function(attrib) {
        return this.reduce(function(prev, curr) {
            return prev[attrib] < curr[attrib] ? prev : curr;
        });
    }

    var worseCounter = result.length;
    if (worseCounter >= 5) {
        worseCounter = 5;
    }
    document.getElementById(worseCounterDOM).textContent = worseCounter;

    // loop to find top 5 products with minimum total
    for (var i = 0; i < worseCounter; i++) {
        // sort by finding min total
        worseProduct = result.hasMin('total');
        // push object with min total to a new array before popping it off
        worseProductList.push(worseProduct);
        var index = result.indexOf(worseProduct);
        if (index != -1) result.splice(index, 1);
    }

    for (var i = 0; i < worseProductList.length; i++) {
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
                    display: false
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
                    callback: function(value) { return numberWithCommas(value); }
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
                    else if (t.datasetIndex === 0) {
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
            }, {
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

    if (chartDOM == 'worseProductBranchChart') {
        if (worseProductBranchChart1) worseProductBranchChart1.destroy();
        worseProductBranchChart1 = new Chart(ctx, opt);

        worseProductBranchChart1.update();
        document.getElementById("productBranchWorseText").innerHTML = brand;
    } else {
        if (worseProductBranchChart2) worseProductBranchChart2.destroy();
        worseProductBranchChart2 = new Chart(ctx, opt);

        worseProductBranchChart2.update();
        document.getElementById("productBranchWorseText1").innerHTML = brand;
    }
}

// function to plot the branch distribution by age group and genders
var branchAgeGenderChart;
var branchAgeGenderChart1;

function plotBranchAgeGenderChart(arr, chartDOM, branch) {
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
    for (var i = 0; i < res.length; i++) {
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
    for (var i = 0; i < femaleData.length; i++) {
        femaleData[i] = -Math.abs(femaleData[i]);
    }

    var ctx = document.getElementById(chartDOM).getContext("2d");

    var options = {
        layout: {
            padding: {
                top: 5,
            }
        },
        scales: {
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
                }
            ]
        },
        options: options
    };

    if (chartDOM == 'branchAgeGenderChart') {
        if (branchAgeGenderChart) branchAgeGenderChart.destroy();
        branchAgeGenderChart = new Chart(ctx, opt);

        branchAgeGenderChart.update();
        document.getElementById("branchAgeGenderText").innerHTML = branch;
    } else {
        if (branchAgeGenderChart1) branchAgeGenderChart1.destroy();
        branchAgeGenderChart1 = new Chart(ctx, opt);

        branchAgeGenderChart1.update();
        document.getElementById("branchAgeGenderText1").innerHTML = branch;
    }
}

// function to plot the total revenue by each age group based on selected branch
var branchPowerChart, branchPowerChart1;

function plotBranchPurchasingPower(arr, chartDOM, gradient, branch) {
    document.getElementById(chartDOM).style.display = 'block';

    var ageGroup = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '>=80'];
    var ageIndex;
    var amountData = new Array(ageGroup.length).fill(0);
    var priceData = new Array(ageGroup.length).fill(0);
    var datasetarr = [];

    var res = arr.reduce(function(items, item) {
        var existing = items.find(function(i) {
            return i.accountID === item.accountID;
        });

        if (existing) {
            existing.total += item.total;
        } else {
            items.push({...item }); // shallow copy to avoid mutating to the original arr
        }
        return items;
    }, []);

    // sort by age group followed by gender
    for (var i = 0; i < res.length; i++) {
        // get index position in ageGroup
        var age = res[i].age;
        ageIndex = Math.floor(age / 10);

        amountData[ageIndex]++;
        priceData[ageIndex] += res[i].total;
    }

    for (var i = 0; i < amountData.length; i++) {
        for (var j = 0; j < priceData.length; j++) {
            if (i == j) {
                var avg = 0;
                if (priceData[j] != 0 || amountData[i] != 0) {
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
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    fontSize: 11 // set y-axis label size
                },
            }],
            xAxes: [{
                ticks: {
                    fontSize: 11,
                },
                barPercentage: 0.4,
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    callback: function(value) { return numberWithCommas(value); }
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
                    if (t.datasetIndex === 1) return xLabel + ': $ ' + numberWithCommas(yLabel.toFixed(2));
                    // if line chart
                    else if (t.datasetIndex === 0) {
                        return xLabel + ': $ ' + numberWithCommas(yLabel.toFixed(2));
                    }
                }
            }
        }
    };


    var opt = {
        type: "bar",
        data: {
            labels: ageGroup,
            datasets: [{
                type: "bar",
                label: 'Total Revenue',
                data: priceData,
                backgroundColor: "rgba(220,220,220,0)",
                borderColor: gradient,
                borderWidth: 1.5,
                hoverBorderColor: gradient,
            }, {
                type: "line",
                label: 'Average Revenue ',
                data: datasetarr,
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

    if (chartDOM == 'powerBranchChart') {
        if (branchPowerChart) branchPowerChart.destroy();
        branchPowerChart = new Chart(ctx, opt);

        branchPowerChart.update();
        document.getElementById("powerBranchText").innerHTML = branch;
    } else {
        if (branchPowerChart1) branchPowerChart1.destroy();
        branchPowerChart1 = new Chart(ctx, opt);

        branchPowerChart1.update();
        document.getElementById("powerBranchText1").innerHTML = branch;
    }
}
var categoryChart;

async function plotCategoryChart() {


    document.body.classList.add("loading");


    var datasetarr = [];


    var items = await getAllReceiptItems();

    console.log(`items .......... ${items}`);
    // get all receipt items detail, then check if receipt date is within current year before pushing to datasetarr
    getAllReceiptItems().then((ritemlist) => {
        console.log(ritemlist);
        getAllReceipts().then((receiptlist) => {

            console.log(`*********${receiptlist} ***********`);
            console.log(receiptlist);
            console.log(`*********${ritemlist} ***********`);
            let promiseKey = new Promise((resolve, reject) => {
                // loop through list of receipts
                for (var j = 0; j < receiptlist.length; j++) {
                    // check if the date is within current year
                    //if(receiptlist[j].date.substring(0, 4) == getCurrentYear() ){
                    // if within current year, push the receipt items under certain receipt to datasetarr
                    for (var i = 0; i < ritemlist.length; i++) {
                        if (ritemlist[i].receiptID == receiptlist[j].receiptID) {
                            datasetarr.push({ category: ritemlist[i].category, total: ritemlist[i].total, date: receiptlist[j].date });
                        }
                    }
                    //}
                }
                resolve(datasetarr);
            });

            promiseKey.then((arr) => {
                var labelData = [];
                var totalData = [];

                console.log('*****************');
                console.log(`*********${arr} ***********`);

                groupCategoryOverview(arr);

                // use reduce to sort by sum up quantity of same category
                var result = arr.reduce(function(items, item) {
                    var existing = items.find(function(i) {
                        return i.category === item.category;
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

                for (var i = 0; i < result.length; i++) {
                    labelData.push(capitalizeFirstLetter(result[i].category));
                    totalData.push(result[i].total);
                }

                var ctx = document.getElementById('categoryChart').getContext("2d");
                var gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#E91E63');
                gradient.addColorStop(1, '#2196F3');

                var options = {
                    layout: {
                        padding: {
                            top: 5,
                            bottom: 15
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            display: true,
                            barPercentage: 0.4, // set bar thickness
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                fontSize: 11 // set y-axis label size
                            },
                        }],
                        xAxes: [{
                            ticks: {
                                fontSize: 11,
                                callback: function(value) { return numberWithCommas(value); }
                            },
                        }]
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
                            data: totalData,
                            backgroundColor: "rgba(220,220,220,0)",
                            borderColor: gradient,
                            borderWidth: 1.5,
                            hoverBackgroundColor: gradient,
                        }]
                    },
                    options: options
                };

                document.body.classList.remove("loading");
                if (categoryChart) categoryChart.destroy();
                categoryChart = new Chart(ctx, opt);

                categoryChart.update();


            });


        });

    });

}

function groupCategoryOverview(arr) {
    // sort according to GROUP BY category (use an object for grouping and for iterating the groups, take the keys of the object and iterate over them)
    groups = Object.create(null);

    arr.forEach(function(o) {
        groups[o.category] = groups[o.category] || [];
        groups[o.category].push(o);
    });

    var result = [];
    // pass the sorted groups to perform calculation and return as object
    Object.keys(groups).forEach(function(k) {
        obj = formatOverallOverview(groups[k]);
        result.push(obj);
    });

    // pass the list of objects returned to display
    populateOverallOverview(result);

    //console.log(groups.food);
}

// function to get the best selling month and its revenue for each category and return as object
function formatOverallOverview(result) {

    console.log('formatting *********************');

    var category, topMonth = 0,
        topAmount = 0,
        topMonthStr = '',
        currentMonthStr = '',
        currentMonthAmt = 0,
        obj;
    var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // get the category from array parameter
    for (var i = 0; i < result.length; i++) {
        category = result[i].category;
    }

    // loop through grouped date to group by month
    result.forEach(obj => {
        var month = Number(obj.date.substr(5, 2));
        amountData[month - 1] += obj.total;
    })

    // get the max amount and its month index
    var indexOfMaxValue = amountData.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    topMonth = indexOfMaxValue + 1;
    topAmount = amountData[indexOfMaxValue];

    // formulate the string for month with most sales
    topMonthStr = getMonthStr(topMonth);

    // get current month sales
    var d = new Date();
    var month = d.getMonth();
    currentMonthAmt = amountData[month];
    currentMonthStr = getMonthStr(month);

    // format the amountData for sparkline chart
    for (var i = 0; i < amountData.length; i++) {
        amountData[i] = amountData[i].toFixed(2);
    }

    console.log(amountData);

    obj = { category: category, topMonthStr: topMonthStr, topAmount: topAmount, currentMonthStr: currentMonthStr, currentMonthAmt: currentMonthAmt, amountData: amountData };
    return obj;
}

// function to display the list of formatted objects
function populateOverallOverview(result) {



    var table = document.getElementById("firstTabOverall");

    // helper function        
    function addCell(tr, text) {
        var td = tr.insertCell();
        td.textContent = text;
        return td;
    }

    console.log('amounts ************');


    console.log(result);

    // insert data
    result.forEach(function(item) {
        var row = table.insertRow();
        addCell(row, capitalizeFirstLetter(item.category));
        addCell(row, '$ ' + numberWithCommas(item.currentMonthAmt.toFixed(2)));
        addCell(row, item.topMonthStr + ' ($ ' + numberWithCommas(item.topAmount.toFixed(2)) + ')');

        addCell(row, ""); //Added blank cell for sparkline


        console.log(`amounts ........ ${item.amountData}`);


        var dataSpan = $("<span>");
        dataSpan.appendTo($(row).children("td:last"));
        dataSpan.sparkline(item.amountData, {
            type: 'bar',
            barColor: '#2e2e2e',
            // format sparkline hover value
            tooltipFormat: '{{offset:offset}} $ {{value}}',
            tooltipValueLookups: {
                'offset': {
                    0: 'Jan',
                    1: 'Feb',
                    2: 'Mar',
                    3: 'Apr',
                    4: 'May',
                    5: 'Jun',
                    6: 'Jul',
                    7: 'Aug',
                    8: 'Sept',
                    9: 'Oct',
                    10: 'Nov',
                    11: 'Dec'
                }
            }
        });
    });

}

var subtypeChart;

function plotSubtypeChart() {

    document.body.classList.add("loading");
    document.getElementById("subtypeChart").style.display = "block";

    // hide warning message
    setTimeout(function() {
        document.getElementById("txtSubtypeWarning").style.display = "none";
        document.getElementById("txtTimelineWarning").style.display = "none";
    }, 700);

    // get selected category
    var dropdown = document.getElementById("ddlCategory");
    var category = dropdown.options[dropdown.selectedIndex].value;
    category = category.toLowerCase();

    // get top products for each category selected except bill/transportation
    if (category != 'bill' && category != 'transportation') {
        // get top products
        getTopProduct(category);
        // hide warning message & show top product table wrap
        setTimeout(function() {
            $('#txtTopProductWarning').fadeOut('fast');
            document.getElementById('topSellingBox').style.visibility = 'visible';
            document.getElementById("bestSellingTableWrap").style.visibility = 'visible';
            $('#topSellingBox').fadeIn('fast');
            $('#bestSellingTableWrap').fadeIn('fast');

            $('#sixthRowLeft').fadeIn('fast');
            $('#sixthRowRight').fadeIn('fast');
            $('#seventhRow').fadeIn('fast');
        }, 700);
    } else {
        // hide the top selling product container and table wrap
        $('#topSellingBox').fadeOut('fast');
        $('#bestSellingTableWrap').fadeOut('fast');
        // hide the compare brands timeline
        $('#sixthRowLeft').fadeOut('fast');
        $('#sixthRowRight').fadeOut('fast');
        $('#seventhRow').fadeOut('fast');
    }

    // show monthly sales timeline
    plotTimeline(category);

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
                    for (var j = 0; j < ritemlist.length; j++) {
                        for (var k = 0; k < receiptlist.length; k++) {
                            if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                // check if within current year before push to datasetarr
                                //if(receiptlist[k].date.substring(0, 4) == getCurrentYear() ){
                                datasetarr.push({ type: ritemlist[j].type, quantity: ritemlist[j].quantity, price: ritemlist[j].price });
                                //}
                            }
                        }
                    }
                    resolve(datasetarr);
                });

                promiseKey.then((arr) => {
                    var labelData = [];
                    var quantityData = [];
                    var priceData = [];

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
                        // populate axis data
                        labelData.push(capitalizeFirstLetter(result[i].type));
                        quantityData.push(result[i].quantity);
                        priceData.push(result[i].quantity * result[i].price);
                    }

                    var ctx = document.getElementById('subtypeChart').getContext("2d");
                    var gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#E91E63');
                    gradient.addColorStop(1, '#2196F3');

                    var options = {
                        layout: {
                            padding: {
                                top: 5
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: {
                            display: false,
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    fontSize: 11, // set y-axis label size
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
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        },
                        // customize hover tooltip
                        tooltips: {
                            callbacks: {
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
                                label: 'Total Revenue ',
                                data: priceData,
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

                    //document.body.classList.remove("loading");
                    if (subtypeChart) subtypeChart.destroy();
                    subtypeChart = new Chart(ctx, opt);

                    subtypeChart.update();
                });

            });
        });
    });
}

var timelineChart;

function plotTimeline(category) {
    // text to describe export to excel download button 
    document.getElementById('catText').innerHTML = ' ALL ' + category.toUpperCase();

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
                    for (var j = 0; j < ritemlist.length; j++) {
                        for (var k = 0; k < receiptlist.length; k++) {
                            if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                //if(receiptlist[k].date.substring(0, 4) == getCurrentYear() ){
                                datasetarr.push({ date: receiptlist[k].date, total: ritemlist[j].total });
                                //}
                            }
                        }
                    }
                    resolve(datasetarr);
                });

                promiseKey.then((arr) => {

                    var labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                    var monthIndex;
                    var amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    // use reduce to sort & group by date
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

                    plotTimelineDetails(result);
                    populateCategoryOverview(result, category);

                    // loop through grouped date to group by month
                    result.forEach(obj => {
                        var month = Number(obj.date.substr(5, 2));
                        amountData[month - 1] += obj.total;
                    })

                    var ctx = document.getElementById('timelineChart').getContext("2d");
                    var gradient = ctx.createLinearGradient(0, 0, 0, 150);
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
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    fontSize: 11
                                }
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
                                    for (var i = 0; i < allData.length; i++) {
                                        total += allData[i];
                                    }
                                    var tooltipPercentage = Math.round((tooltipData / total) * 100);
                                    return 'Total Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
                                }
                            }
                        }
                    };

                    var opt = {
                        type: "line",
                        data: {
                            labels: labelData,
                            datasets: [{
                                data: amountData,
                                //steppedLine: true,
                                borderWidth: 1.5,
                                fill: false,
                                pointHoverRadius: 5,
                                pointBackgroundColor: gradient,
                                pointHoverBackgroundColor: gradient,
                                borderColor: gradient
                            }]
                        },
                        options: options
                    };

                    if (timelineChart) timelineChart.destroy();
                    timelineChart = new Chart(ctx, opt);

                    timelineChart.update();
                });
            });
        });
    });
}

var timelineDetailChart;

function plotTimelineDetails(result) {
    var labelData = [];
    var amountData = [];

    // sort the date in ascending order
    result.sort(function(a, b) {
        da = new Date(a.date);
        db = new Date(b.date);
        if (da == db) {
            return 0;
        }
        return da > db ? 1 : -1;
    });

    for (var i = 0; i < result.length; i++) {
        var date = formatDateLabel(result[i].date);
        labelData.push(date);
        amountData.push(result[i].total);
    }

    var ctx = document.getElementById('timelineDetailChart').getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, '#E91E63');
    gradient.addColorStop(1, '#2196F3');

    var options = {
        // enforce these two to prevent chart auto expand
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                gridLines: {
                    display: false
                },
                display: false
            }],
            yAxes: [{
                display: false
            }],
        },
        legend: {
            display: false,
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
                    return 'Total Revenue: $ ' + numberWithCommas(tooltipData.toFixed(2));
                }
            }
        }
    };

    var opt = {
        type: "bar",
        data: {
            labels: labelData,
            datasets: [{
                data: amountData,
                backgroundColor: "rgba(220,220,220,0)",
                borderColor: gradient,
                borderWidth: 1.5,
                hoverBackgroundColor: gradient,
            }]
        },
        options: options
    };

    if (timelineDetailChart) timelineDetailChart.destroy();
    timelineDetailChart = new Chart(ctx, opt);

    timelineDetailChart.update();
}

function getTopProduct(category) {
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
                getAllItems().then((itemlist) => {
                    // loop through receipt items to check if receipt date is within current year
                    let promiseKey = new Promise((resolve, reject) => {
                        for (var j = 0; j < ritemlist.length; j++) {
                            for (var k = 0; k < receiptlist.length; k++) {
                                if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                    // if receipt date within current year, get item detail
                                    //if(receiptlist[k].date.substring(0, 4) == getCurrentYear()){
                                    for (var h = 0; h < itemlist.length; h++) {
                                        // if matching item ID with receipt item details, push to datasetarr
                                        if (ritemlist[j].itemID == itemlist[h].itemID) {
                                            datasetarr.push({ type: ritemlist[j].type, quantity: ritemlist[j].quantity, price: ritemlist[j].price, brand: ritemlist[j].brand, itemName: itemlist[h].name });
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
                        var tableData = new Array();
                        var table = document.getElementById("bestSellingTable");

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

                        // use reduce to find max quantity
                        Array.prototype.hasMax = function(attrib) {
                            return this.reduce(function(prev, curr) {
                                return prev[attrib] > curr[attrib] ? prev : curr;
                            });
                        }

                        // loop to find top 10 products with highest quantity
                        for (var i = 0; i < 10; i++) {
                            // sort by finding max quantity
                            topProduct = result.hasMax('quantity');
                            // push object with max quantity to a new array before popping it off
                            topProductList.push(topProduct);
                            var index = result.indexOf(topProduct);
                            if (index != -1) result.splice(index, 1);
                        }

                        // clear previous row but keep header row before populating new results
                        $('#bestSellingTable tr').slice(1).remove();

                        /*// formulate table data
                        for(var i = 0; i < topProductList.length; i++){
                        	tableData[i] = new Array(topProductList[i].type, topProductList[i].brand, topProductList[i].itemName, topProductList[i].quantity);
                        }
						
                        for(var i = 0; i < tableData.length; i++){
                        	// create a new row
                        	var newRow = table.insertRow(table.length);
                        	for(var j = 0; j < tableData[i].length; j++){
                        		// create a new cell
                        		var cell = newRow.insertCell(j);
                        		   
                        		// add value to the cell
                        		cell.innerHTML = tableData[i][j];
                        	}
                        }*/

                        // optimzed code to formulate table data
                        var table = document.getElementById("bestSellingTable");

                        // helper function        
                        function addCell(tr, text) {
                            var td = tr.insertCell();
                            td.textContent = text;
                            return td;
                        }

                        // insert data
                        topProductList.forEach(function(item) {
                            var row = table.insertRow();
                            addCell(row, capitalizeFirstLetter(item.type));
                            addCell(row, item.brand);
                            addCell(row, item.itemName);
                            addCell(row, item.quantity);
                        });


                        document.body.classList.remove("loading");
                    });
                });
            });
        });
    });
}

// function to display revenue over a certain period of time
function populateCategoryOverview(result, category) {
    //document.getElementById('catrevenueText').innerHTML = category;
    //document.getElementById('catOverviewTable').style.visibility = 'visible';

    let profit = {
        today: 0,
        yesterday: 0,
        lasttwoday: 0,
        thisweek: 0,
        lastweek: 0,
        lasttwoweek: 0,
        thismonth: 0,
        lastmonth: 0,
        lasttwomonth: 0
    };

    var today = moment();
    var date;
    result.forEach(function(e) {
        date = moment.utc(e.date, 'YYYY-MM-DD');

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

    document.getElementById('todayProfitCat').innerHTML = '$ ' + numberWithCommas(profit.today.toFixed(2));
    document.getElementById('yesterdayProfitCat').innerHTML = '$ ' + numberWithCommas(profit.yesterday.toFixed(2));
    document.getElementById('thisweekProfitCat').innerHTML = '$ ' + numberWithCommas(profit.thisweek.toFixed(2));
    document.getElementById('lastweekProfitCat').innerHTML = '$ ' + numberWithCommas(profit.lastweek.toFixed(2));
    //document.getElementById('thismonthProfitCat').innerHTML = '$ ' + numberWithCommas(profit.thismonth.toFixed(2));
    //document.getElementById('lastmonthProfitCat').innerHTML = '$ ' + numberWithCommas(profit.lastmonth.toFixed(2));

    // calculate increase or decrease of percentage over two different period of times
    populateCatUpDown('todayPercentageCat', 'imgTodayCat', profit.today, profit.yesterday, 'yesterday');
    populateCatUpDown('yesterdayPercentageCat', 'imgYesterdayCat', profit.yesterday, profit.lasttwoday, 'the day before yesterday');
    populateCatUpDown('thisweekPercentageCat', 'imgThisweekCat', profit.thisweek, profit.lastweek, 'last week');
    populateCatUpDown('lastweekPercentageCat', 'imgLastweekCat', profit.lastweek, profit.lasttwoweek, 'the week before last');
    //populateUpDown('thismonthPercentageCat', 'imgThismonthCat', profit.thismonth, profit.lastmonth, 'last month');
    //populateUpDown('lastmonthPercentageCat', 'imgLastmonthCat', profit.lastmonth, profit.lasttwomonth, 'the month before last');
}

function populateCatUpDown(percentageDOM, imageDOM, compareFrom, compareTo, timeText) {
    var percentage = 0;

    // if both number same, means maintained
    if (compareFrom == compareTo) {
        document.getElementById(imageDOM).src = 'dist/img/maintain_yellow.png';
        percentage = 0;
        // set font color to yellow
        document.getElementById(percentageDOM).style.color = '#f1c40f';
    }
    // if today < yesterday, yesterday < lasttwoday, means decreased
    else if (compareFrom < compareTo) {
        document.getElementById(imageDOM).src = 'dist/img/down_arrow_red.png';
        // if both number are not zero, wont have division over zero error
        if (compareFrom != 0 && compareTo != 0) {
            percentage = Math.round((compareTo - compareFrom) / compareFrom * 100);
        }
        // if either one zero, just multiply the other one with 100
        else if (compareFrom == 0) {
            percentage = Math.round(compareTo * 100);
        } else if (compareTo == 0) {
            percentage = Math.round(compareFrom * 100);
        }
        // set font color to dark red
        document.getElementById(percentageDOM).style.color = '#B40404';
    }
    // if today > yesterday, yesterday < lasttwoday, means increased
    else {
        document.getElementById(imageDOM).src = 'dist/img/up_arrow_green.png';
        // if both number are not zero, wont have division over zero error
        if (compareFrom != 0 && compareTo != 0) {
            percentage = Math.round((compareFrom - compareTo) / compareTo * 100);
        }
        // if either one zero, just multiply the other one with 100
        else if (compareFrom == 0) {
            percentage = Math.round(compareTo * 100);
        } else if (compareTo == 0) {
            percentage = Math.round(compareFrom * 100);
        }
        // set font color to green
        document.getElementById(percentageDOM).style.color = '#088A08';
    }
    // set the percentage value
    document.getElementById(percentageDOM).innerHTML = ' ' + percentage + ' % from ' + timeText;
}

// the function loops through the keys on one of the objects to create a header row, followed by a newline. 
// Then it loops through each object and write out the values of each property
function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function getDataProduct() {
    var catdropdown = document.getElementById("ddlCategory");
    var category = catdropdown.options[catdropdown.selectedIndex].value;
    category = category.toLowerCase();

    if (category == '') {
        alert('Please select a category.');
    } else {

        var datasetarr = [];
        var ritemlist = [];

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
                // get all receipt and item details by matching receipt item ID
                getAllReceipts().then((receiptlist) => {
                    getAllItems().then((itemlist) => {
                        let promiseKey = new Promise((resolve, reject) => {
                            for (var j = 0; j < ritemlist.length; j++) {
                                for (var k = 0; k < receiptlist.length; k++) {
                                    // if matchng receipt item ID
                                    if (ritemlist[j].receiptID == receiptlist[k].receiptID) {
                                        // loop through item list to find matching item ID
                                        for (var m = 0; m < itemlist.length; m++) {
                                            if (ritemlist[j].itemID == itemlist[m].itemID) {
                                                // push the data into array
                                                datasetarr.push({
                                                    merchantName: receiptlist[k].merchantName,
                                                    branchName: receiptlist[k].branchName,
                                                    branchAddress: receiptlist[k].branchAddress,
                                                    currencyName: receiptlist[k].currencyName,
                                                    currencySymbol: receiptlist[k].currencySymbol,
                                                    receiptNumber: receiptlist[k].receiptNumber,
                                                    date: receiptlist[k].date,
                                                    timeIssued: receiptlist[k].timeIssued,
                                                    itemName: itemlist[m].name,
                                                    category: ritemlist[j].category,
                                                    total: ritemlist[j].total,
                                                    price: ritemlist[j].price,
                                                    quantity: ritemlist[j].quantity,
                                                    type: ritemlist[j].type,
                                                    brand: ritemlist[j].brand
                                                });

                                            }
                                        }

                                    }
                                }
                            }
                            resolve(datasetarr);
                        });

                        promiseKey.then((arr) => {
                            // sort brand alphabetically
                            arr.sort((a, b) => a.brand !== b.brand ? a.brand < b.brand ? -1 : 1 : 0);

                            // format array to be parse to write to excel
                            var result = [];
                            for (var i = 0; i < arr.length; i++) {
                                var price = numberWithCommas(parseFloat(arr[i].price).toFixed(2));
                                var total = numberWithCommas(parseFloat(arr[i].total).toFixed(2));

                                result.push({
                                    ReceiptNumber: arr[i].receiptNumber,
                                    Date: arr[i].date,
                                    MerchantName: arr[i].merchantName,
                                    BranchName: arr[i].branchName,
                                    Brand: arr[i].brand,
                                    ItemName: arr[i].itemName,
                                    Category: arr[i].category,
                                    Type: arr[i].type,
                                    Quantity: arr[i].quantity,
                                    Price: price,
                                    ItemTotal: total
                                });
                            }

                            var data, filename, link;
                            var csv = convertArrayOfObjectsToCSV({
                                data: result
                            });
                            if (csv == null) return;

                            // format the file name for excel spread sheet
                            var today = new Date();
                            var dd = today.getDate();
                            var mm = today.getMonth() + 1;
                            var yyyy = getCurrentYear();
                            if (dd < 10) {
                                dd = '0' + dd
                            }
                            if (mm < 10) {
                                mm = '0' + mm
                            }
                            var date = yyyy + '' + mm + '' + dd;

                            filename = date + '_' + category + '_dataproduct.csv';

                            // created and prepends a special string that tells the browser that our content is CSV and it needs to be downloaded
                            if (!csv.match(/^data:text\/csv/i)) {
                                csv = 'data:text/csv;charset=utf-8,' + csv;
                            }
                            data = encodeURI(csv);

                            link = document.createElement('a');
                            link.setAttribute('href', data);
                            link.setAttribute('download', filename);
                            link.click();


                        });
                    });
                });
            });
        });
        // end else
    }
}
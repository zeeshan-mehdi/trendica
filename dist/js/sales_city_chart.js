var selectedCity;
$(document).ready(function() {
    // Handler for .ready() called.
    getData3();
    $(".element4").click(makeGraphSlice);
    $(".element5").click(makeGraphSlice1);

    $("select#salescity1").change(function() {
        selectedCity = $(this).children("option:selected").val();
        myGraphChart.destroy();
        getData3();
    });
});

var startSlice = 0;
var endSlice = 10;
var myGraphChart;
let array1 = [];
let array3 = [];

function getData3() {

    document.getElementsByName("ItemChain-1");

    firebase.database().ref('Fp-Growth-User-1/ItemChain_With_Filter_By_City').once('value').then(function(snapshot) {
        var saleData = snapshot.val();



        let arr101 = Object.values(saleData);

        for (let i = 0; i < arr101.length; i++) {
            var item = arr101[i];


            array1.push(item['Chain-Frequency']['frequency']);



            let str = '';
            for (let j = 1; j < Object.values(item).length; j++) {
                if (item['Item' + j]['City'] == selectedCity) {
                    if (j != 1)
                        str += ' & ';
                    str += item['Item' + j]['ItemName'];
                }
            }
            if (str != '')
                array3.push(str);
        }
        makeChartGraph();
    });
}


function makeChartGraph() {
    let arr456 = array3.slice(startSlice, endSlice);
    let arr567 = array1.slice(startSlice, endSlice);
    var ctx = document.getElementById('salesCityChart').getContext('2d');


    myGraphChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arr456,
            datasets: [{
                label: 'Sales Analysis',
                data: arr567,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    stacked: false,
                    ticks: {
                        display: false //this will remove only the label
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}

function makeGraphSlice() {
    if (endSlice < array3.length) {
        startSlice += 10;
        endSlice += 10;
        myGraphChart.destroy();
        makeChartGraph();
    }
}

function makeGraphSlice1() {
    if (startSlice != 0) {
        startSlice -= 10;
        endSlice -= 10;
        myGraphChart.destroy();
        makeChartGraph();
    }
}
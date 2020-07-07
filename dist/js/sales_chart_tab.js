$(document).ready(function() {
    // Handler for .ready() called.
    getData();
    $(".element").click(makeSlice);
    $(".element1").click(makeSlice1);
});

var start = 0;
var end = 10;
var myChart;
let arr1 = [];
let arr3 = [];

function getData() {

    document.getElementsByName("ItemChain-1");

    firebase.database().ref('Fp-Growth-User-1/ItemChain_With_Filter_By_Branch').once('value').then(function(snapshot) {
        var data = snapshot.val();



        let arr = Object.values(data);

        for (let i = 0; i < arr.length; i++) {
            var item = arr[i];


            arr1.push(item['Chain-Frequency']['frequency']);



            let str = '';
            for (let j = 1; j < Object.values(item).length; j++) {
                if (j != 1)
                    str += ' & ';
                str += item['Item' + j]['ItemName'];
            }
            arr3.push(str);
        }
        makeGraph();
    });
}


function makeGraph() {
    let arr4 = arr3.slice(start, end);
    let arr5 = arr1.slice(start, end);
    var ctx = document.getElementById('chart123').getContext('2d');


    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arr4,
            datasets: [{
                label: 'Sales Analysis',
                data: arr5,
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

function makeSlice() {
    if (end < arr3.length) {
        start += 10;
        end += 10;
        myChart.destroy();
        makeGraph();
    }
}

function makeSlice1() {
    if (start != 0) {
        start -= 10;
        end -= 10;
        myChart.destroy();
        makeGraph();
    }
}
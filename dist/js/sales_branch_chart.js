var selectedBranch;
$(document).ready(function() {
    // Handler for .ready() called.
    getData1();
    $(".element2").click(makeSlice2);
    $(".element3").click(makeSlice3);

    $("select#salesbranch1").change(function() {
        selectedBranch = $(this).children("option:selected").val();
        myChart1.destroy();
        getData1();
    });


});

var start1 = 0;
var end1 = 10;
var myChart1;
let arr12 = [];
let arr34 = [];

function getData1() {
    arr34 = [];

    document.getElementsByName("ItemChain-1");

    firebase.database().ref('Fp-Growth-User-1/ItemChain_With_Filter_By_Branch').once('value').then(function(snapshot) {
        var data1 = snapshot.val();



        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {
            var item = arr0[i];


            arr12.push(item['Chain-Frequency']['frequency']);



            let str = '';
            for (let j = 1; j < Object.values(item).length; j++) {
                if (item['Item' + j]['Branch'] == selectedBranch) {
                    if (j != 1)
                        str += ' & ';
                    str += item['Item' + j]['ItemName'];
                }
            }
            if (str != '')
                arr34.push(str);
        }

        makeGraph1();
    });
}


function makeGraph1() {
    let arr45 = arr34.slice(start1, end1);
    let arr56 = arr12.slice(start1, end1);
    var ctx = document.getElementById('salesBranchChart').getContext('2d');


    myChart1 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arr45,
            datasets: [{
                label: 'Sales Analysis',
                data: arr56,
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

function makeSlice2() {
    if (end1 < arr34.length) {
        start1 += 10;
        end1 += 10;
        myChart1.destroy();
        makeGraph1();
    }
}

function makeSlice3() {
    if (start1 != 0) {
        start1 -= 10;
        end1 -= 10;
        myChart1.destroy();
        makeGraph1();
    }
}
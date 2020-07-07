let data = [];
let start3 = 0;
let end3 = 14;
let chart;

var next = document.getElementsByClassName("element8")[0];
var prev = document.getElementsByClassName("element7")[0];



$(document).ready(function() {

    // Handler for .ready() called.
    firebase.database().ref('Churn-Prediction-User-1/Predictions').once('value').then(function(snapshot) {
        //console.clear();
        console.log("in");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['Value'];
            if (val == 0) val = -1;
            data.push(val);

        }

        console.log(data);

        makeGraph2();
        $(".element7").click(makeGraphSlice2);
        $(".element8").click(makeGraphSlice3);


    });
});

function makeGraph2() {
    let data5 = data;
    let i = start3;
    chart = new Chart(document.getElementById("bar-chart"), {
        type: 'bar',

        data: {
            labels: data5.slice(start3, end3).map(function(v) {
                return `C # ${i++}`;
            }),
            datasets: [{
                label: "Population (millions)",
                backgroundColor: data5.slice(start3, end3).map(function(v) {
                    if (v === -1)
                        return "#3e95cd";

                    return "#8e5ea2";
                }),
                data: data5.slice(start3, end3)
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Churn Prediction'
            }
        }
    });

    console.log('Graph made');


}


function makeGraphSlice2() {
    console.log('clicked');
    if (end3 < data.length) {
        start3 += 14;
        end3 += 14;
        chart.destroy();
        makeGraph2();
    }
}

function makeGraphSlice3() {
    if (start3 !== 0) {
        start3 -= 14;
        end3 -= 14;
        chart.destroy();
        makeGraph2();
    }
}
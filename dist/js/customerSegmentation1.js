let data9 = [];
let bottomLabels = [];
$(document).ready(function() {
    // Handler for .ready() called.
    firebase.database().ref('Customer-Segmentation-User-1/Top-3-Categories').once('value').then(function(snapshot) {
        console.clear();
        console.log("in");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['value'];
            bottomLabels.push(item['name']);
            data9.push(val);

        }

        console.log(data9);
        makeGraph8(data9, bottomLabels);
    });

    makeTopCategoriesGraph();



});

function makeGraph8(data3, bottomLabels) {


    new Chart(document.getElementById("doughnut-chart2"), {
        type: 'doughnut',
        data: {
            labels: bottomLabels,
            datasets: [{
                label: "Churn Prediction",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#FF9800"],
                data: data3
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Top 3 Categories'
            }
        }
    });

}

function makeTopCategoriesGraph() {
    let values = [];
    let labels = [];
    firebase.database().ref('Customer-Segmentation-User-1/Male-Stats').once('value').then(function(snapshot) {
        console.clear();
        console.log("inside grabbing some data");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['value'];
            labels.push(item['name']);
            values.push(val);

        }

        console.log(labels, values);

        makeGraph20(labels, values);
    });
}

function makeGraph20(labels, values) {

    console.clear();
    console.log(labels);
    console.log(values);


    new Chart(document.getElementById("bar-chart-horizontal2"), {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: [{
                label: "Male Stats",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
                data: values
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Male Stats'
            }
        }
    });

}
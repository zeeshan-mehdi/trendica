let data7 = [];
let labelsTop = [];
$(document).ready(function() {
    // Handler for .ready() called.
    firebase.database().ref('Customer-Segmentation-User-1/Bottom-3-Categories').once('value').then(function(snapshot) {
        console.clear();
        console.log("in");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['value'];
            labelsTop.push(item['name']);
            data7.push(val);

        }

        console.log(data7);
        makeGraph7(data7, labelsTop);
    });


    makeBottomCategoriesGraph();


});

function makeGraph7(data8, labelsTop) {


    new Chart(document.getElementById("doughnut-chart1"), {
        type: 'doughnut',
        data: {
            labels: labelsTop,
            datasets: [{
                label: "Churn Prediction",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#FF9800", "#9E9E9E", "#FFC107", "#795548"],
                data: data8
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Bottom 3 Categories'
            }
        }
    });


}

function makeBottomCategoriesGraph() {
    let values = [];
    let labels = [];
    firebase.database().ref('Customer-Segmentation-User-1/Female-Stats').once('value').then(function(snapshot) {
        //console.clear();
        console.log("in");
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

        makeGraph6(labels, values);
    });
}

function makeGraph6(labels, values) {

    new Chart(document.getElementById("bar-chart-horizontal1"), {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
                data: values
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Female Stats'
            }
        }
    });

}
let data11 = [];
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
            if (val === 0) val = -1;
            data11.push(val);

        }

        console.log(data11);
        makeGraph11(data11);
    });

    makepaymentStatsGraph();



});

function makeGraph9(data1) {

    // console.clear();
    console.log("here is new donugt chrt");
    var positive = 0;
    var negative = 0;

    for (let i = 0; i < data1.length; i++) {
        if (data1[i] === 1) positive++;
        else
            negative++;
    }


    new Chart(document.getElementById("doughnut-chart3"), {
        type: 'doughnut',
        data: {
            labels: ["Electronic Accessories", " Fashion Accessories", "Food & Beverages"],
            datasets: [{
                label: "Churn Prediction",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#FF9800"],
                data: [positive, negative]
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

function makepaymentStatsGraph() {
    let values = [];
    let labels = [];
    firebase.database().ref('Customer-Segmentation-User-1/Male-Stats').once('value').then(function(snapshot) {
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

        makeGraph9(labels, values);
    });
}

function makeGraph11(labels, values) {

    new Chart(document.getElementById("bar-chart-horizontal3"), {
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
                text: 'Male Stats'
            }
        }
    });

}
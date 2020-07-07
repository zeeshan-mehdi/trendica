let data2 = [];
$(document).ready(function() {
    // Handler for .ready() called.
    firebase.database().ref('Churn-Prediction-User-1/Predictions').once('value').then(function(snapshot) {
        // console.clear();
        console.log("in");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['Value'];
            if (val === 0) val = -1;
            data2.push(val);

        }

        console.log(data2);

        makeGraph4(data2);
    });


    makeFeatureImportanceGraph();


});

function makeGraph4(data6) {

    // console.clear();
    console.log("here is new donugt chrt");
    var positive = 0;
    var negative = 0;

    for (let i = 0; i < data6.length; i++) {
        if (data6[i] === 1) positive++;
        else
            negative++;
    }


    new Chart(document.getElementById("doughnut-chart"), {
        type: 'doughnut',
        data: {
            labels: ["Non Churn", " Churn"],
            datasets: [{
                label: "Churn Prediction",
                backgroundColor: ["#3e95cd", "#8e5ea2"],
                data: [positive, negative]
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Churn VS Non-Churn'
            }
        }
    });


}


function makeFeatureImportanceGraph() {
    let values = [];
    let labels = [];
    firebase.database().ref('Churn-Prediction-User-1/Feature_Importance').once('value').then(function(snapshot) {
        //console.clear();
        console.log("in");
        console.log(snapshot);
        let data1 = snapshot.val();

        let arr0 = Object.values(data1);

        for (let i = 0; i < arr0.length; i++) {

            let item = arr0[i];
            console.log(item);
            let val = item['Value'];
            labels.push(item['Feature_Name']);
            values.push(val);

        }

        console.log(labels, values);

        makeGraph5(labels, values);
    });
}

function makeGraph5(labels, values) {

    new Chart(document.getElementById("bar-chart-horizontal"), {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: [{
                label: "Population (millions)",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850", "#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: values
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Feature Importance'
            }
        }
    });

}
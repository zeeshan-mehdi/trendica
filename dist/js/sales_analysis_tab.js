$(document).ready(function() {
    // Handler for .ready() called.
    populateBranchTypeDropdown();
    populateCityTypeDropdown();
});

var select = document.getElementById("salesbranch1");
var select1 = document.getElementById("salescity1");

function populateBranchTypeDropdown() {
    var arr1 = [];

    firebase.database().ref('Fp-Growth-User-1/ItemChain_With_Filter_By_Branch').once('value').then(function(snapshot) {
        var data = snapshot.val();

        let arr = Object.values(data);

        for (let i = 0; i < arr.length; i++) {
            var item = arr[i];

            for (let j = 1; j < Object.values(item).length; j++) {
                let index = 'Item' + j.toString();
                arr1.push(item[index]['Branch']);

            }
        }

        arr1 = unique(arr1);
        console.log(arr1);

        $(select).empty();
        $(select).append('<option value="" disabled selected> --- Select Branch ---</option>');

        for (var k = 0; k < arr1.length; k++) {

            var option = document.createElement('option');
            option.text = option.value = arr1[k];

            select.appendChild(option);
        }



    });
}

function populateCityTypeDropdown() {
    var arr2 = [];

    firebase.database().ref('Fp-Growth-User-1/ItemChain_With_Filter_By_City').once('value').then(function(snapshot) {
        var data = snapshot.val();

        let arr = Object.values(data);

        for (let i = 0; i < arr.length; i++) {
            var item = arr[i];

            for (let j = 1; j < Object.values(item).length; j++) {
                let index = 'Item' + j.toString();

                arr2.push(item[index]['City']);

            }
        }
        arr2 = unique(arr2);
        console.log(arr2);

        $(select1).empty();
        $(select1).append('<option value="" disabled selected> --- Select City ---</option>');

        for (var k = 0; k < arr2.length; k++) {

            var option = document.createElement('option');
            option.text = option.value = arr2[k];

            console.log(option);

            select1.appendChild(option);
        }

    });
}

function unique(arr1) {
    var array = [];
    array.push(arr1[0]);
    for (var j = 0; j < arr1.length; j++) {
        if (!isThere(arr1[j], array)) {
            array.push(arr1[j]);
        }
    }
    return (array);
}

function isThere(el, arr1) {
    for (var i = 0; i < arr1.length; i++) {
        if (el == arr1[i]) {
            return true;
        }
    }

    return false;
}
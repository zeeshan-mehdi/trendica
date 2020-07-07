var ritemlist = [];
var datasetarr = [];

function populateCatList() {
    var dropdown = document.getElementById("ddlCategory");
    var brandCatdropdown = document.getElementById("ddlbrandCategory");
    var companyCatdropdown = document.getElementById("ddlCompanyCategory");
    var forecastCatdropdown = document.getElementById("ddlforecastCategory");
    var pdfCatdropdown = document.getElementById("pdfMainCategory");

    var arr = [];
    var arr1 = [];
    // get all category & store as array
    let promiseCategoryList = new Promise((resolve, reject) => {
        var query = firebase.database().ref('receiptItemIDsByCategory');
        query.once('value', data => {
            data.forEach(categorySnapshot => {
                var categoryData = categorySnapshot.val();
                var category = categorySnapshot.key;
                arr.push(category);
            });
            resolve(arr);
        });
    });

    // loop through array add item as drop down options
    promiseCategoryList.then((arr) => {
        for (var i = 0; i < arr.length; i++) {
            var option = document.createElement("option");
            option.text = capitalizeFirstLetter(arr[i]);
            dropdown.add(option);

            var option1 = document.createElement("option");
            option1.text = capitalizeFirstLetter(arr[i]);
            brandCatdropdown.add(option1);

            var option2 = document.createElement("option");
            option2.text = capitalizeFirstLetter(arr[i]);
            companyCatdropdown.add(option2);

            var option3 = document.createElement("option");
            option3.text = capitalizeFirstLetter(arr[i]);
            forecastCatdropdown.add(option3);

            var option4 = document.createElement("option");
            option4.text = capitalizeFirstLetter(arr[i]);
            pdfCatdropdown.add(option4);
        }
    });
}

// function to get all categories
// return result inside of the .then() function. Since I'm returning the result of .then(), this will then evaluate to a promise that, rather than purely returning data, will return result
function getAllCategory() {
    var query = firebase.database().ref('receiptItemIDsByCategory');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(categorySnapshot => {
            var categoryData = categorySnapshot.val();
            var category = categorySnapshot.key;
            result.push(category);
        });
        return result;
    });

    // once everything done, resolve the promise
    resolve(result);
}

// function to get all receipt items details
function getAllReceiptItems() {
    var query = firebase.database().ref('receiptItems');
    return query.once('value').then(data => {
        var result = [];

        //console.log(data);

        data.forEach(snapshot => {


            //console.log(snapshot.val());

            var receiptItemData = snapshot.val();
            var receiptItemID = snapshot.key;

            var price = receiptItemData.price;
            var quantity = receiptItemData.quantity;
            var type = receiptItemData.type;
            var itemTotal = price * quantity;
            var receiptID = receiptItemData.receiptID;
            var category = receiptItemData.category;
            var brand = receiptItemData.brand;
            var itemID = receiptItemData.itemID;

            result.push({
                receiptItemID: receiptItemID,
                category: category,
                receiptID: receiptID,
                total: itemTotal,
                price: price,
                quantity: quantity,
                type: type,
                brand: brand,
                itemID: itemID
            });


        });

        return result;
    });
    resolve(result);
}

// function to get receipt item details by receipt item ID and return as an object
function getReceiptItemByID(rID) {
    var query = firebase.database().ref('receiptItems').child(rID);
    return query.once('value').then(data => {
        var result;
        data.forEach(snapshot => {
            var receiptItemData = data.val();
            var receiptItemID = data.key;

            var price = receiptItemData.price;
            var quantity = receiptItemData.quantity;
            var type = receiptItemData.type;
            var itemTotal = price * quantity;
            var receiptID = receiptItemData.receiptID;
            var category = receiptItemData.category;
            var brand = receiptItemData.brand;
            var itemID = receiptItemData.itemID;

            result = {
                receiptItemID: receiptItemID,
                category: category,
                receiptID: receiptID,
                total: itemTotal,
                price: price,
                quantity: quantity,
                type: type,
                brand: brand,
                itemID: itemID
            };
        });
        return result;
    });
    resolve(result);
}

// function to get receipt details
function getAllReceipts() {
    var query = firebase.database().ref('receipts');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var accountID = snapshot.key;

            snapshot.forEach(childSnapshot => {
                var receiptID = childSnapshot.key;
                var receiptDetail = childSnapshot.val();

                console.log(receiptDetail);
                // branch details
                var merchantName = receiptDetail.merchantName;
                var branchName = receiptDetail.branch.branchName;
                var branchAddress = receiptDetail.branch.branchAddress;

                // currency details
                var currencyName = receiptDetail.currency.currencyName;
                var currencySymbol = receiptDetail.currency.currencySymbol;

                // receipt details
                var receiptNumber = receiptDetail.receiptNumber;
                var date = receiptDetail.date;
                var timeIssued = receiptDetail.timeIssued;
                var totalAmount = receiptDetail.totalAmount;
                var amountPaid = receiptDetail.amountPaid;
                var changeGiven = receiptDetail.changeGiven;
                var discount = receiptDetail.discount;
                var paymentType = receiptDetail.paymentMethod;
                var cardNumber;
                if (paymentType == 'cash') {
                    cardNumber = '';
                } else {
                    cardNumber = receiptDetail.cardNumber;
                }

                result.push({
                    accountID: accountID,
                    receiptID: receiptID,
                    merchantName: merchantName,
                    branchName: branchName,
                    branchAddress: branchAddress,
                    currencyName: currencyName,
                    currencySymbol: currencySymbol,
                    receiptNumber: receiptNumber,
                    date: date,
                    timeIssued: timeIssued,
                    totalAmount: totalAmount,
                    amountPaid: amountPaid,
                    changeGiven: changeGiven,
                    discount: discount,
                    paymentType: paymentType,
                    cardNumber: cardNumber
                });
            });
        });
        return result;
    });
    resolve(result);
}

// function to get account details
function getAllAccounts() {
    var query = firebase.database().ref('accounts');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var accountDetail = snapshot.val();
            var accountID = snapshot.key;
            var email = accountDetail.email;
            var age = accountDetail.age;
            var gender = accountDetail.gender;
            var accountType = accountDetail.accountType;

            result.push({ accountID: accountID, age: age, gender: gender, email: email, accountType: accountType });
        });
        return result;
    });
    resolve(result);
}

// function to get item details
function getAllItems() {
    var query = firebase.database().ref('items');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var itemData = snapshot.val();
            var itemID = snapshot.key;
            var name = itemData.name;
            var category = itemData.category;
            var type = itemData.type;
            var brand = itemData.brand;

            result.push({ itemID: itemID, name: name, category: category, type: type, brand: brand });
        });
        return result;
    });
    resolve(result);
}

// function to get all receipt item IDs under certain category
function getAllReceiptItemIDByCategory(category) {
    var query = firebase.database().ref('receiptItemIDsByCategory').child(category);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var receiptItemData = snapshot.val();
            var receiptItemID = snapshot.key;
            result.push({ receiptItemID: receiptItemID });
        });
        return result;
    });
    resolve(result);
}

// function to get all receipt item IDs under certain brand
function getAllReceiptItemIDByBrand(brandParm) {
    var query = firebase.database().ref('receiptItemIDsByBrand');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            snapshot.forEach(childSnapshot => {
                // get the brand name
                var brandData = childSnapshot.val();
                var brand = childSnapshot.key;
                // if matching with selected brand
                if (brand == brandParm) {
                    // for each brand name, get its list of receipt item IDs
                    childSnapshot.forEach(grandchildSnapshot => {
                        var receiptItemID = grandchildSnapshot.key;

                        result.push({ brand: brand, receiptItemID: receiptItemID });
                    });
                }
            });
        });
        return result;
    });
    resolve(result);
}

// function to get all receipt IDs under certain branch
function getAllReceiptIDByBranch(branch) {
    var query = firebase.database().ref('receiptIDsByBranch').child(branch);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var receiptData = snapshot.val();
            var receiptID = snapshot.key;
            result.push({ receiptID: receiptID });
        });
        return result;
    });
    resolve(result);
}

// function to get all merchants and its relevant branches
function getAllMerchant() {
    var query = firebase.database().ref('merchants');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var merchantData = snapshot.val();
            var merchantName = merchantData.merchantName;
            snapshot.child("branches").forEach(brancheSnapshot => {
                var branchID = brancheSnapshot.key;
                var branchName = brancheSnapshot.val().branchName;
                var branchAddress = brancheSnapshot.val().branchAddress;
                result.push({ merchantName: merchantName, branchID: branchID, branchName: branchName, branchAddress: branchAddress });
            });
        });
        return result;
    });
    resolve(result);
}

// function to get all forecasted profit for selected subtypes
function getForecastProfitBySubtype(subtype) {
    var query = firebase.database().ref('forecastProfit').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        var forecastData = data.val().forecast;
        var expectedData = data.val().expected;

        result.push({ subtype: subtype, forecastData: forecastData, expectedData: expectedData });
        return result;
    });
    resolve(result);
}

// function to get all forecasted product for selected subtypes
function getForecastProductBySubtype(subtype) {
    var query = firebase.database().ref('forecastProduct').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var productData = snapshot.val();

            var itemName = snapshot.key;
            var forecastData = productData.forecast;
            var expectedData = productData.expected;

            result.push({ subtype: subtype, itemName: itemName, forecastData: forecastData, expectedData: expectedData });
        });
        return result;
    });
    resolve(result);
}

// function to get details of forecast data by selected product item
function getForecastProductByItem(subtype, itemName) {
    var query = firebase.database().ref('forecastProduct').child(subtype).child(itemName);
    return query.once('value').then(data => {
        var result = [];
        var productData = data.val();

        var forecastMaleData = productData.forecastMale;
        var forecastFemaleData = productData.forecastFemale;
        var expectedMaleData = productData.expectedMale;
        var expectedFemaleData = productData.expectedFemale;

        result.push({ itemName: itemName, forecastMaleData: forecastMaleData, forecastFemaleData: forecastFemaleData, expectedMaleData: expectedMaleData, expectedFemaleData: expectedFemaleData });
        return result;
    });
    resolve(result);
}

// function to get all forecasted branches for selected subtypes
function getForecastBranchBySubtype(subtype) {
    var query = firebase.database().ref('forecastBranch').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var branchData = snapshot.val();

            var branchName = snapshot.key;
            var forecastData = branchData.forecast;
            var expectedData = branchData.expected;

            result.push({ subtype: subtype, branchName: branchName, forecastData: forecastData, expectedData: expectedData });
        });
        return result;
    });
    resolve(result);
}

// function to get details of forecast data by selected branch
function getForecastBranchByBranchname(subtype, branchName) {
    var query = firebase.database().ref('forecastBranch').child(subtype).child(branchName);
    return query.once('value').then(data => {
        var result = [];
        var branchData = data.val();

        var forecastMaleData = branchData.forecastMale;
        var forecastFemaleData = branchData.forecastFemale;
        var expectedMaleData = branchData.expectedMale;
        var expectedFemaleData = branchData.expectedFemale;

        result.push({ branchName: branchName, forecastMaleData: forecastMaleData, forecastFemaleData: forecastFemaleData, expectedMaleData: expectedMaleData, expectedFemaleData: expectedFemaleData });
        return result;
    });
    resolve(result);
}

// function to get all market basket analysis data for selected subtype
function getMarketBasketBySubtype(subtype) {
    var query = firebase.database().ref('marketBasketAnalysis').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var mbaName = snapshot.key;
            var mbaConf = snapshot.val();

            result.push({ mbaName: mbaName, mbaConf: mbaConf });
        });
        return result;
    });
    resolve(result);
}

// function to get all chat rooms and its latest message
function getAllChatrooms() {
    var query = firebase.database().ref('chatrooms');
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var chatroomData = snapshot.val();
            var chatroomKey = snapshot.key;
            var date = chatroomData.date;
            var time = chatroomData.time;
            var sender = chatroomData.sender;
            var userName2 = chatroomData.userName2;
            var message = chatroomData.message;

            result.push({ chatroomID: chatroomKey, sender: sender, userName2: userName2, message: message, date: date, time: time });
        });
        return result;
    });
    resolve(result);
}

// function to get all chat details by chatroomID
function getChatDetailByChatroomID(chatroomID) {
    var query = firebase.database().ref('chats').child(chatroomID);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var chatData = snapshot.val();

            var date = chatData.date;
            var time = chatData.time;
            var message = chatData.message;
            var recipient = chatData.recipient;
            var sender = chatData.sender;

            result.push({ date: date, time: time, message: message, recipient: recipient, sender: sender });
        });
        return result;
    });
    resolve(result);
}

function getAllReceiptsOfParticularSubtype(subtype) {
    var query = firebase.database().ref('items').orderByChild('type').equalTo(subtype);
    return query.once('value').then(data => {

        var AllReceiptsForParticularSubtype = [];
        var brands = [];
        var products = [];
        var i = 0;
        var AllThings = []; //[AllReceiptsForParticularSubtype , brands , products] for returning multiple items

        data.forEach(snapshot => {

            var item = snapshot.val();

            var itemBrand = item.brand;
            var itemName = item.name;
            var itemType = item.type;
            var itemCategory = item.category;

            AllReceiptsForParticularSubtype.push({ name: itemName, brand: itemBrand, type: itemType, category: itemCategory });

            if (i == 0) {
                brands.push(itemBrand);
                products.push(itemName);
                ++i;
            } else {
                if (!(brands.includes(itemBrand))) {
                    brands.push(itemBrand);
                }

                if (!(products.includes(itemName))) {
                    products.push(itemName);
                }
                ++i;
            }



        });

        AllThings.push(AllReceiptsForParticularSubtype);
        AllThings.push(brands);
        AllThings.push(products);

        return AllThings;

    });

    resolve(AllThings);
}

function getTopProductsOfSubtype(subtype) {
    var query = firebase.database().ref('forecastProduct').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var productData = snapshot.val();
            var productName = snapshot.key;
            result.push({ productName: productName });
        });
        return result;
    });
    resolve(result);

}

function getTopBranchesOfSubtype(subtype) {
    var query = firebase.database().ref('forecastBranch').child(subtype);
    return query.once('value').then(data => {
        var result = [];
        data.forEach(snapshot => {
            var productData = snapshot.val();
            var branchName = snapshot.key;
            result.push({ branchName: branchName });
        });
        return result;
    });
    resolve(result);

}

function getDataForSingleTopProductOfSubtype(productName, subtype) {
    var query = firebase.database().ref('forecastProduct').child(subtype).child(productName);
    return query.once('value').then(data => {
        var Result = [];
        var forecastData = data.val().forecast;
        var expectedData = data.val().expected;
        var expectedMale = data.val().expectedMale;
        var expectedFemale = data.val().expectedFemale;
        var forecastMale = data.val().forecastMale;
        var forecastFemale = data.val().forecastFemale;



        Result.push({ forecastData: forecastData, expectedData: expectedData, expectedMale: expectedMale, forecastMale: forecastMale, expectedFemale: expectedFemale, forecastFemale: forecastFemale });
        return Result;
    });
    resolve(Result);
}

function getParticularBranchDetails(subtype, branchName) {

    var query = firebase.database().ref('forecastBranch').child(subtype).child(branchName);
    return query.once('value').then(data => {
        var Result = [];
        var forecastData = data.val().forecast;
        var expectedData = data.val().expected;
        var expectedMale = data.val().expectedMale;
        var expectedFemale = data.val().expectedFemale;
        var forecastMale = data.val().forecastMale;
        var forecastFemale = data.val().forecastFemale;



        Result.push({ forecastData: forecastData, expectedData: expectedData, expectedMale: expectedMale, forecastMale: forecastMale, expectedFemale: expectedFemale, forecastFemale: forecastFemale });
        return Result;
    });
    resolve(Result);

}
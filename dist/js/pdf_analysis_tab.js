var category;
var ritemlist;

var revenueOfForecastYearOfSubtype;
var revenueOfCurrentYearOfSubtype;

let pdf = false;
let declineProductsFlag = true;

function populatePDFTypeDropdown(){


    document.body.classList.add("loading");

    var catdropdown = document.getElementById("pdfMainCategory");
    category = catdropdown.options[catdropdown.selectedIndex].value;
    category = category.toLowerCase();

    // refresh subtype dropdown
    var typedropdown = document.getElementById("pdfSubCategory");
    typedropdown.options.length = 1;
    // set selected default to hint message
    typedropdown.selectedIndex = 0;

    //on

    ritemlist = [];
    var datasetarr = [];
    // get all receipt item ID which under selected category rather than all receipt item ID
    getAllReceiptItemIDByCategory(category).then((ritemIDlist) => {
        // get all related receipt item details
        let promiseKey = new Promise((resolve, reject) => {
            // loop through the IDs and get its detail
            for(var i = 0; i < ritemIDlist.length; i++){
                getReceiptItemByID(ritemIDlist[i].receiptItemID).then((ritem) => {
                    ritemlist.push(ritem);
                });
            }
            resolve(ritemlist);

        });

        promiseKey.then((ritemlist) => {
            getAllReceipts().then((receiptlist) => {
                var unique = [];
                // use Set for unique values, after mapping only the type of the objects
                // spread syntax ... for collecting the items in a new array
                unique = [...new Set(ritemlist.map(a => a.type))];
                for(var i = 0; i < unique.length; i++){
                    // add new drop down options for subtype according to selected category
                    var option = document.createElement("option");
                    option.text = capitalizeFirstLetter(unique[i]);
                    typedropdown.add(option);

                }

                document.body.classList.remove("loading");

            });
        });

    });
}


function generateReportContent()
{

    document.body.classList.add("loading");
    // get selected subtype
    let TopProductHeading1 = document.getElementById("TopProductHeading1");
    TopProductHeading1.innerHTML="";

    let TopProductHeading2 = document.getElementById("TopProductHeading2");
    TopProductHeading2.innerHTML="";

    let TopProductContent1 = document.getElementById("TopProductContent1");
    TopProductContent1.innerHTML = "";

    let TopProductContent2 = document.getElementById("TopProductContent2");
    TopProductContent2.innerHTML = "";

    let DecProductHeading1 = document.getElementById("DecProductHeading2");
    DecProductHeading1.innerHTML = "";

    let DecProductHeading2 = document.getElementById("DecProductHeading3");
    DecProductHeading2.innerHTML = "";

    let DecProductContent1 = document.getElementById("DecProductContent2");
    DecProductContent1.innerHTML="";

    let DecProductContent2 = document.getElementById("DecProductContent3");
    DecProductContent2.innerHTML="";


    let branchesList = document.getElementById("branchesList");
    branchesList.innerHTML = "";

    let DecliningProductsStatement = document.getElementById("DecliningProductsStatement");
    DecliningProductsStatement.innerHTML="";




    pdf = false;
    var dropdown = document.getElementById("pdfSubCategory");
    var subtype = dropdown.options[dropdown.selectedIndex].value;
    subtype = subtype.toLowerCase();


    let NumberOfTopProducts = 0;
    let NumberOfTopBranches = 0;

    getTopProductsOfSubtype(subtype).then((topProducts) => {


        for(let i=0;i<topProducts.length;i++) {

            ++NumberOfTopProducts;


        }

        getTopBranchesOfSubtype(subtype).then((topBranches)=>{

            for(let i=0;i<topBranches.length;i++) {

                ++NumberOfTopBranches;

            }

            writePdfContent(topProducts,NumberOfTopProducts,subtype,topBranches);



        });



    });













}


function writePdfContent(topProducts,NumberOfTopProducts,subtype,topBranches) {



    let Highlights = document.getElementById("HighLights");
    Highlights.innerHTML = "";

    let Breakline = document.createElement("h1");
    Breakline.innerHTML="";
    Breakline.innerHTML = "<br><br>";


    let List = document.createElement("ul");
    List.innerHTML="";

    getForecastProfitBySubtype(subtype).then((arr) => {




        let labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        let amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // group forecasted and current year profit by month
        for(let i = 0; i < arr.length; i++){
            for (let key in arr[i].forecastData) {
                let month = key;
                let item = arr[i].forecastData[key];
                amountData[month - 1] = item;
            }

            for (let key in arr[i].expectedData) {
                let month = key;
                let item = arr[i].expectedData[key];
                expectedData[month - 1] = item;
            }


        }

        let TotalSubtypeRevenueCurrent = expectedData.reduce((a, b) => a + b, 0);
        let TotalSubtypeRevenueForecast = amountData.reduce((a, b) => a + b, 0);



        getParticularBranchDetails(subtype,topBranches[0].branchName).then((arr1)=>{

            let amountDataBranch = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let expectedDataBranch = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for(let i = 0; i < arr1.length; i++)
            {
                for (let key in arr1[i].forecastData) {
                    let month = key;
                    let item = arr1[i].forecastData[key];
                    amountDataBranch[month - 1] = item;
                }

                for (let key in arr1[i].expectedData) {
                    let month = key;
                    let item = arr1[i].expectedData[key];
                    expectedDataBranch[month - 1] = item;
                }


            }



            let subcategroryRevenueOfLast2Quarters = expectedData[0]+expectedData[1]+expectedData[2]+expectedData[3]+expectedData[4]+expectedData[5];
            let subcategroryRevenueOfNext2Quarters = expectedData[6]+expectedData[6]+expectedData[8]+expectedData[9]+expectedData[10]+expectedData[11];


            let point1 = document.createElement("li");
            point1.innerHTML="";
            point1.innerHTML = "Subcategory "+subtype+" has a total current revenue of (SGD)"+subcategroryRevenueOfLast2Quarters.toFixed(2).toString()+" in " +
                "last two quarters.<br>";

            List.appendChild(point1);


            if(subcategroryRevenueOfLast2Quarters > subcategroryRevenueOfNext2Quarters)
            {
                let point2 = document.createElement("li");
                point2.innerHTML ="";
                point2.innerHTML = "Subcategory "+subtype+" is forecast to decrease in sales during the next two quarters.<br>";
                List.appendChild(point2);

            }
            else
            {
                let point2 = document.createElement("li");
                point2.innerHTML ="";
                point2.innerHTML = "Subcategory "+subtype+" is forecast to increase in sales during the next two quarters.<br>";
                List.appendChild(point2);

            }

            let branchRevenueCurrent = expectedDataBranch.reduce((a, b) => a + b, 0);
            let branchRevenueForecast = expectedDataBranch.reduce((a, b) => a + b, 0);

            let percent =  ((branchRevenueCurrent*100)/(expectedData.reduce((a, b) => a + b, 0)));

            if(branchRevenueCurrent > branchRevenueForecast)
            {
                let point3 = document.createElement("li");
                point3.innerHTML = "";
                point3.innerHTML = ""+topBranches[0].branchName+" is  the top branch in selling "+subtype+" in Singapore. " +
                    "This branch has a total sales of (SGD)"+branchRevenueCurrent+" in the current year which " +
                    "is "+percent.toFixed(2).toString()+"% of the total sales. " +
                    "The forecast to this branch is expected to be increased in the next two quarters.<br>";
                List.appendChild(point3);

            }
            else
            {

                let point3 = document.createElement("li");
                point3.innerHTML = "";
                point3.innerHTML = ""+topBranches[0].branchName+" is  the top branch in selling "+subtype+" in Singapore. " +
                    "This branch has a total sales of (SGD)"+branchRevenueCurrent+" in current year which " +
                    "is "+percent.toFixed(2).toString()+"% of total sales. " +
                    "The forecast to this branch is expected to be increased in the next two quarters.<br>";
                List.appendChild(point3);


            }

            if(NumberOfTopProducts==1)
            {
                getDataForSingleTopProductOfSubtype(topProducts[0].productName,subtype).then((arr3)=>{

                    let amountDataProduct = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    let expectedDataProduct = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    for(let i = 0; i < arr3.length; i++)
                    {
                        for (let key in arr3[i].forecastData) {
                            let month = key;
                            let item = arr3[i].forecastData[key];
                            amountDataProduct[month - 1] = item;
                        }

                        for (let key in arr3[i].expectedData) {
                            let month = key;
                            let item = arr3[i].expectedData[key];
                            expectedDataProduct[month - 1] = item;
                        }

                    }

                    let revenueProduct = expectedDataProduct.reduce((a, b) => a + b, 0);
                    let point4 = document.createElement("li");
                    point4.innerHTML = "";
                    point4.innerHTML = ""+topProducts[0].productName+" is the top product accumulating "+((revenueProduct*100)/(expectedData.reduce((a, b) => a + b, 0))).toFixed(2).toString()+"% " +
                        "of the total sales.<br>";

                    let point5 = document.createElement("li");
                    point5.innerHTML = "";
                    point5.innerHTML = "The subcategory "+subtype+" has no declining products.<br>";

                    declineProductsFlag = false;

                    List.appendChild(point4);

                    List.appendChild(point5);

                    Highlights.appendChild(List);

                    writeProducts(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype);
                    document.body.classList.remove("loading");

                });
            }
            else {

                declineProductsFlag = true;
                getDataForSingleTopProductOfSubtype(topProducts[0].productName, subtype).then((arr3) => {

                    let amountDataProduct = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    let expectedDataProduct = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    for (let i = 0; i < arr3.length; i++) {
                        for (let key in arr3[i].forecastData) {
                            let month = key;
                            let item = arr3[i].forecastData[key];
                            amountDataProduct[month - 1] = item;
                        }

                        for (let key in arr3[i].expectedData) {
                            let month = key;
                            let item = arr3[i].expectedData[key];
                            expectedDataProduct[month - 1] = item;
                        }

                    }

                    let revenueProduct = expectedDataProduct.reduce((a, b) => a + b, 0);
                    let point4 = document.createElement("li");
                    point4.innerHTML = "";
                    point4.innerHTML = "" + topProducts[0].productName + " is the top product accumulating " + ((revenueProduct * 100) / (expectedData.reduce((a, b) => a + b, 0))).toFixed(2).toString() + "% " +
                        "of the total sales.<br>";

                    List.appendChild(point4);



                    getDataForSingleTopProductOfSubtype(topProducts[2].productName, subtype).then((arr4) => {

                        let amountDataProduct1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        let expectedDataProduct1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                        for (let i = 0; i < arr4.length; i++) {
                            for (let key in arr4[i].forecastData) {
                                let month = key;
                                let item = arr4[i].forecastData[key];
                                amountDataProduct1[month - 1] = item;
                            }

                            for (let key in arr4[i].expectedData) {
                                let month = key;
                                let item = arr4[i].expectedData[key];
                                expectedDataProduct1[month - 1] = item;
                            }

                        }


                        let revenueOfDeclineProduct = expectedDataProduct1[0]+expectedDataProduct1[1]+expectedDataProduct1[2]+expectedDataProduct1[3]+expectedDataProduct1[4]+expectedDataProduct1[5];
                        let point5 = document.createElement("li");
                        point5.innerHTML = "";
                        point5.innerHTML = ""+topProducts[2].productName+" is the least sold product with  the revenue of (SGD)"+revenueOfDeclineProduct.toFixed(2).toString()+" because its sales will decline in the next two quarters.<br>";
                        List.appendChild(point5);

                        Highlights.appendChild(List);
                        writeProducts(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype);
                        document.body.classList.remove("loading");



                    });




                });
            }


        });

    });

}


function writeProducts(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype)
{

    if(declineProductsFlag==false)
    {

        getDataForSingleTopProductOfSubtype(topProducts[0].productName,subtype).then((arr1)=>{


            let amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            let amountDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let expectedDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            let amountDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let expectedDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


            for(let i = 0; i < arr1.length; i++)
            {
                for (let key in arr1[i].forecastData) {
                    let month = key;
                    let item = arr1[i].forecastData[key];
                    amountData[month - 1] = item;
                }

                for (let key in arr1[i].expectedData) {
                    let month = key;
                    let item = arr1[i].expectedData[key];
                    expectedData[month - 1] = item;
                }


            }

            for(let i = 0; i < arr1.length; i++)
            {
                for (let key in arr1[i].forecastMale) {
                    let month = key;
                    let item = arr1[i].forecastMale[key];
                    amountDataMale[month - 1] = item;
                }

                for (let key in arr1[i].expectedMale) {
                    let month = key;
                    let item = arr1[i].expectedMale[key];
                    expectedDataMale[month - 1] = item;
                }


            }

            for(let i = 0; i < arr1.length; i++)
            {
                for (let key in arr1[i].forecastFemale) {
                    let month = key;
                    let item = arr1[i].forecastFemale[key];
                    amountDataFemale[month - 1] = item;
                }

                for (let key in arr1[i].expectedFemale) {
                    let month = key;
                    let item = arr1[i].expectedFemale[key];
                    expectedDataFemale[month - 1] = item;
                }


            }



            let TopProductHeading1 = document.getElementById("TopProductHeading1");
            TopProductHeading1.innerHTML="";
            TopProductHeading1.innerHTML="<b><u>"+topProducts[0].productName+"</u></b>";

            let malePercentCurrent = ((expectedDataMale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
            let malePercentforecast = ((amountDataMale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));


            let femalePercentCurrent = ((expectedDataFemale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
            let femalePercentforecast = ((amountDataFemale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));



            let lastQuarterSales = expectedData[0]+expectedData[1]+expectedData[2]+expectedData[3]+expectedData[4]+expectedData[5];
            let IncreasePercent = (((lastQuarterSales+100)-lastQuarterSales)*100)/(lastQuarterSales+100);

            let TopProductContent1 = document.getElementById("TopProductContent1");
            TopProductContent1.innerHTML = "";
            TopProductContent1.innerHTML = "This product has the highest sales in "+topBranches[0].branchName+" in the last " +
                "two quarters. This sales accumulates a total of "+(((expectedData.reduce((a, b) => a + b, 0))*100) / TotalSubtypeRevenueCurrent).toFixed(2).toString()+"%. The last " +
                " two quarters sales is (SGD)"+lastQuarterSales.toFixed(2).toString()+" and the expected sales of this product in the next two quarters is " +
                "(SGD)"+(lastQuarterSales+100).toFixed(2).toString()+", which has an increase of "+IncreasePercent.toFixed(2).toString()+"" +
                "% . Mostly this product is bought by "+malePercentCurrent.toFixed(2).toString()+"% of males and "+femalePercentCurrent.toFixed(2).toString()+"% females." +
                " In future, it is predicted that this product will be bought by "+malePercentforecast.toFixed(2).toString()+"% of males " +
                "and "+femalePercentforecast.toFixed(2).toString()+"% of females.";

            let DecliningProductsStatement = document.getElementById("DecliningProductsStatement");
            DecliningProductsStatement.innerHTML = "The subcategory has no declining products.";

        });


        writebranches(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype)
    }
    else
    {
        for(let k=0;k<2;k++)
        {
            getDataForSingleTopProductOfSubtype(topProducts[k].productName,subtype).then((arr1)=>{


                let amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                let amountDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                let amountDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastData) {
                        let month = key;
                        let item = arr1[i].forecastData[key];
                        amountData[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedData) {
                        let month = key;
                        let item = arr1[i].expectedData[key];
                        expectedData[month - 1] = item;
                    }


                }

                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastMale) {
                        let month = key;
                        let item = arr1[i].forecastMale[key];
                        amountDataMale[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedMale) {
                        let month = key;
                        let item = arr1[i].expectedMale[key];
                        expectedDataMale[month - 1] = item;
                    }


                }

                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastFemale) {
                        let month = key;
                        let item = arr1[i].forecastFemale[key];
                        amountDataFemale[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedFemale) {
                        let month = key;
                        let item = arr1[i].expectedFemale[key];
                        expectedDataFemale[month - 1] = item;
                    }


                }



                let TopProductHeading1 = document.getElementById("TopProductHeading"+(k+1).toString());
                TopProductHeading1.innerHTML="";
                TopProductHeading1.innerHTML="<b><u>"+topProducts[k].productName+"</u></b>";

                let malePercentCurrent = ((expectedDataMale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
                let malePercentforecast = ((amountDataMale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));


                let femalePercentCurrent = ((expectedDataFemale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
                let femalePercentforecast = ((amountDataFemale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));



                let lastQuarterSales = expectedData[0]+expectedData[1]+expectedData[2]+expectedData[3]+expectedData[4]+expectedData[5];
                let IncreasePercent = (((lastQuarterSales+100)-lastQuarterSales)*100)/(lastQuarterSales+100);

                let TopProductContent1 = document.getElementById("TopProductContent"+(k+1).toString());
                TopProductContent1.innerHTML = "";
                TopProductContent1.innerHTML = "This product has the highest sales in "+topBranches[k].branchName+" in the last " +
                    "two quarters. This sales accumulates a total of "+(((expectedData.reduce((a, b) => a + b, 0))*100) / TotalSubtypeRevenueCurrent).toFixed(2).toString()+"%. The last " +
                    " two quarters sales is (SGD)"+lastQuarterSales.toFixed(2).toString()+" and the expected sales of this product in the next two quarters is " +
                    "(SGD)"+(lastQuarterSales+100).toFixed(2).toString()+", which has an increase of "+IncreasePercent.toFixed(2).toString()+"" +
                    "% . Mostly this product is bought by "+malePercentCurrent.toFixed(2).toString()+"% of males and "+femalePercentCurrent.toFixed(2).toString()+"% females." +
                    " In future it is predicted that this product will be bought by "+malePercentforecast.toFixed(2).toString()+"% of males " +
                    "and "+femalePercentforecast.toFixed(2).toString()+"% of females.";

            });
        }


        //declining products

        let DecliningProductsStatement = document.getElementById("DecliningProductsStatement");
        DecliningProductsStatement.innerHTML = "The sales of these products are expected to decline in the upcoming two quarters, therefore you must " +
            "apply some counter-measures to ensure productivity in the near future.";

        for(let k=2;k<4;k++)
        {
            getDataForSingleTopProductOfSubtype(topProducts[k].productName,subtype).then((arr1)=>{


                let amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                let amountDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedDataMale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                let amountDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let expectedDataFemale = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastData) {
                        let month = key;
                        let item = arr1[i].forecastData[key];
                        amountData[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedData) {
                        let month = key;
                        let item = arr1[i].expectedData[key];
                        expectedData[month - 1] = item;
                    }


                }

                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastMale) {
                        let month = key;
                        let item = arr1[i].forecastMale[key];
                        amountDataMale[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedMale) {
                        let month = key;
                        let item = arr1[i].expectedMale[key];
                        expectedDataMale[month - 1] = item;
                    }


                }

                for(let i = 0; i < arr1.length; i++)
                {
                    for (let key in arr1[i].forecastFemale) {
                        let month = key;
                        let item = arr1[i].forecastFemale[key];
                        amountDataFemale[month - 1] = item;
                    }

                    for (let key in arr1[i].expectedFemale) {
                        let month = key;
                        let item = arr1[i].expectedFemale[key];
                        expectedDataFemale[month - 1] = item;
                    }


                }



                let TopProductHeading1 = document.getElementById("DecProductHeading"+(k).toString());
                TopProductHeading1.innerHTML="";
                TopProductHeading1.innerHTML="<b><u>"+topProducts[k].productName+"</u></b>";

                let malePercentCurrent = ((expectedDataMale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
                let malePercentforecast = ((amountDataMale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));


                let femalePercentCurrent = ((expectedDataFemale.reduce((a, b) => a + b, 0))*100)/((expectedDataMale.reduce((a, b) => a + b, 0))+(expectedDataFemale.reduce((a, b) => a + b, 0)));
                let femalePercentforecast = ((amountDataFemale.reduce((a, b) => a + b, 0))*100)/((amountDataMale.reduce((a, b) => a + b, 0))+(amountDataFemale.reduce((a, b) => a + b, 0)));



                let lastQuarterSales = expectedData[0]+expectedData[1]+expectedData[2]+expectedData[3]+expectedData[4]+expectedData[5];
                let IncreasePercent = (((lastQuarterSales+100)-lastQuarterSales)*100)/(lastQuarterSales+100);

                let TopProductContent1 = document.getElementById("DecProductContent"+(k).toString());
                TopProductContent1.innerHTML = "";
                TopProductContent1.innerHTML = "This product has the least sales in "+topBranches[k].branchName+" in the last " +
                    "two quarters. This sales accumulates a total of "+(((expectedData.reduce((a, b) => a + b, 0))*100) / TotalSubtypeRevenueCurrent).toFixed(2).toString()+"%. The last " +
                    " two quarters sales is (SGD)"+lastQuarterSales.toFixed(2).toString()+" and the forecast sales of this product " +
                    "is expected to be (SGD)"+(lastQuarterSales-100).toFixed(2).toString()+", which has a decrease of "+IncreasePercent.toFixed(2).toString()+"" +
                    "% . Mostly this product is bought by "+malePercentCurrent.toFixed(2).toString()+"% of males and "+femalePercentCurrent.toFixed(2).toString()+"% females." +
                    " In future, it is expected that these products will be bought by "+malePercentforecast.toFixed(2).toString()+"% of males " +
                    "and "+femalePercentforecast.toFixed(2).toString()+"% of females.";

                if(malePercentCurrent>malePercentforecast)
                {
                    TopProductContent1.innerHTML += " As the forecast of male percentage is declining in the upcoming quarters, therefore your " +
                        "target audience must involve a high ratio of male customers in order to increase product sales.";
                }
                if(femalePercentCurrent>femalePercentforecast)
                {
                    TopProductContent1.innerHTML += " As the forecast female percentage is declining in the upcoming quarters, therefore your " +
                        "target audience must involve a high ratio of female customers in order to increase the product sales."
                }


            });
        }

        writebranches(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype);

    }

}


function writebranches(TotalSubtypeRevenueCurrent,TotalSubtypeRevenueForecast,topProducts,topBranches,subtype)
{
    let branchesList = document.getElementById("branchesList");

    for(let k=0;k<topBranches.length;k++)
    {

        getParticularBranchDetails(subtype,topBranches[k].branchName).then((arr1)=>{

            let amountData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let expectedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for(let i = 0; i < arr1.length; i++)
            {
                for (let key in arr1[i].forecastData) {
                    let month = key;
                    let item = arr1[i].forecastData[key];
                    amountData[month - 1] = item;
                }

                for (let key in arr1[i].expectedData) {
                    let month = key;
                    let item = arr1[i].expectedData[key];
                    expectedData[month - 1] = item;
                }


            }

            let revenue = expectedData.reduce((a, b) => a + b, 0);

            if(revenue!=0)
            {
                let li = document.createElement("li");
                li.innerHTML = "";
                li.innerHTML = topBranches[k].branchName+" with the total revenue of (SGD)"+revenue.toFixed(2).toString()+".<br>";
                branchesList.appendChild(li);

            }





        });
    }

    pdf = true;

}

function downloadPDF() {


    var informationElement =  document.getElementById("Report");

    if(pdf)
    {
        var opt = {
            margin:       1,
            filename:     'Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a3', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(informationElement).save()

    }

}




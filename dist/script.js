document.addEventListener("DOMContentLoaded",load);

function load() {

   var btn = document.getElementById("btn");

   btn.addEventListener("click",show);


}

function show() {

    var token = setTimeout(show2,5000);
    document.body.className = "loading";

}

function show2() {

    document.getElementById("ctn").innerHTML = "Hello";
    document.body.className= "";
}
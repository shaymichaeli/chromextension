/**
 * Created by shay on 05/10/2016.
 */

var url = document.location.hostname;

window.addEventListener("load", function() {
    chrome.extension.sendMessage({
        type: "dom-loaded",
        data: {
            myProperty: url
        }
    });
}, true);

/*
 chrome.history.onVisited.addListener(function(result) {
 if (result.url == url) {
 alert("My message");
 }
 else {
 alert("Your message");
 }
 })*/




//Test for browser compatibility
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("schedule", "0.1", "my time", 1024 * 1024);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS track (id INTEGER PRIMARY KEY ASC, Web TEXT, time TIME)");
    });


} else {
    alert("WebSQL is not supported by your browser!");
}

//function to output the list of cars in the database
/*
 function updateCarList(transaction, results) {
 //initialise the listitems variable
 var listitems = "";
 //get the car list holder ul
 var listholder = document.getElementById("carlist");

 //clear cars list ul
 listholder.innerHTML = "";

 var i;
 //Iterate through the results
 for (i = 0; i < results.rows.length; i++) {
 //Get the current row
 var row = results.rows.item(i);

 listholder.innerHTML += "<li>" + row.make + " - " + row.model + " (<a href='javascript:void(0);' onclick='deleteCar(" + row.id + ");'>Delete Car</a>)";
 }

 }

 //function to get the list of cars from the database

 function outputCars() {
 //check to ensure the mydb object has been created
 if (mydb) {
 //Get all the cars from the database with a select statement, set outputCarList as the callback function for the executeSql command
 mydb.transaction(function (t) {
 t.executeSql("SELECT * FROM cars", [], updateCarList);
 });
 } else {
 alert("db not found, your browser does not support web sql!");
 }
 }
 */
//function to add the car to the database

function addCar(url) {
    //check to ensure the mydb object has been created
    if (mydb) {
        //Insert the user entered details into the cars table, note the use of the ? placeholder, these will replaced by the data passed in as an array as the second parameter
        mydb.transaction(function (t) {
            t.executeSql("INSERT INTO track (Web,time) VALUES (?,?)", [url,new Date().toDateString()]);
            //outputCars();
        });
    } else {
        alert("db not found, your browser does not support web sql!");
    }
}

/*
 //function to remove a car from the database, passed the row id as it's only parameter

 function deleteCar(id) {
 //check to ensure the mydb object has been created
 if (mydb) {
 //Get all the cars from the database with a select statement, set outputCarList as the callback function for the executeSql command
 mydb.transaction(function (t) {
 t.executeSql("DELETE FROM cars WHERE id=?", [id], outputCars);
 });
 } else {
 alert("db not found, your browser does not support web sql!");
 }
 }
 */


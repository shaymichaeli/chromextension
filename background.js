/**
 * Created by shay on 03/10/2016.
 */



//Test for browser compatibility
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("schedule", "0.1", "my time", 1024 * 1024);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY ASC, url TEXT, start TIME, end TIME, timer INTEGER, tabsCount INTEGER)");
    });


} else {
    alert("WebSQL is not supported by your browser!");
}




function addUrl(url) {
    //check to ensure the mydb object has been created
    if (mydb) {
        //Insert the user entered details into the cars table, note the use of the ? placeholder, these will replaced by the data passed in as an array as the second parameter
        mydb.transaction(function (t) {
            t.executeSql("INSERT INTO tracks (url,start,end,timer,tabsCount) VALUES (?,?,?,?,?)", [url,new Date().getTime(),new Date().getTime(),0,1]);
            console.log("addUrl-SUCCESS");    
    });
    } else {
        alert("db not found, your browser does not support web sql!");
    }
}

function updateUrl(rUrl) {

    if (mydb) {
        //Insert the user entered details into the cars table, note the use of the ? placeholder, these will replaced by the data passed in as an array as the second parameter
        mydb.transaction(function (t) {
            var now = new Date().getTime();
            t.executeSql("UPDATE tracks SET end = ?, tabsCount = ? WHERE url = ?",[now,0,rUrl]);
        console.log("updateUrl-SUCCESS");
        });
    } else {
        alert("db not found, your browser does not support web sql!");
    }
    
}




chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "dom-loaded":
            console.log("dom-loaded");
            addUrl(request.data.myProperty);
            break;
        case "dom-unloaded":
            console.log("dom-unloaded");
            updateUrl(request.data.myProperty);
            break;
    }
    return true;
});


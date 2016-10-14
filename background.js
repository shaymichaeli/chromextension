/**
 * Created by shay on 03/10/2016.
 */


//Test for browser compatibility
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("schedule", "0.1", "my time", 1024 * 1024);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS tracks1 (id INTEGER PRIMARY KEY ASC, url TEXT, start TIME, end TIME, timer INTEGER, activeFlag BOOLEAN)");
    });


} else {
    alert("WebSQL is not supported by your browser!");
}

/******
 * check if a certain url is already in the database
 * @param url - the url of the page we want to check if in table
 * @return true if inside table or false if not
 */
function isExisted(url) {
    var flag;
    mydb.transaction(function (tx) {
        var flag = tx.executeSql('SELECT * FROM tracks1 WHERE url = ?', [url], function (tx, results) {
            if (results.rows.length == 0) {
                console.log("I know there is no such url");
                return false;
            }
            else {
                console.log("Yeah the url exists!");
                return true;
            }
        }, null);
    });
    return flag;
}

/******
 * adding or updating a url to the table. first we calculate the timer for the last active url and than
 * if the url exists - update new start time for the current url
 * if the url doesn't exist - add it to the table with initial values
 * @param url - the url of the page we want to insert or update to the table
 */
function addUrl(url) {
    if (mydb) { //check to ensure the mydb object has been created

        mydb.transaction(function (tx) {
            tx.executeSql('SELECT * FROM tracks1 WHERE activeFlag = ?', [true], function (tx, results) {
                if (results.rows.length > 0) {
                    mydb.transaction(function (t) {
                        var newTimer, curTime;
                        curTime = new Date().getTime();
                        newTimer = results.rows.item(0).timer + curTime - results.rows.item(0).start;
                        t.executeSql("UPDATE tracks1 SET end = ?, timer = ?, activeFlag = ? WHERE activeFlag = ?", [curTime, newTimer, false, true]);
                    });
                }
            });
            }, null);

        mydb.transaction(function (tx) {
            tx.executeSql('SELECT * FROM tracks1 WHERE url = ?', [url], function (tx, results) {
                if (results.rows.length == 0) {         // means the url not exists
                    mydb.transaction(function (t) {
                        t.executeSql("INSERT INTO tracks1 (url,start,end,timer,activeFlag) VALUES (?,?,?,?,?)", [url, new Date().getTime(), 0, 0, true]);
                        console.log("addUrl-SUCCESS");
                    });
                }
                else {                                  // means the url exists
                    var newTimer, curTime;
                    curTime = new Date().getTime();
                    newTimer = results.rows.item(0).timer + curTime - results.rows.item(0).start;
                    mydb.transaction(function (t) {
                        t.executeSql("UPDATE tracks1 SET start = ?, end = ?, activeFlag = ? WHERE url = ?",[curTime,0,true,url]);
                    });
                }
            }, null);
        });

    } else {
        alert("db not found, your browser does not support web sql!");
    }
}


/******
 * execute the changeTab.js script inside the active Tab!
 * see changeTab.js for details
 */
chrome.tabs.executeScript(null, {file:'changeTab.js'});

/******
 * receiving the messages from the content scripts whenever a new page was loaded or tab changed
 * if so - updating the table accordingly
 */
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "dom-loaded":
            console.log("dom-loaded");
            addUrl(request.data.myProperty);
            break;
     //   case "dom-unloaded":
     //       console.log("dom-unloaded");
     //       updateUrl(request.data.myProperty);
     //       break;
    }
    return true;
});


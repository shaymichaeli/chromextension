/**
 * Created by shay on 03/10/2016.
 */

//Global vars
var records = [];
const LAST_INDEX = -1;
const MILLISECOND = 1000;
var columns = ["ID","Color","Web","Time spent"];
var colors = ["rgba(26, 188, 156,1.0)","rgba(46, 204, 113,1.0)","rgba(52, 152, 219,1.0)", 
              "rgba(155, 89, 182,1.0)","rgba(52, 73, 94,1.0)","rgba(241, 196, 15,1.0)",
              "rgba(230, 126, 34,1.0)","rgba(231, 76, 60,1.0)","rgba(236, 240, 241,1.0)",
              "rgba(149, 165, 166,1.0)","#e91e63","#795548"
            ]; 
//turquoise,emerald,blue,purple,dark grey,yellow,orange,red,clouds,light grey,pink.

/**
 * Variables of data table, and pie canvas. 
 */
var canvas = document.getElementById("pieCanvas");
var ctx = canvas.getContext("2d");
var table = document.getElementById("dataTable");


function createTableHead(table, columns)
{
    var nOfCol = columns.length;
    var header = table.createTHead();
    var tr = header.insertRow(0);
    for(var i =0;i<nOfCol;i++)
    {
        var cell = document.createElement("TH");
        cell.innerHTML = columns[i];
        tr.appendChild(cell);
    }
}

function createTableBody(table, data)
{
    var nOfRows = data.length;
    //console.log(nOfRows);
    var properties = Object.getOwnPropertyNames(data[0]);
    properties.unshift("ID","color");
    var nOfCols = properties.length;
    for(var i =0;i<nOfRows;i++)
    {
        var tr = table.insertRow(LAST_INDEX);
        data[i].color = colors[i];
        data[i].timer /= MILLISECOND;
        for(var j=0;j<nOfCols;j++)
        {
            if(0 == j)
            {
                 tr.insertCell(LAST_INDEX).innerHTML = (i+1);
                 continue;
            } ;
            if(1 == j)
            {
                var td = tr.insertCell(LAST_INDEX);
                td.innerHTML = "&#9632";
                td.style.color = data[i]["color"];
                continue;   
            }
            tr.insertCell(LAST_INDEX).innerHTML = data[i][properties[j]];
        }
    }
}


function drawDataPie(canvas,data)
{
    var lastend = 0;
    var myTotal = 0; 

    for (var e = 0; e < data.length; e++)
    {
        myTotal += data[e]["timer"];
    }
    for (var i = 0; i < data.length; i++) 
    {
        ctx.fillStyle = data[i]["color"];
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, lastend, lastend + (Math.PI * 2 * (data[i]["timer"] / myTotal)), false);
        //ctx.lineTo(0, 0);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.fill();
        lastend += Math.PI * 2 * (data[i]["timer"] / myTotal);
    }
}




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
 * Retrieving all records from database and pushes every record as an object to 
 * the global 'records' array variable, then executing a callback function.
 * (Limit to number of records and offset feature still isnt included.)
 * @param limit - limits the number of records returned by sql.
 * @param offset - sets the initial id to retrieve records from.
 * @param callback - the function to execute, after data retrieval is done.
 */
function retrieveData(limit,offset,callback)
{
    mydb.transaction(function (tx) 
    {
         tx.executeSql('SELECT url,timer FROM tracks1',[],function(tx,results)
         {
             var nOfRec = results.rows.length;
             for(var i = 0 ; i < nOfRec ; i ++)
             {
                records.push(results.rows[i]) ;
             }  
             callback();         
         });
    });

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




createTableHead(table,columns);
retrieveData(null,null, function(){
createTableBody(table,records);
drawDataPie(canvas,records);
});






/**
 * Created by shay on 05/10/2016.
 */

var url = document.location.hostname;

window.addEventListener("load", function() {
      console.log("load");
    chrome.extension.sendMessage({
        type: "dom-loaded",
        data: {
            myProperty: url
        }
    });
}, true);

window.addEventListener("beforeunload", function() {
    console.log("beforeunload");
    chrome.extension.sendMessage({
        type: "dom-unloaded",
        data: {
            myProperty: url
        }
    });
}, true);







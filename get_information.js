/**
 * Created by shay on 05/10/2016.
 */

var url = document.location.hostname;

/******
 * sending a message from the content scripts to the background whenever a new page was loaded
 */
window.addEventListener("load", function() {
    console.log("load");
    chrome.extension.sendMessage({
        type: "dom-loaded",
        data: {
            myProperty: url
        }
    });
}, true);

/******
 * sending a message from the content scripts to the background whenever a new page was un-loaded
 *           (not sure if needed)
 */
window.addEventListener("beforeunload", function() {
    console.log("beforeunload");
    chrome.extension.sendMessage({
        type: "dom-unloaded",
        data: {
            myProperty: url
        }
    });
}, true);

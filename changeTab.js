/**
 * Created by shay on 13/10/2016.
 */

/******
 * getting the url hostname and send "dom-loaded" to the background with the url
 */
var url = document.location.hostname;
chrome.extension.sendMessage({
    type: "dom-loaded",
    data: {
        myProperty: url
    }
});
var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

if (system.args.length === 3) {
console.log('Usage: snap.js ');
phantom.exit();
}

var url = system.args[1];
var image_name = system.args[3];
var view_port_width = system.args[2];
var current_requests = 0;
var last_request_timeout;
var final_timeout;
var scrollStepInterval;

var winHeight = 1000,
scrollDelay = 2000,
isPostDocumentLoaded = false,
stepCountTotal=0,
stepCount=0;

// the scrollStep function scrolls the window with a delay between scrolls
// the scrolls will trigger more images loading and the page.onResourceRecieved method will start triggering the debounce method
var scrollStepIntervalFunction = function(){
stepCount ++;
var scrollY = stepCount * winHeight;
var result = page.evaluate(function(scrollY) { $(document).scrollTop(scrollY); return scrollY; }, scrollY);

if(stepCount == stepCountTotal) {
console.log("stepCountTotal : "+ stepCountTotal);
isPostDocumentLoaded = true;
debounced_render();
clearInterval(scrollStepInterval);
}
}

page.viewportSize = { width: view_port_width, height: winHeight};
page.settings = { loadImages: true, javascriptEnabled: true };

// If you want to use additional phantomjs commands, place them here
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.17';

page.onResourceRequested = function(req) {
current_requests += 1;
};

page.onResourceReceived = function(res) {
if (res.stage === 'end') {
current_requests -= 1;
// only start using the debounce_render function after the document has loaded and the scrolling has started
if(isPostDocumentLoaded) {
debounced_render();
}
}
};

page.onLoadFinished = function(status) {
var docHeight = page.evaluate(function() { return document.documentElement.scrollHeight; });
stepCountTotal = Math.floor(docHeight / winHeight) + 1;
scrollStepInterval = setInterval(scrollStepIntervalFunction, scrollDelay);
};

page.open(url, function(status) {
if (status !== 'success') {
console.log('Error with page ' + url);
phantom.exit();
}
});

function debounced_render() {
clearTimeout(last_request_timeout);
clearTimeout(final_timeout);

// If there's no more ongoing resource requests, wait for 1 second before
// rendering, just in case the page kicks off another request
if (current_requests < 1) {
clearTimeout(final_timeout);
last_request_timeout = setTimeout(function() {
console.log('Snapping ' + url + ' at width ' + view_port_width);
page.render(image_name);
phantom.exit();
}, 2000);
}

// Sometimes, straggling requests never make it back, in which
// case, timeout after 5 seconds and render the page anyway
final_timeout = setTimeout(function() {
console.log('Snapping ' + url + ' at width ' + view_port_width);
page.render(image_name);
phantom.exit();
}, 4000);
}

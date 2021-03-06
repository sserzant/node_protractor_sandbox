var http = require("http");
var url = require("url");

// // anonymous function is used by default as first and only parameter of createServer()
// http.createServer(function(request, response) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.write("Hello World");
//     response.end();
// }).listen(8888);
//
// // it can be assigned to var and var can be passed to createServer()
// var onRequest = function(request, response) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.write("Hello World");
//     response.end();
// }; // NB! must terminate assignment operation, yay @ IDEA
// http.createServer(server).listen(8888);


function start(route, handle) { // DI. Expecting route function and object of url<->function mapping

    // or we can simply name this function and pass its name
    // can't move this into own first level scope, because otherwise we can't pass route
    function onRequest(request, response) { // request and response are returned on each received request
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received");

        // Looks like we will have to pass the request object all the way from the server to the router
        // to the request handler. There may be more elegant solutions, but this approach should do the job for now
        route(handle, pathname, response, request);
    }

    http.createServer(onRequest).listen(8888); // on request function receives request, response from createServer
    console.log("Server has started");
}

// Making some code a module means we need to export those parts of its functionality that we want to provide to scripts.
exports.start = start;
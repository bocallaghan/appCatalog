(function () {
    "use strict";
    /*
     * appCatalog.js
     * @Author: Brenton O'Callaghan
     * @Date: 13th April 2014
     * @Description: A basic web server which acts as an app catalog.
     */

    // JSLint directives to ensure NodeJS support.
    /*global exports, require, console, module*/
    
    // Import the HTTP and FS objects for use.
    var http = require('http'),
        fs = require('fs'),
        RequestHanlder = require('./appRequestHandler.js'),
        jsonConfig,
        config,
        server;
    
    // ==========================================
    // Load the configuration for the app catalog
    // ==========================================
    jsonConfig = fs.readFileSync("./appCatalog.conf", 'utf8');
    if (jsonConfig === undefined) {
        throw "Unable to read configuration file ./appCatalog.conf";
    }
    
    config = JSON.parse(jsonConfig);
    if (config === undefined) {
        throw "Config file loaded but unable to parse the config entries.";
    }
    
    // Standard handler for any request to the server.
    server = http.createServer(function (req, res) {
        
        /* There are 4 request types we must handle.
         * 1) Show a list of all of the Apps (/)
         * 2) Show a specific app's information (/?app=<filename>)
         * 3) Handle a manifest file request (/manifest?appID=com.xyz.com&dwl=
         * 4) Handle the downloading of the app itself (/com.xyz.ipa
         */
        var handler = new RequestHanlder(req, res, config.ipaDir);
    });
        
    // Startup the server and listen on the specified port (usually 8081).
    server.listen(config.serverPort);

}());
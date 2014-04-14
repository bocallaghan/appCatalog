(function () {
    "use strict";
    /*
     * appRequestHandler.js
     * @Author: Brenton O'Callaghan
     * @Date: 13th April 2014
     * @Description: Determines the response required to a request.
     */

    // JSLint directives to ensure NodeJS support.
    /*global exports, require, console, module*/
    
    /* There are 4 request types we must handle.
     * 1) Show a list of all of the Apps (/)
     * 2) Show a specific app's information (/?app=<filename>)
     * 3) Handle a manifest file request (/manifest?appID=com.xyz.com&dwl=
     * 4) Handle the downloading of the app itself (/com.xyz.ipa
     */

    //=========================================================
    // The Constructor for an app object.
    module.exports = function (req, res, appDirectory) {
        
        var requestType_manifest = 'manifest',
            requestType_appList = 'appList',
            requestType_appDetail = 'appDetail',
            requestType_download = 'appDownload',
            requestType_invalid = 'invalid',
            url = require('url'),
            fs = require('fs'),
            path = require('path'),
            App = require('./app.js'),
            appList = [],
            supportedMimeTypes = {
                'png' : 'image/png',
                'gif' : 'image/gif',
                'jpg' : 'image/jpg',
                'jpeg' : 'image/jpeg',
                'ipa'  : 'application/octet-stream',
                'ico' : 'image/ico'
            };
        
        
        //=========================================================
        // Private Methods
        //=========================================================
        
        // Get the extension of a filename.
        function getExtension(filename) {
            var ext = path.extname(filename || '').split('.');
            return ext[ext.length - 1];
        }
        
        // Stream a response back to the in the form of a binary file (ipa/image).
        function streamResponse(contentType, file) {
            
            if (!fs.existsSync(file)) {
                throw 'File not found';
            }
            
            // Get the stats on the file so we can determine the size.
            fs.stat(file, function (error, stat) {

                var rs;

                // Write the header of the response.
                res.writeHead(200, {
                    'Content-Type' : contentType,
                    'Content-Length' : stat.size
                });

                // Create a read stream from the file (more efficient than other methods).
                // Changed away from using util.pump as it is now deprecated.
                rs = fs.createReadStream(file).pipe(res);
            });
        }
        
        // Send a stadard response e.g. a web page.
        function sendStandardResponse(contentType, data) {

            res.setHeader("Content-Type", contentType);

            // Write the response code
            res.writeHead(200);

            // We now complete this using the async method as it gives better performance.
            var options = {'encoding' : 'utf8'};

            // Send the response data.
            res.end(data);
        }
        
        /*
         * Handles the returning of a specific file e.g. an image or the IPA itself.
         */
        function handleFileRequest() {
            
            // Get the path of the request.
            // We are expecting either /
            var path = url.parse(req.url, true).pathname,
                pathComponents = path.split('/'),
                fileName = pathComponents[1],
                fullFilePath = appDirectory + fileName,
                fileNameComponents = pathComponents[1].split('.'),
                fileExtension = fileNameComponents[fileNameComponents.length - 1],
                mimeType = supportedMimeTypes[fileExtension];
            
            // If we don't support he mime type then we throw an exception.
            if (mimeType === undefined) {
                throw 'File format ' + fileExtension + ' is not supported by this server.';
            }
            
            // Stream the response back to the client.
            streamResponse(mimeType, fullFilePath);
        }
        
        /*
         * Builds and returns the list of applications available for download.
         */
        function handleAppList() {
                        
            // Read the file system
            fs.readdir(appDirectory, function (error, files) {

                // Setup the variables for the files, dirs and the response body which will contain the HTML page template.
                var i,
                    fileStats,
                    responseData = fs.readFileSync('templates/template_appList.html', 'utf8'),
                    appEntryTemplate = fs.readFileSync('templates/template_appListEntry.html', 'utf8'),
                    appEntry,
                    appEntries = '',
                    z,
                    regex_appID = new RegExp('{appID}', 'g'),
                    regex_appName = new RegExp('{appName}', 'g'),
                    regex_appSize = new RegExp('{appSize}', 'g'),
                    regex_appIcon = new RegExp('{appIcon}', 'g');

                // Nothing we can do if there is an error.
                if (error) {
                    console.log('error reading directory');
                } else {

                    // For each file we retrieve stats about it and then format an output.
                    for (i = files.length - 1; i >= 0; i = i - 1) {

                        // Retrieve the file statistics.
                        fileStats = fs.statSync(appDirectory + files[i]);

                        // Based on whether it is a file or not we format accordingly.
                        if (fileStats.isFile() && getExtension(files[i]) === 'ipa') {
                            try {
                                appList.push(new App(appDirectory + files[i]));
                            } catch (e) {
                                console.log('Unable to load app ' + files[i] + ' with error: ' + e);
                            }
                        }
                    }
                }
            
                // For each file we retrieve stats about it and then format an output.
                for (z = appList.length - 1; z >= 0; z = z - 1) {
                    
                    appEntry = appEntryTemplate.replace(regex_appID, appList[z].getAppFileName());
                    appEntry = appEntry.replace(regex_appName, appList[z].getAppName());
                    appEntry = appEntry.replace(regex_appIcon, appList[z].getIconPath());
                    appEntry = appEntry.replace(regex_appSize, appList[z].getAppSize());
                    
                    // Finally, once all info has been added we add it to our list of apps.
                    appEntries = appEntries + appEntry;
                    appEntry = undefined;
                }

                responseData = responseData.replace('{apps}', appEntries);

                sendStandardResponse('text/html', responseData);
            });
        }
        
        // Determine the request type and call the correct handler
        function handleIncomingRequest() {

            // Get the path of the request.
            // We are expecting either / or /manifest
            var path = url.parse(req.url, true).pathname,
                query = url.parse(req.url, true).query;
            
            // if the path is / and there is no query string we want the list of apps.
            if (path === '/' && query.app === undefined) {
                console.log('List of apps requested.');
                handleAppList();
                
            // if the path is / and there is a query string we are looking at an app's detail.
            } else if (path === '/' && query.app !== undefined) {
                console.log('Specific app detail requested.');
                handleAppList();
            
            // if the path is /manifest and there is a query string we are returning a manifest file.
            } else if (path === '/manifest' && query.appID !== undefined) {
                console.log('Manifest file requested');
                
            // if the path is /somethingElse and there is no query string we are returning the app itself.
            } else {
                console.log('Specific file requested.');
                handleFileRequest();
            }
        }
        
        //=========================================================
        // Public Methods
        //=========================================================
        
        try {
        
            handleIncomingRequest();
        } catch (e) {
            res.setHeader("Content-Type", "text/html");

            // Write the response code
            res.writeHead(500);

            // Send the response data.
            res.end(e);
        }
        
        return {
            // Name of the app
            //getAppName: function () {
            //    return -21;
            //}
        };

    };
}());
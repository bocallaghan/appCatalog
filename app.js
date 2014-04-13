(function () {
    "use strict";
    /*
     * app.js
     * @Author: Brenton O'Callaghan
     * @Date: 11th April 2014
     * @Description: A representation of an app based on
     *            information retrieved from a file path.
     */

    // JSLint directives to ensure NodeJS support.
    /*global exports, require, console, module*/
    

    //=========================================================
    // The Constructor for an app object.
    module.exports = function (path) {
        
        var fs = require('fs'),
            Zip = require('adm-zip'),
            rimraf = require('rimraf'),
            defaultIconName = "default",
            appName,            // The human readable name of the app.
            iconPath,           // The path to the cached version of the app icon.
            version,            // The version of the app.
            description,        // A description of the app.
            creationDate,       // The file creation date.
            size,               // The size of the app file.
            appID,              // The App ID.
            lastChangedDate,    // Last updated date of the app.
            appLocation;        // The file system path to the IPA.
        
        
        //=========================================================
        // Private Methods
        //=========================================================

        /*
         * Retrieve the top level app name from the file name.
         */
        function extractAppName() {

            // Our filename will most likely come in as
            // com.bf.something.else.appName.ipa
            // So we extract the title in that case
            // which is appName or index 4 or length(6) - 2
            var titleComponents = appLocation.split(".");

            // On the off chance we get a file that has no extension we check.
            if (titleComponents.length > 1) {
                return titleComponents[titleComponents.length - 2];
            } else {
                return appLocation;
            }
        }

        /*
         * Verify that a given file path exists
         */
        function fileLocationValid(fileLocation) {
            return fs.existsSync(fileLocation);
        }

        /*
         * Do some primary checks to make sure we have a valid app file.
         */
        function isValidAppFile() {

            if (!fileLocationValid(appLocation)) {
                return false;
            }
            return true;
        }

        /*
         * Retrieve the path to the icon file.
         * Of course if there is no icon file we need to create one.
         */
        function extractIconPath() {

            // With each IPA there is a piece of "iTunes" artwork included.
            // To get it you need to look in the bundle (computationally expensive).
            // So we check for a helpfully cached icon file first (<ipaFileName>_icon.cache).
            // If one does not exists we go the whole hog and extract the correct version from
            // The file. In the future we also need to be mindful of updated apps

            // First we check for a jpg of the name of ipa
            if (fileLocationValid(appLocation + ".icon.png")) {
                return appLocation + ".icon.jpg";
            } else {
                // In this case we need to open the ipa file and cache the icon of the app.
                var ipaZip = new Zip(appLocation),
                    zipEntries = ipaZip.getEntries(),
                    artworkFound = false;

                // Find the artwork file and extract the artwork.
                zipEntries.forEach(function (zipEntry) {
                    if (!artworkFound && zipEntry.name === "iTunesArtwork") {
                        ipaZip.extractEntryTo(zipEntry.entryName, appLocation + "_extracted", true, true);
                        fs.renameSync(appLocation + "_extracted/" + zipEntry.entryName, appLocation + ".icon.png");
                        artworkFound = !artworkFound;
                    }
                });

                if (artworkFound) {
                    // Cleanup the remaining directories
                    rimraf.sync(appLocation + "_extracted");
                } else {
                    // No artwork found - will need to use default icon.
                    iconPath = defaultIconName;
                }

                return appLocation + ".icon.png";
            }
        }
        
        /*
         * Returns the timestamp the file was created at.
         */
        function getCreationTimestamp() {
        
            var fileStats = fs.statSync(appLocation);
            return fileStats.ctime;
            
        }
        
        /*
         * Returns the timestamp the file was created at.
         */
        function getAppSize() {
        
            var fileStats = fs.statSync(appLocation);
            return fileStats.size;
            
        }

        function getDetailsFromAppFile() {
            appName = extractAppName();
            iconPath = extractIconPath();
            creationDate = getCreationTimestamp();
            size = getAppSize();
        }

         // Store the app lcoation for use elsewhere.
        appLocation = path;
        
        // We first check that the ipa file exists.
        if (!isValidAppFile()) {
            throw "Application file not found";
        }
        
        // Retrieve the infomation on our app and prepare it for use.
        getDetailsFromAppFile();
        
        //=========================================================
        // Public Methods
        //=========================================================
        
        return {
            // Name of the app
            getAppName: function () {
                return appName;
            },

            // Icon for the app
            getIconPath: function () {
                return iconPath;
            },

            // Version of the app
            getVersion: function () {
                return -1;
            },

            // Description of the app
            getDescription: function () {
            },

            // Download link to get the app
            getDownloadPath: function () {
                return appLocation;
            },

            // Creation date of the app
            getCreationDate: function () {
                return creationDate;
            },
            
            // The size of the app file.
            getAppSize: function () {
                return size;
            }
        };

    };
}());
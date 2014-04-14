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
            appLocation,        // The file system path to the IPA.
            infoFileData;       // An indicator that this app object has retrieved all its info and is ready.
        
        
        //=========================================================
        // Private Methods
        //=========================================================

        /*
         * Retrieve the top level app name from the file name.
         */
        function extractAppNameFromFilename() {

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
         * Retrieve the filename from the app Path.
         */
        function extractAppFilenameFromPath() {

            var result = appLocation.split('/');
            
            // There has to be a better way of doing this - to be updated later.
            if (result.length === 1) {
                result = appLocation.split('\\');
            }
            
            // now we just return the file name.
            return result[result.length - 1];
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
         * Load the app's info file from which we can extrace various pieces of info.
         */
        function loadAppInfoFile() {
            
            // If we have already loaded all the apps just return.
            if (infoFileData !== undefined) {
                return;
            }
            
            // In this case we need to open the Info.plist file and cache it.
            var ipaZip = new Zip(appLocation),
                zipEntries = ipaZip.getEntries(),
                fileFound = false,
                result = '';
            
            // Find the artwork file and extract the artwork.
            zipEntries.forEach(function (zipEntry) {
                if (!fileFound && zipEntry.name === "Info.plist") {
                    
                    ipaZip.extractEntryTo(zipEntry.entryName, appLocation + "_extracted", true, true);
                    
                    // read in the file and apply a regex to it to get the version.
                    infoFileData = fs.readFileSync(appLocation + "_extracted/" + zipEntry.entryName, 'utf8');
                    
                    fileFound = !fileFound;
                }
            });
            
            if (fileFound) {
                // Cleanup the remaining directories
                rimraf.sync(appLocation + "_extracted");
            }
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
            if (fileLocationValid(appLocation + "." + version + ".png")) {
                return appLocation + "." + version + ".png";
            } else {
                // In this case we need to open the ipa file and cache the icon of the app.
                var ipaZip = new Zip(appLocation),
                    zipEntries = ipaZip.getEntries(),
                    artworkFound = false;

                // Find the artwork file and extract the artwork.
                zipEntries.forEach(function (zipEntry) {
                    if (!artworkFound && zipEntry.name === "iTunesArtwork") {
                        ipaZip.extractEntryTo(zipEntry.entryName, appLocation + "_extracted", true, true);
                        fs.renameSync(appLocation + "_extracted/" + zipEntry.entryName, appLocation + "." + version + ".png");
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

                return appLocation + "." + version + ".png";
            }
        }
    
        
        /*
         * Retrieve the version of the app.
         */
        function extractAppVersion() {

            // With each IPA there is a file which contains all the app info called info.plist.
            // To get it you need to look in the bundle (computationally expensive).
            // In the future we are going to want to cache this information somewhere.
            
            // If we already have the app version - we just return it.
            if (version !== undefined) {
                return version;
            }
            
            // Make sure we haave a version of the info file loaded.
            loadAppInfoFile();
            
            var result = infoFileData.match('(?:<key>CFBundleVersion<\/key>\n\t<string>)(.*)(?=<\/string>)');
            return result[1];
        }
        
        /*
         * Retrieve the display name of the app.
         */
        function extractAppDisplayName() {

            // With each IPA there is a file which contains all the app info called info.plist.
            // To get it you need to look in the bundle (computationally expensive).
            // In the future we are going to want to cache this information somewhere.
            
            // If we already have the app name - we just return it.
            if (appName !== undefined) {
                return appName;
            }
            
            // Make sure we haave a version of the info file loaded.
            loadAppInfoFile();
            
            var result = infoFileData.match('(?:<key>CFBundleExecutable<\/key>\n\t<string>)(.*)(?=<\/string>)');
            
            // If we don't have a valid app name from within the IPA we derive it from the app filename.
            if (result[1] === undefined) {
                return extractAppNameFromFilename();
            } else {
                return result[1];
            }
        }
        
        /*
         * Retrieve the application ID.
         */
        function extractAppID() {
            
            // If we already have the app ID - we just return it.
            if (appID !== undefined) {
                return appID;
            }
            
            // Make sure the info.plist is loaded.
            loadAppInfoFile();
            
            var result = infoFileData.match('(?:<key>CFBundleIdentifier<\/key>\n\t<string>)(.*)(?=<\/string>)');
            
            // If we don't have a valid app ID from within the IPA we need to explore alternaitve.
            if (result[1] === undefined) {
                return "unknown";
            } else {
                return result[1];
            }
        }
        
        /*
         * Returns the timestamp the file was created at.
         */
        function extractAppCreationTimestamp() {
            var fileStats = fs.statSync(appLocation);
            return fileStats.ctime;
        }
        
        /*
         * Returns the timestamp the file was created at.
         */
        function extractAppSize() {
            var fileStats = fs.statSync(appLocation);
            return fileStats.size;
        }

         // Store the app lcoation for use elsewhere.
        appLocation = path;
        
        // We first check that the ipa file exists.
        if (!isValidAppFile()) {
            throw "Application file not found";
        }
        
        //=========================================================
        // Public Methods
        //=========================================================
        
        return {
            getAppFileName: function () {
                return extractAppFilenameFromPath();
            },
            // Name of the app
            getAppName: function () {
                return extractAppDisplayName();
            },

            // Icon for the app
            getIconPath: function () {
                return extractIconPath();
            },

            // Version of the app
            getVersion: function () {
                return extractAppVersion();
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
                return extractAppCreationTimestamp();
            },
            
            // The size of the app file.
            getAppSize: function () {
                return extractAppSize();
            },
            
            // The application ID of the app
            getAppID: function () {
                return extractAppID();
            }
        };

    };
}());
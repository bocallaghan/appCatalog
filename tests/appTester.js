(function () {
    "use strict";
    
    /*
     * appTester.js
     * @Author: Brenton O'Callaghan
     * @Date: 12th April 2014
     * @Description: A testing file for the app.js class.
     */

    // JSLint directives to ensure NodeJS support.
    /*global exports, require, console*/
    
    var App = require('../ios_app.js'),
        invalidAppPath = 'C:\\ipas\\com.notExistsing.ipa',
        validAppPath1 = 'C:\\ipas\\com.test.ipa',
        validAppPath2 = 'C:\\ipas\\com.test2.ipa',
        validAppPath3 = 'C:\\ipas\\com.test3.ipa',
        allTestsPassed = true;
    
    function loadApp(path) {
        var app1 = new App(path);

        console.log("App Name: " + app1.getAppName());
        console.log("Icon File: " + app1.getIconPath());
        console.log("Download Path: " + app1.getDownloadPath());
        console.log("App created at: " + app1.getCreationDate());
        console.log("App Size (bytes): " + app1.getAppSize());
        console.log("App version: " + app1.getVersion());
        console.log("App ID: " + app1.getAppID());
    }
    
    /*
     * Function for testing an app that doesn't exist.
     * Expected Behaviour: An exception should be thrown.
     */
    function performInvalidAppTest() {
        try {
            // Failed Test
            console.log("Starting test: Invalid App at path " + invalidAppPath);
            loadApp(invalidAppPath);
            allTestsPassed = !allTestsPassed;
            console.log("Test failed - no exception thrown");

        } catch (e1) {
            console.log(e1);
            console.log("Test passed - exception thrown");
        } finally {
            console.log("====================================================================");
        }
    }

    /*
     * Function for testing an app that does exist.
     */
    function performValidAppTest() {
        try {
            // Passed Test.
            console.log("Starting test: Valid app at path " + validAppPath1);
            loadApp(validAppPath1);
            console.log("Test passed - Valid IPA Test complete.");
            
            // Passed Test.
            console.log("Starting test: Valid app at path " + validAppPath2);
            loadApp(validAppPath2);
            console.log("Test passed - Valid IPA Test complete.");
            
            // Passed Test.
            console.log("Starting test: Valid app at path " + validAppPath3);
            loadApp(validAppPath3);
            console.log("Test passed - Valid IPA Test complete.");

        } catch (e2) {
            console.log(e2);
            allTestsPassed = !allTestsPassed;
            console.log("Test failed - exception thrown");
        } finally {
            console.log("====================================================================");
        }
    }
    
    console.log("Beginning test script for the app.js class");
    console.log("====================================================================");
    performInvalidAppTest();
    performValidAppTest();
    console.log("Completed test script for the app.js class");
    if (!allTestsPassed) {
        console.log("Test Failed - please see log above.");
    } else {
        console.log("All tests passed.");
    }
    console.log("====================================================================");
}());
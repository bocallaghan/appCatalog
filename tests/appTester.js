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
    
    var App = require('../app.js'),
        invalidAppPath = 'C:\\ipas\\com.notExistsing.ipa',
        validAppPath = 'C:\\ipas\\com.test.ipa',
        allTestsPassed = true;
    
    /*
     * Function for testing an app that doesn't exist.
     * Expected Behaviour: An exception should be thrown.
     */
    function performInvalidAppTest() {
        try {
            // Failed Test
            console.log("Starting test: Invalid App at path " + invalidAppPath);
            var app1 = new App(invalidAppPath);

            console.log("App Name: " + app1.getAppName());
            console.log("Icon File: " + app1.getIconPath());
            console.log("Download Path: " + app1.getDownloadPath());
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
            console.log("Starting test: Valid app at path " + validAppPath);
            var app2 = new App(validAppPath);
            console.log("App Name: " + app2.getAppName());
            console.log("Icon File: " + app2.getIconPath());
            console.log("Download Path: " + app2.getDownloadPath());
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
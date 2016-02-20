'use strict';

angular.module('slingshot')

.service("requestResponseHandler", ['$timeout', '$cordovaDialogs', 'localStorageService', function($timeout, $cordovaDialogs, localStorageService) {
    var requestResponseHandler = this;

    requestResponseHandler.exHandler = function(response, loginButton, callback) {

        if (response.Code === "InvalidRequest") {
            $cordovaDialogs.confirm('Error' + '\n' + 'Server appears unreachable', '', ['Review Settings', 'Exit'])
                .then(function(buttonIndex) {
                    localStorageService.set('Error', false);

                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex === 1) {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'ReviewSettings'
                        });
                    } else {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'Exit'
                        });
                    }
                })
        } else if (response.Code === "InvalidSoapResponse") {
            localStorageService.set('Error', false);

            $cordovaDialogs.confirm('Error' + '\n' + 'Server Responded Unusually. Page cannot be displayed', '', ['Review Settings', 'Exit'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;

                    if (btnIndex === 1) {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'ReviewSettings'
                        });
                    } else {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'Exit'
                        });
                    }
                });
        } else {
            // $scope.message = "Login Failed!";
            loginButton.value = "Login Failed!";
            loginButton.style.background = "#da635d";
            loginButton.style.background = "linear-gradient(#ae4f4a, #da635d)";
            loginButton.style.background = "-webkit-linear-gradient(#ae4f4a, #da635d)";
        }
    };

}]);

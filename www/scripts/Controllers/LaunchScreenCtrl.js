'use strict';

angular.module('slingshot')

.controller('LaunchScreenCtrl', ['$scope', '$state', 'localStorageService', 'soapService', 'sqlService', '$cordovaDialogs', 'toastService', '$timeout', '$activityIndicator', 'expensePreliminariesService',
    function($scope, $state, localStorageService, soapService, sqlService, $cordovaDialogs, toastService, $timeout, $activityIndicator, expensePreliminariesService) {

        var userId = localStorageService.get('userId'),
            token = localStorageService.get('Token'),
            serverapp = localStorageService.get('serverApp');

        localStorageService.set('willExitAppFromRegisterState', true);
        localStorageService.set('willEnableBackButtonOnRegisterPage', false);

        $scope.$on("$destroy", function() {
            document.removeEventListener("backbutton", backButtonHandler, false);
            document.removeEventListener("deviceready", onDeviceReady, false);
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener("backbutton", backButtonHandler, false);
        });

        function onDeviceReady() {
             // alert('hello world');
            showAppNameAndVersionNumber();

            if (isNetworkAvailable()) {
                if (isUserLoggedIn()) {
                    getExpensePreliminariesFromServerAndNavigateToMainPage();
                } else {
                    setTimeout(function() {
                        $state.go('register');
                    }, 3000);
                }
            } else {
                if (isUserLoggedIn()) {
                    toastService.showToast('There is no internet connection, working with cached data..');
                    $timeout(function() {
                        $state.go('slingmainpage');
                    }, 1500);
                } else {
                    showDialogIfNoUserLoggedIn();
                }
            }
        };

        function showAppNameAndVersionNumber() {
            // alert('hello world');
            //get app name from config file
            cordova.getAppVersion.getAppName(function(name) {
                $scope.appName = name;
            });
            //get app version from config file
            cordova.getAppVersion.getVersionNumber(function(version) {
                $scope.appVersion = version;
            });
            //if platform nor the ios and neither the android use the hard coded app name or version number
            if (device.platform !== 'iOS' || device.platform !== 'Android') {
                $scope.appVersion = '1.1';
                $scope.appName = 'Expenses';
            }
        };

        function isNetworkAvailable() {
            if (navigator.connection.type === 'none') {
                isNetworkAvailable = false;
                return false;
            } else {
                isNetworkAvailable = true;
                return true;
            }
        };

        function showDialogIfNoUserLoggedIn() {

            $cordovaDialogs.confirm('Attention' + '\n' + 'You have no internet connection', '', ['Review Settings', 'Exit'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex == 1) {
                        $state.go('register');
                    } else if (btnIndex == 2) {
                        if (device.platform === 'iOS') {
                            $cordovaDialogs.exitApp();
                        }
                        navigator.app.exitApp();
                    }
                });
        };

        function isUserLoggedIn() {
            if (userId !== null && token !== null && serverapp !== null) {
                return true;
            } else {
                return false;
            }
        };

        function getExpensePreliminariesFromServerAndNavigateToMainPage() {

            $scope.showLoader = true;
            $activityIndicator.startAnimating();
            soapService.giveExpensePreliminaries(serverapp, token).then(function(response) {
                expensePreliminariesService.responseHandler(response, function(dialog) {
                    if (dialog.Success === true) {
                        $timeout(function() {
                            $activityIndicator.stopAnimating();
                            $state.go('slingmainpage');
                        }, 2000);
                    } else {
                        $scope.showLoader = false;
                        $timeout(function() {
                            $activityIndicator.stopAnimating();
                        }, 100);
                        if (dialog.selectedButtonOnErrorDialog == 'ReviewSettings') {
                            $state.go('register');
                        } else {
                            if (device.platform === 'iOS') {
                                $cordovaDialogs.exitApp();
                            }
                            navigator.app.exitApp();
                        }
                    }
                });
            });
        };

        function backButtonHandler() {
            if ($state.current.name === 'home') {
                navigator.app.exitApp(); // exit the app
            }
        };

    }
]);

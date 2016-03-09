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
            window.removeEventListener("native.keyboardhide");
        });
        $scope.$on('$viewContentLoaded', function() {
            getAppNameAndVersion();

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

        function getAppNameAndVersion(){
            //get app name from config file
            $scope.appName = cordova_config.getAppName();
            //get app version from config file
            $scope.appVersion = cordova_config.getAppVersion();
        };

        function showAppNameAndVersionNumber() {
            //if platform is blackberry use the hard coded app name 
            if (device.platform === 'blackberry10') {
                $scope.appVersion = '';//1.1
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
                    } else{
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

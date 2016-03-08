'use strict';

angular.module('slingshot')

.controller('RegisterCtrl', ['$scope', '$state', '$window', 'localStorageService', 'soapService', 'sqlService', '$cordovaDialogs', 'requestResponseHandler', 'toastService', '$timeout', '$activityIndicator', 'expensePreliminariesService',
    function($scope, $state, $window, localStorageService, soapService, sqlService, $cordovaDialogs, requestResponseHandler, toastService, $timeout, $activityIndicator, expensePreliminariesService) {

        var loginButton, regForm, network, regOuter, serverid;

        $scope.splash = false;

        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(false);
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        $scope.$on("$destroy", function() {
            document.removeEventListener("backbutton", backButtonHandler, false);
            document.removeEventListener("deviceready", onDeviceReady, false);
            window.removeEventListener("native.keyboardhide");
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            $scope.userId = '';
            $scope.password = '';
            $scope.serverId = localStorageService.get('serverId') ? localStorageService.get('serverId') : 'https://support.slingshotsoftware.com/g2mxpt01';
            $scope.serverApp = localStorageService.get('serverApp') ? localStorageService.get('serverApp') : 'G2';

            loginButton = document.getElementById("regBtn");
            regForm = document.getElementById("registerForm");

            getAppNameAndVersion();

            window.addEventListener("native.keyboardhide", function(e) {
                var regForm = document.getElementById("registerForm");
                regForm.style.top = "0%";
                regForm.style.transition = "all .5s";
                document.getElementById("registerOuter").style.height = 0 + "%";
            });


        });


        function getAppNameAndVersion() {
            //get app name from config file
            $scope.appName = cordova_config.getAppName();
            //get app version from config file
            $scope.appVersion = cordova_config.getAppVersion();
        };


        function onDeviceReady() {
            showAppNameAndVersionNumber();
            showBackButton();
        };

        function showAppNameAndVersionNumber() {
            if (device.platform === 'blackberry10') {
                $scope.appVersion = ''; //1.1
                $scope.appName = 'Expenses';
            }
        };

        function showBackButton() {
            if (device.platform === 'Android') {
                $scope.BackButton = false;
            } else {
                $scope.BackButton = localStorageService.get('willEnableBackButtonOnRegisterPage');
            }
        };

        function backButtonHandler() {
            if ($state.current.name === 'register') {
                if (localStorageService.get('willExitAppFromRegisterState') == true) {
                    navigator.app.exitApp();
                } else {
                    $window.history.back();
                }
            }
        };

        function showLoginButton() {
            loginButton.value = "Please TAP here to LOGIN";
            loginButton.style.background = "#84B057";
            loginButton.style.background = "linear-gradient(#84B057, #698c45)";
            loginButton.style.background = "-webkit-linear-gradient(#84B057, #698c45)";
        };

        function resetButton() {
            loginButton.value = "Please register with the server";
            loginButton.style.background = "linear-gradient(#0270D7, #02509F)";
            loginButton.style.background = "-webkit-linear-gradient(#0270D7, #02509F)";
        };

        $scope.setScroll = function(isSet, offSet) {
            if (device.platform !== 'iOS') {
                regForm.style.transition = "all .5s";
                regForm.style.top = offSet + "%";
                document.getElementById("registerOuter").style.height = 30 + "%";
            }
        };

        $scope.TextWatcher = function(userId, password, serverId, serverApp) {
            if (chkInputFields(userId, password, serverId, serverApp)) {
                showLoginButton();
            } else {
                resetButton();
            }
        };

        $scope.submit = function(userId, password, serverId, serverApp) {

            //localStorageService.set('willEnableBackButtonOnRegisterPage', false);

            document.getElementById("registerOuter").style.height = 0 + "%";
            regForm.style.top = "0%";
            regForm.style.transition = "all .5s";

            if (chkInputFields(userId, password, serverId, serverApp)) {
                loginButton.value = "Please wait ..";
                loginButton.style.background = "linear-gradient(#0270D7, #02509F)";
                loginButton.style.background = "-webkit-linear-gradient(#0270D7, #02509F)";

                if (isNetworkAvailable()) {
                    validateUser(userId, password, serverId, serverApp);
                } else {
                    showDialogIfNoInternetConnection();
                }
            } else {
                $cordovaDialogs.alert('Please fill all the fields.', '', 'OK')
                    .then(function() {
                        // callback success
                    });
            }
        };

        function chkInputFields(userId, password, serverId, serverApp) {
            if (userId.length != 0 && password.length != 0 && serverId.length != 0 && serverApp.length != 0)
                return true;

            return false;
        };

        function isNetworkAvailable() {
            if (navigator.connection.type === 'none') {
                return false;
            } else {
                return true;
            }
        };

        function showDialogIfNoInternetConnection() {

            $cordovaDialogs.confirm('Warning' + '\n' + 'Server appears unreachable', '', ['Review Settings', 'Exit'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex == 1) {
                        $scope.userId = '';
                        $scope.password = '';

                        showLoginButton();
                    } else {
                        if (localStorageService.get('willExitAppFromRegisterState') == true) {
                            if (device.platform === 'iOS') {
                                $cordovaDialogs.exitApp();
                            } else
                                navigator.app.exitApp();
                        } else {
                            $window.history.back();
                        }
                    }
                });
        };

        $scope.back = function() {
            $window.history.back();
        };

        function validateUser(userId, password, serverId, serverApp) {

            soapService.validate(userId, password, serverId, serverApp).then(function(response) {

                if (response.Code === "Success") {
                    if (localStorageService.get('willExitAppFromRegisterState')) {
                        loginButton.value = "ReLogin Successfull!";
                    } else {
                        loginButton.value = "Login Successfull!";
                    }
                    $scope.splash = true;
                    $scope.showLoader = true;

                    $activityIndicator.startAnimating();

                    localStorageService.set('Token', response.Token);
                    localStorageService.set('userId', userId);
                    localStorageService.set('serverId', serverId);
                    localStorageService.set('serverApp', serverApp);
                    getExpensePreliminariesFromServerAndNavigateToMainPage(serverApp, response.Token);
                } else {
                    requestResponseHandler.exHandler(response, loginButton, function(dialog) {
                        if (dialog.selectedButtonOnErrorDialog == 'ReviewSettings') {

                            $scope.password = '';
                            showLoginButton();

                        }
                        //if exit button pressed on popup
                        else {
                            if (localStorageService.get('willExitAppFromRegisterState') == true) {
                                if (device.platform === 'iOS') {
                                    $cordovaDialogs.exitApp();
                                } else {
                                    navigator.app.exitApp();
                                }
                            } else {
                                $window.history.back();
                            }
                        }
                    });
                }
            });
        };

        function getExpensePreliminariesFromServerAndNavigateToMainPage(serverapp, token) {

            localStorageService.set('willExitAppFromRegisterState', true);

            soapService.giveExpensePreliminaries(serverapp, token).then(function(response) {
                expensePreliminariesService.responseHandler(response, function(dialog) {
                    if (dialog.Success === true) {
                        $timeout(function() {
                            $activityIndicator.stopAnimating();
                            $state.go('slingmainpage');
                        }, 2000);
                    } else {
                        $scope.splash = false;
                        $scope.showLoader = false;
                        $timeout(function() {
                            $activityIndicator.stopAnimating();
                        }, 100);
                        if (dialog.selectedButtonOnErrorDialog == 'ReviewSettings') {
                            $scope.userId = '';
                            $scope.password = '';
                            resetButton();
                        } else {
                            if (localStorageService.get('willExitAppFromRegisterState') == true) {
                                if (device.platform === 'iOS') {
                                    $cordovaDialogs.exitApp();
                                }
                                navigator.app.exitApp();
                            } else {
                                $window.history.back();
                            }
                        }
                    }
                });
            });

        };
    }
]);

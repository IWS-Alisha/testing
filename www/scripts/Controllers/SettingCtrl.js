'use strict';

angular.module('slingshot')
    .controller('SettingCtrl', ['$scope', '$state', '$window', 'localStorageService', function($scope, $state, $window, localStorageService) {

        $scope.showBackBtn = false;

        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(true);
        
        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            $scope.serverAddress = localStorageService.get('serverId');

        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }
            //get app version from config file
            cordova.getAppVersion.getVersionNumber(function(version) {
                $scope.appVersion = version;
            });

            if (device.platform !== 'iOS' || device.platform !== 'Android') {
                $scope.appVersion = '1.1';
            }
        };
        
        $scope.updateServer = function() {
            localStorageService.set('willEnableBackButtonOnRegisterPage', true);
            localStorageService.set('willExitAppFromRegisterState', false);
            // localStorageService.set('back', true);
            $state.go('register');
        };

        $scope.back = function() {
           backButtonBehaviour();
        };

        function backButtonHandler(event) {
            if ($state.current.name === 'setting') {
               backButtonBehaviour();
            }
        };
        function backButtonBehaviour(){
            cordova.plugins.Keyboard.close();
            localStorageService.set('willEnableBackButtonOnRegisterPage', false);
            $window.history.back();
        };


    }]);

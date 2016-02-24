'use strict';

angular.module('slingshot')

.controller('UploadResultItemCtrl', ['$scope', '$state', '$stateParams', 'localStorageService', 'sqlService', 'Mailto', '$window',
    function($scope, $state, $stateParams, localStorageService, sqlService, Mailto, $window) {

        $scope.showBackBtn = false;
        $scope.uploadResult = {};

        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(true);

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            getUploadResultExpense();

        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }
        };

        $scope.back = function() {
            $window.history.back();
        };

        $scope.sendReport = function() {
            var recepient = "email@example.com";
            var options = {
                subject: "Slingshot Error Report",
                body: "Failed to upload: " + $scope.uploadResult.DocumentDesc + "\nError message: " + $scope.uploadResult.ErrMessage + "\nError details:\n" + $scope.uploadResult.ErrDescription
            };

            var href = Mailto.url(recepient, options);

            window.open(href);
            return false;
        };

        function getUploadResultExpense() {

            sqlService.getUploadResultsExpense(localStorageService.get('DocId'), function(result) {
                $scope.uploadResult = result;
                $scope.$apply();
            });

        };

        function backButtonHandler(event) {
            if ($state.current.name === 'uploadResultPageItem') {
                $window.history.back();
            }
        };

        $scope.docStatus = function(status) {
            if (status === 1)
                return 'approved';
            else
                return 'denied';
        };


    }
]);

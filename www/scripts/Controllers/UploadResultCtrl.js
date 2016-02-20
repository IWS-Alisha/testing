'use strict';

angular.module('slingshot')

.controller('UploadResultCtrl', ['$scope', '$state', 'localStorageService', 'sqlService', '$window',
    function($scope, $state, localStorageService, sqlService, $window) {

        $scope.showBackBtn = false;
        $scope.uploadResults = [];

        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(true);

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);


            getUploadResults();

        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }

        };

        $scope.docStatus = function(status) {
            if (status === 1)
                return 'approved';
            else
                return 'denied';
        };

        $scope.chkDetail = function() {
            localStorageService.set('DocId', this.uploadResult.Id);
            $state.go('uploadResultPageItem', {
                DocId: this.uploadResult.Id
            });
        };

        $scope.back = function() {
            $window.history.back();
        };

        function getUploadResults() {
            sqlService.getUploadResults(function(result) {
                $scope.uploadResults = result;
                $scope.$apply();
            });

        }

        function backButtonHandler(event) {
            if ($state.current.name === 'uploadresultpage') {
                $window.history.back();
            }
        };


    }
]);

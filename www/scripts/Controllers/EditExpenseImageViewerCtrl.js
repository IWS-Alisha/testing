'use strict';

angular.module('slingshot')
    .controller('EditExpenseImageViewerCtrl', ['$scope', '$state', '$window', '$cordovaCamera', 'localStorageService', '$cordovaDialogs', 'sqlService', '$rootScope', 'fileService',
        function($scope, $state, $window, $cordovaCamera, localStorageService, $cordovaDialogs, sqlService, $rootScope, fileService) {

            var images = [],
                expenseId = localStorageService.get('ExpenseId'),
                fileCount, isRightBtnDisable, isLeftBtnDisable, views, b64Data, contentType, count = 0;

            // localStorageService.set('gridShow', false);
            var viewContainer = document.getElementById("imageSliderContainerID");

            $scope.$on("$destroy", function() {
                document.removeEventListener("deviceready", onDeviceReady, false);
                document.removeEventListener("backbutton", backButtonHandler, false);
            });
            $scope.$on('$viewContentLoaded', function() {
                document.addEventListener("deviceready", onDeviceReady, false);
                document.addEventListener('backbutton', backButtonHandler, false);

                $scope.viewer = false;
                $scope.currentIndex = 0;
                getImageCountAndImages();

                views = viewContainer.children;
            });

            function onDeviceReady() {
                if (device.platform === 'Android') {
                    $scope.showBackBtn = false;
                } else {
                    $scope.showBackBtn = true;
                }
            };

            function setHeaderAndLeftRightButton() {
                setHeader();
                setLeftRightButton();
            };

            function getImageCountAndImages() {

                if ($rootScope.images.length != 0) {
                    fileCount = $rootScope.images.length;
                    contentType = 'image/png';
                    for (var i = 0; i < $rootScope.images.length; i++) {
                        b64Data = $rootScope.images[i].Data;
                        var blob = b64toBlob(b64Data, contentType);
                        var blobUrl = URL.createObjectURL(blob);
                        images.push({ Data: blobUrl });
                    }
                    fileCount = $rootScope.images.length;
                    $scope.images = images;
                    setHeaderAndLeftRightButton();

                } else {
                    fileService.readFiles("images/" + expenseId, function(response) {
                        if (response.Success == true) {
                            images = response.Images;
                            $scope.images = response.Images;
                            fileCount = images.length;
                            setHeaderAndLeftRightButton();
                            $scope.$apply();
                        }
                    });
                }
            };

            function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, { type: contentType });
                return blob;
            }

            $scope.back = function() {
                backButtonBehaviour();
            };

            $scope.dltFilePopUp = function() {
                $cordovaDialogs.confirm('delete file?', '', ['Yes', 'No'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if (btnIndex == 1) {
                            deleteFile();
                            updateView();
                        }
                    });
            };

            function deleteFile() {
                images.splice($scope.currentIndex, 1);
                $rootScope.images.splice($scope.currentIndex, 1);
                fileCount -= 1;
                if (images.length === 0) {
                    backButtonBehaviour();
                }
            };

            $scope.takePicture = function() {
                count = 0;
                $scope.viewer = true;
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    correctOrientation: true
                };

                navigator.camera.getPicture(function(imageData) {
                    b64Data = imageData;
                    var blob = b64toBlob(b64Data, contentType);
                    var blobUrl = URL.createObjectURL(blob);
                    images.push({ Data: blobUrl });
                    $scope.currentIndex = $scope.images.length - 1;
                    fileCount += 1;
                    setHeader();
                    setLeftRightButton();
                    updateRootScopeImages();
                    $scope.$apply();
                }, function(err) {
                    $scope.viewer = false;
                    $scope.$digest();
                    console.log('Failed because:');
                    console.log(err);
                }, options);

            };

            function updateRootScopeImages() {
                $rootScope.images.push({ Data: b64Data });
            };

            function setHeader() {
                if ($scope.images.length > 1) {
                    $scope.show = true;
                    $scope.showImgCount = false;
                    $scope.totalImg = images.length;
                    $scope.currImg = $scope.currentIndex + 1;
                } else {
                    $scope.show = false;
                    $scope.showImgCount = true;
                    $scope.isRightBtnDisable = true;
                }
            };

            $scope.setCurrentSlideIndex = function(index) {
                $scope.currentIndex = index;

            };

            $scope.isCurrentSlideIndex = function(index) {
                return $scope.currentIndex === index;

            };
            $scope.prev = function() {

                if (!($scope.currentIndex == 0)) {
                    $rootScope.isZoomedState = false;
                    $scope.dir = "LTR";
                    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;

                    views[$scope.currentIndex].style.transition = "all .5s";
                    views[$scope.currentIndex + 1].style.transition = "all .5s";

                    setLeftRightButton();
                    setHeader();
                    resetImageScale();
                }
            };

            $scope.next = function() {

                if (!($scope.currentIndex == $scope.images.length - 1)) {
                    $scope.dir = "RTL";
                    $rootScope.isZoomedState = false;
                    $scope.currentIndex = ($scope.currentIndex < $scope.images.length - 1) ? ++$scope.currentIndex : 0;
                    views[$scope.currentIndex - 1].style.transition = "all .5s";
                    views[$scope.currentIndex].style.transition = "all .5s";

                    setLeftRightButton();
                    setHeader();
                }
                resetImageScale();
            };

            function resetImageScale() {
                if ($scope.currentIndex > 0) {
                    views[$scope.currentIndex].style.webkitTransform = "matrix(1, 0, 0, 1, 0, 0)";
                    views[$scope.currentIndex].style.transform = "matrix(1, 0, 0, 1, 0, 0)";
                    views[$scope.currentIndex - 1].style.webkitTransform = "matrix(1, 0, 0, 1, 0, 0)";
                    views[$scope.currentIndex - 1].style.transform = "matrix(1, 0, 0, 1, 0, 0)";
                }
            };

            function setLeftRightButton() {

                if ($scope.currentIndex == 0) {
                    if (fileCount !== 1) {
                        $scope.isLeftBtnDisable = true;
                        $scope.isRightBtnDisable = false;
                    } else {
                        $scope.isLeftBtnDisable = true;
                        $scope.isRightBtnDisable = true;
                    }
                } else if ($scope.currentIndex == fileCount - 1) {
                    $scope.isLeftBtnDisable = false;
                    $scope.isRightBtnDisable = true;
                } else {
                    $scope.isLeftBtnDisable = false;
                    $scope.isRightBtnDisable = false;
                }
                $scope.viewer = false;
                // }
            };

            function updateView() {
                if (!($scope.currentIndex == 0)) {
                    $scope.dir = "LTR";
                    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;
                    // setLeftRightButton();
                    views[$scope.currentIndex].style.transition = "all .5s";
                    views[$scope.currentIndex + 1].style.transition = "all .5s";
                }
                if (!($scope.currentIndex == $scope.images.length - 1)) {
                    if ($scope.currentIndex == 0) {
                        $scope.dir = "RTL";
                        $scope.currentIndex = 0;
                        views[$scope.currentIndex].style.transition = "all .5s";
                    } else {
                        $scope.dir = "RTL";
                        $scope.currentIndex = ($scope.currentIndex < $scope.images.length - 1) ? ++$scope.currentIndex : 0;
                        // setLeftRightButton();
                        views[$scope.currentIndex].style.transition = "all .5s";
                        views[$scope.currentIndex - 1].style.transition = "all .5s";
                    }
                }
                if ($scope.currentIndex == $scope.images.length - 1) {
                    $scope.dir = "RTL";
                    $scope.currentIndex = 0;
                    views[$scope.currentIndex].style.transition = "all .5s";
                }
                setHeader();
                setLeftRightButton();
                resetImageScale();
            };

            function backButtonHandler(event) {
                if ($state.current.name === 'editexpenseimageviewer') {
                    backButtonBehaviour();
                }
            };

            function backButtonBehaviour() {
                $window.history.back();
            };
        }
    ]);

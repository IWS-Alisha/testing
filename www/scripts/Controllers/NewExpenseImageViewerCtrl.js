 'use strict';

 angular.module('slingshot')
     .controller('NewExpenseImageViewerCtrl', ['$scope', '$state', '$window', '$cordovaCamera', 'localStorageService', '$cordovaDialogs', '$rootScope',
         function($scope, $state, $window, $cordovaCamera, localStorageService, $cordovaDialogs, $rootScope) {

             var viewContainer = document.getElementById("imageSliderContainerID");
             var views, isRightBtnDisable, isLeftBtnDisable, b64Data, images = [],
                 viewerWidth, viewerHeight, viewerTop,
                 contentType,
                 index;
             $scope.show = false;
             $scope.viewer = false;
             $scope.showImgCount = false;
             $scope.isZoomedState = false;

             localStorageService.set('gridShow', false);

             $scope.$on("$destroy", function() {
                 document.removeEventListener("deviceready", onDeviceReady, false);
                 document.removeEventListener("backbutton", backButtonHandler, false);
             });

             $scope.$on('$viewContentLoaded', function() {
                 document.addEventListener("deviceready", onDeviceReady, false);
                 document.addEventListener('backbutton', backButtonHandler, false);
                 getHeightWidth(0);
                 $scope.currentIndex = 0;

             });


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

             function onDeviceReady() {
                 if (device.platform === 'Android') {
                     $scope.showBackBtn = false;
                 } else {
                     $scope.showBackBtn = true;
                 }
             };

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
                             updateViewer();
                         }
                     });
             };

             function deleteFile() {
                 images.splice($scope.currentIndex, 1);
                 $rootScope.images.splice($scope.currentIndex, 1);
                 $scope.images = images;
                 $scope.totalImg = $scope.images.length;
                 setHeader();
                 if (images.length === 0 || images.length === undefined) {
                     backButtonBehaviour();
                 } else if ($scope.images === 1) {
                     $scope.show = false;
                     $scope.showImgCount = true;
                     $scope.currImg = 1;
                 }
             };

             function getHeightWidth(currentIndex) {
                 if (currentIndex === $rootScope.images.length) {
                     $scope.images = images;
                     views = viewContainer.children;
                     setLeftRightBtn();
                     setHeader();
                     $scope.$apply();
                     return;
                 }
                 b64Data = $rootScope.images[currentIndex].Data;
                 var img = new Image();
                 img.src = "data:image/png;base64," + b64Data;
                 img.onload = function() {
                     console.log(this.width);


                     var width = this.width;
                     var height = this.height;
                     var slide = document.getElementsByClassName('slider');
                     var aspectRation = width / height;
                     var parentWidth = slide[0].offsetWidth;
                     var parentHeight = slide[0].offsetHeight;
                     if (aspectRation > 1) {

                         viewerWidth = parentWidth;
                         viewerHeight = viewerWidth / aspectRation;
                         viewerTop = (parentHeight - viewerHeight) / 2;

                     } else {

                         viewerHeight = parentHeight;
                         viewerWidth = viewerHeight * aspectRation;
                         viewerTop = 0;
                     }

                     var blob = b64toBlob(b64Data, contentType);
                     var blobUrl = URL.createObjectURL(blob);
                     images.push({ Data: blobUrl, Width: viewerWidth, Height: viewerHeight, Top: viewerTop });
                     currentIndex += 1;
                     getHeightWidth(currentIndex);
                 }
             };
             $scope.takePicture = function() {
                 $scope.viewer = true;
                 var options = {
                     quality: 50,
                     destinationType: Camera.DestinationType.DATA_URL,
                     sourceType: Camera.PictureSourceType.CAMERA,
                     correctOrientation: true
                 };
                 navigator.camera.getPicture(function(imageData) {
                     b64Data = imageData;
                     updateRootScopeImages();
                     $scope.currentIndex = $rootScope.images.length - 1;
                     getHeightWidth($scope.currentIndex);




                 }, function(err) {
                     $scope.viewer = false;
                     $scope.$digest();
                 }, options);

             };

             function updateRootScopeImages() {
                 $rootScope.images.push({ Data: b64Data });
             };

             $scope.setCurrentSlideIndex = function(index) {
                 $scope.currentIndex = index;
                 // setHeader();
             };

             $scope.isCurrentSlideIndex = function(index) {
                 return $scope.currentIndex === index;
             };

             $scope.prev = function() {
                 // if ($rootScope.isZoomedState == false) {
                     if (!($scope.currentIndex == 0)) {

                         $scope.dir = "LTR";
                         $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;

                         views[$scope.currentIndex].style.transition = "all .5s";
                         views[$scope.currentIndex + 1].style.transition = "all .5s";
                         setHeader();
                         setLeftRightBtn();
                         // $rootScope.isZoomedState = false;
                         // resetImageScale();
                    // }
                 }
             };

             $scope.next = function() {
                 // if ($rootScope.isZoomedState == false) {
                     if (!($scope.currentIndex == $scope.images.length - 1)) {

                         $scope.dir = "RTL";
                         $scope.currentIndex = ($scope.currentIndex < $scope.images.length - 1) ? ++$scope.currentIndex : 0;

                         views[$scope.currentIndex].style.transition = "all .5s";
                         views[$scope.currentIndex - 1].style.transition = "all .5s";
                         setHeader();
                         setLeftRightBtn();
                         // $rootScope.isZoomedState = false;
                         // resetImageScale();
                     }
                 // }

             };

             function resetImageScale() {
                 if ($scope.currentIndex > 0) {
                     views[$scope.currentIndex].style.webkitTransform = "matrix(1, 0, 0, 1, 0, 0)";
                     views[$scope.currentIndex].style.transform = "matrix(1, 0, 0, 1, 0, 0)";
                     views[$scope.currentIndex - 1].style.webkitTransform = "matrix(1, 0, 0, 1, 0, 0)";
                     views[$scope.currentIndex - 1].style.transform = "matrix(1, 0, 0, 1, 0, 0)";
                 }
             };

             function setLeftRightBtn() {

                 if ($scope.currentIndex == 0) {
                     if ($scope.images.length == 1) {
                         $scope.isRightBtnDisable = true;
                     } else {
                         $scope.isRightBtnDisable = false;
                     }
                     $scope.isLeftBtnDisable = true;

                 } else if ($scope.currentIndex == $scope.images.length - 1) {
                     if ($scope.images.length == 1) {
                         $scope.isLeftBtnDisable = true;
                         $scope.isRightBtnDisable = true;
                     } else {
                         $scope.isLeftBtnDisable = false;
                         $scope.isRightBtnDisable = true;
                     }
                 } else {
                     $scope.isLeftBtnDisable = false;
                     $scope.isRightBtnDisable = false;
                 }
                 $scope.viewer = false;
             };

             function setHeader() {
                 if ($scope.images.length > 1) {
                     $scope.show = true;
                     $scope.showImgCount = false;
                     $scope.totalImg = $scope.images.length;
                     $scope.currImg = $scope.currentIndex + 1;
                 } else {
                     $scope.show = false;
                     $scope.showImgCount = true;
                     $scope.isRightBtnDisable = true;
                 }
             };

             function updateViewer() {
                    console.log($scope.currentIndex);
                 if ($scope.images.length == 1 && $scope.currentIndex == 1) {
                     $scope.dir = "LTR";
                     $scope.currentIndex = 0;
                     views[$scope.currentIndex].style.transition = "all .5s";
                 } else if ($scope.currentIndex == $scope.images.length) {
                     $scope.dir = "LTR";
                     $scope.currentIndex = $scope.currentIndex - 1;
                     views[$scope.currentIndex].style.transition = "all .5s";
                 } else {
                     $scope.dir = "RTL"; 
                     views[$scope.currentIndex].style.transition = "all .5s";
                     // views[$scope.currentIndex - 1].style.transition = "all .5s";
                 }
                 // resetImageScale();
                 setHeader();
                 setLeftRightBtn();
             };

             function backButtonHandler(event) {
                 if ($state.current.name == "newexpenseimageviewer") {
                     backButtonBehaviour();
                 }
             };

             function backButtonBehaviour() {
                 $window.history.back();
             };
         }
     ]);

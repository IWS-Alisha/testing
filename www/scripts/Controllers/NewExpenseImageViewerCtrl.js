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

             localStorageService.set('gridShow', false);

             $scope.$on("$destroy", function() {
                 document.removeEventListener("deviceready", onDeviceReady, false);
                 document.removeEventListener("backbutton", backButtonHandler, false);
             });

             $scope.$on('$viewContentLoaded', function() {
                 document.addEventListener("deviceready", onDeviceReady, false);
                 document.addEventListener('backbutton', backButtonHandler, false);
                 for (var i = 0; i < $rootScope.images.length; i++) {
                     contentType = 'image/png';
                     b64Data = $rootScope.images[0].Data;
                     getHeightWidth(b64Data);
                     var blob = b64toBlob(b64Data, contentType);
                     var blobUrl = URL.createObjectURL(blob);
                     images.push({ Data: blobUrl, width: viewerWidth, Height: viewerHeight, Top: viewerTop });
                 }
                 $scope.images = images;

                 $scope.currentIndex = 0;

                 views = viewContainer.children;
                 setLeftRightBtn();
                 setHeader();
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

             function getHeightWidth(imageData) {
                 var img = new Image();
                 img.src = "data:image/png;base64," + imageData;
                 var width = img.width;
                 var height = img.height;
                 var slide = document.getElementsByClassName('slider');
                 var aspectRation = width / height;
                 if (aspectRation > 1) {
                     height = slide[0].offsetWidth / aspectRation;
                     viewerWidth = slide[0].offsetWidth;
                     viewerHeight = height;
                     viewerTop = slide[0].offsetHeight - height;
                     viewerTop = viewerTop / 2;
                     viewerTop = viewerTop;
                 } else {
                     width = slide[0].offsetHeight / aspectRation;
                     viewerWidth = width;
                     viewerHeight = slide[0].offsetHeight;
                     viewerTop = 0;
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
                     getHeightWidth(imageData);
                     var blob = b64toBlob(b64Data, contentType);
                     var blobUrl = URL.createObjectURL(blob);
                     images.push({ Data: blobUrl, width: viewerWidth, Height: viewerHeight, Top: viewerTop });

                     $scope.currentIndex = $scope.images.length - 1;
                     setHeader();
                     setLeftRightBtn();
                     updateRootScopeImages();
                     $scope.$digest();
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

                 if (!($scope.currentIndex == 0)) {

                     $scope.dir = "LTR";
                     $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;

                     views[$scope.currentIndex].style.transition = "all .5s";
                     views[$scope.currentIndex + 1].style.transition = "all .5s";
                     setHeader();
                     setLeftRightBtn();
                     $rootScope.isZoomedState = false;
                     resetImageScale();
                 }
             };

             $scope.next = function() {

                 if (!($scope.currentIndex == $scope.images.length - 1)) {

                     $scope.dir = "RTL";
                     $scope.currentIndex = ($scope.currentIndex < $scope.images.length - 1) ? ++$scope.currentIndex : 0;

                     views[$scope.currentIndex].style.transition = "all .5s";
                     views[$scope.currentIndex - 1].style.transition = "all .5s";
                     setHeader();
                     setLeftRightBtn();
                     $rootScope.isZoomedState = false;
                     resetImageScale();
                 }

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
                 if (!($scope.currentIndex == 0)) {
                     $scope.dir = "LTR";
                     $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.images.length - 1;
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
                         views[$scope.currentIndex].style.transition = "all .5s";
                         views[$scope.currentIndex - 1].style.transition = "all .5s";
                     }
                 }
                 if ($scope.currentIndex == $scope.images.length - 1) {
                     $scope.dir = "RTL";
                     $scope.currentIndex = 0;
                     views[$scope.currentIndex].style.transition = "all .5s";
                 }
                 resetImageScale();
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

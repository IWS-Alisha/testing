'use strict';

angular.module('slingshot')

.service("toastService", ['localStorageService', '$cordovaToast', function(localStorageService, $cordovaToast) {

    var toastService = this;

    toastService.showToast = function(text) {

        // console.log('showToast ---- ', text);

        if (localStorageService.get('Platform') === 'blackberry10') {

            showToastBB(text);
        } else {

            $cordovaToast.showShortBottom(text).then(function(success) {
                // success
            }, function(error) {
                // error
            });
        }

    };


    function showToastBB(text) {
        var message = text,
            // buttonText = "Click Me",
            toastId,
            onButtonSelected = function() {
                console.log('Button was clicked for toast: ' + toastId);
            },
            onToastDismissed = function() {
                console.log('Toast disappeared: ' + toastId);
            },
            options = {
                // buttonText: buttonText,
                dismissCallback: onToastDismissed,
                buttonCallback: onButtonSelected,
                timeout: 2000
            };

        toastId = blackberry.ui.toast.show(message, options);
    }

    toastService.showLoaderToast = function(text) {

        // console.log('showToast ---- ', text);

        if (localStorageService.get('Platform') === 'blackberry10') {

            showLoaderToastBB(text);
        } else {

            $cordovaToast.showLongCenter(text).then(function(success) {
                // success
            }, function(error) {
                // error
            });
        }

    };


    function showLoaderToastBB(text) {
        var message = text,
            // buttonText = "Click Me",
            toastId,
            onButtonSelected = function() {
                //console.log('Button was clicked for toast: ' + toastId);
            },
            onToastDismissed = function() {
                //console.log('Toast disappeared: ' + toastId);
            },
            options = {
                // buttonText: buttonText,
                dismissCallback: onToastDismissed,
                buttonCallback: onButtonSelected,
                timeout: 4500
            };

        toastId = blackberry.ui.toast.show(message, options);
    }



}])

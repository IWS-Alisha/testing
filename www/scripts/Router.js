'use strict';

angular.module('slingshot', ['ngAnimate', 'ngCookies',
        'ngTouch', 'ngSanitize',
        'ngResource', 'ui.router',
        'angularSoap', 'ngCordova', 'base64', 'LocalStorageModule', 'hmTouchEvents', '720kb.datepicker', 'angular.filter', 'focus-if', 'ngActivityIndicator', 'uz.mailto'
    ])
    .config(function($stateProvider, $urlRouterProvider, $compileProvider) {
        $stateProvider

        .state('home', {
            url: '/',
            templateUrl: 'partials/launchScreen.html',
            controller: 'LaunchScreenCtrl'
        })

        .state('slingmainpage', {
            url: '/slingmainpage',
            templateUrl: 'partials/mainpage.html',
            controller: 'SlingPageCtrl'
        })

        .state('tripinfo', {
            url: '/tripinfo',
            templateUrl: 'partials/tripinfo.html',
            controller: 'TripInfoCtrl'
        })

        .state('newexpense', {
            url: '/newexpense',
            templateUrl: 'partials/expense.html',
            controller: 'NewExpenseCtrl'
        })

        .state('register', {
            url: '/register',
            templateUrl: 'partials/register.html',
            controller: 'RegisterCtrl'
        })

        .state('newexpenseimageviewer', {
            url: '/newexpenseimageviewer',
            templateUrl: 'partials/expenseImageViewer.html',
            controller: 'NewExpenseImageViewerCtrl'
        })

        .state('capturedexpense', {
            url: '/capturedexpense',
            templateUrl: 'partials/capturedexpense.html',
            controller: 'CapturedExpenseCtrl'
        })

        .state('editexpense', {
            url: '/editexpense?exId',
            templateUrl: 'partials/expense.html',
            controller: 'EditExpenseCtrl'
        })

        .state('setting', {
            url: '/setting',
            templateUrl: 'partials/setting.html',
            controller: 'SettingCtrl'
        })

        .state('editexpenseimageviewer', {
            url: '/editexpenseimageviewer',
            templateUrl: 'partials/expenseImageViewer.html',
            controller: 'EditExpenseImageViewerCtrl'
        })
          .state('uploadResultPage', {
            url: '/uploadResultPage',
            templateUrl: 'partials/uploadResultPage.html',
            controller: 'UploadResultCtrl'
        })
            .state('uploadResultPageItem', {
            url: '/uploadResultPageItem',
            templateUrl: 'partials/uploadResultPageItem.html',
            controller: 'UploadResultItemCtrl'
        })
        ;

        $urlRouterProvider.otherwise('/');
        $compileProvider.imgSrcSanitizationWhitelist('');

    });

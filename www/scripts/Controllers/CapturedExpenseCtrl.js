'use strict';

angular.module('slingshot')

.controller('CapturedExpenseCtrl', ['$scope', '$state', 'localStorageService', 'sqlService', '$window', '$rootScope',
    function($scope, $state, localStorageService, sqlService, $window, $rootScope) {

        localStorageService.set('gridShow', true);
        var getExpenses = [],
            Expenses = [];

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            $scope.Expenses = [];
            $scope.ExpensesExist = false;
            $scope.ExpensesExist = localStorageService.get('ExpensesExist');
            $rootScope.expenseCurrentState = null;

            getAllExpenses();

        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }
        };

        function getAllExpenses() {
            sqlService.getExpenses(function(result) {
                var result = result;
                if (result.length !== 0) {
                    $scope.ExpensesExist = true;

                    var response = [];
                    for (var i = 0; i < result.length; i++) {

                        var dict = {};
                        var res = result[i].dateTime,
                            d = new Date(res),
                            date = d.toDateString();

                        dict.Id = result[i].Id;
                        dict.amount = result[i].amount;
                        dict.code = result[i].code;
                        dict.corporateCard = result[i].corporateCard;
                        dict.costData = result[i].costData;
                        dict.currency = result[i].currency;
                        dict.dateTime = date;
                        dict.description = result[i].description;
                        dict.divisionCard = result[i].divisionCard;
                        dict.fileData = result[i].fileData;
                        dict.iconData = result[i].iconData;
                        dict.jobData = result[i].jobData;
                        dict.projectCard = result[i].projectCard;

                        response.push(dict);
                    }
                    $scope.Expenses = response;
                } else {
                    $scope.ExpensesExist = false;
                    $scope.Expenses = [];
                    localStorageService.set('ExpensesExist', false);
                }

                $scope.$apply();
                var scrollTop = localStorageService.get('scrollTop');
                document.getElementById("expenseDetail").scrollTop = scrollTop;

            });
        };

        $scope.GroupBorder = function(isLast) {
            if (!isLast)
                return 'GroupBorder';

            return ';'
        };

        $scope.newExpense = function() {
            localStorageService.set('scrollTop', 0);
            localStorageService.set('Icon', null);
            localStorageService.set('getDate', new Date());

            $state.go("newexpense");
        };

        $scope.editExpense = function(id) {

            var test = sqlService.getExpense(id, function(result) {
                var res = result.dateTime;
                localStorageService.set('getDate', res);
                $state.go('editexpense', {
                    exId: result.Id
                });
            });

            localStorageService.set('ExpenseId', id);
            localStorageService.set('scrollTop', document.getElementById('expenseDetail').scrollTop);
        };

        $scope.back = function() {
            backButtonBehaviour();
        };

        function backButtonHandler(event) {
            if ($state.current.name === 'capturedexpense') {
                backButtonBehaviour();
            }
        };

        function backButtonBehaviour() {
            localStorageService.set('scrollTop', 0);
            $window.history.back();
        };


    }
]);

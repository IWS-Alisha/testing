'use strict';

angular.module('slingshot')

.service("expensePreliminariesService", ['$timeout', '$cordovaDialogs', 'localStorageService', 'sqlService', 'toastService','$state', function($timeout, $cordovaDialogs, localStorageService, sqlService, toastService, $state) {
    var expensePreliminariesService = this;

    expensePreliminariesService.responseHandler = function(response, callback) {

        if (response.Code === "Success") {
            localStorageService.set('ExpenseCodes', response.ExpenseCodes);
            localStorageService.set('Project', response.Projects);
            localStorageService.set('CorpCards', response.CorpCards);
            localStorageService.set('JobNumbers', response.JobNumbers);
            localStorageService.set('Entities', response.Entities);
            localStorageService.set('Divisions', response.Divisions);
            localStorageService.set('CostCenters', response.CostCenters);
            localStorageService.set('CurrencyCodes', response.CurrencyCodes);
            localStorageService.set('BillingDefaults', response.BillingDefaults);

            sqlService.getExpenses(function(result) {

                if (result.length == 0) {
                    if (localStorageService.get('TripInfoDescription') == null || localStorageService.get('TripInfoDescription') == undefined) {
                        localStorageService.set('TripInfoJobNumber', response.BillingDefaults.JobNumber);
                        localStorageService.set('TripInfoEntity', response.BillingDefaults.Entity);
                        localStorageService.set('TripInfoDivision', response.BillingDefaults.Division);
                        localStorageService.set('TripInfoCostCenter', response.BillingDefaults.CostCenter);
                        localStorageService.set('TripInfoProject', 'Toys R Us');
                        localStorageService.set('TripInfoCorporateCard', null);
                    }
                }

                callback({
                    'Success': true,
                    'selectedButtonOnErrorDialog': null
                });
            });
        } else if (response.Code === 'ReAuth') {
            toastService.showToast('Your former login has expired. Please identify yourself..');
            $state.go('register');
        } else {
            $cordovaDialogs.confirm(response.Message, '', ['Review Settings', 'Exit'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex === 1) {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'ReviewSettings'
                        });
                    } else {
                        callback({
                            'Success': false,
                            'selectedButtonOnErrorDialog': 'Exit'
                        });
                    }
                })
        }
    };

}]);

'use strict';
angular.module('slingshot')

.factory("soapService", ['$soap', 'localStorageService', function($soap, localStorageService) {

    return {
        validate: function(userId, password, serverId, serverapp) {
            var url = serverId + "webservices/authentication.asmx";
            return $soap.post(url, "Validate", {
                Project: serverapp,
                UserID: userId,
                Password: password
            });
        },
        registerMobile: function(serverId, project, token, data) {

            var url = serverId + "webservices/authentication.asmx";
            return $soap.post(url, "RegisterMobileDeviceApp", {
                Project: project,
                Token: token,
                Data: data
            });
        },
        giveExpensePreliminaries: function(serverapp, token) {

            var url = localStorageService.get('serverId') + "webservices/expensecapture.asmx";
            return $soap.post(url, "GiveExpensePreliminaries", {
                Project: serverapp,
                Token: token
            });
        },
        createOrUpdateReportHeader: function(serverapp, token, data) {

            var url = localStorageService.get('serverId') + "webservices/expensecapture.asmx";
            return $soap.post(url, "CreateOrUpdateReportHeader", {
                Project: serverapp,
                Token: token,
                Data: data
            });
        },
        takeExpense: function(serverapp, token, data) {

            var url = localStorageService.get('serverId') + "webservices/expensecapture.asmx";
            return $soap.post(url, "TakeExpense", {
                Project: serverapp,
                Token: token,
                Data: data
            });
        },
        postReport: function(serverapp, token, data) {

            var url = localStorageService.get('serverId') + "webservices/expensecapture.asmx";
            return $soap.post(url, "PostReport", {
                Project: serverapp,
                Token: token,
                Data: data
            });
        }

    }
}])

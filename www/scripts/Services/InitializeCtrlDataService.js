'use strict';

angular.module('slingshot')

.service("initilizeCtrlData", ['$timeout', 'localStorageService', function($timeout, localStorageService) {
    var initilizeCtrlData = this;

    initilizeCtrlData.getResponse = function(callback) {

        var Entities = [],
            CostCenters = [],
            Divisions = [],
            JobNumbers = [],
            temp = [],
            CorpCards = [],
            Project = [],
            listZero = {
                name: null
            };
        Entities.push(listZero);
        CostCenters.push(listZero);
        Divisions.push(listZero);
        JobNumbers.push(listZero);
        CorpCards.push(listZero);
        Project.push(listZero);
        temp = localStorageService.get('CorpCards'); {
            for (var i = 0; i < temp.length; i++) {
                var list = {
                    name: temp[i]
                };
                CorpCards.push(list);
            }
        }

        temp = localStorageService.get('JobNumbers'); {
            for (var i = 0; i < temp.length; i++) {
                var list = {
                    name: temp[i]
                };
                JobNumbers.push(list);
            }
        }

        temp = localStorageService.get('Entities');
        for (var i = 0; i < temp.length; i++) {
            var list = {
                name: temp[i]
            };
            Entities.push(list);
        }

        temp = localStorageService.get('Divisions'); {
            for (var i = 0; i < temp.length; i++) {
                var list = {
                    name: temp[i]
                };
                Divisions.push(list);
            }
        }

        temp = localStorageService.get('CostCenters'); {
            for (var i = 0; i < temp.length; i++) {
                var list = {
                    name: temp[i]
                };
                CostCenters.push(list);
            }
        }


        temp = localStorageService.get('Project'); {
            for (var i = 0; i < temp.length; i++) {
                var list = {
                    name: temp[i].Name
                };
                Project.push(list);
            }
        }

        callback({
            'Entities': Entities,
            'CostCenters': CostCenters,
            'Divisions': Divisions,
            'JobNumbers': JobNumbers,
            'CorpCards': CorpCards,
            'Project': Project
        });
    };

}]);

//'use strict';

angular.module('slingshot')
    .run(['$rootScope', function($rootScope) {
        angular.element(document).on("click", function(e) {
            $rootScope.$broadcast("hideList");
        });
    }]);

angular.module('slingshot')
    .directive("dropdown2", function($rootScope) {
        return {
            restrict: "E",
            templateUrl: "partials/currencyDropdown.html",
            scope: {
                placeholder: "@",
                list: "=",
                selected: "=",
                property: "@"
            },
            link: function(scope) {
                scope.listVisible = false;
                scope.isPlaceholder = true;

                scope.select = function(item) {
                    scope.isPlaceholder = false;
                    scope.selected = item;
                    scope.listVisible = false;
                };

                scope.show = function() {
                    scope.listVisible = true;
                };

                $rootScope.$on("documentClicked", function(inner, target) {
                    console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
                    if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
                        scope.$apply(function() {
                            scope.listVisible = false;
                        });
                });

                $rootScope.$on("hideList", function() {
                    if (scope.listVisible == true) {
                        scope.listVisible = false;
                    }
                });

                scope.$watch("selected", function(value) {
                    if (angular.isDefined(value)) {
                        scope.isPlaceholder = scope.selected[scope.property] === undefined;
                        scope.display = scope.selected[scope.property];
                        scope.listVisible = false;
                    }
                });
            }
        }
    });

angular.module('slingshot')

.controller('FileExpenseCtrl', ['$scope', '$state', '$window', function($scope, $state, $window) 
{

	$scope.newExpense = function(){
        $state.go('newexpense');
    };
  
    $scope.back = function() 
    {
       $window.history.back();
    }


}]);
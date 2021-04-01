/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('TermConditionController', TermConditionController);

    TermConditionController.$inject = ['$scope'];
    function TermConditionController($scope) {
        $scope.message = 'Terms and Conditions';
    }

})();


/**
 * Created by simonyu on 9/02/16.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsErrorController', CramsErrorController);

    CramsErrorController.$inject = ['$scope'];
    function CramsErrorController($scope) {
        $scope.message = 'Error Page';
    }
})();


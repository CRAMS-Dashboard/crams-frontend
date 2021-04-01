/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsContactUsController', CramsContactUsController);

    CramsContactUsController.$inject = ['$scope'];
    function CramsContactUsController($scope) {
        $scope.message = 'Contact us!';
    }

})();
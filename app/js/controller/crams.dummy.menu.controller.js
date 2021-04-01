/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsDummyMenuController', CramsDummyMenuController);

    CramsDummyMenuController.$inject = ['$scope'];
    function CramsDummyMenuController($scope) {
        $scope.message = 'Dummy Menu!';
    }

})();
(function () {
    'use strict';
    angular.module('crams').controller('SiteFooterController', SiteFooterController);
    SiteFooterController.$inject = ['$rootScope', '$scope', '$location'];
    function SiteFooterController($rootScope, $scope, $location) {
        $scope.year = getCurrentYear();
        function getCurrentYear() {
            var date = new Date();
            return date.getFullYear();
        };
    }
})();
/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';
    angular.module('crams').directive('cramsDataCustodian', cramsDataCustodian);
    cramsDataCustodian.$inject = [];
    function cramsDataCustodian() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            templateUrl: 'templates/crams_data_custodian_form.html',
            controller: 'CramsDataCustodianController',
            controllerAs: 'vm'
        };
    }
})();
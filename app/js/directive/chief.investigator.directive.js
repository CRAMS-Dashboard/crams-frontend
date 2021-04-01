/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';
    angular.module('crams').directive('cramsChiefInvestigator', cramsChiefInvestigator);
    cramsChiefInvestigator.$inject = [];
    function cramsChiefInvestigator() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            templateUrl: 'templates/crams_chief_investigator_form.html',
            controller: 'CramsChiefInvestigatorController',
            controllerAs: 'vm'
        }
    }
})();
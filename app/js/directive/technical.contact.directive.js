/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';
    angular.module('crams').directive('cramsTechnicalContact', cramsTechnicalContact);
    cramsTechnicalContact.$inject = [];
    function cramsTechnicalContact() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            templateUrl: 'templates/crams_technical_contact_form.html',
            controller: 'CramsTechnicalContactController',
            controllerAs: 'vm'
        }
    }
})();
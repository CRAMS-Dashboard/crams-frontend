/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';
    angular.module('crams').directive('objectDataOwner', objectDataOwner);
    objectDataOwner.$inject = [];
    function objectDataOwner() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            templateUrl: 'templates/racmon/racm_data_owner_form.html',
            controller: 'DataOwnerController',
            controllerAs: 'vm'
        };
    }
})();
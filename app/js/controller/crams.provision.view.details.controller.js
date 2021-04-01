/**
 * Created by simonyu on 26/10/2015.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsProvisionViewController', CramsProvisionViewController);

    CramsProvisionViewController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService'];

    function CramsProvisionViewController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService) {
        var vm = this;
        var request_id = $routeParams.request_id;


        vm.isEditable = function (path) {
            return path === 'allocations';
        };

        vm.isApprovableOrDeclinable = function (status_code, path) {
            if (path !== 'approval') {
                return false;
            }
            var approvableStatusCodes = ['X', 'E', 'Q'];
            return _.contains(approvableStatusCodes, status_code);
        };

        CramsApiService.getProvisionRequestById(request_id).then(function (response) {
            if (response.success) {
                vm.alloc_project_request = response.data;
            } else {
                var msg = "Failed to get the approved request, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });
    }
})();

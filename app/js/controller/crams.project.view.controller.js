/**
 * Created by simonyu on 26/10/2015.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsProjectViewController', CramsProjectViewController);

    CramsProjectViewController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService'];

    function CramsProjectViewController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService) {
        var vm = this;
        var project_id = $routeParams.project_id;

        var current_paths = $location.path().split('/');
        vm.allocations_base_path = current_paths[1];
        vm.view_request_path = 'allocations/view_request';

        if (current_paths[1] === 'admin' && current_paths[2] === 'allocations') {
            vm.allocations_base_path = current_paths[1] + '/' + current_paths[2];
            vm.view_request_path = 'admin/allocations/view_request';
        }

        vm.isApprovableOrDeclinable = function (status_code, path) {
            if (path !== 'approval' && path !== 'admin') {
                return false;
            }
            var approvableStatusCodes = ['X', 'E', 'Q'];
            return _.contains(approvableStatusCodes, status_code);
        };

        vm.isProvisionable = function (status_code, path) {
            return status_code === 'A' && (path === 'provision' || path === 'admin');
        };

        CramsApiService.getProjectById(project_id).then(function (response) {
            if (response.success) {
                vm.alloc_project_request = response.data;
                vm.alloc_project_request.description = vm.alloc_project_request.description.replace(/\n/g, "<br />");
                angular.forEach(vm.alloc_project_request.requests, function (req) {
                    angular.forEach(req.request_question_responses, function (req_q_resp) {
                        var key = req_q_resp.question.key;
                        if (key === 'racm_transaction_notes' || key === 'racm_collection_profile' || key === 'racm_merit_justification') {
                            req_q_resp.question_response = req_q_resp.question_response.replace(/\n/g, "<br />");
                        }
                    });
                });
            } else {
                var msg = "Failed to get allocation request, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });
    }
})();

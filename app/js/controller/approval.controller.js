/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('ApprovalController', ApprovalController);

    ApprovalController.$inject = ['FlashService', 'NectarRequestService', 'LookupService', '$scope', '$filter'];
    function ApprovalController(FlashService, NectarRequestService, LookupService, $scope, $filter) {
        var vm = this;
        vm.selected_funding_body = -1;
        vm.req_status = null;
        vm.funding_bodies = [];
        //load user funding body.
        loadFundingBody();

        function loadFundingBody() {

            //load funding body
            LookupService.fundingBody().then(function (response) {
                if (response.success) {
                    vm.funding_bodies = response.data;
                    vm.funding_bodies.unshift({"id": -1, "name": "All", "reviewer": true, "approver": true});
                } else {
                    var msg = "Failed to load user funding body";
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        //get funding body allocation requests
        getApprovalRequests();
        function getApprovalRequests() {
            vm.loaded = false;
            vm.nc_projects = [];
            //Call Funding Body allocations counter
            NectarRequestService.ApprovalCounter(vm.selected_funding_body, vm.req_status).then(function (response) {
                if (response.success) {
                    vm.counter = response.data.counter;
                } else {
                    var msg = "Failed to get funding body allocations counter, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });

            //Populate Funding body allocations based on a selected funding body and a request status
            NectarRequestService.listApproval(vm.selected_funding_body, vm.req_status).then(function (response) {
                if (response.success) {
                    vm.nc_projects = response.data.projects;
                } else {
                    var msg = "Failed to get funding body allocation requests, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.filterAllocations = function () {
            getApprovalRequests();
        };

        vm.isAwa = true;
        vm.isAbp = false;
        vm.isAa = false;
        vm.isEa = false;

        vm.isActive = function (label_value) {
            if (label_value == 'awa') {
                vm.isAwa = true;
                vm.isAbp = false;
                vm.isAa = false;
                vm.isEa = false;
                vm.req_status = null;
            }
            if (label_value == 'abp') {
                vm.isAwa = false;
                vm.isAbp = true;
                vm.isAa = false;
                vm.isEa = false;
                vm.req_status = 'approved';
            }
            if (label_value == 'aa') {
                vm.isAwa = false;
                vm.isAbp = false;
                vm.isAa = true;
                vm.isEa = false;
                vm.req_status = 'active';
            }
            if (label_value == 'ea') {
                vm.isAwa = false;
                vm.isAbp = false;
                vm.isAa = false;
                vm.isEa = true;
                vm.req_status = 'expired';
            }
            getApprovalRequests();
        };
    }
})();

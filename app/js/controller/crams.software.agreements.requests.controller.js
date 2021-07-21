/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsSoftwareAgreementRequestsController', CramsSoftwareAgreementRequestsController);

    CramsSoftwareAgreementRequestsController.$inject = ['$scope', 'CramsApiService', 'FlashService'];

    function CramsSoftwareAgreementRequestsController($scope, CramsApiService, FlashService) {
        var vm = this;
        listSoftwareAgreementsRequests();

        function listSoftwareAgreementsRequests() {
            vm.loaded = false;
            CramsApiService.listSoftwareAgreementsRequests().then(function (response) {
                if (response.success) {
                    vm.software_requests = response.data;
                } else {
                    var msg = "Failed to get software agreement requests, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.get_groupid = function (metadata) {
            for (var i = 0; i < metadata.length; i++) {
                try {
                    if (metadata[i].name.key === 'CRAMS_SOFTWARE_GROUP_ID') {
                        return metadata[i].value;
                    }
                }
                catch (err) {
                    // no attribute key in dict, move to next item
                }
            }
            // if no group id found return blank
            return "";
        };

        vm.approve = function (contact_license_id) {
            CramsApiService.approveSoftwareLicenseRequest(contact_license_id).then(function (response) {
                if (response.success) {
                    FlashService.Success('Software licence request approved', true);

                    // update the request list
                    listSoftwareAgreementsRequests();
                } else {
                    var msg = "Failed to approve request, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        };

        vm.decline = function (contact_license_id) {
            CramsApiService.declineSoftwareLicenseRequest(contact_license_id).then(function (response) {
                if (response.success) {
                    FlashService.Success('Software licence request declined', true);

                    // update the request list
                    listSoftwareAgreementsRequests();
                } else {
                    var msg = "Failed to decline request, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        };
    }
})();
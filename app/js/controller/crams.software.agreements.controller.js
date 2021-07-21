/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsSoftwareAgreementController', CramsSoftwareAgreementController);
    CramsSoftwareAgreementController.$inject = ['$scope', 'CramsApiService', 'FlashService', '$mdDialog', '$rootScope', '$q'];

    function CramsSoftwareAgreementController($scope, CramsApiService, FlashService, $mdDialog, $rootScope, $q) {
        var vm = this;

        //load the software list
        softwareList();

        // check user is an admin and display admin controls
        isAdmin();

        function softwareList() {
            vm.loaded = false;
            var software_list = CramsApiService.listSoftwareAgreements();
            var user_email = $rootScope.globals.currentUser.username.toLowerCase();
            var contact_licenses = CramsApiService.softwareContactLicense();

            var err_msg = "";
            $q.all([software_list, contact_licenses]).then(function (values) {
                if (!values[0].success) {
                    vm.hasError = true;
                    err_msg = "Failed to get software licence list.";
                } else {
                    if (!values[1].success) {
                        vm.hasError = true;
                        err_msg = "Failed to get software contact request list.";
                    } else {
                        angular.forEach(values[0].data, function (item, index) {
                            var software_license_id = item.id;

                            angular.forEach(values[1].data, function (cl_item) {
                                if (cl_item.license.id === software_license_id && cl_item.contact.email.toLowerCase() === user_email) {
                                    values[0].data[index]["status"] = cl_item.status;
                                    values[0].data[index]["contact_software_license_id"] = cl_item.id;
                                }
                            });
                        });
                    }
                    vm.software_list = values[0].data;
                }
            }).finally(function () {
                vm.loaded = true;
            });

            if (vm.hasError) {
                FlashService.DisplayError(err_msg);
            }
        }

        vm.isExpired = function (sw) {
            if (sw.end_date_ts === null || sw.end_date_ts === undefined) {
                return true;
            }
            var current = new Date();
            var end_date = new Date(sw.end_date_ts);
            if (current > end_date) {
                return true;
            } else {
                return false;
            }
        };

        function isAdmin() {
            // get the user role check if they are admin
            // TODO: replace with api to get user role for admin validation
            vm.isAdmin = true;
        }

        // Gets the group id/posix id from metadata dict
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
    }
})();
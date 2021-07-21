(function () {
    'use strict';
    angular.module('crams').controller('CramsSoftwareApplyController', CramsSoftwareApplyController);

    CramsSoftwareApplyController.$inject = ['$scope', 'CramsApiService', 'FlashService', '$mdDialog', '$routeParams', '$sce', '$location', '$rootScope'];

    function CramsSoftwareApplyController($scope, CramsApiService, FlashService, $mdDialog, $routeParams, $sce, $location, $rootScope) {
        var vm = this;
        vm.software_id = $routeParams.software_id;

        //load the software agreement
        loadSoftwareLicense(vm.software_id);

        function loadSoftwareLicense(software_id) {
            vm.loaded = false;
            CramsApiService.getSoftwareById(software_id).then(function (response) {
                if (response.success) {
                    vm.software_license = response.data;
                    if (vm.software_license.software.description !== null && vm.software_license.software.description !== undefined && vm.software_license.software.description !== '') {
                        vm.software_license.software.description = vm.software_license.software.description.replace(/\n/g, "<br />");
                    }
                    if (vm.software_license.license_text !== null && vm.software_license.license_text !== undefined && vm.software_license.license_text !== '') {
                        vm.software_license.license_text = vm.software_license.license_text.replace(/\n/g, "<br />");
                    }
                } else {
                    vm.hasError = true;
                    var msg = "Failed to get software licence, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });

            CramsApiService.softwareContactLicense().then(function (response) {
                if (response.success) {
                    vm.contact_licenses = response.data;
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.apply = function (software_id) {
            var software_data = {};
            software_data.notes = "blah";
            software_data.license = {"id": software_id};

            CramsApiService.softwareContactLicenseCreate(software_data).then(function (response) {
                if (response.success) {
                    // return to software agreement page
                    $location.path('/software_agreements');
                } else {
                    vm.hasError = true;
                    var msg = "Failed to apply for software licence, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        };

        vm.displayAction = function (software_license) {
            var display = true;
            if (software_license === undefined || software_license.end_date_ts === null || software_license.end_date_ts === undefined) {
                return false;
            }
            var current = new Date();
            var end_date = new Date(software_license.end_date_ts);
            if (end_date < current) {
                display = false;
            } else {
                angular.forEach(vm.contact_licenses, function (item) {
                    if (item.license.software.id === software_license.id && item.contact.email.toLowerCase() === $rootScope.globals.currentUser.username.toLowerCase()) {
                        if (item.status !== "Declined") {
                            display = false;
                        }
                    }
                });
            }
            return display;
        };

        vm.getStatus = function (software_id) {
            var status = null;
            angular.forEach(vm.contact_licenses, function (item) {
                if (item.license.software.id === software_id && item.contact.email.toLowerCase() === $rootScope.globals.currentUser.username.toLowerCase()) {
                    status = item.status;
                }
            });
            return status;
        };

        vm.notRequestedLicense = function (software_id) {
            var status = vm.getStatus(software_id);
            if (status === null || status === 'Declined') {
                return true;
            }
            return false;
        };
    }
})();
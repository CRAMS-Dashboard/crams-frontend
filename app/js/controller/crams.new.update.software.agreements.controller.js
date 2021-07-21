/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsNewUpdateSoftwareAgreementController', CramsNewUpdateSoftwareAgreementController);

    CramsNewUpdateSoftwareAgreementController.$inject = ['$location', '$scope', '$rootScope', '$routeParams', 'FlashService', 'CramsApiService', 'LookupService', 'CramsUtils', '$filter', '$anchorScroll', '$sce'];

    function CramsNewUpdateSoftwareAgreementController($location, $scope, $rootScope, $routeParams, FlashService, CramsApiService, LookupService, CramsUtils, $filter, $anchorScroll, $sce) {
        var vm = this;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];

        var software_id = $routeParams.id;

        CramsApiService.listSoftwareCategories().then(function (response) {
            if (response.success) {
                vm.software_categories = response.data;
            } else {
                var msg = "Failed to load software category, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        LookupService.researchSystem('crams-erb').then(function (response) {
            if (response.success) {
                vm.funding_schemes = response.data;
            } else {
                var msg = "Failed to load funding schemes, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        CramsApiService.listLicenseTypes().then(function (response) {
            if (response.success) {
                vm.license_types = response.data;
            } else {
                var msg = "Failed to load licence types, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        vm.cluster_data = [];
        if (software_id) {
            CramsApiService.getSoftwareById(software_id).then(function (response) {
                if (response.success) {
                    vm.software_data = response.data;
                    //popular the cluster_data
                    angular.forEach(vm.software_data.cluster, function (c) {
                        vm.cluster_data.push(c.id);
                    });
                } else {
                    var msg = "Failed to load software, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });

        } else {
            vm.software_data = CramsApiService.newSoftwareAgreementRequest();
        }

        //DatePicker settings
        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };

        //openCalendar method
        vm.openCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };

        // closeCalendar method
        vm.closeCalendar = function () {
            vm.opened = false;
        };

        vm.openExpiryCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.expiry_opened = true;
        };

        vm.closedExpiryCalendar = function () {
            vm.expiry_opened = false;
        };

        vm.checkStartDate = function () {
            vm.later_than_end_date_invalid = false;
            var start_date_str = $filter('date')(vm.software_data.start_date, "yyyy-MM-dd");
            var start_date = new Date(start_date_str);

            var end_date_ts_str = vm.software_data.end_date_ts;
            var end_date_ts = new Date(end_date_ts_str);
            end_date_ts.setHours(23, 59, 59, 999);
            if (start_date > end_date_ts) {
                vm.later_than_end_date_invalid = true;
            } else {
                vm.end_date_less_than_start_date = false;
            }
        };

        vm.chekExpiryDate = function () {
            vm.checkEndDate();
        };

        vm.checkEndDate = function () {
            vm.end_date_less_than_start_date = false;
            var start_date_str = $filter('date')(vm.software_data.start_date, "yyyy-MM-dd");
            var start_date = new Date(start_date_str);
            var end_date_ts_str = vm.software_data.end_date_ts;
            var end_date_ts = new Date(end_date_ts_str);
            end_date_ts.setHours(23, 59, 59, 999);
            if (start_date >= end_date_ts) {
                vm.end_date_less_than_start_date = true;
            } else {
                vm.later_than_end_date_invalid = false;
            }
        };

        vm.updateCategory = function () {
            var cid = vm.software_data.software.category.id;
            if (cid !== null && cid !== '' && cid !== undefined) {
                var found_category = _.findWhere(vm.software_categories, {'id': cid});
                if (found_category !== undefined) {
                    vm.software_data.software.category.category = found_category.category;
                }
            }
        };

        vm.updatLicenseType = function () {
            var tid = vm.software_data.type.id;
            if (tid !== null && tid !== '' && tid !== undefined) {
                var found_type = _.findWhere(vm.license_types, {'id': tid});
                if (found_type !== undefined) {
                    vm.software_data.type.type = found_type.type;
                }
            }
        };

        vm.checkSoftwareName = function () {
            vm.name_over_max = false;
            if (vm.software_data.software.name !== null && vm.software_data.software.name !== '' && vm.software_data.software.name !== undefined) {
                var name_len = vm.software_data.software.name.length;
                if (name_len > 99) {
                    vm.name_over_max = true;
                    vm.software_form.$valid = false;
                }
            } else {
                vm.name_invalid = true;
                vm.software_form.$valid = false;
            }
        };

        function validate() {
            vm.name_invalid = false;
            vm.name_over_max = false;
            vm.category_invalid = false;
            vm.group_name_invalid = false;
            vm.description_invalid = false;
            vm.homepage_invalid = false;
            vm.version_invalid = false;
            vm.clusters_invalid = false;
            vm.license_version_invalid = false;
            vm.license_type_invalid = false;
            vm.license_date_invalid = false;
            vm.license_expiry_date_invalid = false;
            vm.license_text_invalid = false;
            vm.software_form.$valid = true;
            vm.later_than_end_date_invalid = false;

            var start_date_str = $filter('date')(vm.software_data.start_date, "yyyy-MM-dd");
            vm.software_data.start_date = start_date_str;
            var start_date = new Date(start_date_str);
            var end_date_ts_str = vm.software_data.end_date_ts;
            var end_date_ts = new Date(end_date_ts_str);
            end_date_ts.setHours(23, 59, 59, 999);
            vm.software_data.end_date_ts = end_date_ts;

            if (start_date >= end_date_ts) {
                vm.later_than_end_date_invalid = true;
                vm.software_form.$valid = false;
            }

            if (!vm.software_form.name.$valid) {
                vm.name_invalid = true;
                vm.software_form.$valid = false;
            } else {
                var name_len = vm.software_data.software.name.length;
                if (name_len > 99) {
                    vm.name_over_max = true;
                    vm.software_form.$valid = false;
                }
            }

            if (!vm.software_form.category.$valid) {
                vm.category_invalid = true;
                vm.software_form.$valid = false;
            } else {
                if (vm.software_data.software.category.id === null || vm.software_data.software.category.id === '') {
                    vm.category_invalid = true;
                    vm.software_form.$valid = false;
                }
            }

            if (!vm.software_form.group_name.$valid) {
                vm.group_name_invalid = true;
                vm.software_form.$valid = false;
            } else {
                if (vm.software_data.software.metadata[0].value === null || vm.software_data.software.metadata[0].value === '') {
                    vm.group_name_invalid = true;
                    vm.software_form.$valid = false;
                }
            }

            if (!vm.software_form.description.$valid) {
                vm.description_invalid = true;
                vm.software_form.$valid = false;
            }

            if (!vm.software_form.homepage.$valid) {
                vm.homepage_invalid = true;
                vm.software_form.$valid = false;
            } else {
                // url validation pattern
                var url_pattern = /^((?:http|ftp)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;
                if (!url_pattern.test(vm.software_data.homepage)) {
                    vm.homepage_invalid = true;
                    vm.software_form.$valid = false;
                }
            }

            if (!vm.software_form.version.$valid) {
                vm.version_invalid = true;
                vm.software_form.$valid = false;
            }

            if (vm.cluster_data.length === 0) {
                vm.clusters_invalid = true;
                vm.software_form.$valid = false;
            } else {
                var clusters = [];
                angular.forEach(vm.cluster_data, function (cid) {
                    var c = {};
                    var found_cluster = _.findWhere(vm.funding_schemes, {'id': cid});
                    if (found_cluster !== undefined) {
                        c.name = found_cluster.name;
                        c.id = cid;
                        clusters.push(c);
                    }
                });
                vm.software_data.cluster = clusters;
            }
            if (!vm.software_form.license_version.$valid) {
                vm.license_version_invalid = true;
                vm.software_form.$valid = false;
            }
            if (!vm.software_form.license_type.$valid) {
                vm.license_type_invalid = true;
                vm.software_form.$valid = false;
            }

            if (!vm.software_form.license_text.$valid) {
                vm.license_text_invalid = true;
                vm.software_form.$valid = false;
            }
            return vm.software_form.$valid;
        }

        vm.submitSoftwareAgreement = function () {
            if (validate()) {
                if (software_id) {
                    CramsApiService.updateSoftwareAgreementRequest(vm.software_data).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Software agreement updated', true);
                            $location.path('/' + current_path);
                        } else {
                            var msg = "Failed to update software agreement. ";
                            FlashService.DisplayError(msg, response.data);
                            $anchorScroll();
                        }
                    });
                } else {
                    CramsApiService.createSoftwareAgreementRequest(vm.software_data).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Software agreement added', true);
                            $location.path('/' + current_path);
                        } else {
                            var msg = "Failed to add software agreement. ";
                            FlashService.DisplayError(msg, response.data);
                            $anchorScroll();
                        }
                    });
                }
            } else {
                FlashService.Error("Please check that all required fields have been filled in correctly.");
                // scroll to top of the page
                $anchorScroll();
            }
        };
    }
})();
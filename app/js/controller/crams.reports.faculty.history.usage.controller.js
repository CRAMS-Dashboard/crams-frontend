/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    google.load("visualization", "1", {packages: ["corechart"]});
    angular.module('crams').controller('FacultyHistoryUsageController', FacultyHistoryUsageController);

    FacultyHistoryUsageController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'LookupService', 'OrganisationService', 'FlashService', '$anchorScroll', '$filter', '$timeout', 'ENV'];

    function FacultyHistoryUsageController($routeParams, $scope, CramsApiService, LookupService, OrganisationService, FlashService, $anchorScroll, $filter, $timeout, ENV) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        vm.selected_faculty_id = null;
        vm.selected_faculty_name = 'All';

        //load all faculties
        loadFaculty();

        loadFacultyUsageHistory(vm.selected_faculty_id);

        function loadFaculty() {
            LookupService.researchSystem(ENV.erb).then(function (response) {
                if (response.success) {
                    var racmon_systems = response.data;
                    vm.e_research_system = racmon_systems[0];
                    if (vm.e_research_system !== undefined) {
                        // get organisation list
                        OrganisationService.listOrganisation().then(function (response) {
                            if (response.success) {
                                var org_list = response.data;
                                //select the first one
                                var first_org = org_list[0];
                                if (first_org !== undefined) {
                                    OrganisationService.listFaculty(first_org.id, vm.type_admin).then(function (response) {
                                        if (response.success) {
                                            vm.faculties = response.data.faculties;
                                            if (vm.faculties !== undefined) {
                                                vm.display_faculties = angular.copy(vm.faculties);
                                            }
                                        } else {
                                            var msg = "Failed to get faculty list, " + response.message + ".";
                                            // display error message to page
                                            FlashService.DisplayError(msg, response.data);
                                        }
                                    });
                                }
                            } else {
                                var msg = "Failed to get Organisation list, " + response.message + ".";
                                // display error message to page
                                FlashService.DisplayError(msg, response.data);
                            }
                        });
                    } else {
                        FlashService.Error('Undefined system name');
                    }
                } else {
                    var msg = "Failed to load eresearch systems, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });

        }

        function loadFacultyUsageHistory(faculty_id) {
            vm.load_fininshed = false;
            CramsApiService.getFacultyUsageHistory(faculty_id).then(function (response) {
                if (response.success) {
                    vm.usage_history_data = response.data;
                } else {
                    var msg = "Failed to get faculty usage history data, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                vm.load_fininshed = true;
            });
        }

        vm.filterFacultyUsageHistoryReport = function () {
            // get the faculty name from id
            if (vm.selected_faculty_id) {
                vm.selected_faculty_name = $.grep(vm.faculties, function (faculty) {
                    return faculty.id === vm.selected_faculty_id;
                })[0].name;
            } else {
                vm.selected_faculty_name = "All"
            }

            loadFacultyUsageHistory(vm.selected_faculty_id);
        };

        vm.report_title = 'Faculty Usage History Report';

        vm.headings = facultyUsageHistoryReportHeading();

        vm.sortHeadings = function () {
            return Object.values(vm.headings);
        };
        
        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

        vm.csvReportFileName = function () {
            let today = getDateStr(new Date());
            return 'FacultyUsageHistory_' + vm.selected_faculty_name + '_' + today + '.csv';
        };

        vm.sortReportData = function () {
            var sorted_report_data = [];
            angular.forEach(vm.usage_history_data, function (r_data) {
                var sorted_report = {};
                Object.keys(vm.headings).forEach(function (k) {
                    if (k == 'reported_allocation_gb' || k === 'disk_usage_gb' || k == 'tape_usage_gb') {
                        var value = r_data[k].toFixed(3);
                        sorted_report[k] = value;
                    } else {
                        sorted_report[k] = r_data[k];
                    }
                });
                sorted_report_data.push(sorted_report);
            });
            return sorted_report_data;
        };

        function facultyUsageHistoryReportHeading() {
            return {
                "faculty": "Faculty",
                "storage_product": "Storage Product",
                "date": "Date",
                "reported_allocation_gb": "Allocated (GB)",
                "disk_usage_gb": "Disk Usage (GB)",
                "tape_usage_gb": "Tape Usage (GB)"
            };
        }

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();


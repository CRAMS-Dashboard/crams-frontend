/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    google.load("visualization", "1", {packages: ["corechart"]});
    angular.module('crams').controller('ProjectHistoryUsageController', ProjectHistoryUsageController);

    ProjectHistoryUsageController.$inject = ['$routeParams', '$scope', '$rootScope', 'CramsApiService', 'LookupService', 'OrganisationService', 'FlashService', '$anchorScroll', '$filter', '$timeout', 'ENV'];

    function ProjectHistoryUsageController($routeParams, $scope, $rootScope, CramsApiService, LookupService, OrganisationService, FlashService, $anchorScroll, $filter, $timeout, ENV) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }
        vm.load_fininshed = true;
        vm.selected_faculty_id = null;
        vm.searched = false;
        vm.selected_faculty_name = 'All';

        //load all faculties
        loadFaculty();


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

        function loadProjectUsageHistory(faculty_id) {
            clearFlashMessage();
            if (!hasInputError()) {
                vm.load_fininshed = false;
                var start_date = $filter('date')(vm.start_date, "yyyyMMdd");
                var end_date = $filter('date')(vm.end_date, "yyyyMMdd");
                CramsApiService.getProjectUsageHistory(start_date, end_date, faculty_id).then(function (response) {
                    if (response.success) {
                        vm.usage_history_data = response.data;
                    } else {
                        var msg = "Failed to get projects usage data, " + response.message + ".";
                        // display error message to page
                        FlashService.DisplayError(msg, response.data);
                    }
                }).finally(function () {
                    vm.load_fininshed = true;
                });
            } else {
                FlashService.Error("Please fix the error below");
            }
        }

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                if (!flash.keepAfterLocationChange) {
                    delete $rootScope.flash;
                } else {
                    // only keep for a single location change
                    flash.keepAfterLocationChange = false;
                }
            }
        }

        function hasInputError() {
            var has_error = false;
            vm.invalid_start_date = false;
            vm.start_date_later_than_end_date_invalid = false;

            if (vm.start_date && vm.end_date) {
                if (vm.start_date > vm.end_date) {
                    vm.start_date_later_than_end_date_invalid = true;
                    has_error = true;
                }
            }
            return has_error;
        }

        vm.filterProjectUsageHistoryReport = function () {
            // get the faculty name from id
            if (vm.selected_faculty_id) {
                vm.selected_faculty_name = $.grep(vm.faculties, function (faculty) {
                    return faculty.id === vm.selected_faculty_id;
                })[0].name;
            } else {
                vm.selected_faculty_name = "All"
            }

            loadProjectUsageHistory(vm.selected_faculty_id);
        };

        vm.clearFilter = function () {
            vm.start_date = null;
            vm.end_date = null;
            vm.selected_faculty_id = null;
        };

        vm.report_title = 'Project Usage History Report';

        vm.headings = facultyProjectHistoryReportHeading();

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
            let start_date = getDateStr(vm.start_date);
            let end_date = getDateStr(vm.end_date);

            return 'ProjectUsageHistory_' + vm.selected_faculty_name + '_' + start_date + '-' + end_date + '.csv';
        };

        vm.sortReportData = function () {
            var sorted_report_data = [];
            angular.forEach(vm.usage_history_data, function (r_data) {
                var sorted_report = {};
                Object.keys(vm.headings).forEach(function (k) {
                    if (k == 'reported_allocation_gb' || k === 'allocated_gb' || k == 'usage_disk_gb' || k == 'usage_tape_fb') {
                        var value = r_data[k];
                        if (value !== null) {
                            value = value.toFixed(3);
                        }
                        sorted_report[k] = value;
                    } else {
                        sorted_report[k] = r_data[k];
                    }
                });
                sorted_report_data.push(sorted_report);
            });

            return sorted_report_data;
        };

        function facultyProjectHistoryReportHeading() {
            return {
                "faculty": "Faculty",
                'project': "Project",
                "storage_product": "Storage Product",
                "date": "Date",
                "allocated_gb": "Allocated (GB)",
                "reported_allocation_gb": "Reported Allocation (GB)",
                "usage_disk_gb": "Disk Usage (GB)",
                "usage_tape_fb": "Tape Usage (GB)",
                "provision_id": "Provision ID"
            };
        }

        //DatePicker settings
        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };


        //openCalendar method
        vm.openStartDateCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.start_opened = true;
        };

        // closeCalendar method
        vm.closeStartDateCalendar = function () {
            vm.start_opened = false;
        };

        //openCalendar method
        vm.openEndDateCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.end_opened = true;
        };

        // closeCalendar method
        vm.closeEndDateCalendar = function () {
            vm.end_opened = false;
        };

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();


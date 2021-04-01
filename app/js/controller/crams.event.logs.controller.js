(function () {
    'use strict';
    angular.module('crams').controller('CramsEventLogsController', CramsEventLogsController);

    CramsEventLogsController.$inject = ['$routeParams', '$scope', '$rootScope', 'CramsApiService', 'LookupService', 'OrganisationService', 'FlashService', '$anchorScroll', '$filter', '$timeout', 'ENV'];

    function CramsEventLogsController($routeParams, $scope, $rootScope, CramsApiService, LookupService, OrganisationService, FlashService, $anchorScroll, $filter, $timeout, ENV) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }
        vm.load_fininshed = true;
        vm.load_projects_fininshed = true;
        vm.download_panel = false;
        vm.project_error = false;
        vm.date_error = false;
        vm.selected_project_id = null;
        vm.searched = false;
        vm.selected_project_name = 'All';

        // load all projects
        loadProjects();


        function loadProjects() {
            vm.load_projects_fininshed = false;
            CramsApiService.dashboardRacmonProjects("admin").then(function (response) {
                if (response.success) {
                    vm.projects = response.data;
                } else {
                    var msg = "Failed to get projects, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                vm.load_projects_fininshed = true;
            });
        }

        function loadProjectEventLogs(project_id) {
            clearFlashMessage();
            if (!hasInputError()) {
                vm.load_fininshed = false;
                var start_date = $filter('date')(vm.start_date, "yyyyMMdd");
                var end_date = $filter('date')(vm.end_date, "yyyyMMdd");
                LookupService.loadProjectEventLogs(project_id, start_date, end_date).then(function (response) {
                    if (response.success) {
                        vm.project_event_log_data = csvLogFilter(response.data);
                    } else {
                        var msg = "Failed to get projects event log data, " + response.message + ".";
                        // display error message to page
                        FlashService.DisplayError(msg, response.data);
                    }
                }).finally(function () {
                    vm.load_fininshed = true;
                    vm.download_panel = true;
                });
            } else {
                FlashService.Error("Please fix the error below:");
            }
        }

        function csvLogFilter(event_logs) {
            // property fields that will be filtered out of the json
            let filtered_values = ['id', 'contact_role_id', 'request_status.code', 'request_status.status', 'creation_ts', 'last_modified_ts', 'sent_email'];

            let i = event_logs.length;
            while (i--) {
                let log = event_logs[i];
                if (log.changes.length === 0) {
                    // remove log with no changes
                    event_logs.splice(i, 1);
                } else {                    
                    // format the change message
                    let ch_text = "";
                    angular.forEach(log.changes, function (ch) { 
                        // fetch property
                        if (Array.isArray(ch.property)) {
                            // remove integers in array
                            let i = ch.property.length;
                            while (i--) {
                                let prop = ch.property[i];
                                if (Number.isInteger(prop)) {
                                    ch.property.splice(i, 1);
                                }
                            }

                            // append all the properties in list 
                            ch_text = ch_text + ' ' + JSON.stringify(ch.property);
                        } else {
                            ch_text = ch_text + ' ' + ch.property;
                        }

                        // fetch prev value
                        if (ch.prev_value !== null) {
                            ch_text = ch_text + ' ' + ch.prev_value;
                        }

                        // fetch changed value
                        if (ch.changed_value !== null) {
                            if (Array.isArray(ch.changed_value)) {
                                ch_text = ch_text + ' ' + JSON.stringify(ch.changed_value);
                            } else {
                                ch_text = ch_text + ' ' + ch.changed_value;
                            }
                        }
                    });

                    log.changes = ch_text;
                }
            }

            return event_logs;

            // angular.forEach(event_logs, function (log) { 
            // });
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
            vm.project_error = false;
            vm.date_error = false;

            // check a project has been selected
            if (!vm.selected_project_id) {
                has_error = true;
                vm.project_error = true;
            }

            // check start date is not greater than end date
            if (vm.start_date && vm.end_date) {
                if (vm.start_date > vm.end_date) {
                    has_error = true;
                    vm.date_error = true;
                }
            }
            return has_error;
        }

        vm.filterProjectEventLog = function () {
            // get the project name from id
            if (vm.selected_project_id) {
                vm.selected_project_name = $.grep(vm.projects, function (project) {
                    return project.project.id === vm.selected_project_id;
                })[0].project.title;
            } else {
                vm.selected_project_name = "All"
            }

            loadProjectEventLogs(vm.selected_project_id);
        };

        vm.clearFilter = function () {
            vm.start_date = null;
            vm.end_date = null;
            vm.selected_project_id = null;
            vm.download_panel = false;
        };

        vm.headings = projectEventLogHeading();

        vm.sortHeadings = function () {
            return Object.values(vm.headings);
        };

        function getDateStr(date) {
            if (date) {
                let dd = date.getDate();
                let mm = date.getMonth()+1;
                // append the extra "0" if value is a single digit
                (dd < 10) && (dd='0'+dd);
                (mm < 10) && (mm='0'+mm);

                return dd + mm + date.getFullYear();
            }
            return null;
        }

        vm.csvFileName = function () {
            let start_date = getDateStr(vm.start_date);
            let end_date = getDateStr(vm.end_date);

            // replace spaces with "_" in the title text
            let short_title = vm.selected_project_name.replace(/ /g, "_");
            // shorten title if longer than 20 chars
            if (short_title.length > 20) {
                short_title = short_title.slice(0,20) + '~';
            }
            
            let fileName = 'event_logs_' + short_title;
            
            // append start and end dates to the filename if applicable
            if (start_date) {
                fileName = fileName + '_start' + start_date;
            }
            if (end_date) {
                fileName = fileName + '_end' + end_date;
            }

            return fileName + '.csv';
        };

        vm.sortLogData = function () {
            var sorted_log_data = [];
            angular.forEach(vm.project_event_log_data, function (r_data) {
                var sorted_log = {};
                Object.keys(vm.headings).forEach(function (k) {
                    if (k == 'date') {
                        var value = r_data[k];
                        if (value !== null) {
                            value = value.toFixed(3);
                        }
                        sorted_log[k] = value;
                    } else {
                        sorted_log[k] = r_data[k];
                    }
                });
                sorted_log_data.push(sorted_log);
            });

            return sorted_log_data;
        };

        function projectEventLogHeading() {
            return {
                "project_title": "Project Title",
                'event': "Event",
                "changes": "Changes",
                "created_by": "User",
                "creation_ts": "Date"
            };
        }

        vm.resetDownload = function () {
            vm.download_panel = false;
        };

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


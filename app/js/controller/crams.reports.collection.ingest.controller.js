/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsReportCollectionIngestController', CramsReportCollectionIngestController);

    CramsReportCollectionIngestController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'FlashService', '$filter'];

    function CramsReportCollectionIngestController($routeParams, $scope, CramsApiService, FlashService, $filter) {
        var vm = this;

        vm.type_admin = $routeParams.type_admin;
        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        vm.load_fininshed = false;
        vm.report_title = 'Collection Ingestion Report';

        vm.headings = demandSummaryReportHeading();
        vm.show_calendar = true;

        vm.selected_date = null;
        vm.selected_date_str = null;
        vm.file_name = 'CollectionIngest.csv';

        loadIngestReport(vm.selected_date_str);

        function loadIngestReport(date) {
            CramsApiService.collectionIngestReport(date, vm.type_admin).then(function (response) {
                if (response.success) {
                    vm.report_data = response.data;
                    if (vm.selected_date) {
                        vm.file_name = 'CollectionIngest_' + getDateStr(vm.selected_date) + '.csv';
                    } else {
                        vm.file_name = 'CollectionIngest_' + getDateStr(new Date()) + '.csv';
                    }

                } else {
                    var msg = "Failed to get collection ingest report, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                vm.load_fininshed = true;
            });
        }

        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

        //DatePicker settings
        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };

        vm.selectedDateIngestReport = function () {
            vm.load_fininshed = false;
            vm.selected_date_str = $filter('date')(vm.selected_date, "yyyyMMdd");
            loadIngestReport(vm.selected_date_str);
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

        vm.displayColumn = function (data, key) {
            var display_data = data[key];
            if (display_data === null){
                return null;
            }

            if (isNaN(display_data)) {
                return display_data;
            } else {
                var commas_num_str = display_data.toString();
                commas_num_str += '';
                var x = commas_num_str.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }
        };

        vm.isNumColumn = function (col_key) {
            if ((col_key.indexOf('_cost') !== -1) || (col_key.indexOf('_tb') !== -1) || (col_key.indexOf('_gb') !== -1) || (col_key.indexOf('_size') !== -1)) {
                return true;
            } else {
                return false;
            }
        };
        vm.isCostColumn = function (col_key) {
            if ((col_key.indexOf('_cost') !== -1)) {
                return true;
            } else {
                return false;
            }
        };

        vm.sortHeadings = function () {
            return Object.values(vm.headings);
        };

        vm.sortReportData = function () {
            var sorted_report_data = [];
            angular.forEach(vm.report_data, function (r_data) {
                var sorted_report = {};
                Object.keys(vm.headings).forEach(function (k) {
                    sorted_report[k] = r_data[k];
                });
                sorted_report_data.push(sorted_report);
            });
            return sorted_report_data;
        };

        function demandSummaryReportHeading() {
            return {
                "collection": "Collection",
                "storage_product": "Storage Product",
                "reported_allocated_gb": "Reported Allocation (GB)",
                "used_gb": "Used (GB)",
                "capital_cost": "Capital Cost / TB (AUD)",
                "operation_cost": "Operations Cost / TB (AUD)",
                "latest_ingest_date": "Latest Ingest Date"
            };
        }
    }
})();
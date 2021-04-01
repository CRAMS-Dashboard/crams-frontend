/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsProductUsageReportController', CramsProductUsageReportController);

    CramsProductUsageReportController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'FlashService', 'ENV'];

    function CramsProductUsageReportController($routeParams, $scope, CramsApiService, FlashService, ENV) {
        var vm = this;

        vm.type_admin = $routeParams.type_admin;
        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        vm.load_fininshed = false;
        vm.report_title = 'Product Usage Summary';
        vm.headings = productUsageSummaryHeading();
        vm.file_name = 'ProductUsage.csv';

        // get organisation list
        CramsApiService.productUsageReport(vm.type_admin, ENV.system).then(function (response) {
            if (response.success) {
                vm.report = response.data;
                vm.report_data = vm.sortReportData();
                vm.file_name = 'ProductUsage_' + getDateStr(new Date()) + '.csv';
            } else {
                var msg = "Failed to get proudct usage report, " + response.message + ".";
                // display error message to page
                FlashService.DisplayError(msg, response.data, false);
            }
        }).finally(function () {
            vm.load_fininshed = true;
        });

        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

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
            var filtered_report_data = [];
            angular.forEach(vm.report, function (r_data) {
                var filtered_report = {};
                var name = r_data.name;
                var alloc_tp = r_data.demand_capacity_tb;
                var used_tp = r_data.used_capacity_tb;
                var capital_cost = r_data.capital_cost;
                var operational_cost = r_data.operational_cost_per_year;
                var unused_tp = (alloc_tp - used_tp).toFixed(2);
                filtered_report.name = name;
                filtered_report.demand_capacity_tb = alloc_tp;
                filtered_report.used_capacity_tb = used_tp;
                filtered_report.capital_cost = capital_cost;
                filtered_report.operational_cost_per_year = operational_cost;
                filtered_report.unused_tp = unused_tp;
                filtered_report_data.push(filtered_report);
            });
            return filtered_report_data;
        };

        function productUsageSummaryHeading() {
            return {
                "name": "Name",
                "demand_capacity_tb": "Allocated (TB)",
                "used_capacity_tb": "Used (TB)",
                "capital_cost": "Used Capital Cost (AUD)",
                "operational_cost_per_year": "Used Annual Operational Cost (AUD)",
                "unused_tp": "Unused (TB)"
            };
        }
    }
})();
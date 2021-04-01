/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsReportFundAllocationCostsController', CramsReportFundAllocationCostsController);

    CramsReportFundAllocationCostsController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'FlashService'];

    function CramsReportFundAllocationCostsController($routeParams, $scope, CramsApiService, FlashService) {
        var vm = this;

        vm.type_admin = $routeParams.type_admin;
        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        vm.load_fininshed = false;
        vm.report_title = 'Funding Accounts Allocation Costs Summary Report';
        vm.headings = reportHeading();
        vm.file_name = 'FundingAllocationCosts.csv';

        CramsApiService.fundAllocationCostsReport(vm.type_admin).then(function (response) {
            if (response.success) {
                vm.report_data = response.data;
                vm.file_name = 'FundingAllocationCosts_' + getDateStr(new Date()) + '.csv';
            } else {
                var msg = "Failed to get funding allocation costs report, " + response.message + ".";
                // display error message to page
                FlashService.DisplayError(msg, response.data);
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

        function reportHeading() {
            return {
                "funding_scheme": "Allocation Scheme",
                "product_name": "Storage Product",
                "demand_capacity_tb": "Demand / Fund (TB)",
                "ingested_tb": "Ingested (TB)",
                "capital_cost_tb": "Capital Cost / TB (AUD)",
                "operational_cost_tb": "Operational Cost / TB (AUD)"
            };
        }
    }
})();
/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsReportStorageTransactionsController', CramsReportStorageTransactionsController);

    CramsReportStorageTransactionsController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'FlashService'];

    function CramsReportStorageTransactionsController($routeParams, $scope, CramsApiService, FlashService) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        // init default sort icons
        initSortColumnIcon();

        vm.load_fininshed = false;
        vm.report_title = 'Storage Transaction Records Report';

        vm.headings = reportHeading();
        vm.csvHeading = angular.copy(vm.headings);
        vm.csvHeading.organisation = 'Organisation';
        vm.csvHeading.faculty = 'Faculty';
        vm.csvHeading.department = 'Department';
        vm.file_name = 'StorageTransactions.csv';

        CramsApiService.storageTransactionsReport(vm.type_admin).then(function (response) {
            if (response.success) {
                vm.report_data = response.data;
                vm.file_name = 'StorageTransactions_' + getDateStr(new Date()) + '.csv';
            } else {
                var msg = "Failed to get storage transactions report, " + response.message + ".";
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
            if (display_data === null) {
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
            return Object.values(vm.csvHeading);
        };

        function initSortColumnIcon() {
            vm.columnSortingOrder = {
                "transaction_id": {"asc": true, "desc": false},
                "provision_id": {"asc": true, "desc": false},
                "status": {"asc": true, "desc": false},
                "date_approved": {"asc": true, "desc": false},
                "collection": {"asc": true, "desc": false},
                "storage_product": {"asc": true, "desc": false},
                "allocation_size": {"asc": true, "desc": false},
                "capital_cost": {"asc": true, "desc": false},
                "operation_cost": {"asc": true, "desc": false},
                "allocation_scheme": {"asc": true, "desc": false}
            };
        }

        vm.columnSort = function(column_name) {
            // save current order
            var asc = vm.columnSortingOrder[column_name]["asc"];
            var desc = vm.columnSortingOrder[column_name]["desc"];

            // reset sort column icons
            initSortColumnIcon();

            vm.columnSortingOrder[column_name]["asc"] = !asc;
            vm.columnSortingOrder[column_name]["desc"] = !desc;

            vm.report_data = _.sortBy(vm.report_data, function (report) {
                if (report[column_name]) {
                    if (column_name === 'allocation_size') {
                        return report[column_name];
                    }

                    if (column_name === 'capital_cost') {
                        return parseFloat(report[column_name]);
                    }

                    if (column_name === 'operation_cost') {
                        return parseFloat(report[column_name]);
                    }

                    return report[column_name].toLowerCase();
                }
            });

            if (vm.columnSortingOrder[column_name]["desc"]  === true) {
                vm.report_data = vm.report_data.reverse();
            }
        };

        vm.getColumnAsc = function(column_name) {
            return vm.columnSortingOrder[column_name]["asc"];
        };

        vm.getColumnDesc = function(column_name) {
            return vm.columnSortingOrder[column_name]["desc"];
        };

        vm.sortReportData = function () {
            var sorted_report_data = [];
            angular.forEach(vm.report_data, function (r_data) {
                var sorted_report = {};
                Object.keys(vm.csvHeading).forEach(function (k) {
                    sorted_report[k] = r_data[k];
                });
                sorted_report_data.push(sorted_report);
            });
            return sorted_report_data;
        };

        function reportHeading() {
            return {
                "transaction_id": "Transaction ID",
                "provision_id": "Provision ID",
                "status": "Status",
                "date_approved": "Date Allocation Approved",
                "collection": "Collection",
                "storage_product": "Storage Product",
                "allocation_size": "Size Of Allocation (GB)",
                "capital_cost": "Capital Cost / Product (AUD)",
                "operation_cost": "Operations Cost / Product (AUD)",
                "allocation_scheme": "Allocation Scheme"
            };
        }
    }
})();
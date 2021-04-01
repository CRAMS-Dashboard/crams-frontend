/**
 * Created by simonyu on 9/05/16.
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonUsageAlertController', RacMonUsageAlertController);

    RacMonUsageAlertController.$inject = ['$location', '$route', '$scope', '$rootScope', '$routeParams', 'CramsApiService', 'FlashService', '$window', '$timeout'];

    function RacMonUsageAlertController($location, $route, $scope, $rootScope, $routeParams, CramsApiService, FlashService, CramsUtils, $window, $timeout) {
        var vm = this;
        var request_id = $routeParams.request_id;
        var request_paths = $location.path().split('/');
        var return_path = request_paths[1];

        vm.allocations_base_path = request_paths[1];

        if (request_paths[1] === 'admin' && request_paths[2] === 'allocations') {
            vm.allocations_base_path = request_paths[1] + '/' + request_paths[2];
        }

        loadUsageAlerts(request_id);

        function loadUsageAlerts(request_id) {
            CramsApiService.getUsageAlertsByRequestId(request_id).then(function (response) {
                if (response.success) {
                    // he populate the models
                    vm.usage_alerts_data = response.data;
                } else {
                    var msg = "Failed to get usage alerts for request " + request_id + ', ' + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });

        }

        vm.renderFrequency = function (days) {
            var frequencies = {
                '7': 'Weekly',
                '30': 'Monthly'
            };
            if (days === undefined) {
                return "";
            }

            var frequency_name = frequencies[days];
            if (frequency_name === undefined) {
                return 'Weekly';
            } else {
                return frequency_name;
            }
        };

        vm.alert_text_label = 'Add New Usage Alert';

        vm.show_alert_window = false;

        vm.showAlertAddOrEdit = function (storage_request, is_add) {
            clearFlashMessage();
            vm.sp_alert_data = {};
            if (!vm.show_alert_window) {
                vm.show_alert_window = true;
            }
            vm.storage_request = storage_request;
            vm.is_add = is_add;

            if (vm.is_add) {
                vm.alert_text_label = 'Add New Usage Alert';
            } else {
                vm.alert_text_label = 'Edit Usage Alert';
            }
            populateUsageAlert();
        };


        function populateUsageAlert() {
            vm.sp_alert_data.storage_product = vm.storage_request.storage_product;
            vm.sp_alert_data.sp_provision = vm.storage_request.sp_provision;

            if (vm.is_add) {
                vm.sp_alert_data.usage_alert = {
                    "sp_provision_id": vm.sp_alert_data.sp_provision.id,
                    "usage_threshold": 50,
                    "frequency": 7
                };
            } else {
                vm.sp_alert_data.usage_alert = vm.storage_request.usage_alerts[0];
            }
        }

        function reLoadUsageAlert(request_id) {
            loadUsageAlerts(request_id);
            vm.show_alert_window = false;
        }

        vm.addOrEditAlert = function () {
            vm.hasError = false;
            if (vm.checkUsageAlerts()) {
                CramsApiService.addOrEditUsageAlert(vm.sp_alert_data.usage_alert, vm.usage_alerts_data.id).then(function (response) {
                    if (response.success) {
                        var msg = '';
                        if (vm.is_add) {
                            msg = 'Usage alert for ' + vm.storage_request.storage_product.name + ' storage product has been added.';
                        } else {
                            msg = 'Usage alert for ' + vm.storage_request.storage_product.name + ' storage product has been updated.';
                        }
                        FlashService.Success(msg);
                        reLoadUsageAlert(vm.usage_alerts_data.id);
                    } else {
                        vm.hasError = true;
                        vm.error_msg = "Failed to set usage alert, " + response.message + '.';
                    }
                });
            } else {
                vm.hasError = true;
                vm.error_msg = "Please check that all required fields have been filled in correctly.";
            }
        };


        vm.checkUsageAlerts = function () {
            var valid = true;
            vm.usage_threshold_invalid = false;
            vm.frequency_invalid = false;
            if (vm.sp_alert_data.usage_alert.usage_threshold === null || vm.sp_alert_data.usage_alert.usage_threshold === undefined) {
                vm.usage_threshold_invalid = true;
                valid = false;
            }
            if (vm.sp_alert_data.usage_alert.frequency === null || vm.sp_alert_data.usage_alert.frequency === undefined) {
                vm.frequency_invalid = true;
                valid = false;
            }
            return valid;
        };

        vm.activateAlert = function (storage_req, isActive) {
            clearFlashMessage();
            var usage_alert = angular.copy(storage_req.usage_alerts[0]);
            usage_alert.active = isActive;
            CramsApiService.addOrEditUsageAlert(usage_alert, vm.usage_alerts_data.id).then(function (response) {
                if (response.success) {
                    var msg = '';
                    if (isActive) {
                        msg = 'Usage alert for ' + storage_req.storage_product.name + ' storage product has been activated.';
                    } else {
                        msg = 'Usage alert for ' + storage_req.storage_product.name + ' storage product has been deactivated.';
                    }
                    FlashService.Success(msg);
                    reLoadUsageAlert(vm.usage_alerts_data.id);
                } else {
                    var err_msg = "Failed to deactivate usage alert, " + response.message + '.';
                    if (isActive) {
                        err_msg = "Failed to activate usage alert, " + response.message + '.';
                    }
                    FlashService.DisplayError(err_msg, response.data);
                }
            });
        };

        vm.isActive = function (sp_req) {
            var usage_alert = sp_req.usage_alerts[0];
            if (usage_alert === undefined) {
                return true;
            } else {
                return usage_alert.active;
            }
        };
        vm.closeAlertWindow = function () {
            vm.show_alert_window = false;
        };

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                delete $rootScope.flash;
            }
        }

        vm.thresholds = [50, 90, 100];

        vm.frequencies = [
            {'interval': 7, 'desc': 'Weekly'},
            {'interval': 30, 'desc': 'Monthly'}
        ];

    }
})();

(function () {
    'use strict';
    angular.module('crams').controller('RacMonManageProvIdsController', RacMonManageProvIdsController);

    RacMonManageProvIdsController.$inject = ['FlashService', 'CramsApiService', 'LookupService', '$scope', '$rootScope', '$filter', '$anchorScroll', 'ENV', '$routeParams'];

    function RacMonManageProvIdsController(FlashService, CramsApiService, LookupService, $scope, $rootScope, $filter, $anchorScroll, ENV, $routeParams) {
        var vm = this;
        vm.show_popup_window = false;
        vm.project_id = $routeParams.project_id;
        vm.selected_stor_req = null;
        vm.available_prov_ids = null;
        vm.new_prov_id = null;
        vm.loaded = false;

        // init the storage product requests provision ids
        loadAllocationRequest(vm.project_id);

        // get all storage product requests and provision ids
        function loadAllocationRequest(project_id) {
            CramsApiService.getProjectById(project_id).then(function (response) {
                if (response.success) {
                    vm.project = response.data;
                } else {
                    var msg = "Failed to get allocation for project_id: " + project_id + ", " + response.message;
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.open_popup_window = function (storage_req) {
            vm.show_popup_window = true;
            vm.selected_stor_req = storage_req;
            vm.get_recent_provision_ids(vm.selected_stor_req.storage_product.name);
        };

        vm.close_popup_window = function () {
            vm.show_popup_window = false;
            clear_prov_id_popup();
        };

        vm.change_prov_id = function () {
            vm.show_popup_window = false;
        };

        vm.change_prov_id = function () {
            if (vm.new_prov_id) {
                CramsApiService.updateProvisionID(vm.selected_stor_req.id, vm.selected_stor_req.storage_product, vm.new_prov_id).then(function (response) {
                    if (response.success) {
                        check_sp_provision_response(response.data);
                        vm.show_popup_window = false;
                    } else {
                        var error_msg = 'Faild to update the provision id ';
                        FlashService.DisplayError(error_msg, response.data);
                    }
                });
            } else {
                vm.prov_id_invalid = true;
            }
        };

        function check_sp_provision_response(resp_data) {
            vm.resp_errors = [];
            var success = resp_data.success;
            if (success === false) {
                var errors = resp_data.errors;
                if (errors !== null) {
                    var non_field_errors = _.pick(errors, 'non_field_errors');
                    if (!_.isEmpty(non_field_errors)) {
                        vm.resp_errors.push(non_field_errors.non_field_errors[0]);
                    }
                    var sp = errors.storage_product;
                    if (sp !== undefined) {
                        var sp_non_field_errors = _.pick(sp, 'non_field_errors');
                        if (!_.isEmpty(sp_non_field_errors)) {
                            vm.resp_errors.push(sp_non_field_errors.non_field_errors[0]);
                        }
                    }
                    var prov_id_errors = _.pick(errors, 'provision_id');
                    if (!_.isEmpty(prov_id_errors)) {
                        vm.resp_errors.push(prov_id_errors.provision_id[0]);
                    }
                }
            }

            vm.sp_provision_error = false;
            if (vm.resp_errors.length > 0) {
                var msg = vm.resp_errors[0];
                FlashService.DisplayError(msg, null);
                $anchorScroll();
            } else {
                FlashService.Success("Success - Provision ID changed");
                loadAllocationRequest(vm.project_id);
                clear_prov_id_popup();
                vm.show_popup_window = false;
            }
        }

        vm.get_recent_provision_ids = function (product_name) {
            CramsApiService.getRecentProvId(product_name).then(function (response) {
                if (response.success) {
                    vm.available_prov_ids = response.data;

                    // add a unique index for the drop down
                    for (let i = 0; i < vm.available_prov_ids.length; i++) {
                        vm.available_prov_ids[i]["index"] = i;
                    }
                }
            });
        };

        function clear_prov_id_popup() {
            vm.selected_stor_req = null;
            vm.new_prov_id = null;
            vm.prov_id_invalid = false;
            // vm.available_prov_ids = null;
            vm.recent_product_prov_ids = null;
        }
    }
})();
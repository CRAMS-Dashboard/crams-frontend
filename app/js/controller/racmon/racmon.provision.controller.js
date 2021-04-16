/**
 * Created by simonyu on 9/05/16.
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonProvisionController', RacMonProvisionController);

    RacMonProvisionController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll'];

    function RacMonProvisionController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll) {
        var vm = this;
        var request_id = $routeParams.request_id;
        var request_paths = $location.path().split('/');
        var return_path = request_paths[1];

        vm.sp_provisions = [];
        vm.recent_product_prov_ids = {};

        vm.get_recent_prov_id = function (product_name) {
            CramsApiService.getRecentProvId(product_name).then(function (response) {
                if (response.success) {
                    vm.recent_product_prov_ids[product_name] = response.data;
                    // add a unique index for the drop down
                    for (let i = 0; i < vm.recent_product_prov_ids[product_name].length; i++) {
                        vm.recent_product_prov_ids[product_name][i]["index"] = i;
                    }
                } else {
                    var msg = "No provision id for products found, " + response.message + ".";
                    console.error(msg);
                }
            });
        };

        vm.get_recent_prov_id('Computational');
        vm.get_recent_prov_id('Vault');
        vm.get_recent_prov_id('Object');
        vm.get_recent_prov_id('Market-File');
        vm.get_recent_prov_id('Market-SONAS');

        CramsApiService.getProvisionRequestById(request_id).then(function (response) {
            if (response.success) {
                vm.alloc = response.data;
                vm.proj_desc = vm.alloc.description.replace(/\n/g, "<br />");
                //check email notification flag, if it's undefined, set it as true
                if (vm.alloc.requests[0].sent_email === undefined) {
                    vm.alloc.requests[0].sent_email = true;
                }
                angular.forEach(vm.alloc.requests[0].storage_requests, function (storage_req) {
                    var sp_id = storage_req.id;
                    var storage_prod = storage_req.product;
                    var provision_id = storage_req.provision_id;
                    if (provision_id === undefined) {
                        provision_id = null;
                    }
                    var provisioned = false;
                    var provision_notes = null;

                    var provision_details = storage_req.provision_details;
                    if (provision_details !== undefined) {
                        var status = provision_details.status;
                        //using provision status to check if it's already provisioned or not.
                        //can't using approved_quota_change to determine if it's provisioned or not
                        // as the request not to be updated during partial provision.
                        if (status === 'P') {
                            provisioned = true;
                        }
                        provision_notes = provision_details.message;
                        if (provision_notes !== null && provision_notes !== undefined) {
                            provision_notes = provision_notes.replace(/\n/g, "<br />");
                        }
                    }

                    var sr_provision = createStorageRequestProvision(sp_id, provision_id, provision_notes, storage_prod);
                    var sp_details = {'provisioned': provisioned, 'provision': sr_provision, 'selected': false};
                    vm.sp_provisions.push(sp_details);
                });
            } else {
                var msg = "Failed to get the approved request, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });
        vm.selected_sp_provisions = [];

        vm.checkSelectedSp = function (index) {
            vm.selected_sp_provisions = _.reject(vm.sp_provisions, function (sp_p) {
                return sp_p.selected === false;
            });
            vm.provision_form['sp_provision_id_' + index].$invalid = false;
            validateProvisionForm();
        };

        vm.notes_counts = [];
        vm.countNotes = function (index) {
            var sp_p = vm.sp_provisions[index];
            angular.forEach(vm.sp_provisions, function (sp_p, key) {
                var message = sp_p.provision.message;
                if (message !== null && message !== undefined && message !== '') {
                    vm.notes_counts[key] = message.length;
                } else {
                    vm.notes_counts[key] = 0;
                }
            });
        };

        vm.provision_request = function () {
            vm.btn_disabled = true;
            if (validateProvisionForm()) {
                var sp_r_provisions = [];
                angular.forEach(vm.selected_sp_provisions, function (sp_p, key) {
                    sp_r_provisions.push(sp_p.provision);
                });
                CramsApiService.provisionStorageProductRequests(sp_r_provisions).then(function (response) {
                    if (response.success) {
                        var sp_r_provisions = response.data;
                        check_sp_provision_response(sp_r_provisions);
                    } else {
                        var msg = "Provision Failed ";
                        FlashService.DisplayError(msg, response.data);
                        $anchorScroll();
                    }
                });
            } else {
                var msg = "Please fix up the below errors";
                FlashService.Error(msg);
                $anchorScroll();
                vm.btn_disabled = false;
            }
        };

        function check_sp_provision_response(resp_data) {
            vm.resp_errors = [];
            angular.forEach(resp_data, function (sp_resp, key) {
                var success = sp_resp.success;
                if (success === false) {
                    var errors = sp_resp.errors;
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
                } else {
                    var sp_provision = sp_resp.sp_provision;
                    var sp_p_id = sp_provision.id;
                    angular.forEach(vm.sp_provisions, function (sp_provision, key) {
                        var sp_prov = sp_provision.provision;
                        var found_sp_id = sp_prov.id;
                        if (sp_p_id === found_sp_id) {
                            sp_provision.provisioned = true;
                            sp_provision.selected = false;
                        }
                    });
                }
            });
            vm.sp_provision_error = false;
            // alert('---- provision erros: ' + JSON.stringify(vm.resp_errors));
            if (vm.resp_errors.length > 0) {
                var msg = "Provision Failed, see the below errors.";
                FlashService.DisplayError(msg, null);
                $anchorScroll();
                vm.btn_disabled = false;
                vm.sp_provision_error = true;
            } else {
                FlashService.Success('Provisioned', true);
                $location.path('/' + return_path);
                vm.btn_disabled = false;
            }
        }

        function isStorageChanged() {
            var storage_changed = false;
            angular.forEach(vm.alloc.requests[0].storage_requests, function (storage_req) {
                var approved_quota_changes = storage_req.approved_quota_change;
                if (approved_quota_changes !== 0) {
                    storage_changed = true;
                }
            });
            return storage_changed;
        }

        function validateProvisionForm() {
            //check storage products
            vm.non_storage_product_selected = false;
            if (vm.selected_sp_provisions.length === 0 && isStorageChanged()) {
                vm.non_storage_product_selected = true;
                return false;
            }

            angular.forEach(vm.sp_provisions, function (sp_p, key) {
                var provisioned = sp_p.provisioned;
                var selected = sp_p.selected;
                if (!provisioned && selected) {
                    if (sp_p.provision.provision_id === null || sp_p.provision.provision_id === undefined || sp_p.provision.provision_id === '') {
                        vm.provision_form['sp_provision_id_' + key].$invalid = true;
                        vm.provision_form.$valid = false;
                    }
                }

                var message = sp_p.provision.message;
                if (message !== null && message !== undefined && message !== '') {
                    var len = message.length;
                    if (len > 1500) {
                        vm.provision_form['sp_provision_notes_' + key].$invalid = true;
                        vm.provision_form.$valid = false;
                    }
                }
            });
            return vm.provision_form.$valid;
        }

        function generateProvisionResults(allocation) {
            var project_provision = emptyProjectRequestProvisions();
            project_provision.id = allocation.id;
            var req_provision = {};
            req_provision.id = allocation.requests[0].id;
            req_provision.compute_requests = [];
            //storage provisions
            var final_sp_provisions = [];
            angular.forEach(vm.selected_sp_provisions, function (sp_p, key) {
                var provision = sp_p.provision;
                final_sp_provisions.push(provision);
            });
            req_provision.storage_requests = final_sp_provisions;
            req_provision.sent_email = allocation.requests[0].sent_email;
            project_provision.requests.push(req_provision);
            return project_provision;
        }

        function createStorageRequestProvision(s_req_id, provision_id, message, storage_product) {
            var storage_provision = {};
            storage_provision.id = s_req_id;
            storage_provision.provision_id = provision_id;
            storage_provision.message = message;
            storage_provision.storage_product = storage_product;
            return storage_provision;
        }

        function emptyProjectRequestProvisions() {
            var provision_details = {};
            provision_details.id = null;
            provision_details.project_ids = [];
            provision_details.requests = [];
            return provision_details;
        }
    }
})();

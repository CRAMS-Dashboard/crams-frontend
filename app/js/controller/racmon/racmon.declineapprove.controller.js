/**
 * Created by simonyu on 9/05/16.
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonDeclineApproveController', RacMonDeclineApproveController);

    RacMonDeclineApproveController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll', 'ENV'];

    function RacMonDeclineApproveController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll, ENV) {
        var vm = this;
        var request_id = $routeParams.request_id;

        var request_paths = $location.path().split('/');
        var return_path = request_paths[1];
        if (return_path === 'admin') {
            return_path = 'admin/allocations';
        }

        //Populate Funding Schemes
        LookupService.fundingScheme(ENV.erb).then(function (response) {
            if (response.success) {
                vm.funding_schemes = response.data;
            } else {
                var msg = "Failed to load funding schemes, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });

        CramsApiService.getProjectRequestById(request_id).then(function (response) {
            if (response.success) {
                vm.alloc = response.data[0];
                angular.forEach(vm.alloc.requests[0].storage_requests, function (each_storage_req, key) {
                    each_storage_req.approved_quota_change = each_storage_req.requested_quota_change;
                    each_storage_req.approved_quota_total = each_storage_req.current_quota + each_storage_req.approved_quota_change;
                });
                vm.proj_desc = vm.alloc.description.replace(/\n/g, "<br />");

                //check email notification flag, if it's undefined, set it as true
                if (vm.alloc.requests[0].sent_email === undefined) {
                    vm.alloc.requests[0].sent_email = true;
                }
            } else {
                var msg = "Failed to get the allocation request, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });

        //Populate nectar storage product lookup
        LookupService.loadStorageProducts(ENV.funidng_body).then(function (response) {
            if (response.success) {
                vm.storageProducts = response.data;
            } else {
                var msg = "Failed to load the storage products, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });

        //if check storage products duplicated or not
        vm.changeStorageProduct = function (scope, index) {
            vm.clearSpDuplicatedFlag();
            var found_duplicated = false;
            var all_storage_requests = angular.copy(vm.alloc.requests[0].storage_requests);
            angular.forEach(vm.alloc.requests[0].storage_requests, function (each_sp_req, key) {
                angular.forEach(all_storage_requests, function (a_sp_req, akey) {
                    if (key !== akey) {
                        if ((each_sp_req.storage_product.id === a_sp_req.storage_product.id)
                            && each_sp_req.storage_product.id !== 0
                            && a_sp_req.storage_product.id !== 0
                            && each_sp_req.storage_product.id !== undefined
                            && a_sp_req.storage_product.id !== undefined) {
                            found_duplicated = true;
                            vm.approve_form['sp_' + akey].$setValidity('isdup', !found_duplicated);
                            vm.approve_form['sp_' + key].$setValidity('isdup', !found_duplicated);
                            // set form invalid
                            vm.approve_form.$valid = !found_duplicated;
                        }
                    }
                });
            });
        };

        vm.clearSpDuplicatedFlag = function () {
            angular.forEach(vm.alloc.requests[0].storage_requests, function (each_sp_req, key) {
                vm.approve_form['sp_' + key].$setValidity('isdup', true);
            });
        };

        // change funding scheme
        vm.selectFundingScheme = function () {
            var selected_funding_scheme_id = vm.alloc.requests[0].funding_scheme.id;
            if (selected_funding_scheme_id !== undefined || selected_funding_scheme_id !== 0) {
                var selected_scheme = _.findWhere(vm.funding_schemes, {"id": selected_funding_scheme_id});
                vm.alloc.requests[0].funding_scheme.funding_scheme = selected_scheme.funding_scheme;
            }
        };

        vm.negative_total_quota_invalid = [];

        vm.calcualteApprovedTotal = function (sp_index) {
            vm.negative_total_quota_invalid[sp_index] = false;
            var quota_total = vm.alloc.requests[0].storage_requests[sp_index].current_quota + vm.alloc.requests[0].storage_requests[sp_index].approved_quota_change;
            vm.alloc.requests[0].storage_requests[sp_index].approved_quota_total = quota_total;

            if (quota_total < 0) {
                vm.negative_total_quota_invalid[sp_index] = true;
            }
        };

        vm.decline_notes_err_msg = 'Reason can not be blank';

        function validate_decline_form() {
            if (vm.declineParams !== undefined) {
                if (vm.declineParams.approval_notes) {
                    // check notes not greater than 500 char
                    if (vm.declineParams.approval_notes.length > 500) {
                        vm.decline_notes_err_msg = 'Reason notes has exceeded 500 characters';
                        vm.decline_notes_invalid = true;
                        return false;
                    } 
                } else {
                    // check white spaces
                    vm.decline_notes_err_msg = 'Reason can not be blank';
                    vm.decline_notes_invalid = true;
                    return false;    
                }
            } else {
                vm.decline_notes_err_msg = 'Reason can not be blank';
                vm.decline_notes_invalid = true;
                return false;
            }
            
            vm.decline_notes_invalid = false;
            return true;        
        }

        vm.decline_request = function () {
            vm.btn_disabled = true;
            
            if (validate_decline_form()) {
                var approval_notes = "";
                if (vm.declineParams !== undefined) {
                    approval_notes = vm.declineParams.approval_notes;
                }
                
                var sent_data = {
                    'approval_notes': approval_notes,
                    'sent_email': vm.alloc.requests[0].sent_email
                };
                CramsApiService.declineRequest(sent_data, request_id).then(function (response) {
                    if (response.success) {
                        FlashService.Success('Request declined', true);
                        $location.path('/' + return_path);
                        vm.btn_disabled = false;
                    } else {
                        var msg = "Failed to decline the request, " + response.message + ".";
                        FlashService.DisplayError(msg, response.data);
                        console.error(msg);
                        vm.btn_disabled = false;
                    }
                });
            }
            vm.btn_disabled = false;
        };

        vm.approve_request = function () {
            vm.btn_disabled = true;
            if (validate_approve_form()) {
                _.each(vm.alloc.requests, function (req, index, list) {
                    var ar = _.pick(req, 'compute_requests', 'storage_requests', 'funding_scheme', 'national_percent', 'approval_notes', 'sent_email');
                    CramsApiService.approveRequest(ar, req.id).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Request approved', true);
                            $location.path('/' + return_path);
                            vm.btn_disabled = false;
                        } else {
                            var msg = "Failed to approve the request, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            console.error(msg);
                            $anchorScroll();
                            vm.btn_disabled = false;
                        }
                    });
                });
            } else {
                var msg = "Please fix up the below errors";
                FlashService.Error(msg);
                $anchorScroll();
                vm.btn_disabled = false;
            }
        };

        function validate_approve_form() {
            vm.approval_notes_err_msg = 'Reason can not be blank';
            vm.funding_scheme_invalid = false;
            vm.approval_notes_invalid = false;

            if (!vm.approve_form.funding_scheme.$valid) {
                vm.funding_scheme_invalid = true;
                vm.approve_form.$valid = false;
            }
            if (vm.alloc.requests[0].funding_scheme.id === 0 || vm.alloc.requests[0].funding_scheme.id === null) {
                vm.funding_scheme_invalid = true;
                vm.approve_form.$valid = false;
            }
            if (vm.alloc.requests[0].approval_notes) {
                // check notes not greater than 500 char
                if (vm.alloc.requests[0].approval_notes.length > 500) {
                    vm.approval_notes_err_msg = 'Reason notes has exceeded 500 characters';
                    vm.approve_form.$valid = false;
                    vm.approval_notes_invalid = true;
                    return false;
                }
            }

            angular.forEach(vm.alloc.requests[0].storage_requests, function (storage_request, key) {
                // if (storage_request.storage_product.id === 0) {
                //     vm.approve_form['sp_' + key].$invalid = true;
                //     vm.approve_form.$valid = false;
                // }
                if (storage_request.current_quota === 0 && storage_request.approved_quota_change <= 0) {
                    vm.approve_form['approved_quota_change_' + key].$invalid = true;
                    vm.approve_form.$valid = false;
                }
            });
            return vm.approve_form.$valid;
        }
    }
})();

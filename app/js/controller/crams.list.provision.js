/**
 * Created by simonyu on 28/3/17.
 */

(function () {
    'use strict';
    angular.module('crams').controller('ProvisionListController', ProvisionListController);

    ProvisionListController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll', 'ENV'];

    function ProvisionListController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll, ENV) {
        var vm = this;
        //get all approved provision list
        getProvisionRequestList();
        vm.show_status_window = false;
        vm.selected_status = [];

        function getProvisionRequestList() {
            vm.loaded = false;
            vm.projects = [];

            //Populate Funding body allocations based on a selected funding body and a request status
            CramsApiService.provisionList().then(function (response) {
                if (response.success) {
                    vm.projects = response.data;
                    //filter the projects by system
                    vm.projects = _.filter(vm.projects, function (project) {
                        return project.requests[0].e_research_system.name === ENV.system;
                    });

                    if (vm.projects !== undefined || vm.projects.length !== 0) {
                        vm.projects = _.sortBy(vm.projects, function (p) {
                            return p.title.toLowerCase();
                        });
                    }
                    getRequestStatus(vm.projects);
                    //copy all projects.
                    vm.copied_projects = angular.copy(vm.projects);
                    initSortColumnIcon();
                } else {
                    var msg = "Failed to get approved provision list, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.isSpProvisioned = function (sp_request) {
            var provision_details = sp_request.provision_details;
            if (provision_details !== undefined && provision_details !== null) {
                var status = provision_details.status;
                if (status === 'P') {
                    return true;
                }
            }
            return false;
        };

        vm.isSpProvisionPending = function (sp_request) {
            var provision_details = sp_request.provision_details;
            if (provision_details === null || provision_details === undefined) {
                return true;
            } else {
                var status = provision_details.status;
                if (status === 'S') {
                    return true;
                }
            }
            return false;
        };

        // get all the request status available in list
        function getRequestStatus(projects) {
            vm.all_status = [];
            angular.forEach(projects, function (project) {
                var all_requests = project.requests;
                angular.forEach(all_requests, function (req) {
                    var code = req.request_status.code;
                    var display_name = req.request_status.display_name;
                    var existed = _.findWhere(vm.all_status, {'code': code, 'display_name': display_name});
                    if (existed === undefined) {
                        vm.all_status.push({'code': code, 'display_name': display_name});
                    }
                });
            });
            vm.all_status = _.sortBy(vm.all_status, function (st) {
                return st.display_name.toLowerCase();
            });
        }

        vm.filterProjects = function () {
            vm.projects = vm.copied_projects;
            if (vm.projects.length > 0) {
                vm.filterProjectsByStatus();
                // var sort_type = 'asc';
                // if (vm.nameDesc) {
                //     sort_type = 'desc';
                // }
                // sortByName(sort_type);
            }
        };

        vm.filterProjectsByStatus = function () {
            var filtered_projects = [];
            if (vm.selected_status.length !== 0) {
                angular.forEach(vm.projects, function (project) {
                    var requests = project.requests;
                    if (requests !== undefined && requests.length > 0) {
                        var req = requests[0];
                        if (_.contains(vm.selected_status, req.request_status.display_name)) {
                            filtered_projects.push(project);
                        }
                    }
                });
                vm.projects = filtered_projects;
            }
        };

        vm.showStatusFilter = function () {
            vm.show_status_window = true;
        };

        vm.closeStatusFilter = function () {
            vm.show_status_window = false;
        };

        vm.nameSort = function () {
            // save current order
            var asc = vm.nameAsc;
            var desc = vm.nameDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.nameAsc = !asc;
            vm.nameDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.title.toLowerCase();
            });

            if (vm.nameDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        vm.transactionIdSort = function () {
            // save current order
            var asc = vm.transAsc;
            var desc = vm.transDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.transAsc = !asc;
            vm.transDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.requests[0].transaction_id.toLowerCase();
            });

            if (vm.transDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        vm.fundingSort = function () {
            // save current order
            var asc = vm.fundingAsc;
            var desc = vm.fundingDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.fundingAsc = !asc;
            vm.fundingDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.requests[0].funding_scheme.funding_scheme.toLowerCase();
            });

            if (vm.fundingDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        vm.approverSort = function () {
            // save current order
            var asc = vm.approverAsc;
            var desc = vm.approverDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.approverAsc = !asc;
            vm.approverDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.requests[0].approver_email.toLowerCase();
            });

            if (vm.approverDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        function initSortColumnIcon() {
            vm.nameAsc = true;
            vm.nameDesc = false;
            vm.transAsc = true;
            vm.transDesc = false;
            vm.fundingAsc = true;
            vm.fundingDesc = false;
            vm.approverAsc = true;
            vm.approverDesc = false;
        }
    }
})();
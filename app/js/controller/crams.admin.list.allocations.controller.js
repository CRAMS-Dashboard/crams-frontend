/**
 * Created by simonyu on 14/2/17.
 */
/**
 * Created by simonyu on 19/10/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsAdminAllocationsController', CramsAdminAllocationsController);

    CramsAdminAllocationsController.$inject = ['FlashService', 'CramsApiService', 'LookupService', '$scope', '$rootScope', '$filter', '$anchorScroll', 'ENV'];

    function CramsAdminAllocationsController(FlashService, CramsApiService, LookupService, $scope, $rootScope, $filter, $anchorScroll, ENV) {
        var vm = this;
        vm.loaded = false;

        vm.allocations_base_path = 'admin/allocations';
        //get my allocation requests
        vm.copied_projects = [];
        CramsApiService.listAdminAllocations().then(function (response) {
            if (response.success) {
                // vm.projects = response.data;
                vm.projects = response.data;
                //filter the projects by system
                vm.projects = _.filter(vm.projects, function (project) {
                    return project.requests[0].e_research_system.name === ENV.system;
                });

                if (vm.projects !== undefined && vm.projects.length !== 0) {
                    //copy all projects.
                    vm.copied_projects = angular.copy(vm.projects);
                    sortBy('asc', true);
                    getRequestStatus();
                }

                // init default sort icons
                initSortColumnIcon();
            } else {
                var msg = "Failed to get allocations, " + response.message + '.';
                FlashService.DisplayError(msg, response.data);
            }
        }).finally(function () {
            vm.loaded = true;
        });

        vm.show_filter_window = false;
        vm.showNameFilter = function () {
            vm.show_filter_window = true;
        };

        vm.closeNameFilter = function () {
            vm.show_filter_window = false;
        };

        vm.asc = true;
        vm.desc = false;

        vm.setAscDescSort = function (sort_type) {
            if (sort_type === 'asc') {
                vm.asc = true;
                vm.desc = false;
            } else {
                vm.desc = true;
                vm.asc = false;
            }
            sortBy(sort_type, true);
        };

        function sortBy(sort_type, close_window) {
            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.title.toLowerCase();
            });
            if (sort_type === 'desc') {
                vm.projects = vm.projects.reverse();
            }
            if (close_window) {
                vm.show_filter_window = false;
            }
        }

        vm.hasNonCompSp = function (request) {
            var has_other_sp = false;
            angular.forEach(request.storage_requests, function (s_req) {
                var sp_name = s_req.storage_product.name;
                if (sp_name.indexOf('Computational') === -1) {
                    has_other_sp = true;
                }
            });
            return has_other_sp;
        };

        vm.filterProjects = function () {
            vm.projects = [];
            if (vm.filtered_project_name !== undefined && vm.filtered_project_name !== null && vm.filtered_project_name.length >= 3) {
                var temp_projects = [];
                angular.forEach(vm.copied_projects, function (project) {
                    var title = project.title.toLowerCase();
                    if (title.indexOf(vm.filtered_project_name.toLowerCase()) !== -1) {
                        temp_projects.push(project);
                    }
                });
                vm.projects = temp_projects;
            } else {
                vm.projects = vm.copied_projects;
            }
            if (vm.projects.length > 0) {
                filterProjectByStatus();
                var sort_type = 'asc';
                if (vm.desc) {
                    sort_type = 'desc';
                }
                sortBy(sort_type, false);
            }
        };

        function filterProjectByStatus() {
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
        }

        vm.clearFilter = function () {
            if (vm.filtered_project_name !== undefined && vm.filtered_project_name !== null && vm.filtered_project_name !== '') {
                vm.filtered_project_name = null;
                vm.filterProjects();
            }
        };

        vm.selected_status = [];

        function getRequestStatus() {
            vm.all_status = [];
            angular.forEach(vm.copied_projects, function (project) {
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

        vm.show_status_window = false;
        vm.showStatusFilter = function () {
            vm.show_status_window = true;
        };

        vm.closeStatusFilter = function () {
            vm.show_status_window = false;
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

            // reset the sort column icons
            initSortColumnIcon();

            vm.fundingAsc = !asc;
            vm.fundingDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.requests[0].funding.toLowerCase();
            });

            if (vm.fundingDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        function initSortColumnIcon() {
            vm.transAsc = true;
            vm.transDesc = false;
            vm.fundingAsc = true;
            vm.fundingDesc = false;
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

        vm.allocationCSVData = function () {
            var allocations_csv = [];
            angular.forEach(vm.projects, function (project) {
                var req = project.requests[0];
                angular.forEach(req.storage_requests, function (s_req) {
                    var csv_data = [project.title, req.request_status.display_name, s_req.storage_product.name, req.transaction_id, s_req.requested_quota_total, s_req.approved_quota_total, req.funding_scheme.funding_scheme];
                    allocations_csv.push(csv_data);
                });
            });
            return allocations_csv;
        };

        vm.allocationsCSVHeadings = function () {
            return ['Project Name', 'status', 'Resources', 'Transaction ID', 'Requested Quota (GB)', 'Approved Quota (GB)', 'Funding'];
        };

        vm.isReadonly = function (request) {
            if ($rootScope.globals.perms !== undefined) {
                var isAdmin = $rootScope.globals.perms.admin;
                if (isAdmin) {
                    return false;
                } else {
                    if (request.readonly) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            return true;
        };

        vm.isPreProvisioned = function (req) {
            var related_allocations = req.related_allocations;
            if (related_allocations !== null && related_allocations !== undefined) {
                var provisioned_id = related_allocations.provisioned_allocation_id;
                if (provisioned_id !== undefined && provisioned_id !== null) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        };

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();
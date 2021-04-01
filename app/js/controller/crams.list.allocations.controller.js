/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsListAllocationsController', CramsListAllocationsController);

    CramsListAllocationsController.$inject = ['$routeParams', 'FlashService', 'CramsApiService', 'LookupService', '$scope', '$filter', '$anchorScroll', 'ENV'];

    function CramsListAllocationsController($routeParams, FlashService, CramsApiService, LookupService, $scope, $filter, $anchorScroll, ENV) {
        var vm = this;
        vm.selected_funding_body = -1;
        vm.req_status = $routeParams.status;
        vm.isAproved = false;
        vm.show_filter_window = false;
        vm.show_status_window = false;
        vm.selected_status = [];
        vm.show_table = true;

        // init default sort icons
        initSortColumnIcon();

        if (vm.req_status === 'approved' || vm.req_status === 'active' || vm.req_status === 'expired') {
            vm.isAproved = true;
        } else {
            vm.req_status = null;
        }
        vm.funding_bodies = [];
        //load user funding body.
        loadFundingBody();

        function loadFundingBody() {

            //load funding body
            LookupService.fundingBody().then(function (response) {
                if (response.success) {
                    vm.funding_bodies = response.data;
                    vm.funding_bodies.unshift({"id": -1, "name": "All", "reviewer": true, "approver": true});
                } else {
                    var msg = "Failed to load user funding body";
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        // get all the request status available in list
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

        //get funding body allocation requests
        getApprovalRequests();

        function getApprovalRequests() {
            vm.loaded = false;
            vm.projects = [];

            //Populate Funding body allocations based on a selected funding body and a request status
            CramsApiService.listApproval(vm.selected_funding_body, vm.req_status).then(function (response) {
                if (response.success) {
                    vm.projects = response.data.projects;

                    if (vm.projects.length <= 0) {
                        vm.show_table = false;
                    }

                    //filter the projects by system
                    vm.projects = _.filter(vm.projects, function (project) {
                        return project.requests[0].e_research_system.name === ENV.system;
                    });

                    if (vm.projects !== undefined || vm.projects.length !== 0) {
                        vm.projects = _.sortBy(vm.projects, function (p) {
                            return p.title.toLowerCase();
                        });

                        //copy all projects.
                        vm.copied_projects = angular.copy(vm.projects);
                        getRequestStatus(vm.copied_projects);
                    }
                } else {
                    var msg = "Failed to get funding body allocation requests, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        vm.filterAllocations = function () {
            getApprovalRequests();
        };

        function sortByName(sort_type) {
            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.title.toLowerCase();
            });

            if (sort_type === 'desc') {
                vm.projects = vm.projects.reverse();
            }
        }

        vm.showNameFilter = function () {
            vm.show_filter_window = true;
        };

        vm.closeNameFilter = function () {
            vm.show_filter_window = false;
        };

        vm.setNameAscDescSort = function (sort_type) {
            // reset sort column icons
            initSortColumnIcon();

            if (sort_type === 'asc') {
                vm.nameAsc = true;
                vm.nameDesc = false;
            }

            if (sort_type === 'desc') {
                vm.nameAsc = false;
                vm.nameDesc = true;
            }

            sortByName(sort_type);

            vm.closeNameFilter();
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
                vm.filterProjectsByStatus();
                var sort_type = 'asc';
                if (vm.nameDesc) {
                    sort_type = 'desc';
                }
                sortByName(sort_type);
            }
        };

        vm.clearProjectNameFilter = function () {
            if (vm.filtered_project_name !== undefined && vm.filtered_project_name !== null && vm.filtered_project_name !== '') {
                vm.filtered_project_name = null;
                vm.filterProjects();
            }
            vm.show_filter_window = false;
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

        vm.updatedBySort = function () {
            // save current order
            var asc = vm.updatedByAsc;
            var desc = vm.updatedByDesc;

            // reset the sort columns icons
            initSortColumnIcon();

            vm.updatedByAsc = !asc;
            vm.updatedByDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.updated_by.email.toLowerCase();
            });

            if (vm.updatedByDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        vm.approverSort = function () {
            // save current order
            var asc = vm.approverAsc;
            var desc = vm.approverDesc;

            // reset the sort column icons
            initSortColumnIcon();

            vm.approverAsc = !asc;
            vm.approverDesc = !desc;

            vm.projects = _.sortBy(vm.projects, function (p) {
                return p.requests[0].updated_by.email.toLowerCase();
            });

            if (vm.approverDesc === true) {
                vm.projects = vm.projects.reverse();
            }
        };

        function initSortColumnIcon() {
            vm.nameAsc = true;
            vm.nameDesc = false;
            vm.resourceAsc = true;
            vm.resourceDesc = false;
            vm.transAsc = true;
            vm.transDesc = false;
            vm.fundingAsc = true;
            vm.fundingDesc = false;
            vm.updatedByAsc = true;
            vm.updatedByDesc = false;
            vm.approverAsc = true;
            vm.approverDesc = false;
        }

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();

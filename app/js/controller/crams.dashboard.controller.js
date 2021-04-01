/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    google.load("visualization", "1", {packages: ["corechart"]});
    angular.module('crams').controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$routeParams', '$scope', '$rootScope', 'CramsApiService', 'LookupService', 'FlashService', '$timeout', '$anchorScroll', 'ENV'];

    function DashboardController($routeParams, $scope, $rootScope, CramsApiService, LookupService, FlashService, $timeout, $anchorScroll, ENV) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }
        vm.isCostView = false;
        vm.view_label = 'Cost View';

        vm.toggleCostView = function () {
            vm.isCostView = !vm.isCostView;
            if (vm.isCostView) {
                vm.view_label = 'Usage View';
            } else {
                vm.view_label = 'Cost View';
            }
        };
        //loading spinners for all projects
        vm.load_spinners = {};

        vm.loaded = false;
        initializeDashboardProjects();
        //load the research system name first
        //then load dashboard projects and first project graphic
        function initializeDashboardProjects() {
            LookupService.researchSystem(ENV.erb).then(function (response) {
                if (response.success) {
                    var racmon_systems = response.data;
                    vm.e_research_system = racmon_systems[0];

                    //define storage product usage dictionary
                    vm.storage_product_usages_dict = {};
                    //CramsApiService.dashboardProjects(vm.type_admin).then(function (response) {
                    CramsApiService.dashboardRacmonProjects(vm.type_admin).then(function (response) {
                        if (response.success) {
                            vm.projects = response.data;


                            if (vm.projects !== undefined && vm.projects.length !== 0) {
                                vm.projects = _.sortBy(vm.projects, function (p) {
                                    return p.project.title.toLowerCase();
                                    // return p.title.toLowerCase();
                                });

                                vm.display_projects = angular.copy(vm.projects);
                                //load the first project report graphic
                                var first_project = vm.projects[0].project;
                                var project_id = first_project.id;
                                loadProjectUsageCost(project_id);
                            }
                        } else {
                            var msg = "Failed to get allocations, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                        }
                    }).finally(function () {
                        vm.loaded = true;
                    });
                } else {
                    var msg = "Failed to load eresearch systems, " + response.message + ".";
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        vm.getPersistentIdLink = function (crams_id) {
            if (vm.type_admin) {
                return '/#/admin/allocations/collection/' + crams_id;
            } else {
                return '/#/allocations/collection/' + crams_id;
            }
        };

        vm.loadProjectGraphicData = function (project_id) {
            var existed_project = vm.storage_product_usages_dict[project_id];
            if (existed_project === undefined) {
                loadProjectUsageCost(project_id);
            } else {
                delete vm.storage_product_usages_dict[project_id];
            }
        };

        function loadProjectUsageCost(project_id) {
            if (vm.e_research_system !== undefined) {
                //put loading spinner flag
                vm.load_spinners[project_id] = true;
                CramsApiService.getProjectUsageCost(project_id, vm.e_research_system.name).then(function (response) {
                    if (response.success) {
                        //populate the models
                        vm.storage_product_usages_dict[project_id] = response.data;
                    } else {
                        var msg = "Failed to get the project reports, " + response.message + '.';
                        FlashService.DisplayError(msg, response.data);
                    }
                }).finally(function () {
                    //set no loading spinner
                    vm.load_spinners[project_id] = false;
                });
            } else {
                var msg = "Failed to get the project reports, eresearch system name is undefined";
                FlashService.Error(msg);
            }
        }

        //check if it is expanded or not
        vm.isExpanded = function (project_id) {
            var project = vm.storage_product_usages_dict[project_id];
            if (project !== undefined) {
                return true;
            } else {
                return false;
            }
        };

        vm.projectUsageCost = function (project_id) {
            var project = vm.storage_product_usages_dict[project_id];
            if (project !== undefined) {
                return project.storage_product;
            } else {
                return [];
            }
        };

        function filterProjectUsageCost(project_id) {
            if (vm.e_research_system !== undefined) {
                //put loading spinner flag
                vm.load_spinners[project_id] = true;
                vm.storage_product_usages_dict = {};

                vm.display_projects = _.filter(vm.projects, function (proj) {
                    return proj.project.id === project_id;
                });
                CramsApiService.getProjectUsageCost(project_id, vm.e_research_system.name).then(function (response) {
                    if (response.success) {

                        vm.storage_product_usages_dict[project_id] = response.data;

                    } else {
                        vm.storage_product_usages_dict = {};
                        var msg = "Failed to get the project reports, " + response.message + '.';
                        FlashService.DisplayError(msg, response.data);
                    }
                }).finally(function () {
                    //set no spinner flag
                    vm.load_spinners[project_id] = false;
                });
            }
        }

        vm.isLoading = function (project_id) {
            var f_spinner = vm.load_spinners[project_id];
            if (f_spinner === undefined) {
                return false;
            } else {
                return f_spinner;
            }
        };

        vm.selected_project_id = null;

        function filterProjectReport() {
            if (vm.selected_project_id !== null) {
                filterProjectUsageCost(vm.selected_project_id);
            } else {
                initializeDashboardProjects();
            }
        }

        //timer to delay refesh the graphic
        function delayRefeshGoogleGraphic() {
            if (vm.time < 5000) {
                vm.time += 1000;
                filterProjectReport();
            }
        }

        vm.filterProject = function () {
            vm.time = 0;
            $timeout(delayRefeshGoogleGraphic, 300);
        };

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();


/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    google.load("visualization", "1", {packages: ["corechart"]});
    angular.module('crams').controller('FacultyUsageController', FacultyUsageController);

    FacultyUsageController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'LookupService', 'OrganisationService', 'FlashService', '$anchorScroll', '$filter', '$timeout', 'ENV'];
    function FacultyUsageController($routeParams, $scope, CramsApiService, LookupService, OrganisationService, FlashService, $anchorScroll, $filter, $timeout, ENV) {
        var vm = this;
        vm.type_admin = $routeParams.type_admin;

        if (vm.type_admin === 'merc_admin'){
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

        //loading spinners for all faculties
        vm.load_spinners = {};

        initializeFacultyUsageCost();

        function initializeFacultyUsageCost() {
            vm.storage_product_usages_dict = {};
            LookupService.researchSystem(ENV.erb).then(function (response) {
                if (response.success) {
                    var racmon_systems = response.data;
                    vm.e_research_system = racmon_systems[0];
                    if (vm.e_research_system !== undefined) {
                        // get organisation list
                        OrganisationService.listOrganisation().then(function (response) {
                            if (response.success) {
                                var org_list = response.data;
                                //select the first one
                                var first_org = org_list[0];
                                if (first_org !== undefined) {
                                    OrganisationService.listFaculty(first_org.id, vm.type_admin).then(function (response) {
                                        if (response.success) {
                                            vm.faculties = response.data.faculties;
                                            if (vm.faculties !== undefined) {
                                                vm.display_faculties = angular.copy(vm.faculties);
                                                loadFacultyUsageCost(vm.faculties[0].id);
                                            }
                                        } else {
                                            var msg = "Failed to get faculty list, " + response.message + ".";
                                            // display error message to page
                                            FlashService.DisplayError(msg, response.data);
                                        }
                                    });
                                }
                            } else {
                                var msg = "Failed to get Organisation list, " + response.message + ".";
                                // display error message to page
                                FlashService.DisplayError(msg, response.data);
                            }
                        });
                    } else {
                        FlashService.Error('Undefined system name');
                    }
                } else {
                    var msg = "Failed to load eresearch systems, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });

        }

        vm.selected_faculty_id = null;

        vm.loadFacultyGraphicData = function (faculty_id) {
            var existed_faculty = vm.storage_product_usages_dict[faculty_id];
            if (existed_faculty === undefined) {
                loadFacultyUsageCost(faculty_id);
            } else {
                delete vm.storage_product_usages_dict[faculty_id];
            }
        };

        function loadFacultyUsageCost(faculty_id) {
            if (vm.e_research_system !== undefined) {
                //put loading spinner flag
                vm.load_spinners[faculty_id] = true;
                CramsApiService.getFacultyUsageCostById(faculty_id, vm.e_research_system.name).then(function (response) {
                    if (response.success) {
                        vm.storage_product_usages_dict[faculty_id] = response.data;
                    } else {
                        if (response.status === 404) {
                            if (response.data.hasOwnProperty('detail')) {
                                var message = response.data.detail;
                                if (message === 'Not found.') {
                                    vm.storage_product_usages_dict[faculty_id] = null;
                                    //vm.no_usage_data_message = 'No Usage Data';
                                } else {
                                    var msg = "Failed to get the project reports, " + response.message + '.';
                                    FlashService.DisplayError(msg, response.data);
                                }
                            }
                        } else {
                            var err_msg = "Failed to get the project reports, " + response.message + '.';
                            FlashService.DisplayError(err_msg, response.data);
                        }
                    }
                }).finally(function () {
                    //set no loading spinner
                    vm.load_spinners[faculty_id] = false;
                });
            }
        }

        //check if it is expanded or not
        vm.isExpanded = function (faculty_id) {
            var faculty = vm.storage_product_usages_dict[faculty_id];
            if (faculty !== undefined) {
                return true;
            } else {
                return false;
            }
        };


        vm.facultyUsageCost = function (faculty_id) {
            var faculty = vm.storage_product_usages_dict[faculty_id];
            if (faculty !== undefined && faculty !== null) {
                return faculty.storage_product;
            } else if (faculty === undefined) {
                return undefined;
            } else {
                return [];
            }
        };

        function filterFacultyUsageCost(faculty_id) {
            if (vm.e_research_system !== undefined) {
                //put loading spinner flag
                vm.load_spinners[faculty_id] = true;
                vm.display_faculties = _.filter(vm.faculties, function (fac) {
                    return fac.id === faculty_id;
                });
                vm.storage_product_usages_dict = {};
                CramsApiService.getFacultyUsageCostById(faculty_id, vm.e_research_system.name).then(function (response) {
                    if (response.success) {
                        vm.storage_product_usages_dict[faculty_id] = response.data;
                    } else {
                        if (response.status === 404) {
                            if (response.data.hasOwnProperty('detail')) {
                                var message = response.data.detail;
                                if (message === 'Not found.') {
                                    vm.storage_product_usages_dict[faculty_id] = null;
                                } else {
                                    var msg = "Failed to get the project reports, " + response.message + '.';
                                    FlashService.DisplayError(msg, response.data);
                                }
                            }
                        } else {
                            var err_msg = "Failed to get the project reports, " + response.message + '.';
                            FlashService.DisplayError(err_msg, response.data);
                        }
                    }
                }).finally(function () {
                    //set no spinner flag
                    vm.load_spinners[faculty_id] = false;
                });
            }
        }

        vm.isLoading = function (faculty_id) {
            var f_spinner = vm.load_spinners[faculty_id];
            if (f_spinner === undefined) {
                return false;
            } else {
                return f_spinner;
            }
        };

        vm.selected_faculty_id = null;

        function filterFacultyReport() {
            if (vm.selected_faculty_id !== null) {
                filterFacultyUsageCost(vm.selected_faculty_id);
            } else {
                initializeFacultyUsageCost();
            }
        }

        //timer to delay refesh the graphic
        function delayRefeshGoogleGraphic() {
            if (vm.time < 5000) {
                vm.time += 1000;
                filterFacultyReport();
            }
        }

        vm.filterFaculty = function () {
            vm.time = 0;
            $timeout(delayRefeshGoogleGraphic, 300);
        };

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };
    }
})();


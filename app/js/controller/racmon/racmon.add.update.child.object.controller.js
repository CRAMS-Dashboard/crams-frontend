(function () {
    'use strict';
    angular.module('crams').controller('RacMonAddUpdateChildObjectController', RacMonAddUpdateChildObjectController);

    RacMonAddUpdateChildObjectController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'CramsApiService', 'OrganisationService', 'FlashService', '$anchorScroll', '$q', '$filter', '$timeout'];

    function RacMonAddUpdateChildObjectController($scope, $rootScope, $routeParams, $location, CramsApiService, OrganisationService, FlashService, $anchorScroll, $q, $filter, $timeout) {
        var vm = this;
        //This controller will be used for adding and updating.
        vm.request_id = $routeParams.request_id;
        vm.child_id = $routeParams.child_id;

        vm.button_label = 'Submit';

        vm.allocations_base_path = 'allocations';
        var current_paths = $location.path().split('/');
        if (current_paths[1] === 'admin' && current_paths[2] === 'allocations') {
            vm.allocations_base_path = current_paths[1] + '/' + current_paths[2];
        }

        var ADD_NEW_LABEL = '【 Add New Label 】';
        vm.selected_label = null;
        vm.label_options = [];
        vm.show_add_label = false;

        $scope.addOrChangeDataOwnerLabel = 'Add Data Owner';

        // populate the erb_label dropdown and get label id
        CramsApiService.getERBLabelList("racmon").then(function (response) {
            if (response.success) {
                vm.erb_label_list = response.data;
                vm.label_options = vm.erb_label_list.labels;
                repopulateLabelOptions(null);
            } else {
                var msg = "Failed ERB label list, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
            }
        });

        vm.checkSelectedLabel = function () {
            vm.selected_label_invalid = false;
            vm.sequence_number_invalid = false;
            clearFlashMessage();
            if (vm.selected_label === undefined || vm.selected_label === null) {
                vm.selected_label_invalid = true;
                vm.child_object.erb_label = emptyERBLabelObject();
            } else {
                if (vm.selected_label === ADD_NEW_LABEL) {
                    vm.show_add_label = true;
                    vm.new_erb_label = null;
                } else {
                    vm.show_add_label = false;
                    generateSeqNumByLabel(vm.selected_label);
                }
            }
        };

        vm.closeAddLabelWindow = function () {
            vm.show_add_label = false;
            if (vm.selected_label === ADD_NEW_LABEL) {
                vm.selected_label = null;
                vm.child_object.erb_label = emptyERBLabelObject();
            }
            cleanLabelMsg();
        };

        function cleanLabelMsg() {
            vm.add_label_success = false;
            vm.add_label_error = false;
            vm.add_label_success_msg = null;
            vm.add_label_error_msg = null;
            vm.new_label_invalid = false;
        }

        vm.addNewLabel = function () {
            cleanLabelMsg();
            if (validateNewLabel()) {
                CramsApiService.addNewErbLabel("racmon", vm.new_erb_label).then(function (response) {
                    if (response.success) {
                        var new_erb_label = response.data;
                        vm.selected_label = new_erb_label.key;
                        vm.add_label_success = true;
                        vm.add_label_success_msg = 'Label added';
                        repopulateLabelOptions(vm.selected_label);
                        generateSeqNumByLabel(vm.selected_label);
                        $timeout(delayToClose, 1000);
                    } else {
                        vm.add_label_error = true;
                        vm.add_label_error_msg = response.data + ".";
                    }
                });
            }
        };

        function validateNewLabel() {
            var valid = true;
            vm.new_label_invalid = false;
            vm.new_label_max_invalid = false;
            if (vm.new_erb_label === null || vm.new_erb_label === '' || vm.new_erb_label === undefined) {
                vm.new_label_invalid = true;
                valid = false;
            } else {
                var len = vm.new_erb_label.length;
                if (len > 25) {
                    vm.new_label_max_invalid = true;
                    valid = false;
                }
            }
            return valid;
        }

        function delayToClose() {
            vm.show_add_label = false;
        }

        function repopulateLabelOptions(new_label) {
            if (_.contains(vm.label_options, ADD_NEW_LABEL)) {
                vm.label_options = _.without(vm.label_options, ADD_NEW_LABEL);
            }
            if (new_label !== null && new_label !== undefined) {
                vm.label_options.push(new_label);
            }
            vm.label_options = _.sortBy(vm.label_options, function (lab) {
                return lab.toLowerCase();
            });
            vm.label_options.unshift(ADD_NEW_LABEL);
        }

        function generateSeqNumByLabel(label) {
            // validation - check to make sure a group label has been selected
            if (label !== null) {
                // get the next sequence number with label
                CramsApiService.getNextSequenceNumber("racmon", label).then(function (response) {
                    if (response.success) {
                        var erb_label_resp = response.data;

                        // create erb_label in child_object and set label and seq
                        vm.child_object.erb_label = emptyERBLabelObject();
                        vm.child_object.erb_label.label.id = erb_label_resp.label.id;
                        vm.child_object.erb_label.label.key = label;
                        vm.child_object.erb_label.label.e_research_body = erb_label_resp.label.e_research_body;
                        vm.child_object.erb_label.sequence_number = erb_label_resp.next_sequence_number;

                        // format the seq number for display
                        vm.formatted_seq_num = format_seq_num(erb_label_resp.next_sequence_number);
                    } else {
                        var msg = "Failed to get next sequence number, " + response.message + ".";
                        FlashService.DisplayError(msg, response.data);
                    }
                });
            } else {
                // No group label selected
                vm.selected_label_invalid = true;
            }
        }

        vm.org_id = 0;

        vm.review_date = undefined;
        vm.originalSpSizeCheckCounter = 1;
        vm.saved_child_provision_id = 0;
        vm.saved_child_allocation_gb = 0;
        vm.display_sp_available_size = 0;
        vm.available_size = 0;
        vm.data_owner_present = false;

        //use request id to check the allocation for available quota, project title, storage products, etc
        checkCurrentParentRequest(vm.request_id, vm.child_id);

        // format the sequence number to have zeros in front of it so it makes up to 4 digits
        // e.g: 1 == 0001, 23 == 0023, 434 == 0434, 6123 == 6123
        // anything bigger 9999 just display as is: 12345
        function format_seq_num(seq_num) {
            let formatted_seq_num = '' + seq_num;
            while (formatted_seq_num.length < 4) {
                formatted_seq_num = '0' + formatted_seq_num;
            }

            return formatted_seq_num;
        }

        function checkCurrentParentRequest(request_id, child_id) {
            //get my allocation requests
            CramsApiService.checkCurrentParentRequest(request_id).then(function (response) {
                if (response.success) {
                    vm.current_parent_request = response.data;
                    populateParentStorageProducts();
                    if (child_id !== undefined) {
                        // if child id is not undefined, then it's updating, otherwsie. it create a new child object.
                        vm.button_label = 'Update';
                        getCurrentChildObjects(request_id, child_id);

                    } else {
                        vm.child_object = emptyChildObject();
                        initialNewChildObject();
                    }
                } else {
                    var msg = "Failed to get the current parent, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        }

        function populateParentStorageProducts() {
            vm.parent_storage_products = [];
            angular.forEach(vm.current_parent_request.storage_requests, function (s_request) {
                var provision_id = s_request.provision_id.id;
                var sp_name = s_request.provision_id.storage_product.name;
                if (sp_name.indexOf('Computational') === -1) {
                    var sp = {'provision_id': provision_id, 'name': sp_name};
                    vm.parent_storage_products.push(sp);
                }
            });
        }

        function initialNewChildObject() {
            vm.setReviewDate();
            //load organisations
            loadOrgAndFaculties();
        }

        function getCurrentChildObjects(request_id, child_id) {
            //get my allocation requests
            CramsApiService.getCurrentChildObject(request_id, child_id).then(function (response) {
                if (response.success) {
                    vm.child_object = response.data;
                    vm.selected_label = vm.child_object.erb_label.label.key;
                    vm.formatted_seq_num = format_seq_num(vm.child_object.erb_label.sequence_number);
                    convertChildObjectDates();
                    vm.checkSpAvailableSize();
                    vm.countDesc();
                    if (vm.child_object.properties.data_owner !== null && vm.child_object.properties.data_owner !== undefined && vm.child_object.properties.data_owner !== '') {
                        $scope.addOrChangeDataOwnerLabel = 'Change Data Owner';
                        vm.data_owner_present = true;
                    }
                    //load organisations
                    loadOrgAndFaculties();
                } else {
                    var msg = "Failed to get child objects, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        }


        vm.checkSpAvailableSize = function () {
            vm.display_sp_available_size = 0;
            vm.available_size = 0;

            if (vm.child_object.provision_id !== null && vm.child_object.provision_id !== undefined) {
                var sp_req = _.find(vm.current_parent_request.storage_requests, function (req) {
                    return req.provision_id.id === vm.child_object.provision_id;
                });
                if (sp_req !== undefined) {
                    vm.available_size = sp_req.available_gb;
                    //make sure it's called only once.
                    if (vm.originalSpSizeCheckCounter === 1) {
                        vm.saved_child_provision_id = vm.child_object.provision_id;
                        vm.saved_child_allocation_gb = vm.child_object.allocation_gb;
                        //increase 1 for the counter to make sure next time  this section is not called
                        vm.originalSpSizeCheckCounter++;
                    }
                    // if the child object provision id is the same as saved child object provision id
                    // and child object id is not undefined.
                    // the available size = available size + saved child alloction gb size.
                    if (vm.saved_child_provision_id === vm.child_object.provision_id && vm.child_object.id !== undefined) {
                        vm.available_size += vm.saved_child_allocation_gb;
                    }
                    vm.display_sp_available_size = display_cap_value(vm.available_size - vm.child_object.allocation_gb);
                    convertAllocSizeByUnit();
                }
            }
            vm.storage_product_validation();
        };

        function display_cap_value(capacity_value) {
            if (capacity_value > 9999999) {
                return 9999999;
            } else {
                return capacity_value;
            }
        }

        function convertAllocSizeByUnit() {
            var unit = vm.child_object.properties.alloc_unit;
            if (unit === undefined || unit === null) {
                vm.child_object.properties.alloc_unit = 'GB';
                //set default as GB
                unit = 'GB';
            }
            if (unit === 'KB') {
                vm.child_object.properties.alloc_size = vm.child_object.allocation_gb * 1000000;
            }
            if (unit === 'MB') {
                vm.child_object.properties.alloc_size = vm.child_object.allocation_gb * 1000;
            }
            if (unit === 'GB') {
                vm.child_object.properties.alloc_size = vm.child_object.allocation_gb;
            }
            if (unit === 'TB') {
                vm.child_object.properties.alloc_size = vm.child_object.allocation_gb / 1000;
            }
        }


        vm.checkChildAllocSize = function () {
            vm.allocation_gb_excess_max_invalid = false;
            if (vm.child_object.properties.alloc_size === undefined || vm.child_object.properties.alloc_size === null) {
                vm.child_object.properties.alloc_size = '';
            }
            var alloc_gb = 0;
            if (vm.child_object.properties.alloc_unit === 'KB') {
                alloc_gb = vm.child_object.properties.alloc_size / 1000000;
            }
            if (vm.child_object.properties.alloc_unit === 'MB') {
                alloc_gb = vm.child_object.properties.alloc_size / 1000;
            }
            if (vm.child_object.properties.alloc_unit === 'GB') {
                alloc_gb = vm.child_object.properties.alloc_size;
            }
            if (vm.child_object.properties.alloc_unit === 'TB') {
                alloc_gb = vm.child_object.properties.alloc_size * 1000;
            }
            vm.child_object.allocation_gb = alloc_gb;
            vm.display_sp_available_size = display_cap_value(vm.available_size - vm.child_object.allocation_gb);

            if (vm.child_object.properties.alloc_size > 9999999) {
                vm.allocation_gb_excess_max_invalid = true;
                vm.child_object_form.$valid = false;
            }

            vm.allocation_gb_validation();
        };

        vm.addOrUpdateChildObject = function () {
            if (validate()) {
                // covert date to string in specified format - dd/MM/yyyy
                vm.child_object.properties.archived_date = convertDateStr(vm.child_object.properties.archived_date);
                vm.child_object.properties.dataset_last_updated_date = convertDateStr(vm.child_object.properties.dataset_last_updated_date);
                if (vm.child_id !== undefined) {
                    // Updating existing child object
                    CramsApiService.updateChildObject(vm.request_id, vm.child_object).then(function (response) {
                        if (response.success) {
                            FlashService.Success("Child object updated", true);
                            $location.path('/' + vm.allocations_base_path + '/child_objects/' + vm.request_id);
                        } else {
                            var msg = "Failed to update child objects, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            $anchorScroll();
                        }
                    });
                } else {
                    // Add new child object
                    CramsApiService.addChildObject(vm.request_id, vm.child_object).then(function (response) {
                        if (response.success) {
                            FlashService.Success("Child object added", true);
                            $location.path('/' + vm.allocations_base_path + '/child_objects/' + vm.request_id);
                        } else {
                            var msg = "Failed to add child objects, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            $anchorScroll();
                        }
                    });
                }
            } else {
                FlashService.Error("Please check that all required fields have been filled in correctly.");
                $anchorScroll();
            }
        };

        // subscribe the event to get the selected data owner.
        // set crams.data.owner.controller.js
        $scope.$on('selected_data_owner', function (event, data_owner) {
            vm.child_object.properties.data_owner = data_owner.email;
            $scope.addOrChangeDataOwnerLabel = 'Change Data Owner';
            vm.data_owner_invalid = false;
            vm.data_owner_present = true;
        });

        vm.desc_count = 0;
        vm.countDesc = function () {
            if (vm.child_object.properties.description !== null && vm.child_object.properties.description !== undefined) {
                vm.desc_count = vm.child_object.properties.description.length;
            }

            vm.desc_validation();
        };

        function validate() {
            vm.selected_label_invalid = false;
            vm.sequence_number_invalid = false;
            vm.data_owner_invalid = false;
            vm.dataset_last_updated_date_invalid = false;
            vm.archived_date_invalid = false;
            vm.do_organisation_invalid = false;
            vm.do_faculty_invalid = false;
            vm.do_department_invalid = false;

            if (vm.child_object.erb_label === null || vm.child_object.erb_label === undefined) {
                vm.selected_label_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                if (vm.child_object.erb_label.label.key === null || vm.child_object.erb_label.label.key === undefined) {
                    vm.selected_label_invalid = true;
                    vm.child_object_form.$valid = false;
                }
                // group label and seq number
                if (vm.child_object.erb_label.sequence_number === null || vm.child_object.erb_label.sequence_number === undefined) {
                    vm.sequence_number_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }

            // title
            vm.title_validation();

            // description
            vm.desc_validation();

            // storage product
            vm.storage_product_validation();

            // capacity size
            vm.allocation_gb_validation();

            // location
            vm.location_validation();

            // source
            vm.source_validation();

            // data owner
            if (vm.child_object.properties.data_owner === undefined || vm.child_object.properties.data_owner === null || vm.child_object.properties.data_owner === '') {
                vm.data_owner_invalid = true;
                vm.child_object_form.$valid = false;
            }

            if (vm.child_object.properties.organisation === undefined || vm.child_object.properties.organisation === null || vm.child_object.properties.organisation === '') {
                vm.do_organisation_invalid = true;
                vm.child_object_form.$valid = false;
            }

            if (vm.child_object.properties.faculty === undefined || vm.child_object.properties.faculty === null || vm.child_object.properties.faculty === '') {
                vm.do_faculty_invalid = true;
                vm.child_object_form.$valid = false;
            }

            if (vm.child_object.properties.department === undefined || vm.child_object.properties.department === null || vm.child_object.properties.department === '') {
                vm.do_department_invalid = true;
                vm.child_object_form.$valid = false;
            }
            // retention period
            var valid_retention = validateRetentionDates();
            if (!valid_retention) {
                vm.child_object_form.$valid = false;
            }

            // validate size
            vm.checkChildAllocSize();

            return vm.child_object_form.$valid;
        }

        vm.title_validation = function() {
            vm.title_invalid = false;
            vm.title_excess_max_invalid = false;

            if (vm.child_object.properties.title === undefined || vm.child_object.properties.title === null || vm.child_object.properties.title === '') {
                vm.title_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                var title_len = vm.child_object.properties.title.length;
                if (title_len > 255) {
                    vm.title_excess_max_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }
        };

        vm.desc_validation = function() {
            vm.description_invalid = false;
            vm.desc_excess_max_invalid = false;

            if (vm.child_object.properties.description === undefined || vm.child_object.properties.description === null || vm.child_object.properties.description === '') {
                vm.description_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                var desc_len = vm.child_object.properties.description.length;
                if (desc_len > 4000) {
                    vm.desc_excess_max_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }
        };

        vm.storage_product_validation = function() {
            vm.storage_product_invalid = false;

            if (vm.child_object.provision_id === undefined || vm.child_object.provision_id === null) {
                vm.storage_product_invalid = true;
                vm.child_object_form.$valid = false;
            }
        };

        vm.allocation_gb_validation = function() {
            vm.allocation_gb_invalid = false;
            vm.allocation_gb_excess_max_invalid = false;

            if (vm.child_object.properties.alloc_size === undefined || vm.child_object.properties.alloc_size === null ||
                vm.child_object.properties.alloc_size === '' || vm.child_object.properties.alloc_size === 0) {
                vm.allocation_gb_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                if (vm.child_object.properties.alloc_size > 9999999) {
                    vm.allocation_gb_excess_max_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }
        };

        vm.location_validation = function() {
            vm.data_path_invalid = false;
            vm.data_path_max_invalid = false;

            if (vm.child_object.properties.data_path === undefined || vm.child_object.properties.data_path === null || vm.child_object.properties.data_path === '') {
                vm.data_path_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                var path_len = vm.child_object.properties.data_path.length;
                if (path_len > 255) {
                    vm.data_path_max_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }
        };

        vm.source_validation = function() {
            vm.source_location_invalid = false;
            vm.source_location_max_invalid = false;

            if (vm.child_object.properties.source_location === undefined || vm.child_object.properties.source_location === null || vm.child_object.properties.source_location === '') {
                vm.source_location_invalid = true;
                vm.child_object_form.$valid = false;
            } else {
                var src_len = vm.child_object.properties.source_location.length;
                if (src_len > 255) {
                    vm.source_location_max_invalid = true;
                    vm.child_object_form.$valid = false;
                }
            }
        };

        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };

        vm.open_calendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.ad_opened = true;
        };

        vm.close_calendar = function () {
            vm.setReviewDate();
            vm.ad_opened = false;
        };

        vm.openDsLudCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.ds_opened = true;
        };

        vm.closeDsLudCalendar = function () {
            vm.setReviewDate();
            vm.ds_opened = false;
        };

        function convertChildObjectDates() {
            if (vm.child_object.properties.archived_date !== undefined && vm.child_object.properties.archived_date !== null) {
                var a_date_str = vm.child_object.properties.archived_date.split('/');
                vm.child_object.properties.archived_date = new Date(+a_date_str[2], a_date_str[1] - 1, +a_date_str[0]);
            }

            if (vm.child_object.properties.dataset_last_updated_date !== undefined && vm.child_object.properties.dataset_last_updated_date !== null) {
                var ds_date_str = vm.child_object.properties.dataset_last_updated_date.split('/');
                vm.child_object.properties.dataset_last_updated_date = new Date(+ds_date_str[2], ds_date_str[1] - 1, +ds_date_str[0]);
            }
            vm.setReviewDate();
        }

        function convertDateStr(date) {
            return $filter('date')(date, "dd/MM/yyyy");
        }

        function validateRetentionDates() {
            vm.retention_period_invalid = false;
            vm.dataset_last_updated_date_invalid = false;
            vm.archived_date_invalid = false;
            var valid = true;
            // retention period
            if (vm.child_object.properties.retention_period === undefined || vm.child_object.properties.retention_period === null || vm.child_object.properties.retention_period <= 0 || vm.child_object.properties.retention_period > 99) {
                vm.retention_period_invalid = true;
                valid = false;
            }
            //last updated date
            if (vm.child_object.properties.dataset_last_updated_date === undefined || vm.child_object.properties.dataset_last_updated_date === null || vm.child_object.properties.dataset_last_updated_date === '') {
                vm.dataset_last_updated_date_invalid = true;
                valid = false;
            }
            // archived date
            if (vm.child_object.properties.archived_date === undefined || vm.child_object.properties.archived_date === null || vm.child_object.properties.archived_date === '') {
                vm.archived_date_invalid = true;
                valid = false;
            }
            return valid;
        }

        vm.setReviewDate = function () {
            if (validateRetentionDates()) {
                var ret_years = vm.child_object.properties.retention_period;
                var base_date = null;
                if (vm.child_object.properties.dataset_last_updated_date < vm.child_object.properties.archived_date) {
                    base_date = angular.copy(vm.child_object.properties.dataset_last_updated_date);
                } else {
                    base_date = angular.copy(vm.child_object.properties.archived_date);
                }
                vm.review_date = base_date.setFullYear(base_date.getFullYear() + ret_years);
                vm.review_date = convertDateStr(vm.review_date);
            }
        };

        function loadOrgAndFaculties() {
            OrganisationService.listOrganisation().then(function (response) {
                if (response.success) {
                    vm.org_list = response.data;
                    if (vm.org_list !== undefined && vm.org_list.length !== 0) {
                        var default_org = vm.org_list[0];
                        if (vm.child_object.properties.organisation === undefined || vm.child_object.properties.organisation === '' || vm.child_object.properties.organisation === null) {
                            vm.child_object.properties.organisation = default_org.name;
                        }
                        var org_id = getOrgIdByName(vm.child_object.properties.organisation);
                        loadFacultyByOrgId(org_id);
                    } else {
                        setNAOrg();
                    }
                } else {
                    var msg = "Failed to get Organisation list, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                    // scroll back to the top of page for error
                    $anchorScroll();
                }
            });
        }


        function loadFacultyByOrgId(org_id) {
            OrganisationService.listFacultiesByOrgId(org_id).then(function (response) {
                if (response.success) {
                    vm.faculty_list = response.data;
                    if (vm.faculty_list !== undefined && vm.faculty_list.length !== 0) {
                        if (vm.child_object.properties.faculty !== undefined && vm.child_object.properties.faculty !== '' && vm.child_object.properties.faculty !== null) {
                            var fac_id = getFacIdByName(vm.child_object.properties.faculty);
                            loadDepartmentByFacId(fac_id);
                        }
                    } else {
                        setNAFaculty();
                    }
                } else {
                    var msg = "Failed to get faculty list, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                    // scroll back to the top of page for error
                    $anchorScroll();
                }
            });
        }

        function loadDepartmentByFacId(fac_id) {
            OrganisationService.listDeptByFacultyId(fac_id).then(function (response) {
                if (response.success) {
                    vm.dept_list = response.data;
                    if (vm.dept_list === undefined || vm.dept_list.length === 0) {
                        setNADepartment();
                    }
                } else {
                    var msg = "Failed to get department list, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                    // scroll back to the top of page for error
                    $anchorScroll();
                }
            });
        }

        function getOrgIdByName(org_name) {
            var org_id = 0;
            var foud_org = _.findWhere(vm.org_list, {"name": org_name});
            if (foud_org !== undefined) {
                org_id = foud_org.id;
            }
            return org_id;
        }

        function getFacIdByName(fac_name) {
            var fac_id = 0;
            var selected_fac = _.findWhere(vm.faculty_list, {"name": fac_name});
            if (selected_fac !== undefined) {
                fac_id = selected_fac.id;
            }
            return fac_id;
        }

        // change organisation
        vm.changeOrg = function () {
            vm.do_organisation_invalid = false;
            var org_id = getOrgIdByName(vm.child_object.properties.organisation);
            loadFacultyByOrgId(org_id);
        };

        // change faculty
        vm.changeFaculty = function () {
            vm.do_faculty_invalid = false;
            var fac_id = getFacIdByName(vm.child_object.properties.faculty);
            loadDepartmentByFacId(fac_id);
        };

        vm.changeDepartment = function () {
            vm.do_department_invalid = false;
        };

        function setNAOrg() {
            vm.org_list = [naOrg()];
            vm.faculty_list = [naFaculty()];
            vm.dept_list = [naDept()];
            vm.child_object.properties.organisation = '(Not Applicable)';
            vm.child_object.properties.faculty = '(Not Applicable)';
            vm.child_object.properties.department = '(Not Applicable)';
        }

        function setNAFaculty() {
            vm.faculty_list = [naFaculty()];
            vm.dept_list = [naDept()];
            vm.child_object.properties.faculty = '(Not Applicable)';
            vm.child_object.properties.department = '(Not Applicable)';
        }

        function setNADepartment() {
            vm.dept_list = [naDept()];
            vm.child_object.properties.department = '(Not Applicable)';
        }

        function naOrg() {
            return {
                'id': 0,
                'short_name': '',
                'name': '(Not Applicable)'
            };
        }

        function naDept() {
            return {
                'department_code': '',
                'name': '(Not Applicable)'
            };
        }

        function naFaculty() {
            return {
                'faculty_code': '',
                'name': '(Not Applicable)'
            };
        }


        function emptyERBLabelObject() {
            return {
                "label": {
                    "id": null,
                    "key": null,
                    "e_research_body": ENV.erb
                },
                "sequence_number": null
            };
        }

        // TODO: future contact(user) label object
        function emptyContactLabelObject() {
            return {
                "contact_label": ""
            };
        }

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                if (!flash.keepAfterLocationChange) {
                    delete $rootScope.flash;
                } else {
                    // only keep for a single location change
                    flash.keepAfterLocationChange = false;
                }
            }
        }

        function emptyChildObject() {
            return {
                "provision_id": null,
                "allocation_gb": 0,
                "organisation": {
                    "id": 1,
                    "name": "CRAMS",
                    "short_name": "crams"
                },
                "erb_label": null,
                "properties": {
                    "alloc_unit": "GB",
                    "alloc_size": 0,
                    "data_path": null,
                    "source_location": null,
                    "data_owner": null,
                    "organisation": null,
                    "faculty": null,
                    "department": null,
                    "dataset_last_updated_date": new Date(),
                    "archived_date": new Date(),
                    "title": null,
                    "description": null,
                    "retention_period": 5
                },
                "historical": false,
                "last_updated_ts": null
            };
        }
    }

})();

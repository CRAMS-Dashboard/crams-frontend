/**
 * Created by simonyu on 07/01/19.
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonListChildObjectsController', RacMonListChildObjectsController);
    RacMonListChildObjectsController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'CramsApiService', 'FlashService', 'ENV', '$filter'];

    function RacMonListChildObjectsController($scope, $rootScope, $routeParams, $location, CramsApiService, FlashService, ENV, $filter) {
        var vm = this;

        vm.load_fininshed = false;

        vm.mixed_sp = false;
        vm.comp_sp_only = false;
        vm.non_comp_sp_only = false;

        vm.request_id = $routeParams.request_id;

        vm.allocations_base_path = 'allocations';
        var current_paths = $location.path().split('/');
        if (current_paths[1] === 'admin' && current_paths[2] === 'allocations') {
            vm.allocations_base_path = current_paths[1] + '/' + current_paths[2];
        }

        //load the project child objects
        projectChildObjects(vm.request_id);

        function projectChildObjects(request_id) {
            //get my allocation requests
            CramsApiService.listChildObjects(request_id).then(function (response) {
                if (response.success) {
                    vm.child_objects_data = response.data;
                    vm.sortBy('seq_id', 'asc');
                    populateAllocatedStorageProducts();

                } else {
                    var msg = "Failed to get child objects, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                vm.load_fininshed = true;
            });
        }

        // this is the id which combines the Label with the sequence number
        vm.displayID = function(child_obj) {
            return child_obj.erb_label.label.key + '-' + child_obj.erb_label.sequence_number;
        };

        function populateAllocatedStorageProducts() {
            vm.parent_alloc_sp = [];
            var non_comp_sp = false;
            var comp_sp = false;
            angular.forEach(vm.child_objects_data.storage_requests, function (s_request) {
                var provision_id = s_request.provision_id.id;
                var sp_name = s_request.provision_id.storage_product.name;
                var alloc_size = s_request.allocation_gb;
                var available_size = s_request.available_gb;
                var sp = {
                    'provision_id': provision_id,
                    'name': sp_name,
                    'alloc_size': alloc_size,
                    'available_size': available_size,
                    'child_no': 0,
                    'child_usage': 0
                };
                if (sp_name.indexOf('Computational') === -1) {
                    non_comp_sp = true;
                } else {
                    comp_sp = true;
                }
                vm.parent_alloc_sp.push(sp);
            });

            if (comp_sp && non_comp_sp) {
                vm.mixed_sp = true;
            } else if (comp_sp && !non_comp_sp) {
                vm.comp_sp_only = true;
            } else {
                vm.non_comp_sp_only = true;
            }

            angular.forEach(vm.parent_alloc_sp, function (alloc_sp) {
                var prov_id = alloc_sp.provision_id;
                var child_no = 0;
                var child_usage = 0;
                angular.forEach(vm.child_objects_data.child_allocations, function (alloc) {
                    if (alloc.provision_id === prov_id) {
                        child_no += 1;
                        child_usage += alloc.allocation_gb;
                    }
                });
                alloc_sp.child_no = child_no;
                alloc_sp.child_usage = child_usage;
            });
        }

        vm.getSpName = function (provision_id) {
            var sp_name = 'None';
            angular.forEach(vm.parent_alloc_sp, function (sp) {
                if (sp.provision_id === provision_id) {
                    sp_name = sp.name;
                }
            });
            return sp_name;
        };

        vm.display_name = function (contact_obj) {
            // if first name and last name are not empty values then append them together
            if (contact_obj.first_name !== null && contact_obj.first_name !== undefined && contact_obj.first_name !== '') {
                if (contact_obj.last_name !== null && contact_obj.last_name !== undefined && contact_obj.last_name !== '') {
                    return contact_obj.first_name + ' ' + contact_obj.last_name;
                }
            }

            // incomplete first name and last name return the email as default
            return contact_obj.email;
        };

        vm.childObjectCSVData = function () {
            var sorted_child_csv_data = [];
            angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                var csv_data = {};
                var id = vm.displayID(child_alloc);
                csv_data.id = id;
                csv_data.title = child_alloc.properties.title;
                csv_data.description = child_alloc.properties.description;
                csv_data.storage_product = vm.getSpName(child_alloc.provision_id);
                csv_data.alloc_size = child_alloc.allocation_gb;
                csv_data.location = child_alloc.properties.data_path;
                csv_data.source = child_alloc.properties.source_location;
                csv_data.date_owner = child_alloc.properties.data_owner;
                csv_data.organisation = child_alloc.properties.organisation;
                csv_data.faculty = child_alloc.properties.faculty;
                csv_data.department = child_alloc.properties.department;
                csv_data.ds_last_updated_date = child_alloc.properties.dataset_last_updated_date;
                csv_data.archived_date = child_alloc.properties.archived_date;
                csv_data.retention_period = child_alloc.properties.retention_period;
                csv_data.review_date = vm.convertReviewDate(child_alloc);
                csv_data.created_by =vm.display_name(child_alloc.created_by);
                csv_data.last_modified = child_alloc.creation_ts;
                sorted_child_csv_data.push(csv_data);
            });
            return sorted_child_csv_data;
        };

        vm.csvFileName = function () {
            return vm.child_objects_data.project.title + ' ' + new Date().toISOString().substring(0, 10) + '.csv';
        };

        vm.sortHeadings = function () {
            return Object.values(childObjectHeading());
        };

        function childObjectHeading() {
            return {
                "id": "ID",
                "title": "Title",
                "description": "Description",
                "storage_product": "Storage Product",
                "alloc_size": "Size (GB)",
                "location": "Location",
                "source": "Source",
                "date_owner": "Data Owner",
                "organisation": "Organisation",
                "faculty": "Faculty",
                "department": "Department",
                "ds_last_updated_date": "Dataset Last Updated Date",
                "archived_date": "Archived Date",
                "retention_period": "Retention Period (Year)",
                "review_date": "Review Date",
                "created_by": "Created By",
                "last_modified": "Last Modified"
            };
        }

        vm.id_asc = true;
        vm.id_desc = false;
        vm.t_asc = true;
        vm.t_desc = false;
        vm.d_asc = true;
        vm.d_desc = false;
        vm.sp_asc = true;
        vm.sp_desc = false;
        vm.gb_asc = true;
        vm.gb_desc = false;
        vm.l_asc = true;
        vm.l_desc = false;
        vm.src_asc = true;
        vm.src_desc = false;
        vm.o_asc = true;
        vm.o_desc = false;
        vm.dsd_asc = true;
        vm.dsd_desc = false;
        vm.arc_asc = true;
        vm.arc_desc = false;
        vm.ret_asc = true;
        vm.ret_desc = false;
        vm.rv_asc = true;
        vm.rv_desc = false;
        vm.cb_asc = true;
        vm.cb_desc = false;

        vm.sortBy = function (sort_name, sort_type) {
            setAscDescSort(sort_name, sort_type);
        };

        function setAscDescSort(sort_name, sort_type) {
            if (sort_name === 'seq_id') {
                vm.id_asc = false;
                vm.id_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    child_alloc.seq_id = child_alloc.erb_label.sequence_number;
                });
                //default it's asc sort order
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.seq_id;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.id_asc = true;
                    vm.id_desc = false;
                }
            }

            if (sort_name === 'title') {
                vm.t_asc = false;
                vm.t_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.title.toLowerCase();
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.t_asc = true;
                    vm.t_desc = false;
                }
            }
            if (sort_name === 'desc') {
                vm.d_asc = false;
                vm.d_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.description.toLowerCase();
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.d_asc = true;
                    vm.d_desc = false;
                }
            }
            if (sort_name === 'sp') {
                vm.sp_asc = false;
                vm.sp_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    child_alloc.sp_name = vm.getSpName(child_alloc.provision_id);
                });
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.sp_name.toLowerCase();
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.sp_asc = true;
                    vm.sp_desc = false;
                }
            }
            if (sort_name === 'size') {
                vm.gb_asc = false;
                vm.gb_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.allocation_gb;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.gb_asc = true;
                    vm.gb_desc = false;
                }
            }

            if (sort_name === 'location') {
                vm.l_asc = false;
                vm.l_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.data_path;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.l_asc = true;
                    vm.l_desc = false;
                }
            }

            if (sort_name === 'source') {
                vm.src_asc = false;
                vm.src_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.source_location;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.src_asc = true;
                    vm.src_desc = false;
                }
            }

            if (sort_name === 'owner') {
                vm.o_asc = false;
                vm.o_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.data_owner;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.o_asc = true;
                    vm.o_desc = false;
                }
            }

            if (sort_name === 'ds_date') {
                vm.dsd_asc = false;
                vm.dsd_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    convertDatasetStrDates(child_alloc);
                });

                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.ds_date;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.dsd_asc = true;
                    vm.dsd_desc = false;
                }
            }

            if (sort_name === 'arc_date') {
                vm.arc_asc = false;
                vm.arc_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    convertArchivedStrDates(child_alloc);
                });

                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.arc_date;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.arc_asc = true;
                    vm.arc_desc = false;
                }
            }

            if (sort_name === 'retention') {
                vm.ret_asc = false;
                vm.ret_desc = true;
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.retention_period;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.ret_asc = true;
                    vm.ret_desc = false;
                }
            }

            if (sort_name === 'review') {
                vm.rv_asc = false;
                vm.rv_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    vm.convertReviewDate(child_alloc);
                });
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.properties.rv_date;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.rv_asc = true;
                    vm.rv_desc = false;
                }
            }
            if (sort_name === 'created_by') {
                vm.cb_asc = false;
                vm.cb_desc = true;
                angular.forEach(vm.child_objects_data.child_allocations, function (child_alloc) {
                    setCreatedUser(child_alloc);
                });
                vm.child_objects_data.child_allocations = _.sortBy(vm.child_objects_data.child_allocations, function (child_alloc) {
                    return child_alloc.created_user;
                });
                if (sort_type === 'desc') {
                    vm.child_objects_data.child_allocations = vm.child_objects_data.child_allocations.reverse();
                    vm.cb_asc = true;
                    vm.cb_desc = false;
                }
            }
        }

        function convertDatasetStrDates(child_alloc) {
            if (child_alloc.properties.dataset_last_updated_date !== undefined && child_alloc.properties.dataset_last_updated_date !== null) {
                var ds_date_str = child_alloc.properties.dataset_last_updated_date.split('/');
                child_alloc.properties.ds_date = new Date(+ds_date_str[2], ds_date_str[1] - 1, +ds_date_str[0]);
            }
        }

        function convertArchivedStrDates(child_alloc) {
            if (child_alloc.properties.archived_date !== undefined && child_alloc.properties.archived_date !== null) {
                var a_date_str = child_alloc.properties.archived_date.split('/');
                child_alloc.properties.arc_date = new Date(+a_date_str[2], a_date_str[1] - 1, +a_date_str[0]);
            }
        }

        vm.convertReviewDate = function (child_alloc) {
            if (child_alloc.properties.archived_date !== undefined && child_alloc.properties.archived_date !== null) {
                var a_date_str = child_alloc.properties.archived_date.split('/');
                child_alloc.properties.arc_date = new Date(+a_date_str[2], a_date_str[1] - 1, +a_date_str[0]);
            }

            if (child_alloc.properties.dataset_last_updated_date !== undefined && child_alloc.properties.dataset_last_updated_date !== null) {
                var ds_date_str = child_alloc.properties.dataset_last_updated_date.split('/');
                child_alloc.properties.ds_date = new Date(+ds_date_str[2], ds_date_str[1] - 1, +ds_date_str[0]);
            }

            var ret_years = child_alloc.properties.retention_period;
            var base_date = null;
            if (child_alloc.properties.ds_date < child_alloc.properties.arc_date) {
                base_date = angular.copy(child_alloc.properties.ds_date);
            } else {
                base_date = angular.copy(child_alloc.properties.arc_date);
            }
            var review_date = base_date.setFullYear(base_date.getFullYear() + ret_years);
            child_alloc.properties.rv_date = review_date;
            return convertDateStr(review_date);
        };

        function convertDateStr(date) {
            return $filter('date')(date, "dd/MM/yyyy");
        }


        function setCreatedUser(child_alloc) {
            var created_user = child_alloc.created_by.first_name + ' ' + child_alloc.created_by.last_name;
            child_alloc.created_user = created_user;
        }
    }
})();
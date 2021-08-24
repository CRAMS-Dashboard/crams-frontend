/**
 * Created by simonyu on 11/05/16.
 */


(function () {
    'use strict';
    angular.module('crams').controller('RacMonRequestController', RacMonRequestController);

    RacMonRequestController.$inject = ['$location', '$scope', '$routeParams', 'FlashService', 'CramsApiService', 'CramsQuestionsService', 'LookupService', 'ContactService', 'OrganisationService', 'CramsUtils', '$filter', '$anchorScroll', '$q', 'ENV'];

    function RacMonRequestController($location, $scope, $routeParams, FlashService, CramsApiService, CramsQuestionsService, LookupService, ContactService, OrganisationService, CramsUtils, $filter, $anchorScroll, $q, ENV) {
        var vm = this;
        vm.funding_scheme_rdsm = null;

        vm.project = CramsApiService.newRacmProjectRequest();
        // vm.technical_contact = ContactService.makeNewTechnicalContact();

        getContactRoleID();

        // data sensitive radio buttons defaults to empty
        vm.data_sensitive = null;

        // project title error message
        vm.title_error_message = 'Required field';

        $scope.addOrChangeLabel = 'Add Data Custodian';
        // subscribe the event to get the selected data custodian.
        // set crams.data.custodian.controller.js
        $scope.$on('selected_data_custodian', function (event, custodian) {
            var dc_existed = false;
            angular.forEach(vm.project.project_contacts, function (p_contact, index) {
                // only check if it's data custodian
                if (p_contact.contact_role === 'Data Custodian') {
                    if (p_contact.contact.email === custodian.email) {
                        dc_existed = true;
                    }
                }
            });

            if (!dc_existed) {
                var new_dc = emptyDataCustodian();
                new_dc.contact = custodian;
                vm.project.project_contacts.push(new_dc);
                vm.data_custodian_invalid = false;
                vm.alloc_form.$valid = true;
            }
        });

        // subscribe the event to get the selected technical contact.
        // see crams.technical.contact.controller.js
        $scope.$on('selected_tech_contact', function (event, tech_contact) {
            var emailExisted = false;
            angular.forEach(vm.project.project_contacts, function (p_contact, key) {
                if (p_contact.contact_role === "Technical Contact") {
                    if (p_contact.contact.email === tech_contact.email) {
                        emailExisted = true;
                    }
                }
            });
            if (!emailExisted) {
                var project_contact = emptyTechnicalContact();
                project_contact.contact = tech_contact;
                vm.project.project_contacts.push(project_contact);
                vm.technical_contact_invalid = false;
            }
        });

        // remove data custodian
        vm.removeDataCustodian = function (index) {
            vm.project.project_contacts.splice(index, 1);
            var data_custodians = $filter('filter')(vm.project.project_contacts, {contact_role: 'Data Custodian'});
            if (data_custodians.length === 0) {
                vm.data_custodian_invalid = true;
                vm.alloc_form.$valid = false;
            }
        };

        // remove technical contact
        vm.removeTechContact = function (index) {
            vm.project.project_contacts.splice(index, 1);
            // var technical_contacts = $filter('filter')(vm.project.project_contacts, {contact_role: 'Technical Contact'});
            // if (technical_contacts.length === 0) {
            //     vm.technical_contact_invalid = true;
            //     vm.alloc_form.$valid = false;
            // }
        };

        // change organisation
        vm.changeOrg = function () {
            var selected_org_name = vm.project.department.organisation;
            vm.project.department.faculty = '(Not Applicable)';
            vm.project.department.department = '(Not Applicable)';
            vm.faculty_list = [];
            vm.dept_list = [naDept()];
            if (selected_org_name !== undefined && selected_org_name !== null) {
                var selected_org = _.findWhere(vm.org_list, {"name": selected_org_name});
                if (selected_org !== undefined) {
                    OrganisationService.listFacultiesByOrgId(selected_org.id).then(function (response) {
                        if (response.success) {
                            vm.faculty_list = response.data;
                        } else {
                            var msg = "Failed to get faculty list, " + response.message + ".";
                            // display error message to page
                            FlashService.DisplayError(msg, response.data);
                            // scroll back to the top of page for error
                            $anchorScroll();
                        }
                    });
                }
            }
        };

        // change faculty
        vm.changeFaculty = function () {
            vm.dept_list = [naDept()];
            vm.project.department.department = '(Not Applicable)';
            var selected_fac_name = vm.project.department.faculty;
            if (selected_fac_name !== undefined && selected_fac_name !== null && selected_fac_name !== '(Not Applicable)') {
                var selected_fac = _.findWhere(vm.faculty_list, {"name": selected_fac_name});
                if (selected_fac !== undefined) {
                    OrganisationService.listDeptByFacultyId(selected_fac.id).then(function (response) {
                        if (response.success) {
                            vm.dept_list = response.data;
                        } else {
                            var msg = "Failed to get department list, " + response.message + ".";
                            // display error message to page
                            FlashService.DisplayError(msg, response.data);
                            // scroll back to the top of page for error
                            $anchorScroll();
                        }
                    });
                }
            }
            if (selected_fac_name === undefined) {
                vm.dept_list = [];
                vm.project.department.department = null;
            }
        };

        vm.changeDepartment = function () {
            // need to add the dept id of the selected dept to project
            let dept_name = vm.project.department.department;
            let dept_id = null;
            for (let i = 0; i < vm.dept_list.length; i++) {
                if (dept_name === vm.dept_list[i].name) {
                    dept_id = vm.dept_list[i].id;
                    break;
                }
            }
            if (dept_id !== null) {
                vm.project.department.department_id = dept_id;
            }
        };

        function naDept() {
            return {
                'faculty_code': '',
                'name': '(Not Applicable)'
            };
        }

        function naFaculty() {
            return {
                'faculty_code': '',
                'name': '(Not Applicable)'
            };
        }

        //load the funding schemes
        loadFundingSchemes();
        //load the system
        loadRaCMonSystem();
        //load FOR Codes
        loadFORCodes();

        //init domain for FOR codes
        initForCode();

        //FOR Code Percentages
        vm.for_percentages = forCodePercentages();
        vm.authorityQuestion = CramsQuestionsService.getQuestion('crams_demo_authorization');
        vm.dataRetentionQuestion = CramsQuestionsService.getQuestion('crams_demo_data_retention_period');
        vm.electronicInfoClassQuestion = CramsQuestionsService.getQuestion('crams_demo_electronic_inf_class');
        vm.dataMigrationSrcQuestion = CramsQuestionsService.getQuestion('crams_demo_data_migration_src');
        vm.dataMigrationAstQuestion = CramsQuestionsService.getQuestion('crams_demo_data_migration_assistance');
        vm.accessMethodQuestion = CramsQuestionsService.getQuestion('crams_demo_current_access_method');
        vm.preferAccessMethodQuestion = CramsQuestionsService.getQuestion('crams_demo_preferred_access_method');
        vm.onlyCopyQuestion = CramsQuestionsService.getQuestion('crams_demo_only_copy');
        vm.canRegeneratedQuestion = CramsQuestionsService.getQuestion('crams_demo_can_be_regenerated');
        vm.lossImpactQuestion = CramsQuestionsService.getQuestion('crams_demo_loss_impact');
        vm.privacy1Question = CramsQuestionsService.getQuestion('crams_demo_privacy_q1');
        vm.privacy2Question = CramsQuestionsService.getQuestion('crams_demo_privacy_q2');
        vm.privacy3Question = CramsQuestionsService.getQuestion('crams_demo_privacy_q3');

        //Populate nectar storage product lookup
        LookupService.loadStorageProducts(ENV.erb, ENV.system).then(function (response) {
            if (response.success) {
                vm.storageProducts = response.data;
            } else {
                var msg = "Failed to load the storage products, " + response.message;
                FlashService.Error(msg);
            }
        });

        var request_paths = $location.path().split('/');
        var project_id = $routeParams.project_id;
        var request_id = $routeParams.id;

        vm.allocations_base_path = request_paths[1];

        if (request_paths[1] === 'admin' && request_paths[2] === 'allocations') {
            vm.allocations_base_path = request_paths[1] + '/' + request_paths[2];
        }

        function loadOrganisationAndFacultyList() {
            OrganisationService.listOrganisation().then(function (response) {
                if (response.success) {
                    vm.org_list = response.data;
                    populateOrgAndFaculty();
                } else {
                    var msg = "Failed to get Organisation list, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                    // scroll back to the top of page for error
                    $anchorScroll();
                }
            });
        }

        function populateOrgAndFaculty() {
            //set vm.org_list[0] as default organisation
            var selected_org = vm.org_list[0];
            if (vm.project.department !== null) {
                var org_name = vm.project.department.organisation;
                if (org_name !== undefined && org_name !== null) {
                    var foud_org = _.findWhere(vm.org_list, {"name": org_name});
                    if (foud_org !== undefined) {
                        selected_org = foud_org;
                    }
                }
            } else {
                // set empty project department dictionary to avoid the error.
                vm.project.department = {};
            }

            vm.project.department.organisation = selected_org.name;
            vm.faculty_list = [];
            vm.dept_list = [naDept()];
            OrganisationService.listFacultiesByOrgId(selected_org.id).then(function (response) {
                if (response.success) {
                    vm.faculty_list = response.data;
                    if (vm.faculty_list === undefined || vm.faculty_list.length === 0) {
                        vm.faculty_list = [naFaculty()];
                    }
                    var selected_fac_name = vm.project.department.faculty;
                    if (selected_fac_name !== undefined && selected_fac_name !== null) {
                        var selected_fac = _.findWhere(vm.faculty_list, {"name": selected_fac_name});
                        if (selected_fac !== undefined) {
                            OrganisationService.listDeptByFacultyId(selected_fac.id).then(function (response) {
                                if (response.success) {
                                    vm.dept_list = response.data;
                                } else {
                                    var msg = "Failed to get department list, " + response.message + ".";
                                    // display error message to page
                                    FlashService.DisplayError(msg, response.data);
                                    // scroll back to the top of page for error
                                    $anchorScroll();
                                }
                            });
                        } else {
                            vm.project.department.faculty = '(Not Applicable)';
                            vm.project.department.department = '(Not Applicable)';
                        }
                    } else {
                        vm.project.department.faculty = '(Not Applicable)';
                        vm.project.department.department = '(Not Applicable)';
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

        vm.has_parent_project = false;

        vm.loaded_parent_projects = null;

        vm.selected_parent_proj = null;

        vm.show_select_parent_proj_window = false;

        vm.hasParentProject = function () {
            if (vm.has_parent_project) {
                if (vm.loaded_parent_projects) {
                    vm.parent_projects = angular.copy(vm.loaded_parent_projects);
                    sortCollectionNames();
                    vm.show_loading_proj_spinner = false;
                    vm.show_select_parent_proj_window = true;
                } else {
                    vm.show_loading_proj_spinner = true;
                    CramsApiService.listParentProjects().then(function (response) {
                        if (response.success) {
                            vm.loaded_parent_projects = response.data;
                            vm.parent_projects = angular.copy(vm.loaded_parent_projects);
                            sortCollectionNames();
                        } else {
                            var msg = 'Failed to list none-child projects, ' + response.message + '.';
                            FlashService.DisplayError(msg, response.data);
                        }
                    }).finally(function () {
                        //set no loading spinner
                        vm.show_loading_proj_spinner = false;
                        vm.show_select_parent_proj_window = true;
                    });
                }
            } else {
                vm.show_select_parent_proj_window = false;
                vm.selected_parent_proj = null;
                vm.project.requests[0].linked_allocations = [];
            }

        };

        function sortCollectionNames() {
            if (vm.parent_projects !== undefined || vm.parent_projects.length !== 0) {
                vm.parent_projects = _.sortBy(vm.parent_projects, function (pj) {
                    return pj.project.toLowerCase();
                });
            }
        }

        vm.closeParentProjectWindow = function () {
            if (vm.selected_parent_proj === undefined || vm.selected_parent_proj === null) {
                vm.no_parent_project_error = true;
                vm.show_select_parent_proj_window = true;
            } else {
                vm.show_select_parent_proj_window = false;
            }
        };
        vm.search_parent_project_name = '';

        vm.filterParentProjects = function () {
            if (vm.search_parent_project_name !== undefined && vm.search_parent_project_name !== '' && vm.search_parent_project_name.length >= 3) {
                vm.parent_projects = _.filter(vm.loaded_parent_projects, function (proj) {
                    return proj.project.toLowerCase().search(vm.search_parent_project_name.toLowerCase()) !== -1;
                });
            } else {
                vm.parent_projects = vm.loaded_parent_projects;
            }

            vm.parent_projects = _.sortBy(vm.parent_projects, function (pj) {
                return pj.project.toLowerCase();
            });

        };

        vm.selectParentProject = function (p_proj) {
            vm.selected_parent_proj = p_proj;
            vm.show_select_parent_proj_window = false;
            vm.no_parent_project_error = false;
            var linked_allocations = vm.project.requests[0].linked_allocations;
            if (linked_allocations === undefined || linked_allocations.length === 0) {
                vm.project.requests[0].linked_allocations = emptyLinkedAllocations();
            }
            vm.project.requests[0].linked_allocations[0].allocation = racmonLinkedAllocations();
        };

        vm.changeParentProject = function () {
            vm.hasParentProject();
        };

        //make a collective lable
        function racmonLinkedLable() {
            return {
                "key": "COLLECTIVE_PARENT",
                "e_research_body": ENV.erb
            };
        }

        //linked to allocation
        function racmonLinkedAllocations() {
            return {
                "id": vm.selected_parent_proj.id,
                "project": vm.selected_parent_proj.project,
                "project_id": vm.selected_parent_proj.project_id,
                "historic": vm.selected_parent_proj.historic
            };
        }

        //make a empty lined allocation
        function emptyLinkedAllocations() {
            return [
                {
                    "label": racmonLinkedLable(),
                    "allocation": {}
                }
            ];
        }

        //define a copied project for later comparing
        vm.copied_project = {};
        if (project_id) {
            CramsApiService.getProjectRequestById(request_id).then(function (response) {
                if (response.success) {
                    // he populate the models
                    vm.project = response.data[0];
                    //sort the request question response in the form order
                    var question_responses = CramsUtils.sortRacmReqQuestionResponseInFormOrder(vm.project);
                    vm.project.requests[0].request_question_responses = question_responses.request_question_responses;
                    if (vm.project.requests[0].request_question_responses.length === 0) {
                        vm.project.requests[0].request_question_responses = CramsApiService.emptyRaCMonRequestQuestionResponse();
                    }
                    //count desc
                    if (vm.project.description !== null && vm.project.description !== undefined) {
                        vm.desc_count = vm.project.description.length;
                    }
                    // load the project contacts in order filtered by contacts given name and contact role
                    // vm.project_contacts_sorted = CramsUtils.sortProjectContactsInFormOrder(vm.project, 'given_name');
                    CramsUtils.sortProjectContactsInFormOrder(vm.project, 'given_name');

                    // get data sensitive question
                    vm.data_sensitive = vm.project.requests[0].data_sensitive;

                    // var linked_allocations = vm.project.requests[0].linked_allocations;
                    // if (!(linked_allocations === undefined || linked_allocations.length === 0)) {
                    //     vm.selected_parent_proj = linked_allocations[0].allocation;
                    //     if (vm.selected_parent_proj !== undefined) {
                    //         vm.has_parent_project = true;
                    //     }
                    // }

                    //vm.project.requests[0].linked_allocations = emptyLinkedAllocations();

                    //check email notification flag, if it's undefined, set it as true
                    if (vm.project.requests[0].sent_email === undefined) {
                        vm.project.requests[0].sent_email = true;
                    }

                    //convert retention string value into int
                    convertRetentionPeriod();
                    //convert current storage size of data from string to int
                    convertSpQuestionResponseToInt();
                    //load organisation and facult
                    loadOrganisationAndFacultyList();

                    // if loading a draft with no storage request preload an empty sr
                    if (status_code === 'N') {
                        if (vm.project.requests[0].storage_requests.length === 0) {
                            let sr = {
                                "current_quota": 0,
                                "requested_quota_change": 0,
                                "requested_quota_total": 0,
                                "approved_quota_change": 0,
                                "approved_quota_total": 0,
                                "storage_product": {
                                    "id": 0
                                },
                                "storage_question_responses": []
                            };
                            vm.project.requests[0].storage_requests.push(sr);
                        }
                    }
                    //copy the project for late comparing
                    vm.copied_project = angular.copy(vm.project);

                    var status_code = vm.project.requests[0].request_status.code;
                    // remove any zero storage product requests after provision
                    if (status_code === 'P') {
                        //check storage products
                        angular.forEach(vm.project.requests, function (request, index) {
                            var storage_requests = [];
                            angular.forEach(request.storage_requests, function (storage_request, index) {
                                storage_request.current_quota = storage_request.approved_quota_total;
                                storage_request.requested_quota_total = storage_request.current_quota;
                                storage_request.requested_quota_change = 0;
                                storage_request.approved_quota_change = 0;
                                var current_total = storage_request.current_quota + storage_request.requested_quota_change;
                                //remove any storge request if current is zero after provision
                                if (current_total !== 0) {
                                    storage_requests.push(storage_request)
                                }
                            });
                            request.storage_requests = storage_requests;
                        });
                    }

                } else {
                    var msg = "Failed to get the allocation request, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        } else {
            loadOrganisationAndFacultyList();
        }

        function setDefaultFundingScheme() {
            var default_funding_scheme = _.findWhere(vm.funding_schemes, {'funding_scheme': 'RDSM'});
            if (default_funding_scheme !== undefined) {
                vm.project.requests[0].funding_scheme = default_funding_scheme;
            }
        }

        // add storage product quota
        vm.addAnotherSpQuota = function () {
            var storageQuota = newEmptyStorageQuota();
            vm.project.requests[0].storage_requests.push(storageQuota);
        };

        //remove the storage product
        vm.removeStorageProd = function (index) {
            vm.project.requests[0].storage_requests.splice(index, 1);
            vm.checkDuplicatedStorageProd();
        };

        //check storage product duplications
        vm.checkDuplicatedStorageProd = function (scope, index) {
            vm.clearSpDuplicatedFlag();
            var found_duplicated = false;
            var selected_sp = _.findWhere(vm.storageProducts, {'id': vm.project.requests[0].storage_requests[index].storage_product.id});
            if (selected_sp !== undefined) {
                vm.project.requests[0].storage_requests[index].storage_product.name = selected_sp.name;
            }
            var all_storage_requests = angular.copy(vm.project.requests[0].storage_requests);
            angular.forEach(vm.project.requests[0].storage_requests, function (each_sp_req, key) {
                angular.forEach(all_storage_requests, function (a_sp_req, akey) {
                    if (key !== akey) {
                        if ((each_sp_req.storage_product.id === a_sp_req.storage_product.id) && each_sp_req.storage_product.id !== 0 && a_sp_req.storage_product.id !== 0 && each_sp_req.storage_product.id !== undefined && a_sp_req.storage_product.id !== undefined) {
                            found_duplicated = true;
                            vm.alloc_form['sp_' + akey].$setValidity('isdup', !found_duplicated);
                            vm.alloc_form['sp_' + key].$setValidity('isdup', !found_duplicated);
                        }
                    }
                });
            });
        };

        vm.clearSpDuplicatedFlag = function () {
            angular.forEach(vm.project.requests[0].storage_requests, function (each_sp_req, key) {
                vm.alloc_form['sp_' + key].$setValidity('isdup', true);
            });
        };

        // add an additional FOR Code
        vm.addFORCode = function ($event) {
            $event.preventDefault();
            var domain = newEmptyDomain();
            vm.project.domains.push(domain);
        };

        // remove a FOR code
        vm.removeFORCode = function (index) {
            vm.project.domains.splice(index, 1);
            checkForCodeDuplication();
        };

        vm.clearForCodeDuplicateFlag = function () {
            angular.forEach(vm.project.domains, function (forcode, key) {
                vm.alloc_form["for_code" + key].$setValidity("isDup", true);
            });
        };

        // change funding scheme
        vm.changeFundingScheme = function () {
            var selected_funding_scheme_id = vm.project.requests[0].funding_scheme.id;
            if (selected_funding_scheme_id !== undefined || selected_funding_scheme_id !== 0) {
                var selected_scheme = _.findWhere(vm.funding_schemes, {"id": selected_funding_scheme_id});
                vm.project.requests[0].funding_scheme.funding_scheme = selected_scheme.funding_scheme;
            }
        };

        vm.negative_total_quota_invalid = [];
        vm.calcualteRequestedTotal = function (sp_index) {
            vm.negative_total_quota_invalid[sp_index] = false;
            var quota_total = vm.project.requests[0].storage_requests[sp_index].current_quota +
                vm.project.requests[0].storage_requests[sp_index].requested_quota_change;
            vm.project.requests[0].storage_requests[sp_index].requested_quota_total = quota_total;
            if (quota_total < 0) {
                vm.negative_total_quota_invalid[sp_index] = true;
            }
        };
        vm.desc_count = 0;

        vm.countDesc = function () {
            if (vm.project.description !== null && vm.project.description !== undefined) {
                vm.desc_count = vm.project.description.length;
            }
        };

        vm.grant_info_invalid = false;
        //Populate GrantTypes
        LookupService.grantTypes().then(function (response) {
            if (response.success) {
                vm.grant_types = response.data;
            } else {
                var msg = "Failed to load grant types, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
            }
        });

        // add research grant
        vm.addGrant = function ($event) {
            $event.preventDefault();
            var grantInfo = newEmptyGrantInfo();
            vm.project.grants.push(grantInfo);
        };

        // remove research grant
        vm.removeGrant = function (index) {
            vm.project.grants.splice(index, 1);
            validateGrantTypeDuplication();
        };

        // reset grant invalid flag
        vm.resetGrantInvalidFlag = function () {
            vm.grant_info_invalid = false;
        };

        vm.clearGrantTypeDuplicateFlag = function () {
            angular.forEach(vm.project.grants, function (grant, key) {
                vm.alloc_form["grant_type_" + key].$setValidity("isDup", true);
                vm.alloc_form["total_funding_" + key].$setValidity("valid", true);
            });
        };

        //check duplicated Grant Type
        vm.checkGrantTypeDup = function (scope, index) {
            //validateGrantTypeDuplication();
        };

        function validateGrantTypeDuplication() {
            var grant_valid = true;
            // save the previous domains
            var grants = vm.project.grants;
            var copied_grants = angular.copy(grants);
            vm.clearGrantTypeDuplicateFlag();
            // only check when domains is greater than 1
            if (grants.length > 1) {
                angular.forEach(grants, function (grant, key) {
                    // loop for duplicates
                    if (grant.grant_type) {
                        if (grant.grant_type.id !== 0 && grant.grant_type.id !== null) {
                            angular.forEach(copied_grants, function (copy_grant, copy_key) {
                                if (key !== copy_key) {
                                    if (copy_grant.grant_type) {
                                        if (copy_grant.grant_type.id === grant.grant_type.id) {
                                            // invalid
                                            vm.alloc_form["grant_type_" + key].$setValidity("isDup", false);
                                            vm.alloc_form["grant_type_" + copy_key].$setValidity("isDup", false);
                                            grant_valid = false;
                                        }
                                    }
                                }
                            });
                        } else {
                            vm.alloc_form["grant_type_" + key].$invalid = true;
                            grant_valid = false;
                        }
                    }

                    if (grant.total_funding === 0 || grant.total_funding === null || grant.total_funding === '' || grant.total_funding === undefined) {
                        vm.alloc_form["total_funding_" + key].$setValidity("valid", false);
                        grant_valid = false;
                    }
                });

            }
            if (grants.length === 1) {
                if (vm.project.grants[0].grant_type === null) {
                    vm.alloc_form["grant_type_0"].$invalid = true;
                    grant_valid = false;
                } else {
                    if (vm.project.grants[0].grant_type.id === 0 || vm.project.grants[0].grant_type.id === null) {
                        vm.alloc_form["grant_type_0"].$invalid = true;
                        grant_valid = false;
                    }
                }
                if (vm.project.grants[0].duration === 0 || vm.project.grants[0].duration === null || vm.project.grants[0].duration === undefined) {
                    vm.alloc_form["grant_duration_0"].$setValidity("valid", false);
                    grant_valid = false;
                }
                if (vm.project.grants[0].total_funding === 0 || vm.project.grants[0].total_funding === null || vm.project.grants[0].total_funding === '' || vm.project.grants[0].total_funding === undefined) {
                    vm.alloc_form["total_funding_0"].$setValidity("valid", false);
                    grant_valid = false;
                }
            }
            return grant_valid;
        }

        vm.checkFundingMount = function (index) {
            var total_mount = vm.project.grants[index].total_funding;
            if (total_mount === 0 || total_mount === null || total_mount === '' || total_mount === undefined) {
                vm.alloc_form["total_funding_" + index].$setValidity("valid", false);
            } else {
                vm.alloc_form["total_funding_" + index].$setValidity("valid", true);
            }
        };

        vm.checkFundingDuration = function (index) {
            var duration = vm.project.grants[index].duration;

            if (duration === null || duration === '' || duration === undefined) {
                vm.alloc_form["grant_duration_" + index].$setValidity("valid", false);
            } else {
                if (duration > 0 && duration < 1000) {
                    vm.alloc_form["grant_duration_" + index].$setValidity("valid", true);
                } else {
                    vm.alloc_form["grant_duration_" + index].$setValidity("valid", false);
                }
            }
        };

        vm.submitRacMonReq = function () {
            // validate project title exists
            // need to do this first before the rest of the vaildation otherwise it causes a race condition
            LookupService.projectTitleExists(ENV.erb, vm.project.title, vm.project.id).then(function (response) {
                vm.titleExists = false;

                if (response.success) {
                    vm.titleExists = response.data;
                } else {
                    var msg = "Failed to check title, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            }).finally(function () {
                if (validateForm(vm.titleExists)) {
                    if (project_id) {
                        //check if there is a changes or not
                        var no_changes = angular.equals(angular.toJson(vm.copied_project), angular.toJson(vm.project));
                        var status = vm.project.requests[0].request_status.code;
                        if (no_changes && status !== 'N') {
                            var msg = "No changes";
                            // scroll to top of the page
                            $anchorScroll();
                            FlashService.Error(msg);
                        } else {
                            adjustNullToEmpty();
                            CramsApiService.updateProjectRequest(vm.project, project_id).then(function (response) {
                                if (response.success) {
                                    if (vm.project.requests[0].request_status.code === 'N') {
                                        FlashService.Success("Request created", true);
                                    } else {
                                        FlashService.Success("Request updated", true);
                                    }
                                    $location.path('/' + vm.allocations_base_path);
                                } else {
                                    var msg = "Failed to create request, " + response.message + ".";
                                    FlashService.DisplayError(msg, response.data);
                                    console.error(msg);
                                }
                            });
                        }
                    } else {
                        // create a new request
                        adjustNullToEmpty();
                        CramsApiService.createProjectRequest(vm.project).then(function (response) {
                            if (response.success) {
                                FlashService.Success('Request created', true);
                                $location.path('/' + vm.allocations_base_path);
                            } else {
                                var msg = "Failed to create request, " + response.message + ".";
                                FlashService.DisplayError(msg, response.data);
                                console.error(msg);
                            }
                        });
                    }
                } else {
                    FlashService.Error("Please check that all required fields have been filled in correctly.");
                    //console.log("Validation Errors check invalid fields.");
                    // scroll to top of the page
                    $anchorScroll();
                }
            });
        };

        function adjustNullToEmpty() {
            if (vm.project.requests[0].request_question_responses[2].question_response === 0 || vm.project.requests[0].request_question_responses[2].question_response === null) {
                vm.project.requests[0].request_question_responses[2].question_response = "";
            }
            if (vm.project.requests[0].request_question_responses[5].question_response === 0 || vm.project.requests[0].request_question_responses[5].question_response === null) {
                vm.project.requests[0].request_question_responses[5].question_response = "";
            }

            if (vm.project.requests[0].request_question_responses[8].question_response === 0 || vm.project.requests[0].request_question_responses[8].question_response === null) {
                vm.project.requests[0].request_question_responses[8].question_response = "";
            }
            if (vm.project.requests[0].request_question_responses[9].question_response === 0 || vm.project.requests[0].request_question_responses[9].question_response === null) {
                vm.project.requests[0].request_question_responses[9].question_response = "";
            }
        }

        function toDecimal(x) {
            var val = Number(x);
            if (!isNaN(parseFloat(val))) {
                val = val.toFixed(2);
            }
            return val;
        }

        function validateForm(titleExist) {
            vm.authority_question_invalid = false;
            vm.title_invalid = false;
            vm.description_invalid = false;
            vm.organisation_valid = false;
            vm.faculty_valid = false;
            vm.department_valid = false;
            vm.description_excess_max_invalid = false;
            vm.funding_scheme_invalid = false;
            vm.data_retention_period_invalid = false;
            vm.electronic_inf_class_invalid = false;
            vm.sum_for_gt_100_invalid = false;
            vm.sum_for_lt_100_invalid = false;

            vm.data_migration_src_invalid = false;

            vm.data_migration_ast_invalid = false;
            vm.access_method_invalid = false;
            vm.prefer_access_method_invalid = false;
            vm.only_copy_invalid = false;
            vm.loss_impact_invalid = false;
            vm.privacy_question1_invalid = false;
            vm.privacy_question2_invalid = false;

            // data sensitive validation
            vm.data_sensitive_invalid = false;

            vm.form_valid = true;

            if (vm.data_sensitive === null) {
                vm.data_sensitive_invalid = true;
                vm.form_valid = false;
            } else {
                // add data_sensitive value to all of the project requests
                angular.forEach(vm.project.requests, function (request, index) {
                    request.data_sensitive = vm.data_sensitive;
                });
            }

            if (!vm.alloc_form.authority.$valid) {
                vm.authority_question_invalid = true;
                vm.form_valid = false;
            } else {
                if (vm.project.requests[0].request_question_responses[0].question_response === 0) {
                    vm.authority_question_invalid = true;
                    vm.form_valid = false;
                }
            }
            //check if it's data custodian is not present
            vm.data_custodian_invalid = true;
            angular.forEach(vm.project.project_contacts, function (p_contact, index) {
                if (p_contact.contact_role === 'Data Custodian' && p_contact.contact.id !== 0) {
                    vm.data_custodian_invalid = false;
                }
            });

            // //check  if the technical contact is not present
            // vm.technical_contact_invalid = true;
            // angular.forEach(vm.project.project_contacts, function (p_contact, key) {
            //     if (p_contact.contact_role === 'Technical Contact' && p_contact.contact.id !== 0) {
            //         vm.technical_contact_invalid = false;
            //     }
            // });

            if (vm.data_custodian_invalid || vm.technical_contact_invalid) {
                vm.form_valid = false;
            }

            if (!vm.alloc_form.title.$valid) {
                vm.title_invalid = true;
            }

            // check if project title already exists
            if (titleExist) {
                vm.title_invalid = true;
                vm.title_error_message = 'This project title has already been taken, please try a different project title';
                vm.form_valid = false;
            }

            if (!vm.alloc_form.description.$valid) {
                vm.description_invalid = true;
                vm.form_valid = false;
            } else {
                var max_len = vm.project.description.length;
                if (max_len > 2500) {
                    vm.description_excess_max_invalid = true;
                    vm.form_valid = false;
                }
            }

            if (vm.project.department === null || vm.project.department === undefined) {
                vm.organisation_valid = true;
                vm.faculty_valid = true;
                vm.department_valid = true;
                vm.form_valid = false;
            } else {
                //check organisation
                if (vm.project.department.organisation === null || vm.project.department.organisation === undefined) {
                    vm.organisation_valid = true;
                    vm.form_valid = false;
                }

                // check faculty
                if (vm.project.department.faculty === null || vm.project.department.faculty === undefined) {
                    vm.faculty_valid = true;
                    vm.form_valid = false;
                }

                // check for department
                if (vm.project.department.department === null || vm.project.department.department === undefined) {
                    vm.department_valid = true;
                    vm.form_valid = false;
                }
            }

            if (!vm.alloc_form.funding_scheme.$valid) {
                vm.funding_scheme_invalid = true;
                vm.form_valid = false;
            }

            if (vm.project.requests[0].funding_scheme.id === 0) {
                vm.funding_scheme_invalid = true;
                vm.form_valid = false;
            }

            if (!vm.alloc_form.data_retention_period.$valid) {
                vm.data_retention_period_invalid = true;
                vm.form_valid = false;
            }

            if (!vm.alloc_form.data_migration_src.$valid) {
                vm.data_migration_src_invalid = true;
            }

            if (!vm.alloc_form.access_method.$valid) {
                vm.access_method_invalid = true;
            }
            if (!vm.alloc_form.prefer_access_method.$valid) {
                vm.prefer_access_method_invalid = true;
            }

            if (!vm.alloc_form.loss_impact.$valid) {
                vm.loss_impact_invalid = true;
            }

            //check FOR CODE
            var duplicated = checkForCodeDuplication();
            if (duplicated) {
                vm.form_valid = false;
            }

            // forcode domain percentage validation
            var sumOfPercentage = 0;

            for (var i = 0; i < vm.project.domains.length; i++) {
                // calculate and check sum of domain percentage
                var domain_percentage = vm.project.domains[i].percentage;
                sumOfPercentage += domain_percentage;

                if (domain_percentage === 0 || domain_percentage === undefined) {
                    vm.alloc_form['for_percentage' + i].$invalid = true;
                    vm.form_valid = false;
                }

                // check for empty FORCode
                if (vm.project.domains[i].for_code.id === 0 || vm.project.domains[i].for_code.id === null || vm.project.domains[i].for_code.id === undefined) {
                    // display error
                    vm.alloc_form["for_code" + i].$invalid = true;
                    vm.form_valid = false;
                }
            }

            sumOfPercentage = toDecimal(sumOfPercentage);
            if (sumOfPercentage > 100) {
                vm.sum_for_gt_100_invalid = true;
                vm.form_valid = false;
            }
            if (sumOfPercentage < 100) {
                vm.sum_for_lt_100_invalid = true;
                vm.form_valid = false;
            }

            //check storage products
            angular.forEach(vm.project.requests[0].storage_requests, function (storage_request, key) {
                if (storage_request.storage_product.id === 0) {
                    vm.alloc_form['sp_' + key].$invalid = true;
                    vm.form_valid = false;
                }
                //if leave the requested quota change as empty. just reset it to 0
                if (storage_request.requested_quota_change === null) {
                    storage_request.requested_quota_change = 0;
                }
                // it can't be a negative value if the current quota is zero
                if ((storage_request.current_quota === 0 && storage_request.requested_quota_change <= 0) || (storage_request.requested_quota_change === undefined)) {
                    vm.alloc_form['sp_requested_quota_change_' + key].$invalid = true;
                    vm.form_valid = false;
                }
            });


            var grant_valid = validateGrantTypeDuplication();
            if (!grant_valid) {
                vm.form_valid = false;
            }

            angular.forEach(vm.project.grants, function (each_grant, key) {
                if (each_grant.grant_type === null) {
                    vm.alloc_form['grant_type_' + key].$invalid = true;
                    vm.form_valid = false;
                } else {
                    if (each_grant.grant_type.id === 0 || each_grant.grant_type.id === undefined) {
                        vm.alloc_form['grant_type_' + key].$invalid = true;
                        vm.form_valid = false;
                    }
                }
                if (each_grant.funding_body_and_scheme === '' || each_grant.funding_body_and_scheme === null) {
                    vm.alloc_form['funding_body_and_scheme_' + key].$invalid = true;
                    vm.form_valid = false;
                }
                if (each_grant.start_year < 1970 || each_grant.start_year > 3000) {
                    vm.alloc_form['start_year_' + key].$invalid = true;
                    vm.form_valid = false;
                }
                if (each_grant.duration < 1) {
                    vm.alloc_form['grant_duration_' + key].$invalid = true;
                    vm.form_valid = false;
                }
                if (each_grant.total_funding < 1) {
                    vm.alloc_form['total_funding_' + key].$invalid = true;
                    vm.form_valid = false;
                }
            });

            if (!vm.alloc_form.privacy_question_1.$valid) {
                vm.privacy_question1_invalid = true;
                vm.form_valid = false;
            }

            if (!vm.alloc_form.privacy_question_2.$valid) {
                vm.privacy_question2_invalid = true;
                vm.form_valid = false;
            }
            return vm.form_valid;
        }

        vm.submitDraftReq = function () {
            // validate project title exists
            // need to do this first before the rest of the validation otherwise it causes a race condition
            LookupService.projectTitleExists(ENV.erb, vm.project.title, vm.project.id).then(function (response) {
                vm.titleExists = false;

                if (response.success) {
                    vm.titleExists = response.data;
                } else {
                    var msg = "Failed to check title, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    vm.form_valid = false;
                }
            }).finally(function () {
                if (validateDraft(vm.titleExists)) {
                    if (project_id) {
                        CramsApiService.updateProjectRequestDraft(vm.project, project_id).then(function (response) {
                            if (response.success) {
                                FlashService.Success("Request draft updated", true);
                                $location.path('/' + vm.allocations_base_path);
                            } else {
                                //disable draft storage request validation error
                                disableDraftStorageRequestValidationError();
                                var msg = "Failed to update request draft, " + response.message + ".";
                                FlashService.DisplayError(msg, response.data);
                                console.error(msg);
                            }
                        });
                    } else {
                        // create a new request
                        CramsApiService.saveProjectRequestDraft(vm.project).then(function (response) {
                            if (response.success) {
                                FlashService.Success('Request draft saved', true);
                                $location.path('/' + vm.allocations_base_path);
                            } else {
                                //disable draft storage request validation error
                                disableDraftStorageRequestValidationError();
                                var msg = "Failed to save request draft, " + response.message + ".";
                                FlashService.DisplayError(msg, response.data);
                                console.error(msg);
                            }
                        });
                    }
                } else {
                    FlashService.Error("Please check that all required fields have been filled in correctly.");
                    $anchorScroll();
                }
            });
        };

        function disableDraftStorageRequestValidationError() {
            //append an empty storage request
            angular.forEach(vm.project.requests, function (req, index) {
                var sp_requests = req.storage_requests;
                // add empty storage products
                if (sp_requests.length === 0) {
                    vm.project.requests[index].storage_requests = [{
                        "current_quota": 0,
                        "requested_quota_change": 0,
                        "requested_quota_total": 0,
                        "approved_quota_change": 0,
                        "approved_quota_total": 0,
                        "storage_product": {
                            "id": 0
                        },
                        "storage_question_responses": []
                    }];
                }
            });
        }

        function validateDraft(titleExist) {
            // reset alloc_form valid to true
            vm.alloc_form.$valid = true;

            var formValid = true;
            vm.title_invalid = false;
            vm.description_invalid = false;
            vm.funding_scheme_invalid = false;

            if (!vm.alloc_form.title.$valid) {
                vm.title_invalid = true;
                vm.title_error_message = 'Required field';
                formValid = false;
            }

            // check if project title already exists
            if (titleExist) {
                vm.title_invalid = true;
                vm.title_error_message = 'This project title has already been taken, please try a different project title';
                formValid = false;
            }

            if (vm.project.description === null || vm.project.description === '' || vm.project.description === undefined) {
                vm.project.description = 'None';
            } else {
                var max_len = vm.project.description.length;
                if (max_len > 2500) {
                    vm.description_excess_max_invalid = true;
                    vm.alloc_form.$valid = false;
                    formValid = false;
                }
            }

            vm.project.domains = _.reject(vm.project.domains, function (a_domain) {
                return a_domain.for_code.id === 0 || a_domain.for_code.id === null || a_domain.for_code.id === undefined;
            });

            vm.project.project_contacts = _.reject(vm.project.project_contacts, function (a_contact) {
                return a_contact.contact.email === null;
            });

            //if no organisation provided, then set the department is null
            if (vm.project.department !== null) {
                if (vm.project.department.department === null || vm.project.department.faculty === null || vm.project.department.organisation === null) {
                    vm.project.department = null;
                }
            }

            if (!vm.alloc_form.funding_scheme.$valid) {
                vm.funding_scheme_invalid = true;
                formValid = false;
            }

            var valid_grants = [];
            angular.forEach(vm.project.grants, function (each_grant, key) {
                if (each_grant.grant_type.id !== 0 && each_grant.grant_type.id !== null) {
                    if (each_grant.funding_body_and_scheme === '' || each_grant.funding_body_and_scheme === null) {
                        each_grant.funding_body_and_scheme = 'None';
                    }
                    if (each_grant.start_year < 1970 || each_grant.start_year === null) {
                        each_grant.start_year = 1970;
                    }
                    if (each_grant.duration < 1) {
                        each_grant.duration = 1;
                    }
                    if (each_grant.total_funding < 1) {
                        each_grant.total_funding = 1;
                    }
                    valid_grants.push(each_grant);
                }
            });
            vm.project.grants = valid_grants;

            if (vm.project.requests[0].request_question_responses[2].question_response === 0 || vm.project.requests[0].request_question_responses[2].question_response === null) {
                vm.project.requests[0].request_question_responses[2].question_response = "";
            }

            if (vm.project.requests[0].request_question_responses[5].question_response === 0 || vm.project.requests[0].request_question_responses[5].question_response === null) {
                vm.project.requests[0].request_question_responses[5].question_response = "";
            }

            if (vm.project.requests[0].request_question_responses[8].question_response === 0 || vm.project.requests[0].request_question_responses[8].question_response === null) {
                vm.project.requests[0].request_question_responses[8].question_response = "";
            }

            if (vm.project.requests[0].request_question_responses[9].question_response === 0 || vm.project.requests[0].request_question_responses[9].question_response === null) {
                vm.project.requests[0].request_question_responses[9].question_response = "";
            }

            // make sure we don't send any null question responses in draft
            function set_empty_qresp(qkey) {
                angular.forEach(vm.project.requests[0].request_question_responses, function (req_resp, key) {
                    if (qkey === req_resp.question.key) {
                        if (req_resp.question_response === null) {
                            req_resp.question_response = '';
                        }
                    }
                });
            }

            set_empty_qresp('crams_demo_data_migration_src');
            set_empty_qresp('crams_demo_current_access_method');
            set_empty_qresp('crams_demo_preferred_access_method');
            set_empty_qresp('crams_demo_loss_impact');

            //check storage products
            let empty_sr_indexes = []; // indexes of empty sr 
            angular.forEach(vm.project.requests[0].storage_requests, function (storage_request, key) {
                let rqc = storage_request.requested_quota_change
                if (rqc === 0 || rqc === undefined || rqc === null) {
                    let sp_id = storage_request.storage_product.id
                    if (sp_id === 0 || sp_id === undefined || sp_id === null) {
                        // this is a blank storage product request remove it from the json
                        empty_sr_indexes.push(key);
                    }
                } else {
                    // it can't be a negative value if the current quota is zero
                    if (storage_request.current_quota === 0 && storage_request.requested_quota_change <= 0) {
                        vm.alloc_form['sp_requested_quota_change_' + key].$invalid = true;
                        vm.alloc_form.$valid = false;
                        formValid = false;
                    }

                    // has storage product id
                    let sp_id = storage_request.storage_product.id
                    if (sp_id === 0 || sp_id === undefined || sp_id === null) {
                        vm.alloc_form['sp_' + key].$invalid = true;
                        vm.alloc_form.$valid = false;
                        formValid = false;
                    }
                }
            });
            // remove the indexes of empty sr before saving as a draft
            if (empty_sr_indexes) {
                // sort by descending to remove indexes backwards
                empty_sr_indexes.sort(function (a, b) {
                    return b - a
                });

                // remove empty sr
                for (let i = 0; i < empty_sr_indexes.length; i++) {
                    vm.project.requests[0].storage_requests.splice(empty_sr_indexes[i], 1);
                }
            }

            // angular.forEach(vm.project.requests[0].storage_requests, function (storage_request, key) {

            //     if (storage_request.storage_product.id === 0) {
            //         vm.alloc_form['sp_' + key].$invalid = true;
            //         vm.alloc_form.$valid = false;
            //         formValid = false;
            //     }

            //     // it can't be a negative value if the current quota is zero
            //     if (storage_request.current_quota === 0 && storage_request.requested_quota_change <= 0) {
            //         vm.alloc_form['sp_requested_quota_change_' + key].$invalid = true;
            //         vm.alloc_form.$valid = false;
            //         formValid = false;
            //     }

            // });

            // data sensitivity
            if (vm.data_sensitive !== null) {
                // add data_sensitive value to all of the project requests
                angular.forEach(vm.project.requests, function (request, index) {
                    request.data_sensitive = vm.data_sensitive;
                });
            }

            return formValid;
        }


        function copyDomainsForCode() {
            //clean any for codes
            vm.domains = [];
            //copy to vm.project.domains to vm.domains
            angular.forEach(vm.project.domains, function (each_domain, key) {
                if (each_domain.for_code !== undefined && each_domain.for_code.id !== 0) {
                    var dom = {
                        "percentage": each_domain.percentage,
                        "for_code": {
                            "id": each_domain.for_code.id
                        }
                    };
                    vm.domains.push(dom);
                }
            });

            var d_lens = vm.domains.length;
            //console.log('domains lens: ' + d_lens);
            if (d_lens < 3) {
                for (var i = 0; i < (3 - d_lens); i++) {
                    var dom = {
                        "percentage": 0,
                        "for_code": {
                            "id": 0
                        }
                    };
                    vm.domains.push(dom);
                }
            }
        }

        function convertRetentionPeriod() {
            var retentiaon_period = vm.project.requests[0].request_question_responses[1].question_response;
            if (retentiaon_period === '') {
                retentiaon_period = '0';
            }
            vm.project.requests[0].request_question_responses[1].question_response = parseInt(retentiaon_period);
        }

        function convertSpQuestionResponseToInt() {
            angular.forEach(vm.project.requests[0].request_question_responses, function (request_question_resp, index) {
                var question_key = request_question_resp.question.key;
                var q_response = request_question_resp.question_response;
                if (question_key === 'crams_demo_current_size') {
                    var current_size = parseInt(q_response);
                    request_question_resp.question_response = current_size;
                }
            });
        }

        function setRequestStartDateEndDate() {
            var current = new Date();
            var current_date_str = current.toISOString().substring(0, 10);
            var end_date = current;
            end_date.setMonth(end_date.getMonth() + 1);
            var end_date_str = end_date.toISOString().substring(0, 10);
            vm.project.requests[0].start_date = current_date_str;
            vm.project.requests[0].end_date = end_date_str;
        }

        function initForCode() {
            var domain = {
                "percentage": 100,
                "for_code": {
                    "id": null
                }
            };

            vm.project.domains.push(domain);
        }

        //check duplicated FOR Code
        vm.checkFORDuplicate = function (scope, index) {
            checkForCodeDuplication();
        };

        function checkForCodeDuplication(index) {
            // save the previous domains
            var form_invalid = false;
            var domains = vm.project.domains;
            var copyDomains = angular.copy(vm.project.domains);
            vm.clearForCodeDuplicateFlag();
            if (domains.length >= 1) {
                // loop for duplicates
                angular.forEach(domains, function (domain, key) {
                    var domainHasDup = false;
                    if (domain.for_code.id !== 0 && domain.for_code.id !== null) {
                        angular.forEach(copyDomains, function (copy_domain, copy_key) {
                            if (key !== copy_key) {
                                if (domain.for_code.id === copy_domain.for_code.id && domain.for_code.id !== null && copy_domain.for_code.id !== null) {
                                    // invalid
                                    vm.alloc_form["for_code" + key].$setValidity("isDup", false);
                                    vm.alloc_form["for_code" + copy_key].$setValidity("isDup", false);
                                    // found dup in this domain
                                    domainHasDup = true;
                                    form_invalid = true;
                                }
                            }
                        });
                        // after a loop and domain has no duplicate remove the error
                        if (!domainHasDup) {
                            vm.alloc_form["for_code" + key].$setValidity("isDup", true);
                        }
                    } else {
                        vm.alloc_form["for_code" + key].$invalid = true;
                        form_invalid = true;
                    }
                });
            }
            return form_invalid;
        }

        function loadFORCodes() {
            //Populate FORCodes
            LookupService.forCodes().then(function (response) {
                if (response.success) {
                    vm.for_codes = response.data;
                } else {
                    var msg = "Failed to load FOR codes, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }

        function loadFundingSchemes() {
            //Populate Funding Schemes
            LookupService.fundingScheme(ENV.erb).then(function (response) {
                if (response.success) {
                    vm.funding_schemes = response.data;
                    setDefaultFundingScheme();
                } else {
                    var msg = "Failed to load funding schemes, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }

        function loadRaCMonSystem() {
            LookupService.researchSystem(ENV.erb).then(function (response) {
                if (response.success) {
                    var racmon_systems = response.data;
                    vm.project.requests[0].e_research_system = racmon_systems[0];
                } else {
                    var msg = "Failed to load eresearch systems, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }

        function forCodePercentages() {
            return [
                //{value: 0, "label": "0%"},
                {value: 10, "label": "10%"},
                {value: 20, "label": "20%"},
                {value: 30, "label": "30%"},
                {value: 40, "label": "40%"},
                {value: 50, "label": "50%"},
                {value: 60, "label": "60%"},
                {value: 70, "label": "70%"},
                {value: 80, "label": "80%"},
                {value: 90, "label": "90%"},
                {value: 100, "label": "100%"}
            ];
        }

        function newEmptyStorageQuota() {
            return {
                "current_quota": 0,
                "requested_quota_change": 0,
                "requested_quota_total": 0,
                "approved_quota_change": 0,
                "approved_quota_total": 0,
                "storage_product": {
                    "id": 0
                },
                "storage_question_responses": []
            };
        }

        function newEmptyDomain() {
            return {
                "percentage": 0.00,
                "for_code": {
                    "id": null
                }
            };
        }

        function getContactRoleID() {
            // fetch the data custodian and tech contact contact role id for use when adding roles to project
            ContactService.contactRoles().then(function (response) {
                if (response.success) {
                    let contact_roles = response.data;
                    for (let i = 0; i < contact_roles.length; i++) {
                        if (contact_roles[i].name.toLowerCase().includes('technical contact')) {
                            vm.tech_cont_id = contact_roles[i].id;
                        }

                        if (contact_roles[i].name.toLowerCase().includes('data custodian')) {
                            vm.data_cust_id = contact_roles[i].id;
                        }
                    }
                }
            });
        }

        function emptyTechnicalContact() {
            return {
                "contact": {
                    "id": 0
                },
                "contact_role": "Technical Contact",
                "contact_role_id": vm.tech_cont_id
            };
        }

        function emptyDataCustodian() {
            return {
                "contact": {
                    "id": 0,
                    "email": null
                },
                "contact_role": "Data Custodian",
                "contact_role_id": vm.data_cust_id
            };
        }

        function newEmptyGrantInfo() {
            // pre fill the start year with current year
            var current_year = (new Date()).getFullYear();

            return {
                "grant_type": null,
                "funding_body_and_scheme": null,
                "grant_id": null,
                "start_year": current_year,
                "duration": 0,
                "total_funding": 0.0
            };
        }
    }
})();
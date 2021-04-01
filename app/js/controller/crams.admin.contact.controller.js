/**
 * Created by simonyu on 10/1/17.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsAdminContactController', CramsAdminContactController);

    CramsAdminContactController.$inject = ['$location', '$scope', '$routeParams', 'ContactService', 'FlashService', '$anchorScroll', 'ENV', 'OrganisationService'];

    function CramsAdminContactController($location, $scope, $routeParams, ContactService, FlashService, $anchorScroll, ENV, OrganisationService) {
        var vm = this;
        var contact_id = $routeParams.contact_id;

        var current_paths = $location.path().split('/');

        vm.contact = null;
        vm.contact_form_errors = {};

        // get organisation list
        OrganisationService.listOrganisation().then(function (response) {
            if (response.success) {
                vm.organisations = response.data;
                vm.organisations = _.sortBy(vm.organisations, function (org) {
                    return org.name.toLowerCase();
                });
            } else {
                // error loading organisations
                vm.organisations = null;
            }
        });

        var action_name = current_paths[3];
        //check if it's editing a contact or not
        var is_editing_contact = false;
        if (action_name === 'edit_contact') {
            is_editing_contact = true;
        }

        if (is_editing_contact) {
            //get the contact for updating
            ContactService.findContactById(contact_id).then(function (response) {
                if (response.success) {
                    vm.contact = response.data;

                    var contact_projects = vm.contact.projects;
                    contact_projects = _.filter(contact_projects, function (project) {
                        return project.e_research_systems[0].name === ENV.system;
                    });
                    if (contact_projects === undefined) {
                        contact_projects = [];
                    }
                    vm.contact.projects = contact_projects;

                } else {
                    var msg = "Failed to get the contact, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        } else {
            //define the admin update contact path
            vm.contact_updated_path = 'admin/contacts/edit_contact';
            vm.view_project_path = 'admin/allocations';
            //get the contact details and projects
            ContactService.contactProjects(contact_id).then(function (response) {
                if (response.success) {
                    vm.contact = response.data;

                    var contact_projects = vm.contact.projects;
                    contact_projects = _.filter(contact_projects, function (project) {
                        return project.e_research_systems[0].name === ENV.system;
                    });
                    if (contact_projects === undefined) {
                        contact_projects = [];
                    }
                    vm.contact.projects = contact_projects;

                } else {
                    var msg = "Failed to get the contact projects " + response.message + '.';
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }

        vm.organisation_change = function() {
            for (var i = 0; i < vm.organisations.length; i++) {
                if (vm.organisations[i].name === vm.contact.organisation.name) {
                    vm.contact.organisation = vm.organisations[i];
                }
            }
        };

        vm.editContact = function () {
            if (validateUpdateContact()) {
                ContactService.editContact(vm.contact).then(function (response) {
                    if (response.success) {
                        vm.contact = response.data;
                        FlashService.Success("Contact updated", true);
                        $location.path("/admin/contacts");
                    } else {
                        for (var errorField in response.data) {
                            // raise a form error for every field error in the response
                            vm.raiseFieldError(errorField, response.data[errorField].toString());
                            FlashService.Error("Failed to edit the contact.");
                            // scroll to top of the page
                            $anchorScroll();
                        }
                    }
                });
            } else {
                FlashService.Error("Please check that all required fields have been filled in correctly.");
                // scroll to top of the page
                $anchorScroll();
            }
        };

        function validateUpdateContact() {
            // validate contact fields
            var valid_contact = true;
            vm.contact_form_errors = {};
            if (vm.contact.given_name === undefined || vm.contact.given_name === '' || vm.contact.given_name == null) {
                vm.contact_form_errors['given_name_status'] = true;
                vm.contact_form_errors['given_name_message'] = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.surname === undefined || vm.contact.surname === '' || vm.contact.surname === null) {
                vm.contact_form_errors['surname_status'] = true;
                vm.contact_form_errors['surname_message'] = 'This field is required';
                valid_contact = false;
            }
            if (vm.contact.email === undefined || vm.contact.email === '' || vm.contact.email === null) {
                vm.contact_form_errors['email_status'] = true;
                vm.contact_form_errors['email_message'] = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.phone) {
                let re_phone = /^[\d\s\-+]+$/;
                if (!re_phone.test(vm.contact.phone)) {
                    vm.contact_form_errors['phone_status'] = true;
                    vm.contact_form_errors['phone_message'] = 'Please enter numeric values, spaces and hypens are accepted';
                    valid_contact = false;
                }
            }

            if (vm.contact.orcid) {
                let re_orcid = /^(?:http(s)?:\/\/)?orcid.org\/\w{4}-\w{4}-\w{4}-\w{4}$/;
                if (!re_orcid.test(vm.contact.orcid)) {
                    vm.contact_form_errors['orcid_status'] = true;
                    vm.contact_form_errors['orcid_message'] = 'Invalid orcid - required format: http://orcid.org/XXXX-XXXX-XXXX-XXXX';
                    valid_contact = false;
                }
            }

            // validate scopus_id, should be numeric
            if (vm.contact.scopusid !== undefined || vm.contact.scopusid !== '' || vm.contact.scopusid !== null) {
                if (isNaN(vm.contact.scopusid)) {
                    vm.contact_form_errors['scopusid_status'] = true;
                    vm.contact_form_errors['scopusid_message'] = 'This scopus id should contain only numbers';
                    valid_contact = false;
                }
            }

            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            console.log("Error in " + fieldName + ": " + errorMessage);
            switch (fieldName) {
                case "title":
                    vm.contact_form_errors['title_status'] = true;
                    vm.contact_form_errors['title_message'] = errorMessage;
                    break;
                case "organisation":
                    vm.contact_form_errors['organisation_status'] = true;
                    vm.contact_form_errors['organisation_message'] = errorMessage;
                    break;
                case "given_name":
                    vm.contact_form_errors['given_name_status'] = true;
                    vm.contact_form_errors['given_name_message'] = errorMessage;
                    break;
                case "email":
                    vm.contact_form_errors['email_status'] = true;
                    vm.contact_form_errors['email_message'] = errorMessage;
                    break;
                case "surname":
                    vm.contact_form_errors['surname_status'] = true;
                    vm.contact_form_errors['surname_message'] = errorMessage;
                    break;
                case "phone":
                    vm.contact_form_errors['phone_status'] = true;
                    vm.contact_form_errors['phone_message'] = errorMessage;
                    break;
                case "orcid":
                    vm.contact_form_errors['orcid_status'] = true;
                    vm.contact_form_errors['orcid_message'] = errorMessage;
                    break;
            }
        };
    }
})();
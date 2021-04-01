/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams').controller('CramsTechnicalContactController', CramsTechnicalContactController);
    CramsTechnicalContactController.$inject = ['$scope', 'ContactService', 'OrganisationService'];

    function CramsTechnicalContactController($scope, ContactService, OrganisationService) {
        var vm = this;

        // flag popup is opened or not
        vm.tc_popup_opened = false;

        // search technical contact field
        vm.search_tc = '';

        // show new technical contact form flag
        vm.show_new_tc = false;

        // new technical contact form errors
        vm.tc_form_errors = {};

        // display the char count for some input fields
        vm.input_char_count = {};

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

        // add technical contact popup button action
        vm.addTechnicalContact = function () {
            vm.tc_popup_opened = !vm.tc_popup_opened;
            // reset the following default value
            vm.selected_tc = '';
            vm.search_tc = '';
            vm.found_tc = [];
            vm.tc_searched = false;
            vm.show_new_tc = false;
            vm.contact = {};
            var search_tc_ele = document.getElementById('id-search_tc');
            if (vm.tc_popup_opened) {
                search_tc_ele.autofocus = 'autofocus';
            } else {
                search_tc_ele.removeAttribute('autofocus');
            }
        };

        // call find project technical rest api
        vm.findProjectTechnicalContacts = function () {
            //only searching technical contact after input more than 3 chars
            if (vm.search_tc !== '' && vm.search_tc.length >= 3) {
                ContactService.findContact(vm.search_tc).then(function (response) {
                    if (response.success) {
                        vm.found_tc = response.data;
                    } else {
                        var msg = "Failed to find a technical contact, " + response.message + ".";
                        console.error(msg);
                    }
                });
                vm.tc_searched = true;
            } else {
                vm.found_tc = [];
                vm.tc_searched = false;
            }
        };

        vm.organisation_change = function () {
            for (var i = 0; i < vm.organisations.length; i++) {
                if (vm.organisations[i].name === vm.contact.organisation.name) {
                    vm.contact.organisation = vm.organisations[i];
                }
            }
        };

        vm.updateTechnicalContact = function (technicalContact) {
            $scope.$emit('selected_tech_contact', technicalContact);
            vm.addTechnicalContact();
        };

        vm.showNewTechnicalContactForm = function () {
            vm.show_new_tc = !vm.show_new_tc;
            vm.contact = {};
            vm.tc_form_errors = {};
        };

        vm.newTechnicalContact = function (technicalContact) {
            //clear previous errors if any
            vm.tc_form_errors = {};
            if (validateNewContact()) {
                ContactService.createContact(technicalContact).then(function (response) {
                    if (response.success) {
                        vm.updateTechnicalContact(response.data);
                    } else {
                        for (var errorField in response.data) {
                            // raise a form error for every field error in the response
                            vm.raiseFieldError(errorField, response.data[errorField].toString());
                        }
                    }
                });
            }
        };

        vm.countChar = function (field) {
            if (field) {
                vm.input_char_count[field] = field.length;
            }
        };

        function validateNewContact() {
            /**
             *  validate Techincal Contact
             */
            var valid_contact = true;
            if (vm.contact.given_name === undefined || vm.contact.given_name === '') {
                vm.tc_form_errors.given_name_status  = true;
                vm.tc_form_errors.given_name_message  = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.surname === undefined || vm.contact.surname === '') {
                vm.tc_form_errors.surname_status  = true;
                vm.tc_form_errors.surname_message  = 'This field is required';
                valid_contact = false;
            }
            if (vm.contact.email === undefined || vm.contact.email === '') {
                vm.tc_form_errors.email_status  = true;
                vm.tc_form_errors.email_message  = 'This field is required';
                valid_contact = false;
            } else {
                let re_emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.([a-z.]{2,5})*$/;
                if (!re_emailFormat.test(vm.contact.email)) { 
                    vm.tc_form_errors.email_status = true;
                    vm.tc_form_errors.email_message = 'Invalid email format. e.g: joe.bloggs@monash.edu';
                    valid_contact = false;
                }
            }

            // validate phone no if available - needs to be numeric
            if (vm.contact.phone) {
                // regex validation numeric, spaces and dashes
                let re_phone = /^[\d\s\-+]+$/;
                if (!re_phone.test(vm.contact.phone)) {
                    vm.tc_form_errors.phone_status = true;
                    vm.tc_form_errors.phone_message = 'Please enter numeric values, spaces and hypens are accept';
                    valid_contact = false;
                }
            }

            // validate orcid - needs to be in a specific url pattern
            if (vm.contact.orcid) {
                let re_orcid = /^(?:http(s)?:\/\/)?orcid.org\/\w{4}-\w{4}-\w{4}-\w{4}$/;
                if (!re_orcid.test(vm.contact.orcid)) {
                    vm.tc_form_errors.orcid_status = true;
                    vm.tc_form_errors.orcid_message = 'Invalid ORCID - required format: http://orcid.org/XXXX-XXXX-XXXX-XXXX';
                    valid_contact = false;
                }
            }

            // validate scopus_id, should be numeric
            if (vm.contact.scopusid) {
                if (isNaN(vm.contact.scopusid)) {
                    vm.tc_form_errors.scopusid_status = true;
                    vm.tc_form_errors.scopusid_message = 'This scopus id should contain only numbers';
                    valid_contact = false;
                } else {
                    vm.tc_form_errors.scopusid_status = false;
                    valid_contact = true;
                }
            }

            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            console.log("Error in " + fieldName + ": " + errorMessage);
            switch (fieldName) {
                case "title":
                    vm.tc_form_errors.title_status  = true;
                    vm.tc_form_errors.title_message  = errorMessage;
                    break;
                case "organisation":
                    vm.tc_form_errors.organisation_status = true;
                    vm.tc_form_errors.organisation_message = errorMessage;
                    break;
                case "given_name":
                    vm.tc_form_errors.given_name_status = true;
                    vm.tc_form_errors.given_name_message  = errorMessage;
                    break;
                case "email":
                    vm.tc_form_errors.email_status  = true;
                    vm.tc_form_errors.email_message  = errorMessage;
                    break;
                case "surname":
                    vm.tc_form_errors.surname_status  = true;
                    vm.tc_form_errors.surname_message  = errorMessage;
                    break;
                case "phone":
                    vm.tc_form_errors.phone_status  = true;
                    vm.tc_form_errors.phone_message  = errorMessage;
                    break;
                case "orcid":
                    vm.tc_form_errors.orcid_status  = true;
                    vm.tc_form_errors.orcid_message  = errorMessage;
                    break;
                case "scopusid":
                    vm.tc_form_errors.scopusid_status = true;
                    vm.tc_form_errors.scopusid_message = errorMessage;
                    break;
            }
        };
    }
})();


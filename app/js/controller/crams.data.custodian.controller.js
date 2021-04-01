/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams').controller('CramsDataCustodianController', CramsDataCustodianController);
    CramsDataCustodianController.$inject = ['$scope', 'ContactService', 'OrganisationService'];

    function CramsDataCustodianController($scope, ContactService, OrganisationService) {
        var vm = this;

        // flag popup is opened or not
        vm.dc_popup_opened = false;

        // search data custodian field
        vm.search_dc = '';

        // show new data custodian form flag
        vm.show_new_dc = false;

        // new data custodian form errors
        vm.dc_form_errors = {};

        // display the char count for some input fields
        vm.input_char_count  = {};

        // add or change data custodian popup button action
        vm.addOrChangeDataCustodian = function () {
            vm.dc_popup_opened = !vm.dc_popup_opened;
            // reset the following default value
            vm.selected_custodian = '';
            vm.search_dc = '';
            vm.found_dc = [];
            vm.dc_searched = false;
            vm.show_new_dc = false;
            //set a empty contact
            vm.contact = {};

            var search_dc_ele = document.getElementById('id-search_dc');
            if (vm.dc_popup_opened) {
                search_dc_ele.autofocus = 'autofocus';
            } else {
                search_dc_ele.removeAttribute('autofocus');
            }
        };

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

        // call find project data custodian rest api
        vm.findProjectDataCustodians = function () {
            //only searching data custodian after input more than 3 chars
            if (vm.search_dc !== '' && vm.search_dc.length >= 3) {
                ContactService.findContact(vm.search_dc).then(function (response) {
                    if (response.success) {
                        vm.found_dc = response.data;
                    } else {
                        var msg = "Failed to find a data custodian, " + response.message;
                        console.error(msg);
                    }
                });
                vm.dc_searched = true;
            } else {
                vm.found_dc = [];
                vm.dc_searched = false;
            }
        };

        vm.organisation_change = function () {
            for (var i = 0; i < vm.organisations.length; i++) {
                if (vm.organisations[i].name === vm.contact.organisation.name) {
                    vm.contact.organisation = vm.organisations[i];
                }
            }
        };

        vm.updateDataCustodian = function (custodian) {
            $scope.$emit('selected_data_custodian', custodian);
            vm.addOrChangeDataCustodian();
        };

        vm.showNewDataCustodianForm = function () {
            vm.show_new_dc = !vm.show_new_dc;
            vm.contact = {};
        };

        vm.newDataCustodian = function (custodian) {
            //clear previous errors if any
            vm.dc_form_errors = {};
            if (validateNewContact()) {
                ContactService.createContact(custodian).then(function (response) {
                    if (response.success) {
                        vm.updateDataCustodian(response.data);
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
                vm.dc_form_errors.given_name_status = true;
                vm.dc_form_errors.given_name_message = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.surname === undefined || vm.contact.surname === '') {
                vm.dc_form_errors.surname_status = true;
                vm.dc_form_errors.surname_message = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.email === undefined || vm.contact.email === '') {
                vm.dc_form_errors.email_status = true;
                vm.dc_form_errors.email_message = 'This field is required';
                valid_contact = false;
            } else {
                let re_emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.([a-z.]{2,5})*$/;
                if (!re_emailFormat.test(vm.contact.email)) { 
                    vm.dc_form_errors.email_status = true;
                    vm.dc_form_errors.email_message = 'Invalid email format. e.g: joe.bloggs@monash.edu';
                    valid_contact = false;
                }
            }

            // validate phone no if available - needs to be numeric
            if (vm.contact.phone) {
                // regex validation numeric, spaces and dashes
                let re_phone = /^[\d\s\-+]+$/;
                if (!re_phone.test(vm.contact.phone)) {
                    vm.dc_form_errors.phone_status = true;
                    vm.dc_form_errors.phone_message = 'Please enter numeric values, spaces and hypens are accept';
                    valid_contact = false;
                }
            }

            // validate orcid - needs to be in a specific url pattern
            if (vm.contact.orcid) {
                let re_orcid = /^(?:http(s)?:\/\/)?orcid.org\/\w{4}-\w{4}-\w{4}-\w{4}$/;
                if (!re_orcid.test(vm.contact.orcid)) {
                    vm.dc_form_errors.orcid_status = true;
                    vm.dc_form_errors.orcid_message = 'Invalid ORCID - required format: http://orcid.org/XXXX-XXXX-XXXX-XXXX';
                    valid_contact = false;
                }
            }

            // validate scopus_id, should be numeric
            if (vm.contact.scopusid) {
                if (isNaN(vm.contact.scopusid)) {
                    vm.dc_form_errors.scopusid_status = true;
                    vm.dc_form_errors.scopusid_message = 'This scopus id should contain only numbers';
                    valid_contact = false;
                } else {
                    vm.dc_form_errors.scopusid_status = false;
                    valid_contact = true;
                }
            }
            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            console.log("Error in " + fieldName + ": " + errorMessage);
            switch (fieldName) {
                case "title":
                    vm.dc_form_errors.title_status = true;
                    vm.dc_form_errors.title_message = errorMessage;
                    break;
                case "organisation":
                    vm.dc_form_errors.organisation_status = true;
                    vm.dc_form_errors.organisation_message = errorMessage;
                    break;
                case "given_name":
                    vm.dc_form_errors.given_name_status = true;
                    vm.dc_form_errors.given_name_message = errorMessage;
                    break;
                case "email":
                    vm.dc_form_errors.email_status = true;
                    vm.dc_form_errors.email_message = errorMessage;
                    break;
                case "surname":
                    vm.dc_form_errors.surname_status = true;
                    vm.dc_form_errors.surname_message = errorMessage;
                    break;
                case "phone":
                    vm.dc_form_errors.phone_status = true;
                    vm.dc_form_errors.phone_message = errorMessage;
                    break;
                case "orcid":
                    vm.dc_form_errors.orcid_status = true;
                    vm.dc_form_errors.orcid_message = errorMessage;
                    break;
                case "scopusid":
                    vm.dc_form_errors.scopusid_status = true;
                    vm.dc_form_errors.scopusid_message = errorMessage;
                    break;
            }
        };
    }
})();


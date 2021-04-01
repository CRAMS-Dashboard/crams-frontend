/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams').controller('DataOwnerController', DataOwnerController);
    DataOwnerController.$inject = ['$scope', 'ContactService', 'OrganisationService'];

    function DataOwnerController($scope, ContactService, OrganisationService) {
        var vm = this;
        // flag popup is opened or not
        vm.do_popup_opened = false;

        // search data owner field
        vm.search_do = '';

        // show new data owner form flag
        vm.show_new_do = false;

        // new data custodian form errors
        vm.do_form_errors = {};

        // add or change data owner popup button action
        vm.addOrChangeDataOwner = function () {
            vm.do_popup_opened = !vm.do_popup_opened;
            // reset the following default value
            vm.selected_data_owner = '';
            vm.search_do = '';
            vm.found_do = [];
            vm.do_searched = false;
            vm.show_new_do = false;
            //set a empty contact
            vm.contact = {};

            var search_do_ele = document.getElementById('id-search_do');
            if (vm.do_popup_opened) {
                search_do_ele.autofocus = 'autofocus';
            } else {
                search_do_ele.removeAttribute('autofocus');
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

        // call find project data owner rest api
        vm.findChildObjectDataOwner = function () {
            if(vm.show_new_do){
                vm.show_new_do = false;
            }
            //only searching data owner after input more than 3 chars
            if (vm.search_do !== '' && vm.search_do.length >= 3) {
                ContactService.findContact(vm.search_do).then(function (response) {
                    if (response.success) {
                        vm.found_do = response.data;
                    } else {
                        var msg = "Failed to find a data owner, " + response.message;
                    }
                });
                vm.do_searched = true;
            } else {
                vm.found_do = [];
                vm.do_searched = false;
            }
        };

        vm.changeOrganisation = function () {
            for (var i = 0; i < vm.organisations.length; i++) {
                if (vm.organisations[i].name === vm.contact.organisation.name) {
                    vm.contact.organisation = vm.organisations[i];
                }
            }
        };

        vm.updateDataOwner = function (dataowner) {
            $scope.$emit('selected_data_owner', dataowner);
            vm.addOrChangeDataOwner();
        };

        vm.showNewDataOwner = function () {
            vm.show_new_do = !vm.show_new_do;
            vm.contact = {};
            vm.do_form_errors.given_name_status = false;
            vm.do_form_errors.surname_status = false;
            vm.do_form_errors.email_status = false;
        };

        vm.newDataOwner = function (custodian) {
            //clear previous errors if any
            vm.do_form_errors = {};
            if (validateNewContact()) {
                ContactService.createContact(custodian).then(function (response) {
                    if (response.success) {
                        vm.updateDataOwner(response.data);
                    } else {
                        for (var errorField in response.data) {
                            // raise a form error for every field error in the response
                            vm.raiseFieldError(errorField, response.data[errorField].toString());
                        }
                    }
                });
            }
        };

        function validateNewContact() {
            /**
             *  validate Techincal Contact
             */
            var valid_contact = true;
            if (vm.contact.given_name === undefined || vm.contact.given_name === '') {
                vm.do_form_errors.given_name_status = true;
                vm.do_form_errors.given_name_message = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.surname === undefined || vm.contact.surname === '') {
                vm.do_form_errors.surname_status = true;
                vm.do_form_errors.surname_message = 'This field is required';
                valid_contact = false;
            }
            if (vm.contact.email === undefined || vm.contact.email === '') {
                vm.do_form_errors.email_status = true;
                vm.do_form_errors.email_message = 'This field is required';
                valid_contact = false;
            }

            // validate scopus_id, should be numeric
            if (vm.contact.scopusid) {
                if (isNaN(vm.contact.scopusid)) {
                    vm.do_form_errors.scopusid_status = true;
                    vm.do_form_errors.scopusid_message = 'This scopus id should contain only numbers';
                    valid_contact = false;
                } else {
                    vm.do_form_errors.scopusid_status = false;
                    valid_contact = true;
                }
            }
            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            switch (fieldName) {
                case "title":
                    vm.do_form_errors.title_status = true;
                    vm.do_form_errors.title_message = errorMessage;
                    break;
                case "organisation":
                    vm.do_form_errors.organisation_status = true;
                    vm.do_form_errors.organisation_message = errorMessage;
                    break;
                case "given_name":
                    vm.do_form_errors.given_name_status = true;
                    vm.do_form_errors.given_name_message = errorMessage;
                    break;
                case "email":
                    vm.do_form_errors.email_status = true;
                    vm.do_form_errors.email_message = errorMessage;
                    break;
                case "surname":
                    vm.do_form_errors.surname_status = true;
                    vm.do_form_errors.surname_message = errorMessage;
                    break;
                case "phone":
                    vm.do_form_errors.phone_status = true;
                    vm.do_form_errors.phone_message = errorMessage;
                    break;
                case "orcid":
                    vm.do_form_errors.orcid_status = true;
                    vm.do_form_errors.orcid_message = errorMessage;
                    break;
                case "scopusid":
                    vm.do_form_errors.scopusid_status = true;
                    vm.do_form_errors.scopusid_message = errorMessage;
                    break;
            }
        };
    }
})();


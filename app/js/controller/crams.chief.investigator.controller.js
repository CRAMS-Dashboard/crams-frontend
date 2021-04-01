/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams').controller('CramsChiefInvestigatorController', CramsChiefInvestigatorController);
    CramsChiefInvestigatorController.$inject = ['$scope', '$rootScope', 'ContactService', 'OrganisationService'];

    function CramsChiefInvestigatorController($scope, $rootScope, ContactService, OrganisationService) {
        var vm = this;

        var current_user_email = $rootScope.globals.currentUser.username;

        vm.user_titles = ContactService.userTitles();
        vm.organisations = OrganisationService.getOrganisationList();

        // flag popup is opened or not
        vm.ci_popup_opened = false;

        // search chief investigator field
        vm.search_ci = '';

        // show new chief investigator form flag
        vm.show_new_ci = false;

        // new chief investigator form errors
        vm.ci_form_errors = {};

        // add chief investigator popup button action
        vm.addChiefInvestigator = function () {
            vm.ci_popup_opened = !vm.ci_popup_opened;
            // reset the following default value
            vm.selected_ci = '';
            vm.search_ci = '';
            vm.found_ci = [];
            vm.ci_searched = false;
            vm.show_new_ci = false;
            vm.contact = {};
        };

        // call find chief investigators rest api
        vm.findChiefInvestigators = function () {
            //only searching chief investigator after input more than 3 chars
            if (vm.search_ci != '' && vm.search_ci.length >= 3) {
                ContactService.findContact(vm.search_ci).then(function (response) {
                    if (response.success) {
                        vm.found_ci = response.data;
                    } else {
                        var msg = "Failed to find a technical contact, " + response.message;
                        console.error(msg);
                    }
                });
                vm.ci_searched = true;
            } else {
                vm.found_ci = [];
                vm.ci_searched = false;
            }
        };

        vm.updateChiefInvestigator = function (chiefInvestigator) {
            $scope.$emit('selected_chief_investigator', chiefInvestigator);
            vm.addChiefInvestigator();
        };

        vm.showNewChiefInvestigatorForm = function () {
            vm.show_new_ci = !vm.show_new_ci;
            vm.contact = {};
            vm.ci_form_errors = {};
        };

        vm.newChiefInvestigator = function (chiefInvestigator) {
            //clear previous errors if any
            vm.ci_form_errors = {};
            if (validateNewContact()) {
                ContactService.createContact(chiefInvestigator).then(function (response) {
                    if (response.success) {
                        vm.updateChiefInvestigator(response.data);
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
                vm.ci_form_errors['given_name_status'] = true;
                vm.ci_form_errors['given_name_message'] = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.surname === undefined || vm.contact.surname === '') {
                vm.ci_form_errors['surname_status'] = true;
                vm.ci_form_errors['surname_message'] = 'This field is required';
                valid_contact = false;
            }
            if (vm.contact.email === undefined || vm.contact.email === '') {
                vm.ci_form_errors['email_status'] = true;
                vm.ci_form_errors['email_message'] = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.phone === undefined || vm.contact.phone === '') {
                vm.ci_form_errors['phone_status'] = true;
                vm.ci_form_errors['phone_message'] = 'This field is required';
                valid_contact = false;
            }

            if (vm.contact.organisation === undefined || vm.contact.organisation === '') {
                vm.ci_form_errors['organisation_status'] = true;
                vm.ci_form_errors['organisation_message'] = 'This field is required';
                valid_contact = false;
            }

            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            console.log("Error in " + fieldName + ": " + errorMessage);
            switch (fieldName) {
                case "title":
                    vm.ci_form_errors['title_status'] = true;
                    vm.ci_form_errors['title_message'] = errorMessage;
                    break;
                case "organisation":
                    vm.ci_form_errors['organisation_status'] = true;
                    vm.ci_form_errors['organisation_message'] = errorMessage;
                    break;
                case "given_name":
                    vm.ci_form_errors['given_name_status'] = true;
                    vm.ci_form_errors['given_name_message'] = errorMessage;
                    break;
                case "email":
                    vm.ci_form_errors['email_status'] = true;
                    vm.ci_form_errors['email_message'] = errorMessage;
                    break;
                case "surname":
                    vm.ci_form_errors['surname_status'] = true;
                    vm.ci_form_errors['surname_message'] = errorMessage;
                    break;
                case "phone":
                    vm.ci_form_errors['phone_status'] = true;
                    vm.ci_form_errors['phone_message'] = errorMessage;
                    break;
                case "orcid":
                    vm.ci_form_errors['orcid_status'] = true;
                    vm.ci_form_errors['orcid_message'] = errorMessage;
                    break;
            }
        };
    }
})();


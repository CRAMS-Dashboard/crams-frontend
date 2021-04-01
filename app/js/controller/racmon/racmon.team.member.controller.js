/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonTeamMemberController', RacMonTeamMemberController);
    RacMonTeamMemberController.$inject = ['$scope', '$rootScope', '$location', 'ContactService', 'OrganisationService', 'FlashService'];

    function RacMonTeamMemberController($scope, $rootScope, $location, ContactService, OrganisationService, FlashService) {
        var vm = this;
        vm.contact = {};

        // flag popup is opened or not
        vm.tm_popup_opened = false;
        vm.user_titles = ContactService.userTitles();

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

        // new project team member form errors
        vm.tm_form_errors = {};
        vm.contact.email = $rootScope.globals.currentUser.username;

        //make modal window active
        vm.m_active = 'active';

        // close
        vm.mClose = function () {
            vm.m_active = 'inactive';
            vm.tm_form_errors = {};
        };

        // findContactById function works with both id or email
        ContactService.findContactById(vm.contact.email).then(function (response) {
            if (response.success) {
                var found_contacts = response.data;
                if (found_contacts.length === 1) {
                    vm.contact = found_contacts[0];
                }
            } else {
                var msg = "Failed to find a contact, " + response.message;
                console.error(msg);
            }
        });

        vm.addOrUpdateUser = function () {
            //clear previous errors if any
            vm.tm_form_errors = {};
            if (validateNewContact()) {
                if (vm.contact.id == undefined || vm.contact.id == '') {
                    ContactService.createContact(vm.contact).then(function (response) {
                        if (response.success) {
                            $rootScope.globals.currentUser.isCompleted = true;
                            //set the globals in cookie to make sure the authen info exist after page refresh
                            // localStorageService.set('globals', $rootScope.globals);
                            window.localStorage.setItem('crams-fe', JSON.stringify($rootScope.globals));
                            FlashService.Success("User saved", true);
                            var posix_provided = $rootScope.globals.posixid_provided;
                            if (posix_provided) {
                                $location.path('/allocations');
                            } else {
                                $location.path('/user_account');
                            }
                        } else {
                            for (var errorField in response.data) {
                                // raise a form error for every field error in the response
                                vm.raiseFieldError(errorField, response.data[errorField].toString());
                            }
                            var msg = "Failed to add the contact " + response.data.non_field_errors[0];
                            FlashService.Error(msg);
                            console.error(msg);
                        }
                    });
                } else {
                    ContactService.editContact(vm.contact).then(function (response) {
                        if (response.success) {
                            $rootScope.globals.currentUser.isCompleted = true;
                            //set the globals in cookie to make sure the authen info exist after page refresh
                            window.localStorage.setItem('crams-fe', JSON.stringify($rootScope.globals));
                            FlashService.Success("User updated", true);
                            var posix_provided = $rootScope.globals.posixid_provided;
                            if (posix_provided) {
                                $location.path('/allocations');
                            } else {
                                $location.path('/user_account');
                            }
                        } else {
                            for (var errorField in response.data) {
                                // raise a form error for every field error in the response
                                vm.raiseFieldError(errorField, response.data[errorField].toString());
                            }
                            var msg = "Failed to update the contact, " + response.data.non_field_errors[0];
                            FlashService.Error(msg);
                            console.error(msg);
                        }
                    });
                }
            }
        };

        function setUserCompleted() {
            $rootScope.globals.currentUser.isCompleted = true;
        }

        function validateNewContact() {
            /**
             *  validate team member Contact
             */
            var valid_contact = true;
            if (!vm.contact.given_name) {
                vm.tm_form_errors['given_name_status'] = true;
                vm.tm_form_errors['given_name_message'] = 'This field is required';
                valid_contact = false;
            }

            if (!vm.contact.surname) {
                vm.tm_form_errors['surname_status'] = true;
                vm.tm_form_errors['surname_message'] = 'This field is required';
                valid_contact = false;
            }
            if (!vm.contact.email === undefined || vm.contact.email === '') {
                vm.tm_form_errors['email_status'] = true;
                vm.tm_form_errors['email_message'] = 'This field is required';
                valid_contact = false;
            }

            if (!vm.contact.phone) {
                vm.tm_form_errors['phone_status'] = true;
                vm.tm_form_errors['phone_message'] = 'This field is required';
                valid_contact = false;
            } else {
                // regex validation numeric, spaces and dashes
                let re_phone = /^[\d\s\-+]{0,50}$/;
                if (!re_phone.test(vm.contact.phone)) {
                    vm.tm_form_errors['phone_status'] = true;
                    vm.tm_form_errors['phone_message'] = 'Please enter numeric values(max 50 digits), spaces and hypens are accept';
                    valid_contact = false;
                }
            }

            var org_drop_down = document.getElementById('organisation');
            if (org_drop_down.value === undefined || org_drop_down.value === '') {
                vm.tm_form_errors['organisation_status'] = true;
                vm.tm_form_errors['organisation_message'] = 'This field is required';
                valid_contact = false;
            } else {
                for (var i = 0; i < vm.organisations.length; i++) {
                    if (vm.organisations[i].name === vm.contact.organisation.name) {
                        vm.contact.organisation = vm.organisations[i];
                    }
                }
            }

            if (vm.contact.orcid) {
                let re_orcid = /^(?:http(s)?:\/\/)?orcid.org\/\w{4}-\w{4}-\w{4}-\w{4}$/;
                if (!re_orcid.test(vm.contact.orcid)) {
                    vm.tm_form_errors['orcid_status'] = true;
                    vm.tm_form_errors['orcid_message'] = 'Invalid orcid - required format: http://orcid.org/XXXX-XXXX-XXXX-XXXX';
                    valid_contact = false;
                }
            }

            if (isNaN(vm.contact.scopusid)) {
                vm.tm_form_errors['scopusid_status'] = true;
                vm.tm_form_errors['scopusid_message'] = 'The scopus id should contain only numbers';
                valid_contact = false;
            }

            return valid_contact;
        }

        vm.raiseFieldError = function (fieldName, errorMessage) {
            switch (fieldName) {
                case "title":
                    vm.tm_form_errors['title_status'] = true;
                    vm.tm_form_errors['title_message'] = errorMessage;
                    break;
                case "organisation":
                    vm.tm_form_errors['organisation_status'] = true;
                    vm.tm_form_errors['organisation_message'] = errorMessage;
                    break;
                case "given_name":
                    vm.tm_form_errors['given_name_status'] = true;
                    vm.tm_form_errors['given_name_message'] = errorMessage;
                    break;
                case "email":
                    vm.tm_form_errors['email_status'] = true;
                    vm.tm_form_errors['email_message'] = errorMessage;
                    break;
                case "surname":
                    vm.tm_form_errors['surname_status'] = true;
                    vm.tm_form_errors['surname_message'] = errorMessage;
                    break;
                case "phone":
                    vm.tm_form_errors['phone_status'] = true;
                    vm.tm_form_errors['phone_message'] = errorMessage;
                    break;
                case "orcid":
                    vm.tm_form_errors['orcid_status'] = true;
                    vm.tm_form_errors['orcid_message'] = errorMessage;
                    break;
                case "scopusid":
                    vm.tm_form_errors['scopusid_status'] = true;
                    vm.tm_form_errors['scopusid_message'] = errorMessage;
                    break;
            }
        };
    }
})();


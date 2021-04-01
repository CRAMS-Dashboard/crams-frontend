(function () {
    'use strict';
    angular.module('crams').controller('AddMemberController', AddMemberController);

    AddMemberController.$inject = ['$scope', '$rootScope', '$location', '$uibModal', 'CramsApiService'];

    function AddMemberController($scope, $rootScope, $location, $uibModal, CramsApiService) {
        var vm = this;

        vm.showAddUser = showAddUser;
        vm.add_member_data = {};

        function showAddUser(project_id) {

            clearFlashMessage();

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addMemberOrCIContent',
                controller: 'AddMemberModalCtrl',
                controllerAs: 'vm',
                // size: 'lg',
                backdrop: 'static'
            });

            modalInstance.project_id = project_id;

            //call back when close the modal
            modalInstance.result.then(function (add_member_success) {
                if (add_member_success) {
                    $scope.$emit('add_member_success', add_member_success);
                }
            }, function () {
                //alert();
            });
        }

        function clearFlashMessage() {
            var flash = $rootScope.flash;
            if (flash) {
                delete $rootScope.flash;
            }
        }
    }

    angular.module('crams').controller('AddMemberModalCtrl', function ($window, $location, $scope, $rootScope, $uibModalInstance, FlashService, CramsApiService, ContactService) {
        var vm = this;
        vm.add_member_data = {};
        vm.add_member_success = false;
        var project_id = $uibModalInstance.project_id;

        vm.hasError = false;

        vm.search_contact = '';
        vm.found_contacts = [];

        // vm.contact_roles = contactRoles();
        vm.add_member_data.contact_id = null;
        vm.add_member_data.contact_role = null;
        vm.add_member_data.sent_email = true;

        vm.selected_contact = {};

        // get the contact roles
        ContactService.contactRoles().then(function (response) {
            if (response.success) {
                vm.contact_roles = response.data;
            } else {
                var msg = "Failed to get contact roles, " + response.message;
                console.error(msg);
            }
        });

        // call find contact rest api
        vm.findContacts = function () {
            vm.hasError = false;
            vm.error_msg = null;
            vm.add_member_data.contact_id = null;
            vm.contact_id_invalid = false;

            //only searching a contact after input more than 3 chars
            if (vm.search_contact !== '' && vm.search_contact.length >= 3) {
                ContactService.findContact(vm.search_contact).then(function (response) {
                    if (response.success) {
                        vm.found_contacts = response.data;
                    } else {
                        var msg = "Failed to find a contact, " + response.message;
                        console.error(msg);
                    }
                });
                vm.contact_searched = true;
            } else {
                vm.found_contacts = [];
                vm.contact_searched = false;
            }
        };

        vm.addMember = function () {
            if (validate()) {
                if (!project_id) {
                    vm.hasError = true;
                    vm.error_msg = "Failed to add an user, project id is null.";
                } else {
                    vm.add_member_data.project_id = project_id;

                    //TODO: add member (user) api call
                    CramsApiService.projectAddUser(vm.add_member_data).then(function (response) {
                        if (response.success) {
                            vm.add_member_success = true;
                            if (vm.selected_contact.given_name !== null && vm.selected_contact.surname !== null) {
                                FlashService.Success(vm.selected_contact.given_name + ' ' + vm.selected_contact.surname + ' has been added', true);
                            } else {
                                FlashService.Success('User ' + vm.selected_contact.email + ' has been added', true);
                            }

                            vm.closeModalWindow();
                        } else {
                            vm.hasError = true;
                            vm.add_member_success = false;
                            // var message = "Failed to add an user, " + response.message + '.';
                            vm.error_msg = displayError("", response.data);
                        }
                    });
                }
            } else {
                vm.hasError = true;
                vm.add_member_success = false;
                vm.error_msg = "Please check that all required fields have been filled in correctly.";
            }
        };

        vm.updateSelectedMemberStatus = function (contact) {
            if (vm.add_member_data.contact_id !== undefined && vm.add_member_data.contact_id !== null) {
                vm.contact_id_invalid = false;
            }
            // store the selected contact
            vm.selected_contact = contact;
        };

        function contactRoles() {
            return [
                {'contact_role': 'Data Custodian'},
                {'contact_role': 'Technical Contact'}
            ];
        }

        function displayError(message, errors) {
            var found_errors = '';
            if (errors !== undefined) {
                if (errors.hasOwnProperty('non_field_errors')) {
                    found_errors = errors.non_field_errors[0];
                }

                if (errors.hasOwnProperty('detail')) {
                    found_errors = errors.detail;
                }

                if (errors.hasOwnProperty('message')) {
                    found_errors = errors.message;
                }
            }
            return message + ' ' + found_errors;
        }

        function validate() {
            vm.contact_id_invalid = false;

            if (vm.add_member_data.contact_id === undefined || vm.add_member_data.contact_id === null) {
                vm.contact_id_invalid = true;
                vm.add_member_form.$valid = false;
            }
            if (vm.add_member_data.contact_role === undefined || vm.add_member_data.contact_role === null || vm.add_member_data.contact_role === '') {
                vm.add_member_form['contact_role'].$invalid = true;
                vm.add_member_form.$valid = false;
            }
            return vm.add_member_form.$valid;
        }


        vm.closeModalWindow = function () {
            $uibModalInstance.close(vm.add_member_success);
        };
    });

})();

(function () {
    'use strict';
    angular.module('crams').controller('SupportEmailController', SupportEmailController);

    SupportEmailController.$inject = ['$scope', '$rootScope', '$location', '$uibModal'];

    function SupportEmailController($scope, $rootScope, $location, $uibModal) {
        var vm = this;
        vm.open = open;

        function open() {
            $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent',
                controller: 'ModalInstanceCtrl',
                controllerAs: 'vm',
                // size: 'lg',
                backdrop: 'static'
            });
        }
    }

    angular.module('crams').controller('ModalInstanceCtrl', function ($rootScope, $uibModalInstance, SupportEmailService, FlashService, LookupService, $location) {
        var vm = this;
        // get users logged in email address and populate the form
        vm.email = $rootScope.globals.currentUser.username;
        vm.current_url = $location.absUrl();
        // loadSupportEmailContacts();
        get_support_email();


        function loadSupportEmailContacts() {
            LookupService.loadSupportEmailContactsERB($rootScope.erb).then(function (response) {
                if (response.success) {
                    vm.support_email_contacts = response.data;
                } else {
                    var msg = "Failed to load ERB support contact emails, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        vm.prepopulateURL = function () {
            // auto append the current url to the subject
            if (vm.selected_support_contact.email === "rcmon-support@monash.edu") {
                if (vm.body === undefined) {
                    vm.body = vm.current_url + '\n\n';
                } else {
                    // only add the url if it hasn't been added already
                    if (!vm.body.toString().toLowerCase().includes(vm.current_url)) {
                        vm.body = vm.current_url + '\n\n' + vm.body.toString();
                    }
                }
            }
        };

        function preappendAdditionalInfo(message) {
            // get support type
            var support_type = "[" + vm.support_type + "] ";

            // append the support type
            message.subject = support_type + message.subject;

            // get the current url
            var current_url = "[" + $location.$$absUrl + "]";

            // append the url link/page user was viewing when support was sent
            message.body = current_url + '\n\n' + message.body;
        }

        function validateForm() {
            vm.email_invalid = false;
            vm.subject_invalid = false;
            vm.body_invalid = false;
            // vm.support_email_contacts_invalid = false;
            //
            // if (!vm.selected_support_contact) {
            //     vm.support_email_contacts_invalid = true;
            // }

            if (!vm.subject) {
                vm.subject_invalid = true;
            }

            if (!vm.body) {
                vm.body_invalid = true;
            }

            // return false if any errors in form
            if (vm.email_invalid || vm.subject_invalid || vm.body_invalid || vm.support_email_contacts_invalid) {
                return false;
            } else {
                return true;
            }
        }

        function get_support_email() {
            //TODO: re-enabled the support email.
            // LookupService.loadSupportEmailContactsERB($rootScope.erb).then(function (response) {
            //     if (response.success) {
            //         // should only return 1 result, grab the first email from list
            //         if (response.data.length == 1) {
            //             var result = response.data[0];
            //             vm.support_email_id =  result.id;
            //             vm.support_type = result.description;
            //         } else {
            //             var msg = "Unable to get fetch support email";
            //             FlashService.Error(msg);
            //             console.error(msg);
            //         }
            //     } else {
            //         var msg = "Failed to load ERB support contact emails, " + response.message;
            //         FlashService.Error(msg);
            //         console.error(msg);
            //     }
            // });
        }

        vm.submit = function () {
            // validate form
            if (validateForm()) {

                var message = {
                    "subject": vm.subject,
                    "body": vm.body,
                    "support_email_contact_id": vm.support_email_id
                };

                // pre-append the support type and url link to support email
                preappendAdditionalInfo(message);

                SupportEmailService.sendSupportEmail(message).then(function (response) {
                    if (response.success) {
                        // display successful message
                        var msg = "Support request sent, check your email inbox to confirm.";
                        FlashService.Success(msg);
                        vm.displayMessage = false;
                        $uibModalInstance.close();
                    } else {
                        // display error on modal and keep the modal popup open
                        // so users have a chance to copy and paste their question/issue.
                        var msg = "A server error occurred while sending support email.";
                        vm.errorMessage = msg;
                        vm.displayMessage = true;
                    }
                });
            }
        };

        vm.close = function () {
            $uibModalInstance.close();
        };
    });

})();

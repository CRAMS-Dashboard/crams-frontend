/**
 * Created by simonyu on 6/9/17.
 */

(function () {
    'use strict';
    angular.module('crams').controller('RacMonProjectMembershipController', RacMonProjectMembershipController);
    RacMonProjectMembershipController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'ContactService', 'CramsApiService', 'FlashService', '$mdDialog', 'ENV'];

    function RacMonProjectMembershipController($scope, $rootScope, $routeParams, $location, ContactService, CramsApiService, FlashService, $mdDialog, ENV) {
        var vm = this;
        vm.project_id = $routeParams.project_id;

        //load the project members and invitations
        projectMembership(vm.project_id);
        vm.hasError = false;

        function projectMembership(project_id) {
            CramsApiService.projectLeaderMember(project_id).then(function (response) {
                if (response.success) {
                    vm.project_title = response.data.title;
                    vm.project_group_id = response.data.system_id;

                    vm.member_list = response.data.members;

                    // filtered list
                    vm.project_members = [];
                    vm.invited_users = [];
                    vm.requested_users = [];
                    vm.rejected_users = [];

                    // filter each user based on their project status
                    angular.forEach(vm.member_list, function (member, key) {
                        switch (member.status_code) {
                            case 'M':
                                // user is a project member
                                vm.project_members.push(member);
                                break;

                            case 'I':
                                // user has been invited
                                vm.invited_users.push(member);
                                break;

                            case 'R':
                                // user has requested to join
                                vm.requested_users.push(member);
                                break;

                            case 'C':
                                // user has declined join
                                vm.rejected_users.push(member);
                                break;

                            case 'E':
                                // user request has been rejected
                                vm.rejected_users.push(member);
                                break;

                            case 'V':
                                // user membership has been revoked
                                vm.rejected_users.push(member);
                                break;
                        }
                    });
                } else {
                    vm.hasError = true;
                    var msg = "Failed to get the project membership, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                }
            });
        }

        function removeMember(email, action, sent_email) {
            vm.reject_user = {};
            vm.reject_user.project_id = vm.project_id;
            vm.reject_user.email = email;
            vm.reject_user.action = "reject";
            vm.reject_user.sent_email = sent_email;
            // alert('reject_user json: ' + JSON.stringify(vm.reject_user));

            CramsApiService.projectLeaderRequest(vm.reject_user).then(function (response) {
                if (response.success) {
                    // reload project membership list
                    projectMembership(vm.project_id);
                    var message = actionSuccessMessage(email, action);
                    FlashService.Success(message);
                } else {
                    var err_msg = actionErrorMessage(email, action);
                    FlashService.DisplayError(err_msg, response.data);
                }
            });
        }

        function actionSuccessMessage(email, action) {
            var msg = '';
            switch (action) {
                case 'cancel':
                    msg = 'The invitation for user ' + email + ' has been cancelled';
                    break;
                case 'remove':
                    msg = 'The user ' + email + ' has been removed';
                    break;

                case 'reject':
                    msg = 'The invitation for user ' + email + ' has been rejected';
                    break;
            }
            return msg;
        }

        function actionErrorMessage(email, action) {
            var err_msg = '';
            switch (action) {
                case 'cancel':
                    err_msg = 'Failed to cancel the invitation for user ' + email + '.';
                    break;
                case 'remove':
                    err_msg = 'Failed to remove the user ' + email + '.';
                    break;
                case 'reject':
                    err_msg = 'Failed to reject the invitation for user ' + email + '.';
                    break;
            }
            return err_msg;
        }

        vm.removeProjectMember = function (ev, email) {
            //define the to be removed email for displaying in the popup windows
            vm.to_be_removed_email = email;
            $mdDialog.show({
                controller: ConfirmDialogController,
                templateUrl: 'templates/racmon/remove_member.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev
            }).then(function (answer) {
                if (answer === 'Yes') {
                    if (vm.isApplicant(email)) {
                        var err = "Can't remove the applicant.";
                        FlashService.Error(err);
                    } else {
                        if (vm.project_members.length === 1) {
                            var err_message = "Can't remove the last member";
                            FlashService.Error(err_message);
                        } else {
                            removeMember(email, 'remove', vm.sent_email);
                        }
                    }
                }
            }, function () {
                //Noting, cancelled the dialog
            });
        };

        function ConfirmDialogController($scope, $mdDialog) {
            //put the default email notification as true
            $scope.sent_email = true;

            //show the removed email
            $scope.removed_email = vm.to_be_removed_email;

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                //set the email notification flag.
                vm.sent_email = $scope.sent_email;
                $mdDialog.hide(answer);
            };
        }

        vm.isApplicant = function (email) {
            var isApp = false;
            var memeber = _.findWhere(vm.project_members, {'email': email});
            if (memeber !== undefined) {
                var roles = memeber.roles;
                isApp = _.contains(roles, 'Applicant');
            }
            return isApp;
        };

        //after added member (project member or chief investigator) successfully, reload the project membership
        $scope.$on('add_member_success', function (event, add_member_success) {
            if (add_member_success) {
                projectMembership(vm.project_id);
            }
        });
    }
})();
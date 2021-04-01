/**
 * Created by simonyu on 22/10/15.
 */
(function () {
    'use strict';

    angular.module('crams').factory('CRAMSAAService', CRAMSAAService);

    CRAMSAAService.$inject = ['$http', '$rootScope', 'CramsUtils', 'ENV'];

    function CRAMSAAService($http, $rootScope, CramsUtils, ENV) {

        var crams_authen_api_url = ENV.apiEndpoint + "api-token-auth/";

        //var crams_check_perm_url = ENV.apiEndpoint + "user_funding_body/";

        var crams_check_perm_url = ENV.apiEndpoint + "user_roles/";

        var service = {};
        service.authen = authen;
        service.setCredentials = setCredentials;
        service.cleanCredentials = cleanCredentials;
        service.checkPermissions = checkPerms;
        service.setUserPerms = setUserPerms;
        return service;

        function authen(user) {
            return $http({
                    url: crams_authen_api_url,
                    method: 'POST',
                    data: user
                }
            ).then(handleSuccess, handleError);
        }

        function checkPerms() {
            return $http.get(crams_check_perm_url).then(handleSuccess, handleError);
        }

        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText),
                data: response.data
            };
        }

        function setCredentials(username, token_data) {
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    token: token_data
                },
                isLoggedIn: true
            };
            //put user token in the Authorization headers
            $http.defaults.headers.common.Authorization = 'Token ' + token_data;
            //set the globals in local storage to make sure the authen info exist after page refresh
            // localStorageService.set('globals', $rootScope.globals);
            // Replaced localStorageService by window localStorage
            window.localStorage.setItem('crams-fe', JSON.stringify($rootScope.globals));
        }

        function setUserPerms(perm_data) {
            //get user permissions
            $rootScope.globals.perms = {};
            // get erb roles first.
            var erb_roles = perm_data.erb_roles;
            if (erb_roles === undefined) {
                //get user permissions
                // if erb roles not exist, then get the user roles in global (old format)
                $rootScope.globals.perms = perm_data.user_roles.global;
            } else {
                $rootScope.globals.perms.service_management = erb_roles.service_management;
                $rootScope.globals.perms.faculty_management = erb_roles.faculty_management;
                var racmon_roles = erb_roles[ENV.erb.toLowerCase()];
                if (racmon_roles === undefined) {
                    $rootScope.globals.perms.admin = false;
                    $rootScope.globals.perms.provisioner = false;
                    $rootScope.globals.perms.approver = false;
                    $rootScope.globals.perms.tenant_manager = false;
                } else {
                    $rootScope.globals.perms.admin = racmon_roles.admin;
                    $rootScope.globals.perms.provisioner = racmon_roles.provisioner;
                    $rootScope.globals.perms.approver = racmon_roles.approver;
                    $rootScope.globals.perms.tenant_manager = racmon_roles.tenant_manager;
                }
            }
            // if not perms. just set it as empty dictionary
            if ($rootScope.globals.perms === undefined) {
                $rootScope.globals.perms = {};
            }
            //set user view list
            setViewList($rootScope.globals.perms);

            var contact = perm_data.contact;
            //check if user info is completed or not
            $rootScope.globals.currentUser.isCompleted = CramsUtils.isUserInfoCompleted(contact);
            $rootScope.globals.currentUser.username = contact.email;
            $rootScope.globals.currentUser.given_name = contact.given_name;
            $rootScope.globals.currentUser.surname = contact.surname;
            //set the globals in local storage to make sure the authen info exist after page refresh
            // localStorageService.set('globals', $rootScope.globals);
            // Replaced localStorageService by window localStorage
            window.localStorage.setItem('crams-fe', JSON.stringify($rootScope.globals));
        }

        function cleanCredentials() {
            //empty the globals in rootScope
            $rootScope.globals = {};
            //remove the globals from local storage
            // localStorageService.remove('globals');
            window.localStorage.removeItem('crams-fe');
            window.localStorage.removeItem('next_request_page');
            // clean the Authorization header
            $http.defaults.headers.common.Authorization = '';
        }

        function setViewList(perms) {
            $rootScope.globals.my_view_list = [{'role': 'normal_user', 'view': 'Collection View'}];
            if (perms !== undefined) {
                $rootScope.globals.my_view_list = [{'role': 'normal_user', 'view': 'Collection View'}];
                if (perms.admin) {
                    var admin_view = {
                        'role': 'admin',
                        'view': 'Service Administrator'
                    };
                    $rootScope.globals.my_view_list.push(admin_view);
                }
                if (perms.service_management) {
                    var merc_mgt_view = {
                        'role': 'service_management',
                        'view': 'MeRC Management'
                    };
                    $rootScope.globals.my_view_list.push(merc_mgt_view);
                }
                if (perms.faculty_management) {
                    var fac_mgt_view = {
                        'role': 'faculty_management',
                        'view': 'Faculty Management'
                    };
                    $rootScope.globals.my_view_list.push(fac_mgt_view);
                }
                if (perms.approver) {
                    var approver_view = {
                        'role': 'approver',
                        'view': 'Resource Approver'
                    };
                    $rootScope.globals.my_view_list.push(approver_view);
                }
                if (perms.provisioner) {
                    var provisioner_view = {
                        'role': 'provisioner',
                        'view': 'Resource Provisioner'
                    };
                    $rootScope.globals.my_view_list.push(provisioner_view);
                }
                //set the default view
                $rootScope.globals.selected_view = 'normal_user';
            }
        }
    }
})();
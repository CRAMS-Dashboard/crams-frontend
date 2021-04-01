/**
 * Created by simonyu on 9/02/16.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CRAMSLoginController', CRAMSLoginController);

    CRAMSLoginController.$inject = ['$window', '$scope', '$location', 'CRAMSAAService', 'FlashService', 'ENV'];

    function CRAMSLoginController($window, $scope, $location, CRAMSAAService, FlashService, ENV) {
        var vm = this;
        vm.user = {};

        vm.login = function () {
            //clean any previous login status first if any
            CRAMSAAService.cleanCredentials();

            vm.dataLoading = true;
            CRAMSAAService.authen(vm.user).then(function (response) {
                if (response.success) {
                    var auth_data = response.data;
                    var token = auth_data.token;
                    CRAMSAAService.setCredentials(vm.user.username, token);
                    //check user permissions
                    checkUserPermissions();
                } else {
                    var msg = "Login Failed, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    vm.dataLoading = false;
                }
            });
        };

        function checkUserPermissions() {
            //check user permissions
            CRAMSAAService.checkPermissions().then(function (response) {
                if (response.success) {
                    CRAMSAAService.setUserPerms(response.data);

                    var request_page = window.localStorage.getItem('next_request_page');
                    if (request_page !== undefined && request_page !== '' && request_page !== null) {
                        $window.location.href = request_page;
                    } else {
                        $location.path('/allocations');
                    }
                } else {
                    var msg = "Failed to get user permissions, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }

        vm.logout = function () {
            //just clear the credentials
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        };
    }

})();

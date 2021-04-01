/**
 * Created by Melvin Luong on 21/12/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('KsLoginController', KsLoginController);

    KsLoginController.$inject = ['$window', '$scope', '$routeParams', '$location', '$templateCache', 'CRAMSAAService', 'FlashService'];

    function KsLoginController($window, $scope, $routeParams, $location, $templateCache, CRAMSAAService, FlashService) {
        var username = $routeParams.username;
        var token = $routeParams.rest_token;
        //console.log($routeParams.username);
        //console.log($routeParams.rest_token);
        CRAMSAAService.setCredentials(username, token);
        // check user permissions
        checkUserPermissions();

        function checkUserPermissions() {
            //check user permissions
            CRAMSAAService.checkPermissions().then(function (response) {
                if (response.success) {
                    CRAMSAAService.setUserPerms(response.data);
                    // $location.path('/allocations');
                    var abs_url = $location.absUrl();
                    var base_url = abs_url.substring(0, abs_url.indexOf('#') - 1);
                    // load the requested page after login
                    var request_page = window.localStorage.getItem('next_request_page');
                    if (request_page !== undefined && request_page !== '' && request_page !== null) {
                        $window.location.href = request_page;
                    } else {
                        $window.location.href = base_url + '#/';
                    }
                } else {
                    var msg = "Failed to get user permissions, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            });
        }
    }
})();
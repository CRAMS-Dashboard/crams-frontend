/**
 * AAF Rapid Connect login controller
 */
(function () {
    'use strict';
    angular.module('crams').controller('RapidConnAuthController', RapidConnAuthController);

    RapidConnAuthController.$inject = ['$rootScope', '$location', 'CRAMSAAService', 'ENV'];
    function RapidConnAuthController($rootScope, $location, CRAMSAAService, ENV) {
        var vm = this;
        vm.logout = logout;

        CRAMSAAService.cleanCredentials();
        // authenticate using AAF rapid connect service
        var rapid_conn_redirect = 'redirect_to_rapid_conn';
        vm.auth_redirect = ENV.apiEndpoint + rapid_conn_redirect;

        // listen for the token expired event in the relevant $scope
        vm.token_expired = false;
        var expired = $rootScope.token_expired;
        if (expired) {
            vm.token_expired = true;
            vm.token_expired_msg = 'Token expired, please login again';
            // $rootScope.token_expired = false;
        }

        function logout() {
            //just clear the credentials 
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        }
    }

})();

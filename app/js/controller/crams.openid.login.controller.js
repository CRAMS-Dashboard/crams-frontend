/**
 * OpenID login controller
 */
(function () {
    'use strict';
    angular.module('crams').controller('OpenIDAuthController', OpenIDAuthController);

    OpenIDAuthController.$inject = ['$rootScope', '$location', 'CRAMSAAService', 'ENV'];
    function OpenIDAuthController($rootScope, $location, CRAMSAAService, ENV) {
        var vm = this;
        vm.logout = logout;

        CRAMSAAService.cleanCredentials();
        vm.auth_redirect = ENV.authEndpoint;

        // listen for the token expired event in the relevant $scope
        // vm.token_expired = false;
        // var expired = $rootScope.token_expired;
        // if (expired) {
        //     vm.token_expired = true;
        //     vm.token_expired_msg = 'Token expired, please login again';
        //     // $rootScope.token_expired = false;
        // }

        function logout() {
            //just clear the credentials
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        }
    }

})();

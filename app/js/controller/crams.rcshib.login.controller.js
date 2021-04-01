/**
 * AAF login via shibboleth login controller
 *
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('RcshibAuthController', RcshibAuthController);

    RcshibAuthController.$inject = ['$scope', '$rootScope', '$location', 'CRAMSAAService', 'FlashService', 'ENV'];
    function RcshibAuthController($scope, $rootScope, $location, CRAMSAAService, FlashService, ENV) {
        var vm = this;
        vm.logout = logout;
        var rc_shib_redirect = 'redirect-to-rc-shib?ks_login_url=';
        var abs_url = $location.absUrl();
        var base_url = abs_url.substring(0, abs_url.indexOf('#') - 1);
        // encode the '#' into %23 to avoid losing #/ks-login
        var ks_login_url = base_url + '/%23/ks-login';
        vm.auth_redirect = ENV.apiEndpoint + rc_shib_redirect + ks_login_url;
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

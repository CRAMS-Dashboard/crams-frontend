/**
 * AAF Rapid Connect login controller
 */
(function () {
    'use strict';
    angular.module('crams').controller('AAFAuthController', AAFAuthController);

    AAFAuthController.$inject = ['$rootScope', '$location', 'CRAMSAAService', 'ENV'];

    function AAFAuthController($rootScope, $location, CRAMSAAService, ENV) {
        var vm = this;
        //clean any previous login status first if any
        CRAMSAAService.cleanCredentials();

        // using AAF login via crams auth
        vm.auth_redirect = ENV.authServer + '/login/aaf?client=' + ENV.frontend;
        
        vm.logout = function logout() {
            //just clear the credentials 
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        };
    }

})();

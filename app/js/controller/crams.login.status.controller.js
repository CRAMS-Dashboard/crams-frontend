(function () {
    'use strict';
    angular.module('crams').controller('LoginStatusController', LoginStatusController);

    LoginStatusController.$inject = ['$rootScope', '$scope', '$location', '$route', 'CramsApiService'];

    function LoginStatusController($rootScope, $scope, $location, $route, CramsApiService) {
        var login_status = $rootScope.login_status;
        // if no login status, try to get login status from the backend,
        // and save it into rootScope.
        // if refresh the page, it will call backend api again to get login status
        if (login_status === undefined) {
            //TODO: enable it later once login status available

            // CramsApiService.getLoginStatus().then(function (response) {
            //     if (response.success) {
            //         var login_log = response.data;
            //         $rootScope.login_status = login_log;
            //     } else {
            //         var msg = "Failed to get login status, " + response.message + ".";
            //         console.error(msg);
            //     }
            // });
        }
    }
})();

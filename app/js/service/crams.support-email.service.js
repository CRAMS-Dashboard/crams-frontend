/**
 * Created by Melvin Luong on 14/3/17.
 */
(function () {
    'use strict';
    angular.module('crams').factory('SupportEmailService', SupportEmailService);
    SupportEmailService.$inject = ['$http', 'ENV'];
    function SupportEmailService($http, ENV) {
        var service = {};

        service.sendSupportEmail = sendSupportEmail;

        return service;

        function sendSupportEmail(message) {
            var url = ENV.apiEndpoint + "support_email";

            return $http({
                    url: url,
                    method: 'POST',
                    data: message
                }
            ).then(handleSuccess, handleError);
        }

        // private functions
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
    }
})();

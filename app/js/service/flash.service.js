/**
 * Created by simonyu on 31/08/15.
 */
(function () {
    'use strict';

    angular.module('crams').factory('FlashService', FlashService);
    FlashService.$inject = ['$rootScope'];
    function FlashService($rootScope) {
        var service = {};

        service.Success = Success;
        service.Error = Error;
        service.DisplayError = DisplayError;

        initService();
        return service;

        function initService() {
            $rootScope.$on('$locationChangeStart', function () {
                clearFlashMessage();
            });

            function clearFlashMessage() {
                var flash = $rootScope.flash;
                if (flash) {
                    if (!flash.keepAfterLocationChange) {
                        delete $rootScope.flash;
                    } else {
                        // only keep for a single location change
                        flash.keepAfterLocationChange = false;
                    }
                }
            }
        }

        function Success(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'success',
                keepAfterLocationChange: keepAfterLocationChange
            };
        }

        function Error(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
        }

        function DisplayError(message, errors, keepAfterLocationChange) {
            var found_errors = '';
            if (errors !== undefined && errors !== null) {
                if (errors.hasOwnProperty('non_field_errors')) {
                    found_errors = errors.non_field_errors[0];
                }

                if (errors.hasOwnProperty('detail')) {
                    found_errors = errors.detail;
                }

                if (errors.hasOwnProperty('message')) {
                    found_errors = errors.message;
                }
            }
            $rootScope.flash = {
                message: message + ' ' + found_errors,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
        }
    }

})();
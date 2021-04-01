/**  * Created by simonyu on 9/05/16.  */ (function () {
    'use strict';
    angular.module('crams').controller('RacMonNewMessageDayController', RacMonNewMessageDayController);
    RacMonNewMessageDayController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll', 'textAngularManager', 'ENV'];

    function RacMonNewMessageDayController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll, textAngularManager, ENV) {
        var vm = this;
        vm.message_of_day = '';
        vm.newMessage = function () {
            var message_data = {
                "message": vm.message_of_day
            };
            if (validateMessage()) {
                CramsApiService.newMessageDay(message_data, ENV.erb).then(function (response) {
                    if (response.success) {
                        FlashService.Success("New message of the day added", true);
                        $location.path('/admin/message_day');
                    } else {
                        var msg = "Failed to add new message of the day, " + response.message + ".";
                        FlashService.DisplayError(msg, response.data);
                    }
                });
            } else {
                if (vm.max_len_message_invalid) {
                    FlashService.Error("The message has exceeded the 1500 character limit.");
                } else {
                    FlashService.Error("The message can not be blank.");
                }
                $anchorScroll();
            }

        };
        vm.counter = 0;

        vm.countWords = function () {
            vm.max_len_message_invalid = false;
            if (vm.message_of_day !== '' && vm.message_of_day !== null && vm.message_of_day !== undefined) {
                vm.counter = vm.message_of_day.length;
                if (vm.counter > 1500) {
                    vm.max_len_message_invalid = true;
                }
            }
            return vm.max_len_message_invalid;
        };

        function validateMessage() {
            var valid = true;
            vm.message_invalid = false;
            if (vm.message_of_day === '' || vm.message_of_day === null || vm.message_of_day === undefined) {
                vm.message_invalid = true;
                valid = false;
            } else {
                valid = !vm.countWords();
            }
            return valid;
        }

    }
})();

/**  * Created by simonyu on 9/05/16.  */ (function () {
    'use strict';
    angular.module('crams').controller('RacMonMessageDayController', RacMonMessageDayController);
    RacMonMessageDayController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll', 'ENV'];

    function RacMonMessageDayController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll, ENV) {
        var vm = this;
        vm.message_day = null;
        CramsApiService.messageDay(ENV.erb).then(function (response) {
            if (response.success) {
                var messages = response.data;
                if (messages !== undefined && messages !== null) {
                    vm.message_day = messages[0];
                }
            } else {
                var msg = "Failed to get message of the day, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });
    }
})();

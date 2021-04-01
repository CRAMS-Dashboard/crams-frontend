/**  * Created by simonyu on 9/05/16.  */ (function () {
    'use strict';
    angular.module('crams').controller('RacMonMessageDayListController', RacMonMessageDayListController);
    RacMonMessageDayListController.$inject = ['$location', '$route', '$scope', '$routeParams', 'CramsApiService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll', 'ENV'];

    function RacMonMessageDayListController($location, $route, $scope, $routeParams, CramsApiService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll, ENV) {
        var vm = this;
        var offset = 10;

        vm.display_messages = {};

        CramsApiService.listMessagesDay(ENV.erb).then(function (response) {
            if (response.success) {
                vm.messages_day = response.data;
                vm.all_messages = angular.copy(vm.messages_day);
                vm.total_messages = vm.all_messages.length;
                counterPageNumbers(vm.total_messages);
                vm.pagination(1);

            } else {
                var msg = "Failed to get messages of the day, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
            }
        });

        function counterPageNumbers(total_no) {
            var page_remainder = total_no % offset;
            vm.total_pages = Math.trunc((total_no / offset));
            if (page_remainder > 0) {
                vm.total_pages += 1;
            }
        }

        vm.pagination = function (page_no) {
            var prev_no = page_no - 1;
            if (prev_no < 0) {
                prev_no = 0;
            }
            var current_no = page_no;
            var next_no = current_no + 1;

            if (next_no > vm.total_pages){
                next_no = vm.total_pages;
            }
            var start_no = prev_no * offset;
            var end_no = current_no * offset;

            var messages = vm.all_messages.slice(start_no, end_no);

            vm.display_messages = {
                "prev_no": prev_no,
                "current_no": current_no,
                "next_no": next_no,
                "messages": messages
            };
        };

        vm.prevPage = function (page_no) {

        };

        function pageLess(page_no) {
            var total_display = vm.display_messages.length;
            vm.display_messages = vm.display_messages.slice(0, (total_display - 10));
            var final_total_display = vm.display_messages.length;
            if (final_total_display <= offset) {
                vm.has_more = true;
            }
        }
    }
})();
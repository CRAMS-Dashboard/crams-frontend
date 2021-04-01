/**
 * Created by simonyu on 19/10/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsAllocHistoryController', CramsAllocHistoryController);

    CramsAllocHistoryController.$inject = ['FlashService', 'CramsApiService', '$routeParams', '$location'];

    function CramsAllocHistoryController(FlashService, CramsApiService, $routeParams, $location) {
        var vm = this;
        var request_id = $routeParams.id;
        var current_paths = $location.path().split('/');
        vm.allocations_base_path = current_paths[1];
        if (current_paths[1] === 'admin' && current_paths[2] === 'allocations') {
            vm.allocations_base_path = current_paths[1] + '/' + current_paths[2];
        }

        CramsApiService.listAllocationHistory(request_id).then(function (response) {
            if (response.success) {
                vm.history_list = response.data;
            } else {
                var msg = "Failed to get allocation history, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        });
    }
})();

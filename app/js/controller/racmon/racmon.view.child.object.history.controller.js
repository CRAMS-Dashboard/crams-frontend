(function () {
    'use strict';
    angular.module('crams').controller('RacMonViewChildObjectHistoryController', RacMonViewChildObjectHistoryController);

    RacMonViewChildObjectHistoryController.$inject = ['$scope', '$rootScope', '$routeParams', '$location', 'CramsApiService', 'FlashService', '$anchorScroll', '$q', '$filter'];

    function RacMonViewChildObjectHistoryController($scope, $rootScope, $routeParams, $location, CramsApiService, FlashService, $anchorScroll, $q, $filter) {
        var vm = this;
        //This controller will be used for adding and updating.
        vm.request_id = $routeParams.request_id;
        vm.child_id = $routeParams.child_id;
        vm.allocations_base_path = 'allocations';
        var current_paths = $location.path().split('/');
        if (current_paths[1] === 'admin' && current_paths[2] === 'allocations') {
            vm.allocations_base_path = current_paths[1] + '/' + current_paths[2];
        }

        vm.loaded = false;
        //get my allocation requests
        CramsApiService.getChildObjectHistory(vm.request_id, vm.child_id).then(function (response) {
            if (response.success) {
                vm.history_data = response.data;
                vm.history_data.history = _.sortBy(vm.history_data.history, function (his) {
                    return his.creation_ts;
                });
                vm.history_data.history = vm.history_data.history.reverse();
                populateParentStorageProducts();
            } else {
                var msg = "Failed to get the history of child object, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
            }
        }).finally(function () {
            vm.loaded = true;
        });

        function populateParentStorageProducts() {
            vm.parent_storage_products = [];
            angular.forEach(vm.history_data.storage_requests, function (s_request) {
                var provision_id = s_request.provision_id.id;
                var sp_name = s_request.provision_id.storage_product.name;
                var sp = {'provision_id': provision_id, 'name': sp_name};
                vm.parent_storage_products.push(sp);
            });
        }

        vm.getSpNameById = function (provision_id) {
            var sp_name = 'None';
            angular.forEach(vm.parent_storage_products, function (a_sp) {
                if (a_sp.provision_id === provision_id) {
                    sp_name = a_sp.name;
                }
            });
            return sp_name;
        };

        vm.getChildId = function (index) {
            var a_history = vm.history_data.history[index];
            return a_history.erb_label.label.key + "-" + a_history.erb_label.sequence_number;
        };

        // get the review date - archived date + retention period (years)
        vm.setReviewDate = function (arch_date_str, ret_years) {
            // convert string back into date
            var date_split = arch_date_str.split('/');
            // month is 0-based, that's why we need dataParts[1] - 1
            var review_date = new Date(+date_split[2], date_split[1] - 1, +date_split[0]);

            // append the retention period in years to the date
            review_date.setFullYear(review_date.getFullYear() + ret_years);

            // convert the date back to string and return
            return $filter('date')(review_date, "dd/MM/yyyy");
        };
    }
})();

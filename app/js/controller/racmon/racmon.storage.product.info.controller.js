(function () {
    'use strict';
    angular.module('crams').controller('StorageProductInfoController', StorageProductInfoController);

    StorageProductInfoController.$inject = ['$scope', '$rootScope', '$uibModal'];

    function StorageProductInfoController($scope, $rootScope, $uibModal) {
        var vm = this;
        vm.open = open;

        function open() {
            $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'sp_info_modal',
                controller: 'SPModalInstCtrl',
                controllerAs: 'vm',
                size: 'lg',
                backdrop: 'static'
            });
        }
    }

    angular.module('crams').controller('SPModalInstCtrl', function ($rootScope, $uibModalInstance) {
        var vm = this;

        vm.close = function () {
            $uibModalInstance.close();
        };
    });
})();
(function () {
    'use strict';
    angular.module('crams').controller('ViewSelectionController', ViewSelectionController);

    ViewSelectionController.$inject = ['$rootScope', '$scope', '$location', '$route'];

    function ViewSelectionController($rootScope, $scope, $location, $route) {
        var vm = this;

        vm.selected_view = $rootScope.globals.selected_view;
        if (vm.selected_view === undefined || vm.selected_view === null) {
            vm.selected_view = 'normal_user';
        }

        vm.changeView = function () {
            $rootScope.globals.selected_view = vm.selected_view;
            //set the globals in local storage to make sure the authen info exist after page refresh
            window.localStorage.setItem('crams-fe', JSON.stringify($rootScope.globals));
            vm.selected_view = $rootScope.globals.selected_view;
            // $location.path('/dashboard');
            // $route.reload();
            switch (vm.selected_view) {
                case 'normal_user':
                    $location.path('/dashboard');
                    break;

                case 'admin':
                    $location.path('/dashboard/admin');
                    break;

                case 'faculty_management':
                    $location.path('/dashboard/faculty');
                    break;

                case 'service_management':
                    $location.path('/dashboard/merc_admin');
                    break;

                case 'approver':
                    $location.path('/approval');
                    break;

                case 'provisioner':
                    $location.path('/provision');
                    break;

                default:
                    $location.path('/dashboard');
                    break;
            }
        };
    }
})();
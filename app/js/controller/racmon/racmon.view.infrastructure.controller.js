(function () {
    'use strict';
    angular.module('crams').controller('InfrastructureConntroller', InfrastructureConntroller);

    InfrastructureConntroller.$inject = ['$scope', '$rootScope', '$location', '$uibModal', 'CramsApiService'];

    function InfrastructureConntroller($scope, $rootScope, $location, $uibModal, CramsApiService) {
        var vm = this;

        vm.infrasView = infrasView;

        function infrasView(product_id, sp_name) {

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'infrasContent',
                controller: 'infrasModalCtrl',
                controllerAs: 'vm',
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.product_id = product_id;
            modalInstance.sp_name = sp_name;
        }
    }

    angular.module('crams').controller('infrasModalCtrl', function ($rootScope, $uibModalInstance, FlashService, CramsApiService) {
        var vm = this;

        vm.product_id = $uibModalInstance.product_id;
        vm.sp_name = $uibModalInstance.sp_name;

        vm.csvInfrasSummaryData = function () {
            return vm.csv_data;
        };

        vm.csvInfrasSummaryHeadings = function () {
            return ['Infrastructure', 'Quota (GB)', 'Used Disk (GB)', 'Used Tap (GB)'];
        };

        vm.csvReportFileName = function () {
            let file_name = 'ProductDemand_InfrastructureView_' + vm.sp_name + '_' + getDateStr(new Date()) + '.csv';
            return file_name;
        };

        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

        vm.hasError = false;

        if (!vm.product_id) {
            vm.hasError = true;
            vm.error_msg = "Failed to get infrastructure summary report, product id is null.";
        }

        vm.loaded = false;

        if (!vm.hasError) {
            CramsApiService.getInfrastructureSummary(vm.product_id).then(function (response) {
                if (response.success) {
                    var infras_data = response.data;
                    vm.storage_product = infras_data.storage_product.name;
                    var infrastructure_data = infras_data.infrastructure;
                    var csv_graphic_data = convertJsonToTableData(infrastructure_data);

                    var graphic_data = csv_graphic_data.graphic_data;
                    vm.csv_data = csv_graphic_data.csv_data;
                    drawGoogleCharts(graphic_data, 18);
                } else {
                    vm.hasError = true;
                    vm.error_msg = "Failed to get infrastructure summary report, " + response.message + ".";
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }
        vm.loaded = true;

        function drawGoogleCharts(graphic_data, prod_id) {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'NAS');
            data.addColumn('number', 'Reported Quota');
            data.addColumn('number', 'Used Disk');
            data.addColumn('number', 'Used Tape');
            data.addRows(graphic_data);
            var options = {
                height: 700,
                hAxis: {
                    title: 'Storage Pools',
                    titleTextStyle: {
                        color: '#000000'
                    },
                    slantedText: true,
                    slantedTextAngle: 30
                },
                vAxis: {
                    title: 'Size (GB)'
                },
                legend: 'none',
                colors: ['#be5150', '#5182ba', '#148a81']
            };
            var view = new google.visualization.DataView(data);
            var graphic_id = 'id_product-' + prod_id;
            var googleChart = new google.visualization.ColumnChart(document.getElementById(graphic_id));
            googleChart.draw(view, options);
        }

        function convertJsonToTableData(data_list) {
            var graphic_data = [];
            var csv_data = [];
            vm.quota_sum = 0;
            vm.used_sum = 0;
            vm.tape_sum = 0;

            angular.forEach(data_list, function (data) {
                var row_data = [];
                row_data.push(data.infrastructure.name);
                row_data.push(data.quota_sum);
                row_data.push(data.disk_usage_sum);
                row_data.push(data.tape_usage_sum);
                graphic_data.push(row_data);
                var each_csv_data = {};
                each_csv_data.name = data.infrastructure.name;
                each_csv_data.quota_sum = data.quota_sum.toFixed(3);
                each_csv_data.used_sum = data.disk_usage_sum.toFixed(3);
                each_csv_data.tape_sum = data.tape_usage_sum.toFixed(3);
                csv_data.push(each_csv_data);

                vm.quota_sum += data.quota_sum;
                vm.used_sum += data.disk_usage_sum;
                vm.tape_sum += data.tape_usage_sum;
            });
            csv_data.push({
                'name': 'Sum',
                'quota_sum': vm.quota_sum.toFixed(3),
                'used_sum': vm.used_sum.toFixed(3),
                'tape_sum': vm.tape_sum.toFixed(3)
            });
            return {'csv_data': csv_data, 'graphic_data': graphic_data};
        }

        vm.close = function () {
            $uibModalInstance.close();
        };
    });

})();

(function () {
    'use strict';
    angular.module('crams').controller('IngestHistoryConntroller', IngestHistoryConntroller);

    IngestHistoryConntroller.$inject = ['$scope', '$rootScope', '$location', '$uibModal', 'CramsApiService'];
    function IngestHistoryConntroller($scope, $rootScope, $location, $uibModal, CramsApiService) {
        var vm = this;

        vm.history = history;

        function history(provision_id, product_id) {

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'ingestHistoryContent',
                controller: 'historyModalCtrl',
                controllerAs: 'vm',
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.provision_id = provision_id;
            modalInstance.product_id = product_id;
        }
    }

    angular.module('crams').controller('historyModalCtrl', function ($rootScope, $uibModalInstance, FlashService, CramsApiService) {
        var vm = this;
        vm.provision_id = $uibModalInstance.provision_id;
        vm.product_id = $uibModalInstance.product_id;
        vm.file_name = 'IngestHistory.csv'

        vm.csvHistoryIngestData = function () {
            return vm.ingested_history_csv_data;

        };

        vm.csvHistoryIngestHeadings = function () {
            return ['Project', 'Storage Product', 'Date', 'Allocation (GB)', 'Used (GB)', 'Used Disk (GB)', 'Used Tape (GB)', 'Alloc Cost ($)', 'Used Cost ($)'];
        };


        vm.hasError = false;

        if (!vm.provision_id) {
            vm.hasError = true;
            vm.error_msg = "Failed to get ingestion history error, provision id is null.";
        }
        if (!vm.product_id) {
            vm.hasError = true;
            vm.error_msg = "Failed to get ingestion history error, product id is null.";
        }

        vm.loaded = false;

        if (!vm.hasError) {
            CramsApiService.ingestHistory(vm.provision_id, vm.product_id).then(function (response) {
                if (response.success) {
                    var sp_usage_history = response.data;
                    var graphic_data = {};
                    var ingested_usages = sp_usage_history.ingested_usage;

                    vm.ingested_history_csv_data = [];
                    var ingested_history_data = [];
                    graphic_data.ingested_usages = ingested_history_data;
                    graphic_data.title = sp_usage_history.project_title;
                    graphic_data.storage_product = sp_usage_history.storage_product;
                    vm.file_name = 'IngestHistory_' + graphic_data.title + '_' + getDateStr(new Date()) + '.csv';
                    

                    angular.forEach(ingested_usages, function (ingested_u) {
                        var csv_data = {
                            'project': sp_usage_history.project_title,
                            'storage_product': sp_usage_history.storage_product
                        };

                        //pick the extract date, allocated gb and used gb only
                        var filted_data = _.pick(ingested_u, 'extract_date', 'allocated_gb', 'used_gb');
                        var usage_list = _.values(filted_data);

                        //merge the cvs data- append the usage data after project and storage product
                        csv_data = _.extend(csv_data, ingested_u);
                        ingested_history_data.push(usage_list);
                        vm.ingested_history_csv_data.push(csv_data);
                    });

                    if (graphic_data.ingested_usages.length === 0) {
                        vm.hasError = true;
                        vm.error_msg = "No ingest history data.";
                    }
                    drawGoogleCharts(graphic_data);
                } else {
                    vm.hasError = true;
                    vm.error_msg = "Failed to get collection ingest report, " + response.message + ".";
                }
            }).finally(function () {
                vm.loaded = true;
            });
        }

        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

        function drawGoogleCharts(graphic_data) {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Date');
            data.addColumn('number', 'Allocation');
            data.addColumn('number', 'Ingest');

            data.addRows(graphic_data.ingested_usages);

            var rows = graphic_data.ingested_usages.length;
            var textEvery = 3;
            if (rows >= 30 && rows <= 300) {
                textEvery = 30;
            }
            if (rows > 300) {
                textEvery = 150;
            }

            var view = new google.visualization.DataView(data);
            var g_title = graphic_data.title + ' - ' + graphic_data.storage_product;
            var options = {
                title: g_title,
                width: 700,
                height: 600,
                legend: {position: "bottom"},
                hAxis: {
                    title: 'Date',
                    viewWindowMode: 'maximized',
                    slantedText: true,
                    slantedTextAngle: 60,
                    showTextEvery: textEvery
                },
                vAxis: {
                    title: 'GB'
                }
            };
            var p_id = 'provision_id-' + vm.provision_id;
            var googleChart = new google.visualization['LineChart'](document.getElementById(p_id));
            googleChart.draw(view, options);
        }

        vm.close = function () {
            $uibModalInstance.close();
        };
    });

})();

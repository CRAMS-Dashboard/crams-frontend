/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';

    angular.module('crams').directive('ingestHistory', ingestHistory);
    function ingestHistory() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            terminal: true,
            templateUrl: 'templates/crams_ingest_history_not_used.html',
            controller: function ($scope, CramsApiService) {
                $scope.opened = false;

                function drawGoogleCharts(graphic_data) {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Allocation');
                    data.addColumn('number', 'Ingest');

                    data.addRows(graphic_data.ingested_usages);

                    var rows = graphic_data.ingested_usages.length;
                    var textEvery = 3;
                    if (rows >= 30 && rows <= 1000) {
                        textEvery = 30;
                    }
                    if (rows > 1000) {
                        textEvery = 100;
                    }

                    var view = new google.visualization.DataView(data);
                    var g_title = graphic_data.title + ' - ' + graphic_data.storage_product + ' Ingestion History';
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
                    var p_id = 'provision_id-' + $scope.provision_id;
                    var googleChart = new google.visualization['LineChart'](document.getElementById(p_id));
                    googleChart.draw(view, options);
                }

                $scope.csvHistoryIngestData = function () {
                    return $scope.ingested_history_csv_data;

                };

                $scope.csvHistoryIngestHeadings = function () {
                    return ['Project', 'Storage Product', 'Date', 'Allocation (GB)', 'Used (GB)', 'Alloc Cost ($)', 'Used Cost ($)']
                };

                $scope.closeIngestHistory = function () {
                    $scope.opened = !$scope.opened;
                };

                $scope.getIngestHistory = function () {
                    // alert('provision id: ' + $scope.provision_id + ' product id: ' + $scope.product_id);
                    $scope.hasError = false;
                    if (!$scope.provision_id) {
                        $scope.hasError = true;
                        $scope.error_msg = "Failed to get ingestion history error, provision id is null.";
                    } else {
                        CramsApiService.ingestHistory($scope.provision_id, $scope.product_id).then(function (response) {
                            if (response.success) {
                                var sp_usage_history = response.data;
                                var graphic_data = {};
                                var ingested_usages = sp_usage_history.ingested_usage;

                                $scope.ingested_history_csv_data = [];
                                var ingested_history_data = [];
                                graphic_data.ingested_usages = ingested_history_data;
                                graphic_data.title = sp_usage_history.project_title;
                                graphic_data.storage_product = sp_usage_history.storage_product;

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
                                    $scope.ingested_history_csv_data.push(csv_data);
                                });

                                if (graphic_data.ingested_usages.length === 0) {
                                    $scope.hasError = true;
                                    $scope.error_msg = "No ingest history data.";
                                }
                                drawGoogleCharts(graphic_data);
                            } else {
                                $scope.hasError = true;
                                $scope.error_msg = "Failed to get collection ingest report, " + response.message + ".";
                            }
                        });
                    }

                    return $scope.opened = !$scope.opened;
                };
            },

            link: function ($scope, element, attrs) {
                $scope.provision_id = parseInt(attrs.provisionid);
                $scope.product_id = parseInt(attrs.productid);
            }
        };
    }
})();
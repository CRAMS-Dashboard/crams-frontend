/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';

    angular.module('crams').directive('provisionDetails', provisionDetails);
    function provisionDetails() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            terminal: true,
            templateUrl: 'templates/crams_provision_details.html',
            controller: function ($scope) {
                $scope.opened = false;
                return $scope.show_provision = function () {
                    return $scope.opened = !$scope.opened;
                };
            },
            link: function ($scope, element, attrs) {
                var provisions = {};
                provisions['status'] = 'P';
                provisions['status_str'] = 'Provisioned';

                provisions['project_provisions'] = [];
                provisions['compute_provisions'] = [];
                provisions['storage_provisions'] = [];
                $scope.project['provisions'] = provisions;

                //find the index of the current project in vm.nc_projects
                var index = _.findIndex($scope.vm.projects, {'id': parseInt(attrs.projectid)});

                var proj_provs = $scope.project['provision_details'];

                if (proj_provs.length === 0) {
                    // no provision details
                    provisions['status'] = 'NA';
                } else {
                    //iterate through the project provisions
                    _.find(proj_provs, function (project_prov) {

                        var proj_prov_status = project_prov.status;
                        var tmp_proj_provision = {};
                        if (proj_prov_status === 'F') {
                            tmp_proj_provision['status_str'] = 'Provision Failed';
                        } else if (proj_prov_status === 'P') {
                            tmp_proj_provision['status_str'] = 'Provisioned';
                        } else {
                            tmp_proj_provision['status_str'] = 'In Progress';
                        }

                        if (provisions['status'] !== 'F') {
                            provisions['status'] = proj_prov_status;
                            provisions['status_str'] = tmp_proj_provision['status_str'];
                        }

                        tmp_proj_provision['status'] = proj_prov_status;
                        tmp_proj_provision['message'] = project_prov.message;
                        provisions['project_provisions'].push(tmp_proj_provision);
                    });
                    // iterate the requests
                    var requests = $scope.project['requests'];
                    _.find(requests, function (request, req_id) {
                        // compute requests
                        var compute_requests = request['compute_requests'];
                        _.find(compute_requests, function (compute_request) {
                            var comp_prov = compute_request['provision_details'];
                            if (comp_prov !== 'undefined') {
                                //console.log(JSON.stringify(comp_prov));
                                var compute_prov_status = comp_prov.status;
                                var tmp_compute_prov = {};
                                if (compute_prov_status === 'F') {
                                    tmp_compute_prov['status_str'] = 'Provision Failed';
                                } else if (compute_prov_status === 'P') {
                                    tmp_compute_prov['status_str'] = 'Provisioned';
                                } else {
                                    tmp_compute_prov['status_str'] = 'In Progress';
                                }
                                if (provisions['status'] !== 'F') {
                                    provisions['status'] = compute_prov_status;
                                    provisions['status_str'] = tmp_compute_prov['status_str'];
                                }

                                tmp_compute_prov['status'] = compute_prov_status;
                                tmp_compute_prov['name'] = compute_request.compute_product.name;
                                tmp_compute_prov['message'] = comp_prov.message;
                                provisions['compute_provisions'].push(tmp_compute_prov);
                            }
                        });
                        // storage requests
                        var storage_requests = request['storage_requests'];
                        _.find(storage_requests, function (storage_request) {
                            var storage_req_prov = storage_request['provision_details'];
                            if (storage_req_prov !== 'undefined') {
                                //console.log(JSON.stringify(storage_req_prov));
                                var storage_req_prov_status = storage_req_prov.status;
                                var tmp_storage_prov = {};
                                if (storage_req_prov_status === 'F') {
                                    tmp_storage_prov['status_str'] = 'Provision Failed';
                                } else if (storage_req_prov_status === 'P') {
                                    tmp_storage_prov['status_str'] = 'Provisioned';
                                } else {
                                    tmp_storage_prov['status_str'] = 'In Progress';
                                }
                                if (provisions['status'] !== 'F') {
                                    provisions['status'] = storage_req_prov_status;
                                    provisions['status_str'] = tmp_storage_prov['status_str'];
                                }

                                tmp_storage_prov['status'] = storage_req_prov_status;
                                tmp_storage_prov['name'] = storage_request.storage_product.name;
                                tmp_storage_prov['message'] = storage_req_prov.message;
                                provisions['storage_provisions'].push(tmp_storage_prov);
                            }
                        });
                    });
                }
                // replace the project
                //console.log(JSON.stringify($scope.project.provisions));
                $scope.vm.projects[index] = $scope.project;
            }
        }
    }
})();
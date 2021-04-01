(function () {
    'use strict';
    angular.module('crams').factory('VicnodeRequestService', VicnodeRequestService);
    VicnodeRequestService.$inject = ['$http', 'ENV'];
    function VicnodeRequestService($http, ENV) {

        var crams_project_api_url = ENV.apiEndpoint + "project/";

        var service = {};
        service.newProjectRequest = newProjectRequest;

        service.createProjectRequest = createProjectRequest;
        service.updateProjectRequest = updateProjectRequest;
        service.getProjectRequestById = getProjectRequestById;
        service.approveRequest = approveRequest;
        service.declineRequest = declineRequest;


        var approve_request_path_str = "approve_request";
        var decline_request_path_str = "decline_request";
        var buildDetailAPIUrl = function (pathStr, recordId) {
            return ENV.apiEndpoint + pathStr + "/" + recordId + '/';
        };

        function createProjectRequest(allocation_request) {
            return $http({
                    url: crams_project_api_url,
                    method: 'POST',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function updateProjectRequest(allocation_request, project_id) {
            var update_request_url = crams_project_api_url + project_id + "/";
            return $http({
                    url: update_request_url,
                    method: 'PUT',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function getProjectRequestById(request_id) {
            return $http.get(crams_project_api_url + "?request_id=" + request_id).then(handleSuccess, handleError);
        }

        function approveRequest(allocation_request_partial, request_id) {
            return $http({
                    url: buildDetailAPIUrl(approve_request_path_str, request_id),
                    method: 'PUT',
                    data: allocation_request_partial
                }
            ).then(handleSuccess, handleError);
        }

        function declineRequest(allocation_request_partial, request_id) {
            return $http({
                    url: buildDetailAPIUrl(decline_request_path_str, request_id),
                    method: 'PUT',
                    data: allocation_request_partial
                }
            ).then(handleSuccess, handleError);
        }

        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText)
            };
        }

        function newProjectRequest() {

            return {
                "title": "",
                "description": "",
                "project_question_responses": [],
                "institutions": [],
                "publications": [],
                "grants": [],
                "project_ids": [
                    {
                        "identifier": "",
                        "system": {
                            "id": 2
                        }
                    }
                ],
                "project_contacts": [
                    {
                        "contact": {
                            "id": 0
                        },
                        "contact_role": "Data Custodian"
                    }
                ],
                "domains": [],
                "requests": [
                    {
                        "compute_requests": [],
                        "storage_requests": [
                            {
                                "quota": 0,
                                "approved_quota": 0,
                                "storage_product": {
                                    "id": 0
                                },
                                "storage_question_responses": [
                                    {
                                        "question_response": 0,
                                        "question": {
                                            "key": "vn_current_size"
                                        }
                                    }
                                ]
                            }
                        ],
                        "request_question_responses": [
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_authorization"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_data_migration_src"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_data_migration_assistance"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_current_access_method"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_preferred_access_method"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_data_format"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_only_copy"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_can_be_regenerated"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_loss_impact"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_privacy_q1"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "vn_privacy_q2"
                                }
                            },
                            {
                                "question_response": "No",
                                "question": {
                                    "key": "vn_privacy_q3"
                                }
                            },
                            {
                                "question_response": "No",
                                "question": {
                                    "key": "vn_privacy_q4"
                                }
                            }

                        ],
                        "request_status": {
                            "id": 1
                        },
                        "funding_scheme": {
                            "id": 13
                        },
                        "start_date": "2016-01-01",
                        "end_date": "2017-01-01",
                        "approval_notes": "",
                        "parent_request": null
                    }
                ]
            }
        }

        return service;
    }

})();
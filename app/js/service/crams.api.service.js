(function () {
    'use strict';
    angular.module('crams').factory('CramsApiService', CramsApiService);
    CramsApiService.$inject = ['$http', 'ENV'];

    function CramsApiService($http, ENV) {
        var service = {};

        var crams_project_api_url = ENV.apiEndpoint + "project_request/";
        // var list_my_allocations_url = ENV.apiEndpoint + "project/";
        var list_my_allocations_url = ENV.apiEndpoint + "allocation_list/";
        // var dashboard_projects_url = ENV.apiEndpoint + 'project_list/';

        var list_approval_url = ENV.apiEndpoint + "approve_list";
        var approval_counter_url = ENV.apiEndpoint + "alloc_counter";
        var allocations_history_base_url = ENV.apiEndpoint + "request_history/";
        var project_usage_cost_url = ENV.apiEndpoint + "reports/project_storage_product_usage";
        var faculty_usage_cost_url = ENV.apiEndpoint + "reports/faculty_storage_product_usage";
        var provision_list_url = ENV.apiEndpoint + "provision_project/list/";
        var provision_update_url = ENV.apiEndpoint + "provision/storage_requests/update/";
        var reports_url = ENV.apiEndpoint + "reports/";
        // var project_admin_list_url = ENV.apiEndpoint + 'project/admin/'; //ENV.apiEndpoint + 'project_admin_list/';
        var project_admin_list_url = ENV.apiEndpoint + 'allocation_list/admin/';
        var project_leader_member_url = ENV.apiEndpoint + "member/project_leader_members/";
        var project_leader_request_url = ENV.apiEndpoint + 'member/project_leader_request';
        var project_add_user_url = ENV.apiEndpoint + 'member/project_admin_add_user/';
        var parent_projects_ur = ENV.apiEndpoint + 'label/linked/racmon/collective_parent/not_child';
        var message_day_url = ENV.apiEndpoint + 'message_of_the_day/';
        var erb_label_url = ENV.apiEndpoint + 'label/erb_label/';
        var meta_erb_label_url = ENV.apiEndpoint + 'metadata/erb_label/';
        var child_collection_url = ENV.apiEndpoint + 'metadata/allocation/';
        var faculty_usage_history_url = ENV.apiEndpoint + 'reports/faculty_ingest_summary/';
        var project_usage_history_url = ENV.apiEndpoint + 'reports/faculty_storage_product_ingest_history/';
        var recent_prov_id_url = ENV.apiEndpoint + 'ingest/recent_provision_id';

        var request_usage_alerts_api_base_url = ENV.apiEndpoint + "usage_alerts/";
        var check_login_status_base_url = ENV.apiEndpoint + 'crams_log/login/last/';

        service.newRacmProjectRequest = newRacmProjectRequest;
        service.emptyRaCMonRequestQuestionResponse = emptyRaCMonRequestQuestionResponse;
        service.listMyAllocations = listMyAllocations;
        service.listAdminAllocations = listAdminAllocations;
        service.listAllocationHistory = listAllocationHistory;
        service.getProjectRequestById = getProjectRequestById;
        service.getProjectCramsId = getProjectCramsId;
        service.getProjectById = getProjectById;

        service.createProjectRequest = createProjectRequest;
        service.updateProjectRequest = updateProjectRequest;
        service.saveProjectRequestDraft = saveProjectRequestDraft;
        service.updateProjectRequestDraft = updateProjectRequestDraft;
        service.listApproval = listApproval;
        service.ApprovalCounter = ApprovalCounter;
        service.updateProvisionID = updateProvisionID;

        service.approveRequest = approveRequest;
        service.declineRequest = declineRequest;
        service.projectsUsageCost = projectsUsageCost;
        service.facultyUsageCost = facultyUsageCost;

        service.provisionList = provisionList;
        service.getProvisionRequestById = getProvisionRequestById;
        service.provisionStorageProductRequests = provisionStorageProductRequests;

        service.newHPCProjectRequest = newHPCProjectRequest;
        service.emptyHPCRequest = emptyHPCRequest;
        service.emptyHPCStorageRequest = emptyHPCStorageRequest;

        service.productDemandSummaryReport = productDemandSummaryReport;
        service.getInfrastructureSummary = getInfrastructureSummary;
        service.productUsageReport = productUsageReport;
        service.fundAllocationCostsReport = fundAllocationCostsReport;
        service.storageTransactionsReport = storageTransactionsReport;
        service.collectionIngestReport = collectionIngestReport;
        service.allocContactInfoReport = allocContactInfoReport;
        service.ingestHistory = ingestHistory;

        service.dashboardProjects = dashboardProjects;
        service.dashboardRacmonProjects = dashboardRacmonProjects;
        service.getProjectUsageCost = getProjectUsageCost;
        service.getFacultyUsageCostById = getFacultyUsageCostById;
        service.getFacultyUsageHistory = getFacultyUsageHistory;
        service.getProjectUsageHistory = getProjectUsageHistory;
        service.projectLeaderMember = projectLeaderMember;
        service.projectLeaderRequest = projectLeaderRequest;
        service.projectAddUser = projectAddUser;
        service.listParentProjects = listParentProjects;
        service.messageDay = messageDay;
        service.listChildObjects = listChildObjects;
        service.getChildObjectHistory = getChildObjectHistory;

        service.checkCurrentParentRequest = checkCurrentParentRequest;

        service.getCurrentChildObject = getCurrentChildObject;

        service.addChildObject = addChildObject;

        service.updateChildObject = updateChildObject;

        service.getERBLabelList = getERBLabelList;
        service.getNextSequenceNumber = getNextSequenceNumber;
        service.addNewErbLabel = addNewErbLabel;
        service.getRecentProvId = getRecentProvId;
        service.listMessagesDay = ListMessagesDay;
        service.newMessageDay = newMessageDay;

        // usage alerts
        service.getUsageAlertsByRequestId = getUsageAlertsByRequestId;
        service.addOrEditUsageAlert = addOrEditUsageAlert;
        service.getLoginStatus = getLoginStatus;

        var approve_request_path_str = "approve_request";
        var decline_request_path_str = "decline_request";

        var buildDetailAPIUrl = function (pathStr, recordId) {
            return ENV.apiEndpoint + pathStr + "/" + recordId + '/';
        };

        function listMyAllocations() {
            return $http.get(list_my_allocations_url).then(handleSuccess, handleError);
        }

        function listAdminAllocations() {
            return $http.get(project_admin_list_url).then(handleSuccess, handleError);
        }

        function getProjectRequestById(request_id) {
            return $http.get(crams_project_api_url + "?request_id=" + request_id).then(handleSuccess, handleError);
        }

        function getProjectCramsId(crams_id) {
            return $http.get(crams_project_api_url + "?crams_id=" + crams_id).then(handleSuccess, handleError);
        }

        function getProjectById(project_id) {
            return $http.get(crams_project_api_url + project_id + '/').then(handleSuccess, handleError);
        }

        function listAllocationHistory(request_id) {
            return $http.get(allocations_history_base_url + "?request_id=" + request_id).then(handleSuccess, handleError);
        }

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

        function saveProjectRequestDraft(allocation_request) {
            return $http({
                    url: crams_project_api_url + "?draft",
                    method: 'POST',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function updateProjectRequestDraft(allocation_request, project_id) {
            var update_request_url = crams_project_api_url + project_id + "/?draft";
            return $http({
                    url: update_request_url,
                    method: 'PUT',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function listApproval(funding_body_id, request_status) {
            var request_url = list_approval_url;
            if (funding_body_id !== -1) {
                request_url = list_approval_url + "?funding_body_id=" + funding_body_id;
                if (request_status !== null && request_status !== undefined) {
                    request_url = request_url + "&req_status=" + request_status;
                }
            } else {
                if (request_status !== null && request_status !== undefined) {
                    request_url = request_url + "?req_status=" + request_status;
                }
            }
            return $http.get(request_url).then(handleSuccess, handleError);
        }

        function updateProvisionID(stor_req_id, stor_prod, new_prov_id) {
            let prov_update_url = ENV.apiEndpoint + "provision/storage_requests/" + stor_req_id + "/update_provision_id/";
            let json_payload = {
                "storage_product": stor_prod,
                "provision_id": new_prov_id,
            };

            return $http({
                    url: prov_update_url,
                    method: 'POST',
                    data: json_payload
                }
            ).then(handleSuccess, handleError);
        }

        function ApprovalCounter(funding_body_id, request_status) {
            var request_url = approval_counter_url;
            if (funding_body_id !== -1) {
                request_url = approval_counter_url + "?funding_body_id=" + funding_body_id;
                if (request_status !== null && request_status !== undefined) {
                    request_url = request_url + "&req_status=" + request_status;
                }
            } else {
                if (request_status !== null && request_status !== undefined) {
                    request_url = request_url + "?req_status=" + request_status;
                }
            }
            return $http.get(request_url).then(handleSuccess, handleError);
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

        function projectLeaderMember(project_id) {
            return $http.get(project_leader_member_url + project_id).then(handleSuccess, handleError);
        }

        function projectLeaderRequest(request_data) {
            return $http({
                    url: project_leader_request_url,
                    method: 'POST',
                    data: request_data
                }
            ).then(handleSuccess, handleError);
        }

        function projectAddUser(member_data) {
            return $http({
                    url: project_add_user_url,
                    method: 'POST',
                    data: member_data
                }
            ).then(handleSuccess, handleError);
        }

        function projectsUsageCost(e_r_system) {
            return $http.get(project_usage_cost_url + "/?e_research_system=" + e_r_system).then(handleSuccess, handleError);
        }

        function facultyUsageCost(e_r_system) {
            return $http.get(faculty_usage_cost_url + "/?e_research_system=" + e_r_system).then(handleSuccess, handleError);
        }

        function provisionList() {
            return $http.get(provision_list_url).then(handleSuccess, handleError);
        }

        function getProvisionRequestById(request_id) {
            return $http.get(provision_list_url + request_id + '/').then(handleSuccess, handleError);
        }

        function provisionStorageProductRequests(sp_r_provisions) {
            let prov_update_url = ENV.apiEndpoint + "provision/storage_requests/update_provision_id_bulk/";
            return $http({
                    url: prov_update_url,
                    method: 'POST',
                    data: sp_r_provisions
                }
            ).then(handleSuccess, handleError);
        }

        function productDemandSummaryReport(type_admin, system) {
            var prod_demand_summary_rul = reports_url + 'product_demand_summary/';
            if (system !== null && system !== undefined) {
                prod_demand_summary_rul = reports_url + 'product_demand_summary/?e_research_system=' + system;
            }

            if (type_admin !== undefined) {
                prod_demand_summary_rul = reports_url + 'product_demand_summary/' + type_admin + '/';
                if (system !== null && system !== undefined) {
                    prod_demand_summary_rul = reports_url + 'product_demand_summary/' + type_admin + '/?e_research_system=' + system;
                }
            }
            return $http.get(prod_demand_summary_rul).then(handleSuccess, handleError);
        }

        function getInfrastructureSummary(sp_id) {
            var infra_summary_url = ENV.apiEndpoint + 'reports/storage_product_infrastructure_summary/' + sp_id + '/admin';
            return $http.get(infra_summary_url).then(handleSuccess, handleError);
        }

        function productUsageReport(type_admin, system) {
            var prod_usage_url = reports_url + 'product_demand_summary/';
            if (system !== null && system !== undefined) {
                prod_usage_url = reports_url + 'product_demand_summary/?e_research_system=' + system;
            }

            if (type_admin !== undefined) {
                prod_usage_url = reports_url + 'product_demand_summary/' + type_admin + '/';
                if (system !== null && system !== undefined) {
                    prod_usage_url = reports_url + 'product_demand_summary/' + type_admin + '/?e_research_system=' + system;
                }
            }
            return $http.get(prod_usage_url).then(handleSuccess, handleError);
        }

        function fundAllocationCostsReport(type_admin) {
            var fund_alloc_url = reports_url + 'funding_allocation_summary?funding_body=' + ENV.erb;
            if (type_admin !== undefined) {
                fund_alloc_url = reports_url + 'funding_allocation_summary/' + type_admin + '?funding_body=' + ENV.erb;
            }
            return $http.get(fund_alloc_url).then(handleSuccess, handleError);
        }

        function storageTransactionsReport(type_admin) {
            var transaction_record_report_url = reports_url + 'transaction_record_report/';
            if (type_admin !== undefined) {
                transaction_record_report_url = reports_url + 'transaction_record_report/' + type_admin + '/';
            }
            return $http.get(transaction_record_report_url).then(handleSuccess, handleError);
        }

        function collectionIngestReport(date, type_admin) {
            var ingest_report_url = reports_url + 'collection_ingestion_report/';
            if (type_admin !== undefined) {
                ingest_report_url = reports_url + 'collection_ingestion_report/' + type_admin + '/';
            }

            if (date === null || date === undefined) {
                return $http.get(ingest_report_url).then(handleSuccess, handleError);
            } else {
                return $http.get(ingest_report_url + '?date=' + date).then(handleSuccess, handleError);
            }
        }

        function allocContactInfoReport(type_admin) {
            var contact_info_url = reports_url + 'allocation_contact_information_report/';
            if (type_admin !== undefined) {
                contact_info_url = reports_url + 'allocation_contact_information_report/' + type_admin + '/';
            }
            return $http.get(contact_info_url).then(handleSuccess, handleError);
        }

        function ingestHistory(provision_id, product_id) {
            return $http.get(reports_url + 'project_storage_product_usage_history/?provision_id=' + provision_id + '&storage_product_id=' + product_id).then(handleSuccess, handleError);
        }

        function dashboardProjects(type_admin) {
            var dashboad_base_url = 'project_list';
            var dashboard_projects_url = ENV.apiEndpoint + dashboad_base_url + '/';

            if (type_admin !== undefined) {
                dashboard_projects_url = ENV.apiEndpoint + dashboad_base_url + '/' + type_admin + '/';
            }
            return $http.get(dashboard_projects_url).then(handleSuccess, handleError);
        }

        //TODO: confusing between e_research_body and e_research_system, rafi to explain
        function dashboardRacmonProjects(type_admin) {
            var url = reports_url + 'dashboard_project_list/?e_research_body=' + ENV.erb;
            if (type_admin !== undefined) {
                url = reports_url + 'dashboard_project_list/' + type_admin + '/?e_research_body=' + ENV.erb;
            }
            return $http.get(url).then(handleSuccess, handleError);
        }

        function getProjectUsageCost(project_id, e_r_system) {
            return $http.get(project_usage_cost_url + "/" + project_id + "/?e_research_system=" + e_r_system + "&request_status=provisioned").then(handleSuccess, handleError);
        }

        //getFacultyUsageCostById
        function getFacultyUsageCostById(faculty_id, e_r_system) {
            return $http.get(faculty_usage_cost_url + "/" + faculty_id + "/?e_research_system=" + e_r_system).then(handleSuccess, handleError);
        }

        function getFacultyUsageHistory(faculty_id) {
            var usage_history_url = faculty_usage_history_url;
            if (faculty_id !== null && faculty_id !== undefined) {
                usage_history_url = faculty_usage_history_url + "?faculty_id=" + faculty_id;
            }
            return $http.get(usage_history_url).then(handleSuccess, handleError);
        }

        function getProjectUsageHistory(start_date, end_date, faculty_id) {
            var usage_history_url = project_usage_history_url;
            if (faculty_id !== null && faculty_id !== undefined) {
                usage_history_url = project_usage_history_url + '?faculty_id=' + faculty_id;
                if (start_date !== null && start_date !== undefined) {
                    usage_history_url = usage_history_url + '&from=' + start_date;
                }
                if (end_date !== null && end_date !== undefined) {
                    usage_history_url = usage_history_url + '&to=' + end_date;
                }
            } else {
                if (start_date !== null && start_date !== undefined) {
                    usage_history_url = usage_history_url + '?from=' + start_date;
                } else {
                    if (end_date !== null && end_date !== undefined) {
                        usage_history_url = usage_history_url + '?to=' + end_date;
                    }
                }
            }
            return $http.get(usage_history_url).then(handleSuccess, handleError);
        }

        function listParentProjects() {
            return $http.get(parent_projects_ur).then(handleSuccess, handleError);
        }

        function messageDay(system_name) {
            return $http.get(message_day_url + system_name + '/').then(handleSuccess, handleError);
        }

        function listChildObjects(request_id) {
            var list_child_objects_url = ENV.apiEndpoint + 'metadata/allocation/' + request_id + '/storage';
            return $http.get(list_child_objects_url).then(handleSuccess, handleError);
        }

        function getChildObjectHistory(request_id, child_id) {
            var list_child_object_history_url = ENV.apiEndpoint + 'metadata/allocation/' + request_id + '/storage/' + child_id + '/history';
            return $http.get(list_child_object_history_url).then(handleSuccess, handleError);
        }

        function checkCurrentParentRequest(request_id) {
            var get_current_child_parent_url = ENV.apiEndpoint + 'metadata/allocation/' + request_id + '/storage/available';
            return $http.get(get_current_child_parent_url).then(handleSuccess, handleError);
        }

        function getCurrentChildObject(request_id, child_id) {
            var get_current_child_object_url = ENV.apiEndpoint + 'metadata/allocation/' + request_id + '/storage/' + child_id;
            return $http.get(get_current_child_object_url).then(handleSuccess, handleError);
        }

        function addChildObject(request_id, child_obj) {
            return $http({
                    url: child_collection_url + request_id + '/storage',
                    method: 'POST',
                    data: child_obj
                }
            ).then(handleSuccess, handleError);
        }

        function updateChildObject(request_id, child_obj) {
            return $http({
                    url: child_collection_url + request_id + '/storage/' + child_obj.id,
                    method: 'PUT',
                    data: child_obj
                }
            ).then(handleSuccess, handleError);
        }

        function getERBLabelList(erb) {
            return $http.get(meta_erb_label_url + erb).then(handleSuccess, handleError);
        }

        function getNextSequenceNumber(erb, label) {
            return $http({
                url: meta_erb_label_url + erb + "/next_seq_num",
                method: 'POST',
                data: {"label_name": label}
            }).then(handleSuccess, handleError);
        }

        function addNewErbLabel(erb, label) {
            return $http({
                url: meta_erb_label_url + erb + "/add",
                method: 'POST',
                data: {"label_name": label}
            }).then(handleSuccess, handleError);
        }

        function getRecentProvId(product_name) {
            return $http.get(recent_prov_id_url + '?productname=' + product_name).then(handleSuccess, handleError);
        }

        //TODO:
        function ListMessagesDay(system_name) {
            return $http.get(message_day_url + system_name + '/admin/').then(handleSuccess, handleError);
        }

        function newMessageDay(message, system_name) {
            var new_message_day_url = message_day_url + system_name + '/admin/';
            return $http({
                    url: new_message_day_url,
                    method: 'POST',
                    data: message
                }
            ).then(handleSuccess, handleError);
        }

        function getUsageAlertsByRequestId(request_id) {
            return $http.get(request_usage_alerts_api_base_url + 'request/' + request_id + '/alerts').then(handleSuccess, handleError);
        }

        function addOrEditUsageAlert(usage_alert_data, request_id) {
            var usage_alert_api_url = request_usage_alerts_api_base_url + 'request/' + request_id + '/alerts';
            var method = 'POST';
            var usage_alert_id = usage_alert_data.id;
            if (usage_alert_id !== undefined && usage_alert_id !== null) {
                usage_alert_api_url = usage_alert_api_url + '/' + usage_alert_id;
                method = 'PUT';
            }
            return $http({
                    url: usage_alert_api_url,
                    method: method,
                    data: usage_alert_data
                }
            ).then(handleSuccess, handleError);
        }

        //check use last login status
        function getLoginStatus() {
            return $http.get(check_login_status_base_url).then(handleSuccess, handleError);
        }

        function handleSuccess(response) {
            return {
                success: true,
                status: response.status,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                status: response.status,
                message: (response.status + " " + response.statusText),
                data: response.data
            };
        }

        function newRacmProjectRequest() {

            return {
                "title": "",
                "description": "",
                "project_question_responses": [],
                "institutions": [],
                "publications": [],
                "grants": [],
                "project_ids": [],
                "project_contacts": [],
                "domains": [],
                "requests": [
                    {
                        "compute_requests": [],
                        "storage_requests": [
                            {
                                "current_quota": 0,
                                "requested_quota_change": 0,
                                "requested_quota_total": 0,
                                "approved_quota_change": 0,
                                "approved_quota_total": 0,
                                "storage_product": {
                                    "id": 0
                                },
                                "storage_question_responses": []
                            }
                        ],
                        "request_question_responses": [
                            {
                                "question_response": 'Yes',
                                "question": {
                                    "key": "racm_authorization"
                                }
                            },
                            {
                                "question_response": 5,
                                "question": {
                                    "key": "racm_data_retention_period"
                                }
                            },
                            {
                                "question_response": null,
                                "question": {
                                    "key": "racm_electronic_inf_class"
                                }
                            },
                            {
                                "question_response": 0,
                                "question": {
                                    "key": "racm_current_size"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_data_migration_src"
                                }
                            },
                            {
                                "question_response": null,
                                "question": {
                                    "key": "racm_data_migration_assistance"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_current_access_method"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_preferred_access_method"
                                }
                            },
                            {
                                "question_response": null,
                                "question": {
                                    "key": "racm_only_copy"
                                }
                            },
                            {
                                "question_response": null,
                                "question": {
                                    "key": "racm_can_be_regenerated"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_loss_impact"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_privacy_q1"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "racm_privacy_q2"
                                }
                            },
                            {
                                "question_response": "No",
                                "question": {
                                    "key": "racm_privacy_q3"
                                }
                            }
                        ],
                        "request_status": {
                            "id": 1,
                            "code": "N",
                            "status": "New Draft"
                        },
                        "funding_scheme": {
                            "id": 0
                        },
                        "e_research_system": {
                            "name": ENV.system,
                            "e_research_body": ENV.erb
                        },
                        "start_date": new Date().toISOString().substring(0, 10),
                        "end_date": "9999-12-31",
                        "approval_notes": "",
                        "sent_email": true,
                        "historic": false,
                        "data_sensitive": null
                    }
                ],
                "department": {
                    "department": null,
                    "faculty": null,
                    "organisation": null
                }
            };
        }

        function emptyRaCMonRequestQuestionResponse() {
            return [
                {
                    "question_response": 0,
                    "question": {
                        "key": "racm_authorization"
                    }
                },
                {
                    "question_response": 0,
                    "question": {
                        "key": "racm_data_retention_period"
                    }
                },
                {
                    "question_response": null,
                    "question": {
                        "key": "racm_electronic_inf_class"
                    }
                },
                {
                    "question_response": 0,
                    "question": {
                        "key": "racm_current_size"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_data_migration_src"
                    }
                },
                {
                    "question_response": null,
                    "question": {
                        "key": "racm_data_migration_assistance"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_current_access_method"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_preferred_access_method"
                    }
                },
                {
                    "question_response": null,
                    "question": {
                        "key": "racm_only_copy"
                    }
                },
                {
                    "question_response": null,
                    "question": {
                        "key": "racm_can_be_regenerated"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_loss_impact"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_privacy_q1"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "racm_privacy_q2"
                    }
                },
                {
                    "question_response": "No",
                    "question": {
                        "key": "racm_privacy_q3"
                    }
                }
            ];
        }

        function newHPCProjectRequest() {

            return {
                "title": "",
                "description": "",
                "project_question_responses": [
                    {
                        "question_response": "",
                        "question": {
                            "key": "hpc_seo_question"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_report_question"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_survey_question"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_privacy_q1"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_privacy_q2"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_privacy_q3"
                        }
                    },
                    {
                        "question_response": "No",
                        "question": {
                            "key": "hpc_privacy_q4"
                        }
                    }

                ],
                "institutions": [],
                "publications": [],
                "grants": [],
                "project_ids": [],
                "project_contacts": [],
                "domains": [],
                "requests": [
                    {
                        "compute_requests": [
                            {
                                "instances": 1,
                                "approved_instances": 0,
                                "cores": 1,
                                "approved_cores": 0,
                                "core_hours": 1000,
                                "approved_core_hours": 0,
                                "compute_product": {
                                    "id": 0
                                }
                            }
                        ],
                        "storage_requests": [
                            {
                                "quota": 0,
                                "approved_quota": 0,
                                "storage_product": {
                                    "id": 0
                                },
                                "storage_question_responses": []
                            }
                        ],
                        "request_question_responses": [
                            {
                                "question_response": "Monash",
                                "question": {
                                    "key": "hpc_alloc_share"
                                }
                            },
                            {
                                "question_response": "Reason 1",
                                "question": {
                                    "key": "hpc_reason_for_req"
                                }
                            },
                            {
                                "question_response": "",
                                "question": {
                                    "key": "hpc_additional_requirements"
                                }
                            },
                            {
                                "question_response": "Yes",
                                "question": {
                                    "key": "hpc_cluster_required"
                                }
                            }
                        ],
                        "request_status": {
                            "id": 1,
                            "code": "N",
                            "status": "New Draft"
                        },
                        "e_research_system": {
                            "name": "MASSIVE",
                            "e_research_body": "HPC"
                        },
                        "start_date": new Date().toISOString().substring(0, 10),
                        "end_date": "9999-12-31",
                        "approval_notes": "",
                        "parent_request": null
                    }
                ]
            };
        }

        function emptyHPCRequest() {
            return {
                "compute_requests": [
                    {
                        "instances": 1,
                        "approved_instances": 0,
                        "cores": 1,
                        "approved_cores": 0,
                        "core_hours": 1000,
                        "approved_core_hours": 0,
                        "compute_product": {
                            "id": 0
                        }
                    }
                ],
                "storage_requests": [
                    {
                        "quota": 0,
                        "approved_quota": 0,
                        "storage_product": {
                            "id": 0
                        },
                        "storage_question_responses": []
                    }
                ],
                "request_question_responses": [
                    {
                        "question_response": "Monash",
                        "question": {
                            "key": "hpc_alloc_share"
                        }
                    },
                    {
                        "question_response": "Reason 1",
                        "question": {
                            "key": "hpc_reason_for_req"
                        }
                    },
                    {
                        "question_response": "",
                        "question": {
                            "key": "hpc_additional_requirements"
                        }
                    },
                    {
                        "question_response": "Yes",
                        "question": {
                            "key": "hpc_cluster_required"
                        }
                    }
                ],
                "request_status": {
                    "id": 1,
                    "code": "N",
                    "status": "New Draft"
                },
                "e_research_system": {
                    "name": "MASSIVE",
                    "e_research_body": "HPC"
                },
                "start_date": new Date().toISOString().substring(0, 10),
                "end_date": "9999-12-31",
                "approval_notes": "",
                "parent_request": null
            };
        }

        function emptyHPCStorageRequest() {
            return [
                {
                    "quota": 0,
                    "approved_quota": 0,
                    "storage_product": {
                        "id": 0
                    },
                    "storage_question_responses": []
                }
            ];
        }

        return service;
    }

})();
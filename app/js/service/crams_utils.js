/**
 * Created by simonyu on 2/02/16.
 */

(function () {
    'use strict';
    angular.module('crams').factory('CramsUtils', CramsUtils);
    CramsUtils.$inject = [];

    function CramsUtils() {

        var service = {};
        service.sortQuestionResponseInFormOrder = sortQuestionResponseInFormOrder;
        service.sortRacmReqQuestionResponseInFormOrder = sortRacmReqQuestionResponseInFormOrder;
        service.isUserInfoCompleted = isUserInfoCompleted;
        service.sortProjectContactsInFormOrder = sortProjectContactsInFormOrder;
        return service;

        // sort question response in form order
        function sortQuestionResponseInFormOrder(alloc) {
            var question_responses = {};
            var sorted_project_question_responses = [];
            var project_question_response_list = alloc.project_question_responses;
            var proj_question_keys = ['additionalresearchers', 'nectarvls', 'ncris'];
            _.each(proj_question_keys, function (key) {
                var proj_question_response = find_question_response(project_question_response_list, key);
                if (proj_question_response !== undefined) {
                    sorted_project_question_responses.push(proj_question_response);
                }
            });

            question_responses['project_question_responses'] = sorted_project_question_responses;

            var sorted_req_question_responses = [];
            var req_question_response_list = alloc.requests[0].request_question_responses;
            var req_question_keys = ['duration', 'ptconversion', 'researchcase', 'usagepattern', 'homenode',
                'homerequirements', 'estimatedusers'];
            _.each(req_question_keys, function (key) {
                var req_question_response = find_question_response(req_question_response_list, key);
                if (req_question_response !== undefined) {
                    sorted_req_question_responses.push(req_question_response);
                }
            });
            question_responses['request_question_responses'] = sorted_req_question_responses;
            return question_responses;
        }

        // sort project contacts by specified filter and role
        function sortProjectContactsInFormOrder(alloc, filter_field) {
            let project_contacts = alloc.project_contacts;

            // sort by the specified field
            let sorted_name = project_contacts.sort(function (a, b) {
                if (a.contact[filter_field] < b.contact[filter_field]) {
                    return -1;
                }
                if (a.contact[filter_field] > b.contact[filter_field]) {
                    return 1;
                }
                return 0;
            });

            // and then sort by the contact role
            return sorted_name.sort(function (a, b) {
                if (a.contact_role < b.contact_role) {
                    return -1;
                }
                if (a.contact_role > b.contact_role) {
                    return 1;
                }
                return 0;
            });
        }

        // sort question response in form order
        function sortRacmReqQuestionResponseInFormOrder(alloc) {
            var question_responses = {};
            var sorted_req_question_responses = [];
            var req_question_response_list = alloc.requests[0].request_question_responses;
            var req_question_keys = ['racm_authorization', 'racm_data_retention_period', 'racm_electronic_inf_class',
                'racm_current_size', 'racm_data_migration_src', 'racm_data_migration_assistance', 'racm_current_access_method',
                'racm_preferred_access_method', 'racm_only_copy', 'racm_can_be_regenerated', 'racm_loss_impact',
                'racm_privacy_q1', 'racm_privacy_q2', 'racm_privacy_q3'];

            // before sorting first check for missing request question responses
            // and added the missing question response back in
            if (req_question_response_list.length !== req_question_keys.length) {
                // find all missing questions responses
                let missing_qu_resp = [];
                for (let i = 0; i < req_question_keys.length; i++) {
                    let req = find_question_response(req_question_response_list, req_question_keys[i]);
                    if (req === undefined) {
                        missing_qu_resp.push(req_question_keys[i]);
                    }
                }
                // add missing questions responses back
                for (let i = 0; i < missing_qu_resp.length; i++) {
                    var missing_qr = {
                        "question_response": "",
                        "question": {
                            "key": missing_qu_resp[i]
                        }
                    };
                    if (missing_qu_resp[i] === 'racm_current_size') {
                        missing_qr = {
                            "question_response": 0,
                            "question": {
                                "key": missing_qu_resp[i]
                            }
                        };
                    }
                    if (missing_qu_resp[i] === 'racm_data_retention_period') {
                        missing_qr = {
                            "question_response": 5,
                            "question": {
                                "key": missing_qu_resp[i]
                            }
                        };
                    }

                    req_question_response_list.push(missing_qr);
                }
            }

            _.each(req_question_keys, function (key) {
                var req_question_response = find_question_response(req_question_response_list, key);
                if (req_question_response !== undefined) {
                    sorted_req_question_responses.push(req_question_response);
                }
            });
            question_responses['request_question_responses'] = sorted_req_question_responses;
            return question_responses;
        }

        function find_question_response(question_response_list, key) {
            var found_question_resp = _.find(question_response_list, function (question_resp) {
                var question_key = question_resp.question.key;
                if (question_key === key) {
                    return question_resp;
                }
            });
            return found_question_resp;
        }

        function isUserInfoCompleted(contact) {

            var given_name = contact.given_name;
            var surname = contact.surname;
            var email = contact.email;
            var phone = contact.phone;
            var organisation = contact.organisation;

            var isCompleted = true;
            if (given_name === undefined || given_name === '' || given_name === null) {
                isCompleted = false;
            }
            if (surname === undefined || surname === '' || surname === null) {
                isCompleted = false;
            }
            if (email === undefined || email === '' || email === null) {
                isCompleted = false;
            }
            if (phone === undefined || phone === '' || phone === null || phone === '0') {
                isCompleted = false;
            }
            if (organisation === undefined || organisation === '' || organisation === null) {
                isCompleted = false;
            }
            return isCompleted;
        }
    }
})();
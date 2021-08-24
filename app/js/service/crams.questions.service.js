/**
 * Created by simonyu on 11/05/16.
 */

(function () {
    'use strict';
    angular.module('crams').factory('CramsQuestionsService', CramsQuestionsService);
    CramsQuestionsService.$inject = ['$log'];
    function CramsQuestionsService($log) {
        var service = {};
        service.getQuestion = getQuestion;
        service.getHpcQuestion = getHpcQuestion;

        function getQuestion(question_key) {
            return _.findWhere(vn_questions, {'key': question_key});
        }

        function getHpcQuestion(question_key) {
            return _.findWhere(hpc_questions, {'key': question_key});
        }

        var hpc_questions = angular.fromJson(
            [
                {
                    "key": "hpc_seo_question",
                    "question": ""
                },
                {
                    "key": "hpc_alloc_share",
                    "question": "Which share of MASSIVE you are requesting allocation from?",
                    "choices": {
                        1: "Monash",
                        2: "ANSTO",
                        3: "CSIRO",
                        4: "ARC Centre of Excellence for Integrative Brain Function",
                        5: "ARC Centre of Excellence in Advanced Molecular Imaging"
                    }
                },
                {
                    "key": "hpc_reason_for_req",
                    "question": "Reason for requesting",
                    "choices": {
                        1: "Reason 1",
                        2: "Reason 2",
                        3: "Reason 3",
                        4: "others"
                    }
                },
                {
                    "key": "hpc_additional_requirements",
                    "question": "Do you have any additional requirements?"
                },
                {
                    "key": "hpc_cluster_required",
                    "question": "Do you need a personal cluster account to run jobs or use the desktop?",
                    "choices": ["Yes", "No"]
                },
                // section 4
                {
                    "key": "hpc_report_question",
                    "question": "I agree to submit a yearly project report",
                    "choices": {
                        1: "Yes",
                        2: "No"
                    }
                },
                {
                    "key": "hpc_survey_question",
                    "question": "I agree to participate in the yearly survey",
                    "choices": {
                        1: "Yes",
                        2: "No"
                    }
                },
                // section 5
                {
                    "key": "hpc_privacy_q1",
                    "question": "Publish this information on VicNode database which will eventually turn into a dashboard for you to view information about your collection",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "hpc_privacy_q2",
                    "question": "Contacting you from time to time to improve our service and/or let you know about any service interruptions, changes or updates",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "hpc_privacy_q3",
                    "question": "Creating metadata records which may be sent to the your organisation to enable research discovery by public users through the RDA portal",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "hpc_privacy_q4",
                    "question": "Adding your collection name and list you as a data custodian to the VicNode website",
                    "choices": {1: "Yes", 2: "No"}
                }
            ]
        );

        var vn_questions = angular.fromJson(
            [
                {
                    "key": "vn_authorization",
                    "question": "Please confirm that you have the authority to store this collection on VicNode infrastructure.",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_data_migration_src",
                    "question": "Where is the collection currently stored?"
                },
                {
                    "key": "vn_data_migration_assistance",
                    "question": "Do you require assistance to migrate your data?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_current_access_method",
                    "question": "How do you or your users currently access your collection?"
                },
                {
                    "key": "vn_preferred_access_method",
                    "question": "What is your preferred access method?"
                },
                {
                    "key": "vn_data_format",
                    "question": "Identify the format(s) of the data to be stored on VicNode."
                },
                {
                    "key": "vn_only_copy",
                    "question": "Will VicNode be hosting the only copy of the collection?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_can_be_regenerated",
                    "question": "If yes, how easily can the data be regenerated?",
                    "choices": {
                        1: "Fully Replaceable",
                        2: "Replaceable by equivalent data",
                        3: "Irreplaceable",
                        4: "Uncertain"
                    }
                },
                {
                    "key": "vn_loss_impact",
                    "question": "What would be the impact and/or cost incurred if data is lost?"
                },
                {
                    "key": "vn_privacy_q1",
                    "question": "Publish this information on VicNode database which will eventually turn into a dashboard for you to view information about your collection",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_privacy_q2",
                    "question": "Contacting you from time to time to improve our service and/or let you know about any service interruptions, changes or updates",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_privacy_q3",
                    "question": "Creating metadata records which may be sent to the your organisation to enable research discovery by public users through the RDA portal",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_privacy_q4",
                    "question": "Adding your collection name and list you as a data custodian to the VicNode website",
                    "choices": {1: "Yes", 2: "No"}
                },

                {
                    "key": "crams_demo_authorization",
                    "question": "Please confirm that you have the authority to store this collection on [Your Organisation] infrastructure.",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "crams_demo_data_retention_period",
                    "question": "Data Retention Period (Year)?"
                },
                {
                    "key": "crams_demo_electronic_inf_class",
                    "question": "Electronic Information Classification",
                    "choices": {
                        1: "Critical",
                        2: "Protected",
                        3: "Restricted",
                        4: "Public"
                    }
                },
                {
                    "key": "crams_demo_data_migration_src",
                    "question": "Where is the collection currently stored?"
                },
                {
                    "key": "crams_demo_data_migration_assistance",
                    "question": "Do you require assistance to migrate your data?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "crams_demo_current_access_method",
                    "question": "How do you or your users currently access your collection?"
                },
                {
                    "key": "crams_demo_preferred_access_method",
                    "question": "What is your preferred access method?"
                },
                {
                    "key": "crams_demo_data_format",
                    "question": "Identify the format(s) of the data to be stored on [Your Organisation]."
                },
                {
                    "key": "crams_demo_only_copy",
                    "question": "Will [Your Organisation] be hosting the only copy of the collection?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "crams_demo_can_be_regenerated",
                    "question": "If yes, how easily can the data be regenerated?",
                    "choices": {
                        1: "Fully Replaceable",
                        2: "Replaceable by equivalent data",
                        3: "Irreplaceable",
                        4: "Uncertain"
                    }
                },
                {
                    "key": "crams_demo_loss_impact",
                    "question": "What would be the impact and/or cost incurred if data is lost?"
                },
                {
                    "key": "crams_demo_privacy_q1",
                    "question": "Publish the information on this dashboard for you to view details about your collection",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "crams_demo_privacy_q2",
                    "question": "Contacting you from time to time to improve our service and/or let you know about any service interruptions, changes or updates",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "crams_demo_privacy_q3",
                    "question": "Creating metadata records which may be sent to the your organisation to enable research discovery by public users through the <a href='http://www.researchdata.ands.org.au' target='_blank'>RDA portal</a>",
                    "choices": {1: "Yes", 2: "No"}
                }
            ]
        );

        return service;
    }
})();
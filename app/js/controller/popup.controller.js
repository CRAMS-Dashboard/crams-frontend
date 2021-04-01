/**
 * Created by simonyu on 26/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('PopupController', PopupController);
    PopupController.$inject = ['$scope'];
    function PopupController($scope) {
        $scope.showModal = false;
        $scope.showHelp = function () {
            $scope.showModal = !$scope.showModal;
        };

        $scope.showCreateContact = function () {
            $scope.showModal = !$scope.showModal;
        };

        $scope.showApproveRequest = function () {
            $scope.showModal = !$scope.showModal;
        };

        $scope.showDeclineRequest = function () {
            $scope.showModal = !$scope.showModal;
        };

        $scope.help = helpText();
    }

    function helpText() {
        return {
            "project_identifier": {
                "title": "Project Identifier",
                "text": ["A short name used to identify your project.<br/>Letters, numbers, underscores and hyphens ",
                    "only.<br/>Must start with a letter and be less than 32 characters."].join("")
            },
            "project_description": {
                "title": "Project Allocation Title",
                "text": "A human-friendly descriptive name for your research project."
            },
            "requester_contact": {
                "title": "Contact email",
                "text": ["<p>The email address provided by your IdP which will be used to communicate with ",
                    "you about this allocation request.</p>  <strong>Note:</strong> <i>if this is not a valid email ",
                    "address you will not receive communications on any allocation request you make</i>. ",
                    "If invalid please contact your IdP and ask them to correct your email address!"].join("")
            },
            "start_date": {
                "title": "Start Date",
                "text": "The day on which you want your project allocation to go live. Format: yyyy-mm-dd "
            },
            "estimated_duration": {
                "title": "Estimated Project Duration",
                "text": ["Resources are approved for at most 12-months, but projects can extend a request for ",
                    "resources once it has been approved. "].join("")
            },
            "convert_project_trial": {
                "title": "Convert Trial Project?",
                "text": ["If selected, your existing trial project pt- will be renamed ",
                    "so any resources inside it will become part of this new allocation. ",
                    "A new trial project will be created in its place."].join("")
            },
            "instances": {
                "title": "Number Of Virtual Machine Instances",
                "text": ["The maximum number of virtual machine instances that you think your project will ",
                    "require at any one time."].join("")
            },
            "cores": {
                "title": "Number Of Cores",
                "text": ["This is the maximum number of cores you'd like to use at any one time across all ",
                    "virtual machines. For example, if you'd like to be able to run two 'XXL Sized' VMs at once ",
                    "(each has 16 CPU cores), you should specify 32 here."].join("")
            },
            "core_hours": {
                "title": "Number Of Core Hours",
                "text": ["<p>Core hours is the number of hours multiplied by the number of cores in use. ",
                    "The default value in this field is half of the core hours required to run all of the ",
                    "cores requested over the estimated project period. This should be adjusted up or down ",
                    "as required.</p>",
                    "For example:",
                    "<ul>",
                    "<li> * A 1-core Virtual Machine will use 24 core hours each day it is used</li>",
                    "<li> * A 2-core Virtual Machine will use 48 core hours each day it is used</li>",
                    "<li> * A 4-core Virtual Machine will use 96 core hours each day it is used</li>",
                    "<li> * A 8-core Virtual Machine will use 192 core hours each day it is used</li>",
                    "</ul>"].join("")
            },
            "nectar_sp": {
                "title": "Storage Product",
                "text": "Please select the storage product."
            },
            "nectar_sp_quota": {
                "title": "Storage Quota",
                "text": "Specify the total size in gigabytes that the project will need"
            },
            "publication": {
                "title": "Publication/Output",
                "text": ["Please provide any traditional and non-traditional research outputs using a citation style ",
                    "text reference for each. eg. include article/title, journal/outlet, year, ",
                    "DOI/link if available. "].join("")
            },
            "supported_institution": {
                "title": "Supported Institutions",
                "text": ["List the Australian research institutions and universities supported by this application. ",
                    "If this application is just for you, just write the name of your institution or university. ",
                    "If you are running a public web service list the Australian research institutions and ",
                    "universities that you think will benefit most"].join("")
            },
            "chief_investigator": {
                "title": "Chief Investigator",
                "text": ["Please search for a chief investigator. If none of them is available, ",
                    "please create a new contact as a chief investigator"].join("")
            },
            "additional_researchers": {
                "title": "Other primary investigators, partner investigators and research collaborators",
                "text": ["list all other primary investigators, partner investigators and ",
                    "other research collaborators"].join("")
            },
            "use_case": {
                "title": "Research Use Case",
                "text": ["A short write up on how you intend to to use your cloud virtual machine instances ",
                    "will help us in our decision making."].join("")
            },
            "usage_pattern": {
                "title": "Virtual Machine Instances, Object Storage and Volumes Storage Usage Patterns",
                "text": ["Will your project have many users and small data sets? Or will it have large data ",
                    "sets with a small number of users? Your answers here will help us."].join("")
            },
            "alloc_home": {
                "title": "Allocation Home Location",
                "text": ["You can provide a primary location where you expect to use most resources, effectively ",
                    "the main NeCTAR Node for your allocation. Use of other locations is still possible. This can ",
                    "also indicate a specific arrangement with a NeCTAR Node, for example where you obtain support, ",
                    "or if your institution is a supporting member of that Node. "].join("")
            },
            "estimated_users": {
                "title": "Estimated Number of Users",
                "text": "Estimated number of users, researchers and collaborators to be supported by the allocation."
            },
            "additional_location": {
                "title": "Additional Location Requirements",
                "text": ["Are there any geographic requirements governing your cloud virtual machine instances? ",
                    "For example, should they only be run on a Node in a specific state, or can they be run on any ",
                    "available Node? If you leave this blank we will assume that any Node is acceptable."].join("")
            },
            "grant_type": {
                "title": "Type",
                "text": "Choose the grant type from the dropdown options."
            },
            "funding_body_scheme": {
                "title": "Funding Body and Scheme",
                "text": "For example, ARC Discovery Project."
            },
            "grant_id": {
                "title": "Grant ID",
                "text": "Please enter the grant id."
            },
            "start_year": {
                "title": "First Year Funded",
                "text": "Please enter the first year funded"
            },
            "total_funding": {
                "title": "Total Funding (AUD)",
                "text": "Total funding amount in AUD."
            },
            "nectar_support": {
                "title": "List any NeCTAR Virtual Laboratories supporting this request",
                "text": "Specify any NeCTAR Virtual Laboratories supporting this request."
            },
            "ncris_support": {
                "title": "List NCRIS capabilities supporting this request",
                "text": "Specify NCRIS capabilities supporting this request."
            },
            "decline_reason": {
                "title": "Reason",
                "text": "A brief explanation of the reason the request has been sent back to the user for changes."
            },
            "approve_comment": {
                "title": "Comment",
                "text": "Approver comment."
            },
            "electronic_inf_class": {
                "title": "Electronic Information Classification",
                "text": ["<p>Classification Definitions:</p>",
                    "<ul>",
                    "<li> <b>Public</b>: Information that may result in an Insignificant impact from disclosure event.</li>",
                    "<li> <b>Restricted</b>: Information that may result in a Minor impact from disclosure event.</li>",
                    "<li> <b>Protected</b>: Information that may result in a Moderate impact from disclosure event.</li>",
                    "<li> <b>Critical</b>: Information that may result in a Catastrophic or Major impact from disclosure event.</li>",
                    "</ul>"].join("")
            }
        };
    }
})();

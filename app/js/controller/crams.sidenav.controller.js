(function () {
    'use strict';
    angular.module('crams').controller('SideNavController', SideNavController);

    SideNavController.$inject = ['$rootScope', '$scope', '$location', '$route'];

    function SideNavController($rootScope, $scope, $location, $route) {
        $rootScope.nav = {};

        $scope.isAllocExpanded = false;
        $scope.isAppExpanded = false;
        $scope.isAdminExpanded = false;
        $scope.isSoftwareExpanded = false;
        $scope.isProvisionExpanded = false;
        $scope.isReportExpanded = false;
        $scope.isReviewExpanded = false;

        $scope.isAllocSelected = false;
        $scope.isAppSelected = false;
        $scope.isProvSelected = false;
        $scope.isAdminSelected = false;
        $scope.isRepSelected = false;
        $scope.isReviewSelected = false;

        $scope.isCurrentPath = function (paths) {

            var current_paths = $location.path().split('/');
            var path_lens = current_paths.length;
            var isCurrentPath = false;
            var first_path = '';

            // alert('---- path lens: ' + path_lens);
            if (path_lens === 2) {
                first_path = current_paths[1];
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: first_path,
                    first_level_title: findTitleByPath(first_path),
                    has_second_level: false,
                    second_level_title: null,
                    has_third_level: false,
                    third_level_title: null,
                    has_fourth_level: false,
                    fourth_level_title: null
                };

                if (first_path === '') {
                    $rootScope.nav.has_first_level = false;
                }
            }

            if (path_lens === 3) {
                first_path = current_paths[1];
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: first_path,
                    first_level_title: findTitleByPath(first_path),
                    has_second_level: true,
                    second_level_title: findTitleByPath(current_paths[2]),
                    has_third_level: false,
                    third_level_title: null,
                    has_fourth_level: false,
                    fourth_level_title: null
                };

                isCurrentPath = first_path + '/' + current_paths[2] === paths;

                if (first_path === 'project_membership') {
                    $rootScope.nav.has_second_level = false;
                    $rootScope.nav.second_level_title = null;
                }
            }

            if (path_lens === 4) {
                first_path = current_paths[1];
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: first_path,
                    first_level_title: findTitleByPath(first_path),
                    has_second_level: true,
                    second_level_title: findTitleByPath(current_paths[2]),
                    has_third_level: false,
                    third_level_title: null,
                    has_fourth_level: false,
                    fourth_level_title: null
                };

                var level_3_title = findTitleByPath(current_paths[3]);
                if (level_3_title !== undefined && level_3_title !== '' && first_path !== 'reports') {
                    $rootScope.nav.has_third_level = true;
                    $rootScope.nav.third_level_title = level_3_title;
                }

                isCurrentPath = first_path + '/' + current_paths[2] === paths;
                if (current_paths[2] === 'reviews') {
                    isCurrentPath = first_path + '/' + current_paths[2] + '/' + current_paths[3] === paths;
                }
            }

            if (path_lens >= 5) {
                first_path = current_paths[1];
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: first_path,
                    first_level_title: findTitleByPath(first_path),
                    has_second_level: true,
                    second_level_title: findTitleByPath(current_paths[2]),
                    has_third_level: false,
                    third_level_title: null,
                    has_fourth_level: false,
                    fourth_level_title: null
                };

                var third_level_title = findTitleByPath(current_paths[3]);
                if (third_level_title !== undefined && third_level_title !== '') {
                    $rootScope.nav.has_third_level = true;
                    $rootScope.nav.third_level_title = third_level_title;
                }

                var fourth_level_title = findTitleByPath(current_paths[4]);
                if (fourth_level_title !== undefined && fourth_level_title !== '') {
                    $rootScope.nav.has_fourth_level = true;
                    $rootScope.nav.fourth_level_title = fourth_level_title;
                }

                isCurrentPath = first_path + '/' + current_paths[2] === paths;

            }

            // to identify the sidebar collapsible
            if (first_path === 'allocations') {
                $scope.isAllocExpanded = true;
                $scope.isAllocSelected = true;
            }
            if (first_path === 'admin') {
                $scope.isAdminExpanded = true;
                $scope.isAdminSelected = true;
            }
            if (first_path === 'software_agreements') {
                $scope.isSoftwareExpanded = true;
                $scope.isSoftwareSelected = true;
            }
            if (first_path === 'approval') {
                $scope.isAppExpanded = true;
                $scope.isAppSelected = true;
            }
            if (first_path === 'provision') {
                $scope.isProvisionExpanded = true;
                $scope.isProvSelected = true;
            }
            if (first_path === 'reports') {
                $scope.isReportExpanded = true;
                $scope.isRepSelected = true;
            }

            if (current_paths[2] !== undefined && current_paths[2] === 'reviews') {
                // if (current_paths[2].includes('review')) {
                $scope.isReviewExpanded = true;
                $scope.isReviewSelected = true;
            }

            return isCurrentPath;
        };

        function findTitleByPath(path) {
            var nav_bar_titles = {
                "dashboard": "Collection Custodian Dashboard",
                "allocations": "Allocations",
                "racmon_request": "New Request",
                "edit_request": "Edit Request",
                "view_request": "View Request",
                "contact_us": "Contact Us",
                "approval": "Approval",
                "approved": "Being Provisioned",
                "active": "Provisioned Allocations",
                "expired": "Expired Allocations",
                "approve_request": "Approve Request",
                "approve_racmon_request": "Approve Request",
                "decline_racmon_request": "Decline Request",
                "provision": "Provision",
                "racmon_provision": "Provisioning Request",
                "sp": "Storage Products",
                "org": "Organisations",
                "new_org": "New Organisation",
                "edit_org": "Edit Organisation",
                "contacts": "Contacts",
                "edit_contact": "Edit Contact",
                "view_contact": "Contact Profile",
                "history": "History",
                "reports": "Reports",
                "prod_demand": "Product Capacity Supply-demand Summary Report",
                "prod_usage": "Product Usage Report",
                "fund_alloc_costs": "Funding Accounts Allocation Costs Summary",
                "storage_transaction": "Storage Transaction Records Report",
                "collection_ingest": "Collection Ingestion Report",
                "alloc_custodian": "Allocation Contact Information Report",
                "faculty_usage": "Faculty Usage",
                "settings": "Settings",
                "terms_conditions": "Terms and Conditions",
                "login": "Login",
                "action_error": "Action Error",
                "admin": "Admin",
                "faculty": "Faculty Management",
                "merc_admin": "MeRC Management",
                "view_allocation": "View Allocation",
                "edit_racmon_request": "Edit Request",
                "team_member": "Team Member",
                "message_day": "Message of the day",
                "child_objects": "Child Objects",
                "project_membership": "Project Membership",
                "add": "Adding",
                "update": "Updating",
                "storage_stats": "Storage Stats",
                "faculty_usage_history": "Faculty Usage History Report",
                "project_usage_history": "Project Usage History Report",
                "reviews": "Allocation Reviews",
                "pending": "Pending Reviews",
                "skipped": "Skipped Reviews",
                "sent": "Sent Reviews",
                "new": "New",
                "usage_alerts": "Usage Alerts",
                "event_logs": "Event Logs"
            };
            return nav_bar_titles[path];
        }
    }
})();
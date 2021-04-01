(function () {
    'use strict';
    angular.module('crams', ['ngRoute', 'ngCookies', 'ngResource', 'ui.router', 'ui.bootstrap', 'ngSanitize', 'ngDialog', 'cramsConfig', 'ngCsv', 'ngTextTruncate', 'ngMaterial', 'ngMessages', 'LocalStorageModule', 'tbNumfilters', 'numCommasfilters', 'checklist-model', 'textAngular'])
        .config(config)
        .run(run);

    config.$inject = ['$httpProvider', '$routeProvider', '$locationProvider', 'localStorageServiceProvider', 'ENV'];

    function config($httpProvider, $routeProvider, $locationProvider, localStorageServiceProvider, ENV) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        //disable cache
        $httpProvider.defaults.headers['Cache-Control'] = 'no-cache, must-revalidate';
        $httpProvider.defaults.headers.Pragma = 'no-cache';
        //remove the hash-prefix exclamation mark in the url if using angular1.6
        $locationProvider.hashPrefix('');
        //localStorageServiceProvider.setPrefix('crams').setStorageType('sessionStorage');
        // localStorageServiceProvider.setPrefix('crams-fe');

        // get the theme from ENV object
        var theme = ENV.theme;
        var redirect = '/allocations';
        // provide an interceptor to checkout 401 error:
        $httpProvider.interceptors.push(function ($q, $location, $rootScope, FlashService) {
            return {
                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        var msg = rejection.data.detail;
                        $rootScope.token_expired = true;
                        $rootScope.globals.isLoggedIn = false;
                        // clean any previous login status first if any
                        // empty the globals in rootScope
                        $rootScope.globals = {};
                        // remove the globals from cookie
                        // localStorageService.remove('globals');
                        window.localStorage.removeItem('crams-fe');
                        // force to login again
                        $location.path('/login');
                        // $location.path('/allocations');
                        // FlashService.Error(msg, true);
                    }
                    return $q.reject(rejection);
                }
            };
        });

        $routeProvider
            .when('/dashboard', {
                controller: "DashboardController",
                templateUrl: 'templates/crams_show_dashboard.html',
                controllerAs: 'vm'
            })
            .when('/dashboard/:type_admin', {
                controller: "DashboardController",
                templateUrl: 'templates/crams_show_dashboard.html',
                controllerAs: 'vm'
            })
            .when('/login', {
                controller: ENV.auth,
                templateUrl: 'templates/' + theme + '/show_aaf_login.html',
                controllerAs: 'vm'
            })
            .when('/ks-login', {
                controller: "KsLoginController",
                templateUrl: 'templates/crams_ks_login.html',
                controllerAs: 'vm'
            })
            .when('/crams-login', {
                controller: "CRAMSLoginController",
                templateUrl: 'templates/crams_login.html',
                controllerAs: 'vm'
            })
            .when('/terms_conditions', {
                controller: 'TermConditionController',
                templateUrl: 'templates/' + theme + '/show_terms_and_conditions.html',
                controllerAs: 'vm'
            })
            .when('/action_error', {
                controller: 'CramsErrorController',
                templateUrl: 'templates/crams_show_action_error.html',
                controllerAs: 'vm'
            })
            .when('/allocations', {
                controller: 'CramsMyAllocationsController',
                templateUrl: 'templates/crams_list_my_allocations.html',
                controllerAs: 'vm'
            })
            .when('/allocations/collection/:crams_id', {
                controller: 'CramsCramsIdViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })
            .when('/allocations/view_request/:request_id', {
                controller: 'CramsAllocationViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })
            .when('/allocations/view_allocation/:project_id', {
                controller: 'CramsProjectViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })
            .when('/allocations/history/:id', {
                controller: 'CramsAllocHistoryController',
                templateUrl: 'templates/crams_view_allocation_history.html',
                controllerAs: 'vm'
            })
            .when('/allocations/racmon_request', {
                controller: 'RacMonRequestController',
                templateUrl: 'templates/racmon/racm_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/edit_racmon_request/:project_id/:id', {
                controller: 'RacMonRequestController',
                templateUrl: 'templates/racmon/racm_request.html',
                controllerAs: 'vm'
            })

            .when('/allocations/child_objects/:request_id', {
                controller: 'RacMonListChildObjectsController',
                templateUrl: 'templates/racmon/racm_list_child_objects.html',
                controllerAs: 'vm'
            })
            .when('/allocations/child_objects/add/:request_id', {
                controller: 'RacMonAddUpdateChildObjectController',
                templateUrl: 'templates/racmon/racm_add_update_child_object.html',
                controllerAs: 'vm'
            })
            .when('/allocations/child_objects/update/:request_id/:child_id', {
                controller: 'RacMonAddUpdateChildObjectController',
                templateUrl: 'templates/racmon/racm_add_update_child_object.html',
                controllerAs: 'vm'
            })
            .when('/allocations/child_objects/history/:request_id/:child_id', {
                controller: 'RacMonViewChildObjectHistoryController',
                templateUrl: 'templates/racmon/racm_child_object_history.html',
                controllerAs: 'vm'
            })

            .when('/allocations/usage_alerts/:request_id', {
                controller: 'RacMonUsageAlertController',
                templateUrl: 'templates/racmon/racm_show_usage_alerts.html',
                controllerAs: 'vm'
            })
            // contacts
            .when('/admin/contacts', {
                controller: 'CramsListContactsController',
                templateUrl: 'templates/crams_list_contacts.html',
                controllerAs: 'vm'
            })
            .when('/admin/contacts/edit_contact/:contact_id', {
                controller: 'CramsAdminContactController',
                templateUrl: 'templates/crams_update_contact.html',
                controllerAs: 'vm'
            })
            .when('/admin/contacts/view_contact/:contact_id', {
                controller: 'CramsAdminContactController',
                templateUrl: 'templates/crams_view_contact_projects.html',
                controllerAs: 'vm'
            })

            .when('/contacts/view_contact/:contact_id', {
                controller: 'CramsUserContactController',
                templateUrl: 'templates/crams_view_contact_projects.html',
                controllerAs: 'vm'
            })
            .when('/contacts/edit_contact/:contact_id', {
                controller: 'CramsUserContactController',
                templateUrl: 'templates/crams_update_contact.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations', {
                controller: 'CramsAdminAllocationsController',
                templateUrl: 'templates/crams_list_my_allocations.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations/view_allocation/:project_id', {
                controller: 'CramsProjectViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations/collection/:crams_id', {
                controller: 'CramsCramsIdViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations/view_request/:request_id', {
                controller: 'CramsAllocationViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations/history/:id', {
                controller: 'CramsAllocHistoryController',
                templateUrl: 'templates/crams_view_allocation_history.html',
                controllerAs: 'vm'
            })

            .when('/admin/allocations/edit_racmon_request/:project_id/:id', {
                controller: 'RacMonRequestController',
                templateUrl: 'templates/racmon/racm_request.html',
                controllerAs: 'vm'
            })

            .when('/admin/manage_prov_ids/:project_id', {
                controller: 'RacMonManageProvIdsController',
                templateUrl: 'templates/racmon/racm_manage_prov_ids.html',
                controllerAs: 'vm'
            })

            .when('/admin/approve_racmon_request/:request_id', {
                controller: 'RacMonDeclineApproveController',
                templateUrl: 'templates/racmon/racm_approve_request.html',
                controllerAs: 'vm'
            })

            .when('/admin/decline_racmon_request/:request_id', {
                controller: 'RacMonDeclineApproveController',
                templateUrl: 'templates/racmon/racm_decline_request.html',
                controllerAs: 'vm'
            })

            .when('/admin/racmon_provision/:request_id', {
                controller: 'RacMonProvisionController',
                templateUrl: 'templates/racmon/racm_provision_request.html',
                controllerAs: 'vm'
            })

            .when('/admin/sp', {
                controller: 'CramsStorageProdController',
                templateUrl: 'templates/crams_list_storage_products.html',
                controllerAs: 'vm'
            })

            // view list of organisation
            .when('/admin/org', {
                controller: 'CramsOrganisationController',
                templateUrl: 'templates/crams_list_organisations.html',
                controllerAs: 'vm'
            })
            // adding/creating new organisation
            .when('/admin/org/new_org', {
                controller: 'CramsOrganisationController',
                templateUrl: 'templates/crams_create_update_organisation.html',
                controllerAs: 'vm'
            })
            // viewing/editing an organisation
            .when('/admin/org/edit_org/:org_id', {
                controller: 'CramsOrganisationController',
                templateUrl: 'templates/crams_create_update_organisation.html',
                controllerAs: 'vm'
            })

            //TODO: admin child objects
            .when('/admin/allocations/child_objects/:request_id', {
                controller: 'RacMonListChildObjectsController',
                templateUrl: 'templates/racmon/racm_list_child_objects.html',
                controllerAs: 'vm'
            })
            .when('/admin/allocations/child_objects/add/:request_id', {
                controller: 'RacMonAddUpdateChildObjectController',
                templateUrl: 'templates/racmon/racm_add_update_child_object.html',
                controllerAs: 'vm'
            })
            .when('/admin/allocations/child_objects/update/:request_id/:child_id', {
                controller: 'RacMonAddUpdateChildObjectController',
                templateUrl: 'templates/racmon/racm_add_update_child_object.html',
                controllerAs: 'vm'
            })
            .when('/admin/allocations/child_objects/history/:request_id/:child_id', {
                controller: 'RacMonViewChildObjectHistoryController',
                templateUrl: 'templates/racmon/racm_child_object_history.html',
                controllerAs: 'vm'
            })
            // .when('/admin/event_logs', {
            //    controller: 'CramsEventLogsController',
            //    templateUrl: 'templates/crams_event_logs.html',
            //    controllerAs: 'vm'
            // })
            //TODO: End admin child object section
            .when('/admin/allocations/usage_alerts/:request_id', {
                controller: 'RacMonUsageAlertController',
                templateUrl: 'templates/racmon/racm_show_usage_alerts.html',
                controllerAs: 'vm'
            })

            //list requests waiting for approval
            .when('/approval', {
                controller: 'CramsListAllocationsController',
                templateUrl: 'templates/crams_allocations_list.html',
                controllerAs: 'vm'
            })
            //list requests based on status: approved | active | expired
            .when('/approval/:status', {
                controller: 'CramsListAllocationsController',
                templateUrl: 'templates/crams_allocations_list.html',
                controllerAs: 'vm'
            })
            .when('/approval/view_request/:request_id', {
                controller: 'CramsAllocationViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })
            .when('/approval/history/:id', {
                controller: 'CramsAllocHistoryController',
                templateUrl: 'templates/crams_view_allocation_history.html',
                controllerAs: 'vm'
            })
            .when('/approval/edit_racmon_request/:project_id/:id', {
                controller: 'RacMonRequestController',
                templateUrl: 'templates/racmon/racm_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/approve_racmon_request/:request_id', {
                controller: 'RacMonDeclineApproveController',
                templateUrl: 'templates/racmon/racm_approve_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/decline_racmon_request/:request_id', {
                controller: 'RacMonDeclineApproveController',
                templateUrl: 'templates/racmon/racm_decline_request.html',
                controllerAs: 'vm'
            })

            .when('/provision', {
                controller: 'ProvisionListController',
                templateUrl: 'templates/crams_provision_list.html',
                controllerAs: 'vm'
            })

            .when('/provision/racmon_provision/:request_id', {
                controller: 'RacMonProvisionController',
                templateUrl: 'templates/racmon/racm_provision_request.html',
                controllerAs: 'vm'
            })

            .when('/provision/view_request/:request_id', {
                controller: 'CramsAllocationViewController',
                templateUrl: 'templates/crams_view_allocation.html',
                controllerAs: 'vm'
            })

            .when('/provision/history/:id', {
                controller: 'CramsAllocHistoryController',
                templateUrl: 'templates/crams_view_allocation_history.html',
                controllerAs: 'vm'
            })

            .when('/provision/:status', {
                controller: 'CramsListAllocationsController',
                templateUrl: 'templates/crams_allocations_list.html',
                controllerAs: 'vm'
            })

            .when('/team_member', {
                controller: 'RacMonTeamMemberController',
                templateUrl: 'templates/racmon/racm_team_member.html',
                controllerAs: 'vm'
            })

            .when('/reports', {
                controller: 'CramsReportController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/faculty_usage', {
                controller: "FacultyUsageController",
                templateUrl: 'templates/crams_reports_faculty_usage.html',
                controllerAs: 'vm'
            })

            .when('/reports/faculty_usage/:type_admin', {
                controller: "FacultyUsageController",
                templateUrl: 'templates/crams_reports_faculty_usage.html',
                controllerAs: 'vm'
            })

            .when('/reports/faculty_usage_history', {
                controller: "FacultyHistoryUsageController",
                templateUrl: 'templates/crams_reports_faculty_usage_history.html',
                controllerAs: 'vm'
            })

            .when('/reports/faculty_usage_history/:type_admin', {
                controller: "FacultyHistoryUsageController",
                templateUrl: 'templates/crams_reports_faculty_usage_history.html',
                controllerAs: 'vm'
            })

            .when('/reports/project_usage_history', {
                controller: "ProjectHistoryUsageController",
                templateUrl: 'templates/crams_reports_project_usage_history.html',
                controllerAs: 'vm'
            })

            .when('/reports/project_usage_history/:type_admin', {
                controller: "ProjectHistoryUsageController",
                templateUrl: 'templates/crams_reports_project_usage_history.html',
                controllerAs: 'vm'
            })


            .when('/reports/prod_demand', {
                controller: 'CramsReportProductDemandSummaryController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/prod_demand/:type_admin', {
                controller: 'CramsReportProductDemandSummaryController',
                templateUrl: 'templates/crams_prod_demand_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/prod_usage', {
                controller: 'CramsProductUsageReportController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/prod_usage/:type_admin', {
                controller: 'CramsProductUsageReportController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/fund_alloc_costs', {
                controller: 'CramsReportFundAllocationCostsController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/fund_alloc_costs/:type_admin', {
                controller: 'CramsReportFundAllocationCostsController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/storage_transaction', {
                controller: 'CramsReportStorageTransactionsController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/storage_transaction/:type_admin', {
                controller: 'CramsReportStorageTransactionsController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/collection_ingest', {
                controller: 'CramsReportCollectionIngestController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/collection_ingest/:type_admin', {
                controller: 'CramsReportCollectionIngestController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/storage_stats/:type_admin', {
                controller: 'CramsReportStorageStatsController',
                templateUrl: 'templates/crams_storage_stats_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/alloc_custodian', {
                controller: 'CramsReportAllocationContactInfoController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            .when('/reports/alloc_custodian/:type_admin', {
                controller: 'CramsReportAllocationContactInfoController',
                templateUrl: 'templates/crams_reports.html',
                controllerAs: 'vm'
            })

            //project membership
            .when('/project_membership/:project_id', {
                controller: 'RacMonProjectMembershipController',
                templateUrl: 'templates/racmon/racmon_project_membership.html',
                controllerAs: 'vm'
            })

            .when('/contact_us', {
                controller: 'CramsContactUsController',
                templateUrl: 'templates/crams_contact_us.html',
                controllerAs: 'vm'
            })

            .when('/message_day', {
                controller: 'RacMonMessageDayController',
                templateUrl: 'templates/racmon/racmon_message_day.html',
                controllerAs: 'vm'
            })

            // allocation review
            .when('/admin/reviews/pending', {
                controller: 'CramsReviewListController',
                templateUrl: 'templates/crams_review_list.html',
                controllerAs: 'vm'
            })

            .when('/admin/reviews/skipped', {
                controller: 'CramsReviewListController',
                templateUrl: 'templates/crams_review_list.html',
                controllerAs: 'vm'
            })

            .when('/admin/reviews/sent', {
                controller: 'CramsReviewListController',
                templateUrl: 'templates/crams_review_list.html',
                controllerAs: 'vm'
            })

            .when('/admin/reviews/:review_id', {
                controller: 'CramsReviewDetailsController',
                templateUrl: 'templates/crams_review_details.html',
                controllerAs: 'vm'
            })

            .when('/admin/message_day', {
                controller: 'RacMonMessageDayListController',
                templateUrl: 'templates/racmon/racm_list_messages_day.html',
                controllerAs: 'vm'
            })

            .when('/admin/message_day/new', {
                controller: 'RacMonNewMessageDayController',
                templateUrl: 'templates/racmon/racm_new_message_day.html',
                controllerAs: 'vm'
            })
            .otherwise({redirectTo: redirect});
    }

    run.$inject = ['$rootScope', '$location', '$http', '$templateCache', 'localStorageService', 'FlashService', 'ENV'];

    function run($rootScope, $location, $http, $templateCache, localStorageService, FlashService, ENV) {
        // set the theme into rootScope
        $rootScope.theme = ENV.theme;
        $rootScope.system = ENV.system;
        $rootScope.erb = ENV.erb;

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (current !== undefined) {
                //remove the cache for template.
                var tpl_url = current.templateUrl;
                if (tpl_url !== undefined) {
                    $templateCache.remove(current.templateUrl);
                }
            }
            // $templateCache.removeAll();

            //load authenticated token from crams localstorage.
            var crams_localstorage_json_str = window.localStorage.getItem('crams-fe');
            if (crams_localstorage_json_str === null) {
                $rootScope.globals = {};
            } else {
                $rootScope.globals = JSON.parse(crams_localstorage_json_str);
            }

            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common.Authorization = 'Token ' + $rootScope.globals.currentUser.token;
            }

            var current_paths = $location.path().split('/');
            var current_path = current_paths[1];
            // redirect to login page if not logged in and trying to access a restricted page
            var is_pub_page = _.contains(['login', 'ks-login', 'crams-login', 'action_error', 'terms_conditions'], current_path);

            var loggedIn = $rootScope.globals.currentUser;

            if (!is_pub_page && !loggedIn) {
                //set the next request page to go. it's used after login
                window.localStorage.setItem('next_request_page', next);
                $location.path('/login');
            }


            if (current_path !== undefined) {

                //force the selected view to collection view if try to access to allocation from non-collection view
                if (current_path === 'allocations' && $rootScope.globals.selected_view !== 'normal_user') {
                    $rootScope.globals.selected_view = 'normal_user';
                }

                if (current_path === 'admin' && $rootScope.globals.selected_view !== 'admin') {
                    $rootScope.globals.selected_view = 'admin';
                }
                if (current_path === 'approval' && $rootScope.globals.selected_view !== 'approver') {
                    $rootScope.globals.selected_view = 'approver';
                }

                if (current_path === 'provision' && $rootScope.globals.selected_view !== 'provisioner') {
                    $rootScope.globals.selected_view = 'provisioner';
                }

                var path_len = current_paths.length;
                //check the reports menu
                if (path_len === 4) {
                    var type_admin = current_paths[3];
                    if (current_path === 'reports' && type_admin === 'admin' && $rootScope.globals.selected_view !== 'admin') {
                        $rootScope.globals.selected_view = 'admin';
                    }
                    if (current_path === 'reports' && type_admin === 'merc_admin' && $rootScope.globals.selected_view !== 'service_management') {
                        $rootScope.globals.selected_view = 'service_management';
                    }
                    if (current_path === 'reports' && type_admin === 'faculty' && $rootScope.globals.selected_view !== 'faculty_management') {
                        $rootScope.globals.selected_view = 'faculty_management';
                    }
                }

                //check the dashboard menu
                if (current_path === 'dashboard') {
                    if (path_len === 2 && $rootScope.globals.selected_view !== 'normal_user') {
                        $rootScope.globals.selected_view = 'normal_user';
                    }
                    if (path_len === 3) {
                        var user_type = current_paths[2];
                        if (user_type === 'admin' && $rootScope.globals.selected_view !== 'admin') {
                            $rootScope.globals.selected_view = 'admin';
                        }
                        if (user_type === 'merc_admin' && $rootScope.globals.selected_view !== 'merc_admin') {
                            $rootScope.globals.selected_view = 'service_management';
                        }
                        if (user_type === 'faculty' && $rootScope.globals.selected_view !== 'faculty_management') {
                            $rootScope.globals.selected_view = 'faculty_management';
                        }
                    }
                }

                if ($rootScope.globals.perms !== undefined) {
                    var isAdmin = $rootScope.globals.perms.admin;
                    var isProvisioner = $rootScope.globals.perms.provisioner;
                    var isApprover = $rootScope.globals.perms.approver;

                    var restrictedAdminPage = current_path === 'admin';

                    if (restrictedAdminPage && !isAdmin) {
                        var msg = "Permission denied! You are not an admin";
                        FlashService.Error(msg);
                        $location.path('/action_error');
                    }

                    var restrictedProvisionPage = current_path === 'provision';
                    if (restrictedProvisionPage && !isProvisioner && !isAdmin) {
                        var er_msg = "Permission denied! You are not a provisioner";
                        FlashService.Error(er_msg);
                        $location.path('/action_error');
                    }

                    var restrictedApprovePage = current_path === 'approval';
                    if (restrictedApprovePage && !isApprover && !isAdmin) {
                        var err_msg = "Permission denied! You are not an approver";
                        FlashService.Error(err_msg);
                        $location.path('/action_error');
                    }
                }
            }
        });
    }
})();
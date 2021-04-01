/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsReportStorageStatsController', CramsReportStorageStatsController);

    CramsReportStorageStatsController.$inject = ['$routeParams', '$scope', 'CramsApiService', 'FlashService', '$filter'];

    function CramsReportStorageStatsController($routeParams, $scope, CramsApiService, FlashService, $filter) {
        var vm = this;

        vm.type_admin = $routeParams.type_admin;
        if (vm.type_admin === 'merc_admin') {
            vm.type_admin = 'admin';
        }

        vm.load_fininshed = false;
        vm.report_title = 'Storage Stats Report';

        vm.headings = reportHeading();
        vm.display_headings = reportDisplayHeading();
        vm.show_calendar = true;

        vm.selected_date = null;
        vm.selected_date_str = null;

        vm.csvReportFileName = function () {

            if (vm.selected_date) {
                return 'StorageStas_' + getDateStr(vm.selected_date) + '.csv';
            } else {
                return 'StorageStats_' + getDateStr(new Date()) + '.csv';
            }
        };

        function getDateStr(date) {
            let dd = date.getDate();
            let mm = date.getMonth()+1;
            // append the extra "0" if value is a single digit
            (dd < 10) && (dd='0'+dd);
            (mm < 10) && (mm='0'+mm);

            return dd + mm + date.getFullYear();
        }

        loadIngestReport(vm.selected_date_str);

        function loadIngestReport(date) {
            CramsApiService.collectionIngestReport(date, vm.type_admin).then(function (response) {
                if (response.success) {
                    vm.report_data = response.data;
                    angular.forEach(vm.report_data, function (ingest_data) {
                        var project_id = ingest_data.related_request.project;
                        var request_id = ingest_data.related_request.id;
                        var storage_id = ingest_data.related_request.storage_request;

                        CramsApiService.getProjectRequestById(request_id).then(function (response) {
                            if (response.success) {
                                var project_request = response.data[0];
                                ingest_data.id = project_id;
                                var department = project_request.department;

                                ingest_data.faculty = department.faculty;
                                ingest_data.school = department.department;
                                ingest_data.organisation = department.organisation;

                                var domains = project_request.domains;

                                angular.forEach(domains, function (dom, key) {
                                    var code = dom.for_code.code;
                                    var percent = dom.percentage;
                                    var index = key + 1;
                                    setForCode(ingest_data, index, code, percent);
                                });

                                //project members
                                var proj_contacts = project_request.project_contacts;
                                ingest_data.pi_email_id = '';
                                ingest_data.pi_orcid = '';
                                ingest_data.pi_scopus_id = '';
                                var project_members = '';
                                var member_list = [];
                                angular.forEach(proj_contacts, function (p_contact) {
                                    var contact_role = p_contact.contact_role;
                                    var contact_email = p_contact.contact.email;
                                    if (contact_role === 'Data Custodian') {
                                        ingest_data.pi_email = contact_email;
                                        ingest_data.pi_orcid = p_contact.contact.orcid;
                                        ingest_data.pi_scopus_id = p_contact.contact.scopusid;
                                    } else {
                                        if (!_.contains(member_list, contact_email)) {
                                            member_list.push(contact_email);
                                            project_members = project_members.concat(contact_email).concat('; ');
                                        }
                                    }
                                });
                                project_members = project_members.trim();
                                project_members = project_members.substring(0, project_members.length - 1);
                                ingest_data.project_members = project_members;

                                var first_status_dates = project_request.first_status_dates;
                                if (first_status_dates !== undefined && first_status_dates !== null) {
                                    ingest_data.approved_date = first_status_dates.approved;
                                    if (ingest_data.approved_date !== null) {
                                        ingest_data.approved_date = ingest_data.approved_date.substring(0, 10);
                                    }
                                    ingest_data.provision_date = first_status_dates.provisioned;
                                    if (ingest_data.provision_date !== null) {
                                        ingest_data.provision_date = ingest_data.provision_date.substring(0, 10);
                                    }

                                    ingest_data.ingest_date_details = first_status_dates.ingest;
                                }

                                ingest_data.allocation_type = '';

                                angular.forEach(project_request.requests, function (req) {
                                    if (req.id === request_id) {
                                        angular.forEach(req.storage_requests, function (sp_req) {
                                            if (sp_req.id === storage_id) {
                                                ingest_data.allocation_type = sp_req.storage_product.storage_type.storage_type;
                                                var sp_name = sp_req.storage_product.name;
                                                var ing_date = getIngestDate(ingest_data.ingest_date_details, sp_name);
                                                ingest_data.ingest_date = ing_date;
                                            }
                                        });
                                    }
                                });
                            } else {
                                var msg = "Failed to get allocation request -  " + request_id + ', ' + response.message + ".";
                                FlashService.DisplayError(msg, response.data);
                            }
                        });

                    });
                    vm.load_fininshed = true;
                } else {
                    var msg = "Failed to get collection ingest report, " + response.message + ".";
                    // display error message to page
                    FlashService.DisplayError(msg, response.data);
                }
            });
        }

        function getIngestDate(ingest_date_details, sp_name) {
            var ingest_date = null;
            if (ingest_date_details !== undefined && ingest_date_details !== null) {
                ingest_date = ingest_date_details[sp_name];
                if (ingest_date === undefined) {
                    ingest_date = null;
                }
            }
            return ingest_date;
        }

        //DatePicker settings
        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };

        vm.selectedDateIngestReport = function () {
            vm.load_fininshed = false;
            vm.selected_date_str = $filter('date')(vm.selected_date, "yyyyMMdd");
            loadIngestReport(vm.selected_date_str);
        };

        //openCalendar method
        vm.openCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };

        // closeCalendar method
        vm.closeCalendar = function () {
            vm.opened = false;
        };

        vm.displayColumn = function (data, key) {
            if (key === 'for_more') {
                return '. . .';
            }
            if (key.indexOf('for_code') !== -1 || key === 'pi_scopus_id') {
                return data[key];
            }
            var display_data = data[key];
            if (display_data === null) {
                return null;
            }

            if (isNaN(display_data)) {
                return display_data;
            } else {
                var commas_num_str = display_data.toString();
                commas_num_str += '';
                var x = commas_num_str.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }
        };

        vm.isNumColumn = function (col_key) {
            if ((col_key.indexOf('_cost') !== -1) || (col_key.indexOf('_tb') !== -1) || (col_key.indexOf('_gb') !== -1) || (col_key.indexOf('_size') !== -1)) {
                return true;
            } else {
                return false;
            }
        };
        vm.isCostColumn = function (col_key) {
            if ((col_key.indexOf('_cost') !== -1)) {
                return true;
            } else {
                return false;
            }
        };

        vm.sortHeadings = function () {
            return Object.values(vm.headings);
        };

        vm.sortReportData = function () {
            var sorted_report_data = [];
            angular.forEach(vm.report_data, function (r_data) {
                var sorted_report = {};
                Object.keys(vm.headings).forEach(function (k) {
                    sorted_report[k] = r_data[k];
                });
                sorted_report_data.push(sorted_report);
            });
            return sorted_report_data;
        };

        function reportDisplayHeading() {
            return {
                "id": 'Project ID',
                "collection": "Project Name",
                "pi_email": "Data Custodian",
                "pi_orcid": "Data Custodian ORCID",
                "pi_scopus_id": "Data Custodian Scopus ID",
                "project_members": "Project Members",
                "storage_product": "Storage Product",
                "allocation_type": "Allocation Type",
                "faculty": "Faculty",
                "school": "School",
                "organisation": "Organisation",
                "reported_allocated_gb": "Allocation (GB)",
                "used_gb": "Usage (GB)",
                "approved_date": "Approved Date",
                "provision_date": "Provision Date",
                "ingest_date": "Ingest Date",
                "for_code_1": "FOR #1",
                "for_code_1_percent": "FOR #1 %",
                "for_code_2": "FOR #2",
                "for_code_2_percent": "FOR #2 %",
                'for_more': "More..."
            };
        }

        function reportHeading() {
            return {
                "id": 'Project ID',
                "collection": "Project Name",
                "pi_email": "Data Custodian",
                "pi_orcid": "Data Custodian ORCID",
                "pi_scopus_id": "Data Custodian Scopus ID",
                "project_members": "Project Members",
                "storage_product": "Storage Product",
                "allocation_type": "Allocation Type",
                "faculty": "Faculty",
                "school": "School",
                "organisation": "Organisation",
                "reported_allocated_gb": "Allocation (GB)",
                "used_gb": "Usage (GB)",
                "approved_date": "Approved Date",
                "provision_date": "Provision Date",
                "ingest_date": "Ingest Date",
                "for_code_1": "FOR #1",
                "for_code_1_percent": "FOR #1 %",
                "for_code_2": "FOR #2",
                "for_code_2_percent": "FOR #2 %",
                "for_code_3": "FOR #3",
                "for_code_3_percent": "FOR #3 %",
                "for_code_4": "FOR #4",
                "for_code_4_percent": "FOR #4 %",
                "for_code_5": "FOR #5",
                "for_code_5_percent": "FOR #5 %",
                "for_code_6": "FOR #6",
                "for_code_6_percent": "FOR #6 %",
                "for_code_7": "FOR #7",
                "for_code_7_percent": "FOR #7 %",
                "for_code_8": "FOR #8",
                "for_code_8_percent": "FOR #8 %",
                "for_code_9": "FOR #9",
                "for_code_9_percent": "FOR #9 %",
                "for_code_10": "FOR #10",
                "for_code_10_percent": "FOR #10 %",
                "for_code_11": "FOR #11",
                "for_code_11_percent": "FOR #11 %",
                "for_code_12": "FOR #12",
                "for_code_12_percent": "FOR #12 %",
                "for_code_13": "FOR #13",
                "for_code_13_percent": "FOR #13 %",
                "for_code_14": "FOR #14",
                "for_code_14_percent": "FOR #14 %",
                "for_code_15": "FOR #15",
                "for_code_15_percent": "FOR #15 %",
                "for_code_16": "FOR #16",
                "for_code_16_percent": "FOR #16 %",
                "for_code_17": "FOR #17",
                "for_code_17_percent": "FOR #17 %",
                "for_code_18": "FOR #18",
                "for_code_18_percent": "FOR #18 %",
                "for_code_19": "FOR #19",
                "for_code_19_percent": "FOR #19 %",
                "for_code_20": "FOR #20",
                "for_code_20_percent": "FOR #20 %",
                "for_code_21": "FOR #21",
                "for_code_21_percent": "FOR #21 %",
                "for_code_22": "FOR #22",
                "for_code_22_percent": "FOR #22 %",
                "for_code_23": "FOR #23",
                "for_code_23_percent": "FOR #23 %",
                "for_code_24": "FOR #24",
                "for_code_24_percent": "FOR #24 %",
                "for_code_25": "FOR #25",
                "for_code_25_percent": "FOR #25 %",
            };
        }

        function setForCode(ingest_data, key, code, percent) {
            switch (key) {
                case 1:
                    ingest_data.for_code_1 = code;
                    ingest_data.for_code_1_percent = percent;
                    break;
                case 2:
                    ingest_data.for_code_2 = code;
                    ingest_data.for_code_2_percent = percent;
                    break;
                case 3:
                    ingest_data.for_code_3 = code;
                    ingest_data.for_code_3_percent = percent;
                    break;
                case 4:
                    ingest_data.for_code_4 = code;
                    ingest_data.for_code_4_percent = percent;
                    break;
                case 5:
                    ingest_data.for_code_5 = code;
                    ingest_data.for_code_5_percent = percent;
                    break;
                case 6:
                    ingest_data.for_code_6 = code;
                    ingest_data.for_code_6_percent = percent;
                    break;
                case 7:
                    ingest_data.for_code_7 = code;
                    ingest_data.for_code_7_percent = percent;
                    break;
                case 8:
                    ingest_data.for_code_8 = code;
                    ingest_data.for_code_8_percent = percent;
                    break;
                case 9:
                    ingest_data.for_code_9 = code;
                    ingest_data.for_code_9_percent = percent;
                    break;
                case 10:
                    ingest_data.for_code_10 = code;
                    ingest_data.for_code_10_percent = percent;
                    break;
                case 11:
                    ingest_data.for_code_11 = code;
                    ingest_data.for_code_11_percent = percent;
                    break;
                case 12:
                    ingest_data.for_code_12 = code;
                    ingest_data.for_code_12_percent = percent;
                    break;
                case 13:
                    ingest_data.for_code_13 = code;
                    ingest_data.for_code_13_percent = percent;
                    break;
                case 14:
                    ingest_data.for_code_14 = code;
                    ingest_data.for_code_14_percent = percent;
                    break;
                case 15:
                    ingest_data.for_code_15 = code;
                    ingest_data.for_code_15_percent = percent;
                    break;
                case 16:
                    ingest_data.for_code_16 = code;
                    ingest_data.for_code_16_percent = percent;
                    break;
                case 17:
                    ingest_data.for_code_17 = code;
                    ingest_data.for_code_17_percent = percent;
                    break;
                case 18:
                    ingest_data.for_code_18 = code;
                    ingest_data.for_code_18_percent = percent;
                    break;
                case 19:
                    ingest_data.for_code_19 = code;
                    ingest_data.for_code_19_percent = percent;
                    break;
                case 20:
                    ingest_data.for_code_20 = code;
                    ingest_data.for_code_20_percent = percent;
                    break;
                case 21:
                    ingest_data.for_code_21 = code;
                    ingest_data.for_code_21_percent = percent;
                    break;
                case 22:
                    ingest_data.for_code_22 = code;
                    ingest_data.for_code_22_percent = percent;
                    break;
                case 23:
                    ingest_data.for_code_23 = code;
                    ingest_data.for_code_23_percent = percent;
                    break;
                case 24:
                    ingest_data.for_code_24 = code;
                    ingest_data.for_code_24_percent = percent;
                    break;
                case 25:
                    ingest_data.for_code_25 = code;
                    ingest_data.for_code_25_percent = percent;
                    break;
                default:
                    break;
            }
        }
    }
})();
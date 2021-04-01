/**
 * Created by simonyu on 1/09/15.
 * Updated by Rafi M Feroze on 2/09/15
 */

(function () {
    'use strict';
    angular.module('crams').factory('LookupService', LookupService);
    LookupService.$inject = ['$http', 'ENV'];

    function LookupService($http, ENV) {

        var service = {};
        service.nectarAllocationHome = nectarAllocationHome;
        service.durations = loadDurations;
        service.grantTypes = loadGrantTypes;
        service.ncStorageProducts = loadNectarSps;
        service.vnStorageProducts = loadVicnodeSps;
        service.loadStorageProducts = loadStorageProducts;
        service.hpcStorageProducts = loadHpcSps;
        service.contacts = loadContacts;
        service.forCodes = loadFORCodes;
        service.seoCodes = loadSEOCodes;
        service.fundingBody = loadFundingBody;
        service.fundingScheme = loadFundingSchemeByFundingBody;
        service.researchSystem = loadResearchSystem;
        service.loadHPCSystemStorageProducts = loadHPCSystemStorageProducts;
        service.loadHPCComputePruducts = loadHPCComputePruducts;
        service.loadSupportEmailContactsERB = loadSupportEmailContactsERB;
        service.loadSupportEmailContactsERBS = loadSupportEmailContactsERBS;
        service.projectTitleExists = projectTitleExists;
        service.loadProjectEventLogs = loadProjectEventLogs;
        return service;

        // Allocation Home
        function nectarAllocationHome() {
            return fetchLookup('alloc_home');
        }

        function loadDurations() {
            return fetchLookup('durations');
        }

        function loadGrantTypes() {
            return fetchLookup('grant_types');
        }

        function loadNectarSps() {
            return fetchLookup('nectar_sps');
        }

        function loadVicnodeSps() {
            return fetchLookup('vicnode_sps');
        }

        function loadStorageProducts(fb_name) {
            var sp_path = 'storage_products/' + fb_name;
            return fetchLookup(sp_path);
        }

        function loadHpcSps() {
            return fetchLookup('hpc_sps');
        }

        function loadContacts() {
            return fetchLookup('contacts');
        }

        function loadFORCodes() {
            return fetchLookup('for_codes');
        }

        function loadSEOCodes() {
            return fetchLookup('seo_codes');
        }

        function loadFundingBody() {
            return fetchLookup('user_funding_body/');
        }

        function loadFundingSchemeByFundingBody(funding_body) {
            return fetchLookup('funding_scheme/' + funding_body);
        }

        function loadResearchSystem(funding_body) {
            return fetchLookup('e_research_body/e_research_system/' + funding_body);
        }

        function loadHPCSystemStorageProducts(system_name) {
            return fetchLookup('e_research_body/sps/hpc/' + system_name + "/");
        }

        function loadHPCComputePruducts(system_name) {
            return fetchLookup('e_research_body/cps/hpc/' + system_name + "/");
        }

        function loadSupportEmailContactsERB(erb_name) {
            return fetchLookup('support_email_list/?erb=' + erb_name);
        }

        function loadSupportEmailContactsERBS(system_name) {
            return fetchLookup('support_email_list/?erbs=' + system_name);
        }

        function projectTitleExists(erb_name, title, project_id) {
            if (project_id) {
                return fetchLookup('exists/project/?erb=' + erb_name + '&title=' + title + '&project_id=' + project_id);
            } else {
                return fetchLookup('exists/project/?erb=' + erb_name + '&title=' + title);
            }
        }

        function loadProjectEventLogs(project_id, start_date, end_date) {
            let api_url = 'crams_log/event_log/' + project_id + '/';
            if (start_date) {
                api_url = api_url + '?start_date=' + start_date;
                if (end_date) {
                    api_url = api_url + '&end_date=' + end_date;
                }
            } else {
                if (end_date) {
                    api_url = api_url + '?end_date=' + end_date;
                }
            }

            return fetchLookup(api_url);
        }

        //private functions
        function fetchLookup(apiPath) {
            var lookup_url = ENV.apiEndpoint + apiPath;
            return $http.get(lookup_url).then(handleSuccess, handleError);
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
    }

})();
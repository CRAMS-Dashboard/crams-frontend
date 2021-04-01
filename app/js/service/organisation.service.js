/**
 * Created by Melvin Luong on 31/1/17.
 */
(function () {
    'use strict';
    angular.module('crams').factory('OrganisationService', OrganisationService);
    OrganisationService.$inject = ['$http', 'ENV'];

    function OrganisationService($http, ENV) {

        var service = {};
        service.createOrganisation = createOrganisation;
        service.updateOrganisation = updateOrganisation;
        service.getOrganisation = getOrganisation;
        service.listOrganisation = listOrganisation;
        service.getOrganisationList = getOrganisationList;
        service.listFaculty = listFaculty;
        service.listDepartment = listDepartment;
        service.listFacultiesByOrgId = listFacultiesByOrgId;
        service.listDeptByFacultyId = listDeptByFacultyId;
        return service;

        function createOrganisation(organisation) {
            var create_org_url = ENV.apiEndpoint + "organisation/";

            return $http({
                    url: create_org_url,
                    method: 'POST',
                    data: organisation
                }
            ).then(handleSuccess, handleError);
        }

        function updateOrganisation(organisation, org_id) {
            var update_org_url = ENV.apiEndpoint + "organisation/" + org_id + "/";

            return $http({
                    url: update_org_url,
                    method: 'PUT',
                    data: organisation
                }
            ).then(handleSuccess, handleError);
        }

        function getOrganisation(org_id) {
            var get_org_url = ENV.apiEndpoint + "organisation/" + org_id + "/";
            return $http.get(get_org_url).then(handleSuccess, handleError);
        }

        //limited to faculties you belong to
        function listFaculty(org_id, admin_type) {
            var list_fac_url = ENV.apiEndpoint + "faculty_list/" + org_id + "/";
            if (admin_type !== undefined) {
                list_fac_url = ENV.apiEndpoint + "faculty_list/" + org_id + "/" + admin_type + '/';
            }
            return $http.get(list_fac_url).then(handleSuccess, handleError);
        }

        function listDepartment(fac_id) {
            var list_dept_url = ENV.apiEndpoint + "department_list/" + fac_id + "/";
            return $http.get(list_dept_url).then(handleSuccess, handleError);
        }

        function listOrganisation() {
            var list_org_url = ENV.apiEndpoint + "organisation/";
            return $http.get(list_org_url).then(handleSuccess, handleError);
        }

        function listFacultiesByOrgId(org_id) {
            var list_fac_list_url = ENV.apiEndpoint + "faculty/organisation/" + org_id + "/";
            return $http.get(list_fac_list_url).then(handleSuccess, handleError);
        }

        function listDeptByFacultyId(fac_id) {
            var list_dept_list_url = ENV.apiEndpoint + "department/faculty/" + fac_id + "/";
            return $http.get(list_dept_list_url).then(handleSuccess, handleError);
        }

        function getOrganisationList() {
            return [
                "CRAMS",
                "Organisation N1",
                "Organisation N2",
                "Organisation N3",
                "Other (please specify)"
            ];
        }

        // private functions
        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText),
                data: response.data
            };
        }
    }
})();

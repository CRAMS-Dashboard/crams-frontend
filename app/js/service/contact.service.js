/**
 * Created by simonyu on 12/10/15.
 */
/**
 * Created by simonyu on 31/08/15.
 */
(function () {
    'use strict';
    angular.module('crams').factory('ContactService', ContactService);
    ContactService.$inject = ['$http', 'ENV'];

    function ContactService($http, ENV) {
        var service = {};
        service.createContact = createContact;
        service.findContact = findContact;
        service.makeNewChiefInvestigator = makeNewChiefInvestigator;
        service.makeNewTechnicalContact = makeNewTechnicalContact;
        service.contactList = getContactList;
        service.findContactById = findContactById;
        service.editContact = editContact;
        service.contactProjects = contactProjects;
        service.contactRoles = contactRoles;

        service.userTitles = getUserTitles;
        return service;

        function createContact(contact) {
            var crams_api_url = ENV.apiEndpoint + "contact/";

            return $http({
                    url: crams_api_url,
                    method: 'POST',
                    data: contact
                }
            ).then(handleSuccess, handleError);
        }

        function findContact(searchString) {
            var crams_api_url = ENV.apiEndpoint + "searchcontact/";

            return $http({
                url: crams_api_url,
                method: 'GET',
                params: {search: searchString}
            }).then(handleSuccess, handleError);
        }

        function findContactById(contact_id_or_email) {
            var contact_api_url = ENV.apiEndpoint + "contact/" + contact_id_or_email + "/";
            return $http.get(contact_api_url).then(handleSuccess, handleError);
        }

        function editContact(contact) {
            var crams_api_url = ENV.apiEndpoint + "contact/" + contact.id + "/";
            return $http({
                    url: crams_api_url,
                    method: 'PUT',
                    data: contact
                }
            ).then(handleSuccess, handleError);
        }

        function contactProjects(contact_id) {
            var contact_projects_url = ENV.apiEndpoint + 'admin/contact/' + contact_id + '/list/project/';
            return $http.get(contact_projects_url).then(handleSuccess, handleError);
        }

        function makeNewChiefInvestigator() {
            var newContact = {};
            newContact.contact = makeNewContactTemplate();
            newContact.contact_role = "Chief Investigator";

            return newContact;
        }

        function makeNewTechnicalContact() {
            var newContact = {};
            newContact.contact = makeNewContactTemplate();
            newContact.contact_role = "Technical Contact";

            return newContact;
        }

        function makeNewContactTemplate() {
            return {
                "title": null,
                "given_name": null,
                "surname": null,
                "email": null,
                "phone": null,
                "organisation": null
            };
        }

        function getContactList() {
            var contact_api_url = ENV.apiEndpoint + "contact/";
            return $http.get(contact_api_url).then(handleSuccess, handleError);
        }

        function contactRoles() {
            return $http.get(ENV.apiEndpoint + 'contact_role/?erb=' + ENV.erb).then(handleSuccess, handleError);
        }

        //private functions
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

        function getUserTitles() {
            return [
                "Prof",
                "Asst Prof",
                "Dr",
                "Mr",
                "Ms",
                "Mrs"
            ];
        }
    }

})();
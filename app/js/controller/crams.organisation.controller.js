/**
 * Created by simonyu on 10/1/17.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsOrganisationController', CramsOrganisationController);

    CramsOrganisationController.$inject = ['$scope', '$location', '$routeParams', '$anchorScroll', '$sce', 'OrganisationService', 'FlashService'];

    function CramsOrganisationController($scope, $location, $routeParams, $anchorScroll, $sce, OrganisationService, FlashService) {
        var vm = this;
        // default save button text
        vm.save_button = "Create new Organisation";

        // get organisation from routeParam org_id if available
        if ($routeParams.org_id !== undefined) {
            // set the title and save button text to edit
            vm.save_button = "Update Organisation";

            var org_id = $routeParams.org_id;

            OrganisationService.getOrganisation(org_id).then(function (response) {
                if (response.success) {
                    vm.org = response.data;

                    if (vm.org.name !== null && vm.org.name !== undefined) {
                        vm.org_name_count = vm.org.name.length;
                    }
                    if (vm.org.short_name !== null && vm.org.short_name) {
                        vm.short_name_count = vm.org.short_name.length;
                    }
                } else {
                    var msg = "Failed to load organisation(id: " + org_id + "), " + response.message + ".";
                    // display and log error
                    FlashService.DisplayError(msg, response.data);
                    console.log(response.data);
                }
            });
        }

        // get organisation list
        OrganisationService.listOrganisation().then(function (response) {
            if (response.success) {
                vm.org_list = response.data;
            } else {
                var msg = "Failed to get Organisation list, error: " + response.message + ".";
                // display error message to page
                FlashService.DisplayError(msg, response.data);

                // scroll back to the top of page for error
                $anchorScroll();

                // error to console for debugging
                console.log(response.data);
            }
        });

        vm.org_name_count = 0;
        vm.orgNameCount = function () {
            if (vm.org.name !== null && vm.org.name !== undefined) {
                vm.org_name_count = vm.org.name.length;
            }
        };

        vm.short_name_count = 0;
        vm.shortNameCount = function () {
            if (vm.org.short_name !== null && vm.org.short_name) {
                vm.short_name_count = vm.org.short_name.length;
            }
        };

        // function to save organisation
        vm.saveOrg = function () {
            var org_id = $routeParams.org_id;

            // validate form before saving
            if (validateForm()) {
                // update org if org_id exists in the $routeParams
                if (org_id != undefined) {
                    // edit existing org
                    OrganisationService.updateOrganisation(vm.org, org_id).then(function (response) {
                        if (response.success) {
                            FlashService.Success("Organisation updated", true);
                            $location.path('/admin/org');
                        } else {
                            var msg = "Failed to update an organisation, " + response.message + ".";
                            // display error message to page
                            FlashService.DisplayError(msg, response.data);

                            // scroll back to the top of page for error
                            $anchorScroll();

                            // error to console for debugging
                            console.log(response.data);
                        }
                    });

                } else {
                    // create new org
                    OrganisationService.createOrganisation(vm.org).then(function (response) {

                        if (response.success) {

                            FlashService.Success("Organisation updated", true);
                            $location.path('/admin/org');
                        } else {
                            var msg = "Failed to create an organisation, " + response.message + ".";

                            // display error message to page
                            FlashService.DisplayError(msg, response.data);

                            // scroll back to the top of page for error
                            $anchorScroll();

                            // error to console for debugging
                            console.log(response.data);
                        }
                    });
                }
            } else {
                FlashService.Error("Please check that all required fields have been filled in correctly.");
                // scroll to top of the page
                $anchorScroll();
            }
        };

        // validate form input
        function validateForm() {
            vm.name_invalid = false;
            vm.short_name_invalid = false;
            vm.notification_email_invalid = false;
            vm.ands_url_invalid = false;

            if (!vm.org_form.name.$valid) {
                vm.name_invalid = true;
                vm.org_form.$valid = false;
            }

            if (!vm.org_form.short_name.$valid) {
                vm.short_name_invalid = true;
                vm.org_form.$valid = false;
            }

            if (!vm.org_form.email.$valid) {
                vm.notification_email_invalid = true;
                vm.org_form.$valid = false;
            }

            if (!vm.org_form.ands_url.$valid) {
                vm.ands_url_invalid = true;
                vm.org_form.$valid = false;
            }

            return vm.org_form.$valid;
        }

        // reads errors from response.data and return errors in a concatenated string
        function displayErrors(obj) {
            var errorMessages = "";

            if (obj.hasOwnProperty("name")) {
                // display name error
                errorMessages += ' organisation name: ' + obj["name"];
            }

            if (obj.hasOwnProperty("short_name")) {
                // display short_name error
                errorMessages += ' organisation short name: ' + obj["short_name"];
            }

            if (obj.hasOwnProperty("ands_url")) {
                // display ands urls error
                errorMessages += ' ANDS url: ' + obj["ands_url"];
            }

            if (obj.hasOwnProperty("notification_email")) {
                // display notification email error
                errorMessages += ' notification email: ' + obj["notification_email"];
            }

            return errorMessages;
        }
    }
})();
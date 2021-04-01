/**
 * Created by simonyu on 10/1/17.
 */
(function () {
    'use strict';
    angular.module('crams').controller('CramsListContactsController', CramsListContactsController);

    CramsListContactsController.$inject = ['$scope', 'ContactService', 'FlashService', '$anchorScroll'];

    function CramsListContactsController($scope, ContactService, FlashService, $anchorScroll) {
        var vm = this;
        vm.vn_contacts = [];

        vm.loaded = false;
        // init sort filter
        initSortColumnIcon();

        //get all contacts
        ContactService.contactList().then(function (response) {
            if (response.success) {
                // vm.vn_contacts = response.data;
                
                // filter only datadashboard last logins
                vm.vn_contacts = filterLastLogin(response.data);

                if (vm.vn_contacts !== undefined || vm.vn_contacts.length !== 0) {
                    vm.vn_contacts = _.sortBy(vm.vn_contacts, function (c) {
                        return c.email.toLowerCase();
                    });
                }
            } else {
                var msg = "Failed to get contacts, " + response.message + ".";
                FlashService.DisplayError(msg, response.data);
                console.error(msg);
            }
        }).finally(function () {
            vm.loaded = true;
        });

        //Back to top event
        vm.backToTop = function () {
            $anchorScroll();
        };

        function filterLastLogin(contact_list) {
            let filter_fields = ['datadashboard'];
            
            for (let i=0; i<contact_list.length; i++) {
                let contact = contact_list[i];

                if (contact.last_login.length !== 0) {
                    let filtered_login_dates = [];
                    for (let j=0; j<contact.last_login.length; j++) {
                        if (new RegExp(filter_fields.join("|")).test(contact.last_login[j].site)) {
                            filtered_login_dates.push(contact.last_login[j].date);
                        }
                    }
                    if (filtered_login_dates.length !== 0) {
                        // to get the latest date from the list sort the array in ascending order
                        // then reverse it so the lastest date is the first
                        contact.last_login = filtered_login_dates.sort().reverse()[0];

                    } else {
                        contact.last_login = null;
                    }
                } else {
                    contact.last_login = null;
                }
            }

            return contact_list;
        }

        function initSortColumnIcon() {
            vm.lastLoginAsc = true;
            vm.lastLoginDesc = false;
        }

        vm.lastLoginSort = function () {
            // save current order
            let asc = vm.lastLoginAsc;
            let desc = vm.lastLoginDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.lastLoginAsc = !asc;
            vm.lastLoginDesc = !desc;

            vm.vn_contacts.sort((a,b)=>{
                if (a.last_login===b.last_login) {
                    return 0;
                } else if(a.last_login===null || b.last_login===null) {
                    return a.last_login ? 1 : -1;
                }
                return a.last_login.localeCompare(b.last_login);
            });

            if (vm.lastLoginDesc === true) {
                vm.vn_contacts = vm.vn_contacts.reverse();
            }
        };
    }
})();
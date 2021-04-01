(function () {
    'use strict';
    angular.module('crams').controller('CramsReviewListController', CramsReviewListController);

    CramsReviewListController.$inject = ['$scope', 'ReviewService', 'FlashService', '$anchorScroll', '$mdDialog', '$location'];

    function CramsReviewListController($scope, ReviewService, FlashService, $anchorScroll, $mdDialog, $location) {
        var vm = this;
        vm.review_list = [];

        // bulk of selected reviews
        vm.bulk_reviews = [];
        vm.selectAll = false;

        // disable the bulk send/skip buttons
        vm.disableBulkAction = true;

        // show/hide action column - not needed when viewing sent or skipped reviews
        vm.showActionItems = true;

        // set the page heading and table load
        vm.pageStatus = null;
        setPage($location.path());

        // init sort filter
        initSortColumnIcon();

        // load the table list
        loadReviewList();

        // load all pending reviews
        function loadReviewList() {
            // init loading splash screen
            vm.loaded = false;
            vm.show_table = false;

            // reset the buttons and checkbox
            vm.selectAll = false;
            vm.disableBulkAction = true;

            ReviewService.listReviewAllocations(vm.pageStatus).then(function (response) {
                if (response.success) {
                    vm.review_list = response.data;

                    // show table only if there are values in it
                    if (vm.review_list.length <= 0) {
                        vm.show_table = false;
                    } else {
                        vm.show_table = true;
                    }

                    // select for check box default to false
                    angular.forEach(vm.review_list, function(review) {
                        review.select = false;
                    });

                } else {
                    var msg = "Failed to get review list, " + response.message + ".";
                    FlashService.DisplayError(msg, response.data);
                    console.error(msg);
                }
            }).finally(function() {
                vm.loaded = true;
            });

            //Back to top event
            vm.backToTop = function () {
                $anchorScroll();
            };
        }

        function setPage(path) {
            if (path === '/admin/reviews/pending') {
                vm.heading = 'Pending Reviews';
                vm.pageStatus = null;
                vm.showActionItems = true;
            }

            if (path === '/admin/reviews/skipped') {
                vm.heading = 'Skipped Reviews';
                vm.pageStatus = 'skipped';
                vm.showActionItems = false;
            }

            if (path === '/admin/reviews/sent') {
                vm.heading = 'Sent Reviews';
                vm.pageStatus = 'sent';
                vm.showActionItems = false;
            }
        }

        vm.checkAll = function () {
            // reset/clear all the reviews from bulk list if check all is not select
            vm.bulk_reviews = [];

            angular.forEach(vm.review_list, function (review) {
                review.select = vm.selectAll;

                // add all the reviews into bulk list if selectAll true
                if (vm.selectAll === true) {
                    vm.bulk_reviews.push(review);
                }
            });

            // enable/disable bulk action buttons based on selections
            vm.disableBulkAction = !vm.selectAll;
        };

        vm.checkSingleReview = function (review) {
            if (review.select === true) {
                // add review to the bulk
                vm.bulk_reviews.push(review);
            } else {
                // remove the review from the bulk
                vm.bulk_reviews.splice(vm.bulk_reviews.indexOf(review), 1 );
            }

            // enable/disable bulk action buttons if bulk list contains reviews
            if (vm.bulk_reviews.length > 0) {
                vm.disableBulkAction = false;
            } else {
                vm.disableBulkAction = true;
            }
        };

        vm.projectSort = function () {
            // save current order
            let asc = vm.projectAsc;
            let desc = vm.projectDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.projectAsc = !asc;
            vm.projectDesc = !desc;

            vm.review_list = _.sortBy(vm.review_list, function (r) {
                return r.project.toLowerCase();
            });

            if (vm.projectDesc === true) {
                vm.review_list = vm.review_list.reverse();
            }
        };

        vm.reviewDateSort = function () {
            // save current order
            let asc = vm.reviewDateAsc;
            let desc = vm.reviewDateDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.reviewDateAsc = !asc;
            vm.reviewDateDesc = !desc;

            vm.review_list = _.sortBy(vm.review_list, function(r) {
                return r.review_date;
            });

            if (vm.reviewDateDesc === true) {
                vm.review_list = vm.review_list.reverse();
            }
        };

        vm.lastUpdatedSort = function () {
            // save current order
            let asc = vm.lastUpdatedAsc;
            let desc = vm.lastUpdatedDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.lastUpdatedAsc = !asc;
            vm.lastUpdatedDesc = !desc;

            vm.review_list = _.sortBy(vm.review_list, function(r) {
                return r.updated_date;
            });

            if (vm.lastUpdatedDesc === true) {
                vm.review_list = vm.review_list.reverse();
            }
        };

        vm.updatedBySort = function () {
            // save current order
            let asc = vm.updatedByAsc;
            let desc = vm.updatedByDesc;

            // reset sort column icons
            initSortColumnIcon();

            vm.updatedByAsc = !asc;
            vm.updatedByDesc = !desc;

            vm.review_list = _.sortBy(vm.review_list, function(r) {
                if (r.updated_by !== null) {
                    return r.updated_by.toLowerCase();
                }
            });

            if (vm.updatedByDesc === true) {
                vm.review_list = vm.review_list.reverse();
            }
        };

        function initSortColumnIcon() {
            vm.projectAsc = true;
            vm.projectDesc = false;
            vm.reviewDateAsc = false;
            vm.reviewDateDesc = true;
            vm.lastUpdatedAsc = false;
            vm.lastUpdatedDesc = true;
            vm.updatedByAsc = true;
            vm.updatedByDesc = false;
        }

        vm.getLatestRequestID = function (review) {
            if (review.current_request_id != null) {
                return review.current_request_id;
            } else {
                return review.request_id;
            }
        };

        function ConfirmDialogController($scope, $mdDialog) {
            // confirm message
            $scope.confirm_message = vm.confirm_message;

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                //set the email notification flag.
                vm.sent_email = $scope.sent_email;
                $mdDialog.hide(answer);
            };
        }

        vm.sendBulkReviews = function(ev) {
            var lengthBulk = vm.bulk_reviews.length;
            var payload = [];
            angular.forEach(vm.bulk_reviews, function (review) {
                payload.push({'id': review.id, 'notes': ''});
            });

            // email/s singular or plural for the confirm message
            if (lengthBulk === 1) {
                vm.confirm_message = "Are you sure you want to send an email review for " + vm.bulk_reviews[0].project + "?";
            } else {
                vm.confirm_message = "Are you sure you want to send out " + lengthBulk + " review emails?";
            }

            $mdDialog.show({
                controller: ConfirmDialogController,
                templateUrl: 'templates/crams_review_confirm.html',
                parent: angular.element(document.body),
                targetEvent: ev
            }).then(function (answer) {
                if (answer === 'Yes') {
                    // send email reviews
                    ReviewService.sendReview(payload).then(function (response) {
                        if (response.success) {
                            // reload review list table
                            loadReviewList();

                            // clear the bulk review
                            vm.bulk_reviews = [];
                        } else {
                            var msg = "Failed to get send review, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            console.error(msg);
                        }
                    });
                }
            }, function () {
                //Noting, cancelled the dialog
            });
        };

        vm.skipBulkReviews = function(ev) {
            var lengthBulk = vm.bulk_reviews.length;
            var payload = [];
            angular.forEach(vm.bulk_reviews, function (review) {
                payload.push({'id': review.id, 'notes': ''});
            });

            // email/s singular or plural for the confirm message
            if (lengthBulk === 1) {
                vm.confirm_message = "Are you sure you want to skip the review for " + vm.bulk_reviews[0].project + "?";
            } else {
                vm.confirm_message = "Are you sure you want to skip " + lengthBulk + " allocation reviews?";
            }

            $mdDialog.show({
                controller: ConfirmDialogController,
                templateUrl: 'templates/crams_review_confirm.html',
                parent: angular.element(document.body),
                targetEvent: ev
            }).then(function (answer) {
                if (answer === 'Yes') {
                    ReviewService.skipReview(payload).then(function (response) {
                        if (response.success) {
                            // reload review list table
                            loadReviewList();

                            // clear the bulk review
                            vm.bulk_reviews = [];
                        } else {
                            var msg = "Failed to get send review, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            console.error(msg);
                        }
                    });
                }
            }, function () {
                //Noting, cancelled the dialog
            });
        };

        vm.sendSingleReview = function(ev, review) {
            // confirm message
            vm.confirm_message = "Are you sure you want to send an email review for " + review.project + "?";
            var payload = {'id': review.id, 'notes': ''};

            $mdDialog.show({
                controller: ConfirmDialogController,
                templateUrl: 'templates/crams_review_confirm.html',
                parent: angular.element(document.body),
                targetEvent: ev
            }).then(function (answer) {
                if (answer === 'Yes') {
                    // send email reviews
                    ReviewService.sendReview(payload).then(function (response) {
                        if (response.success) {
                            // reload review list table
                            loadReviewList();
                        } else {
                            var msg = "Failed to get send review, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            console.error(msg);
                        }
                    });
                }
            }, function () {
                //Noting, cancelled the dialog
            });
        };

        vm.skipSingleReview = function(ev, review) {
            // confirm message
            vm.confirm_message = "Are you sure you want to skip the review for " + review.project + "?";
            var payload = {'id': review.id, 'notes': ''};

            $mdDialog.show({
                controller: ConfirmDialogController,
                templateUrl: 'templates/crams_review_confirm.html',
                parent: angular.element(document.body),
                targetEvent: ev
            }).then(function (answer) {
                if (answer === 'Yes') {
                    // skip email reviews
                    ReviewService.skipReview(payload).then(function (response) {
                        if (response.success) {
                            // reload review list table
                            loadReviewList();
                        } else {
                            var msg = "Failed to get send review, " + response.message + ".";
                            FlashService.DisplayError(msg, response.data);
                            console.error(msg);
                        }
                    });
                }
            }, function () {
                //Noting, cancelled the dialog
            });
        };
    }
})();
(function () {
    'use strict';
    angular.module('crams').factory('ReviewService', ReviewService);
    ReviewService.$inject = ['$http', 'ENV'];
    function ReviewService($http, ENV) {
        var service = {};

        service.listReviewAllocations = listReviewAllocations;
        service.detailReviewAllocation = detailReviewAllocation;
        service.sendReview = sendReview;
        service.skipReview = skipReview;

        var review_url = ENV.apiEndpoint + "review/";

        function listReviewAllocations(status) {

            var review_list_url = review_url + "review_date/?erb=" + ENV.erb;
            if (status !== null) {
                review_list_url = review_list_url + '&status=' + status;
            }
            return $http.get(review_list_url).then(handleSuccess, handleError);
        }

        function detailReviewAllocation(review_id) {
            var review_detail_url = review_url + "review_date/" + review_id + "/";
            return $http.get(review_detail_url).then(handleSuccess, handleError);
        }

        function sendReview(data) {
            return $http({
                    url: review_url + "send/",
                    method: 'POST',
                    data: data
                }
            ).then(handleSuccess, handleError);
        }

        function skipReview(data) {
            return $http({
                    url: review_url + "skip/",
                    method: 'POST',
                    data: data
                }
            ).then(handleSuccess, handleError);
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

        return service;
    }
})();
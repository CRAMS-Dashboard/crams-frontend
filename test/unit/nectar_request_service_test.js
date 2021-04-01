/**
 * Created by simonyu on 23/11/15.
 */
describe('List Approved Allocation For Funding Body Allocation', function () {
    beforeEach(module("crams"));
    // After every spec, do the following:
    //afterEach(inject(function ($httpBackend) {
    //    // Make sure we have flushed all of our requests.
    //    $httpBackend.verifyNoOutstandingExpectation();
    //    $httpBackend.verifyNoOutstandingRequest();
    //}));
    it('Should get the appoved allocations', inject(function (CramsApiService, $httpBackend, $rootScope) {
        var mockResponse = [];
        // Every time we hit the specified url,
        // respond with mockResponse( in this case an empty array).
        $httpBackend.when('GET', 'http://localhost:8080/crams/approve_list/?funding_body_id=1&req_status=approved').respond(mockResponse);
        var funding_body_id = 1;
        var req_status = 'approved';
        // The promise reference now holds the $http call returned
        var promise = CramsApiService.listApproval(funding_body_id, req_status);
        // Flush the backend
        //$httpBackend.flush();

        // Use .then() like you would normally.
        promise.then(function (result) {
            expect(result.data).toEqual(mockResponse);
        });

        // Manually trigger a $digest cycle
        // $rootScope.$digest();
    }));

    it('View the details of allocation', inject(function (CramsApiService, $httpBackend, $rootScope) {
        var mockResponse = [];
        // Every time we hit the specified url,
        // respond with mockResponse( in this case an empty array).
        $httpBackend.when('GET', 'http://localhost:8080/crams/crams_project_request').respond(mockResponse);
        var request_id = 1;
        // The promise reference now holds the $http call returned
        var promise = CramsApiService.getProjectRequestById(request_id);

        // Use .then() like you would normally.
        promise.then(function (result) {
            expect(result.data).toEqual(mockResponse);
        });
    }));

    it('Get the funding body allocations counter', inject(function (CramsApiService, $httpBackend, $rootScope) {
        var mockResponse = {"counter": {"active": 1, "new": 6, "approved": 3, "expired": 0}};
        // Every time we hit the specified url,
        // respond with mockResponse( in this case an empty array).
        $httpBackend.when('GET', 'http://localhost:8080/crams/alloc_counter').respond(mockResponse);
        var request_id = 1;
        // The promise reference now holds the $http call returned
        var promise = CramsApiService.getProjectRequestById(request_id);

        // Use .then() like you would normally.
        promise.then(function (result) {
            expect(result.data.counter.active).toEqual(mockResponse.counter.active);
        });
    }));
});
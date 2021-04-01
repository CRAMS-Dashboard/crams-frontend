/**
 * Created by simonyu on 24/08/15.
 */
describe("Test RequestController", function () {
    var $location, $scope, $routeParams, requestCtrl;
    var $filter, FlashService, CramsApiService, CramsQuestionsService, LookupService, ContactService, CramsUtils;
    beforeEach(module("crams"));

    beforeEach(inject(function (_$location_, _$routeParams_, _FlashService_, CramsApiService, CramsQuestionsService, _LookupService_, _ContactService_, _CramsUtils_, $rootScope, _$filter_, _$controller_) {
        FlashService = _FlashService_;
        CramsApiService = CramsApiService;
        CramsQuestionsService = CramsQuestionsService;
        LookupService = _LookupService_;
        ContactService = _ContactService_;
        CramsUtils = _CramsUtils_;
        $filter = _$filter_;
        $location = _$location_;
        $routeParams = _$routeParams_;

        $scope = $rootScope.$new();
        requestCtrl = _$controller_("RacMonRequestController", {
            '$location': $location,
            '$scope': $scope,
            '$routeParams': $routeParams,
            'FlashService': FlashService,
            'CramsApiService': CramsApiService,
            'CramsQuestionsService': CramsQuestionsService,
            'LookupService': LookupService,
            'ContactService': ContactService,
            'CramsUtils': CramsUtils,
            '$filter': $filter
        });
    }));

    it("should be define", function () {
        expect(requestCtrl).toBeDefined();
    });

    it("code value should be setup", function () {
        expect(requestCtrl.project.requests[0].storage_requests.length).toBe(1);
    })
});
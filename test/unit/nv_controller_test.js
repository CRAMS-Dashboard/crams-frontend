/**
 * Created by simonyu on 25/08/15.
 */
describe('NavController', function () {
    var $rootScope, $scope, $location, sideNavController;

    beforeEach(module("crams"));

    beforeEach(inject(function ($rootScope, $controller, _$location_) {

        $scope = $rootScope.$new();
        $location = _$location_;

        sideNavController = $controller("SideNavController", {
            '$rootScope': $rootScope,
            '$scope': $scope,
            '$location': $location
        });

    }));

    it("should be define", function () {
        expect(sideNavController).toBeDefined();
    });

    it('should have a method to check if the path is active', function () {
        $location.path('allocations');
        expect($location.path()).toBe('/allocations');
        expect($scope.isCurrentPath('allocations')).toBe(true);
        expect($scope.isCurrentPath('approval')).toBe(false);
    });
});

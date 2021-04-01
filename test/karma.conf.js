module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',
        // list of files / patterns to tested
        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'app/bower_components/jquery/dist/jquery.min.js',
            'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/ng-dialog/js/ngDialog.js',
            'app/bower_components/underscore/underscore.js',
            'app/app.js',
            'app/js/service/crams_utils.js',
            'app/js/service/flash.service.js',
            'app/js/service/authentication.service.js',
            'app/js/service/lookup.service.js',
            'app/js/service/contact.service.js',
            'app/js/service/crams.api.service.js',
            'app/js/service/crams.questions.service.js',
            'app/js/controller/racmon/racmon.request.controller.js',
            'app/js/controller/crams.sidenav.controller.js',
            'test/crams.config.js',
            'test/unit/**/*.js'
        ],
        // list of files to exclude
        exclude: [
            'app/js/inteceptors.js',
            'app/js/nectar.controllers.js'
        ],
        // preprocess matching files before serving them to the browser
        // available preprocessors:
        // https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters:
        // https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'junit'],

        //// the default configuration
        junitReporter: {
            outputFile: '../test/reporter/test-results.xml',
            suite: 'junit'
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        singleRun: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        autoWatch: true,

        frameworks: ['jasmine'],

        // browsers to test against, be sure to install the correct browser launcher plugins
        //browsers : ['Chorme'],
        // here we use the PhantomJS. PhantomJS is a headless WebKit with a JavaScript API
        // that allows you to work with that browser.
        browsers: ['PhantomJS'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ]
    });
};

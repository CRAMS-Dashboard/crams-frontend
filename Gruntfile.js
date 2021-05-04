'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '"use strict";\n\n {%= __ngModule %}',
                name: 'cramsConfig'
            },
            // Environment Targets For CRAMS api endpoint
            local: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'local',
                        apiEndpoint: 'http://127.0.0.1:8080/',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'RapidConnAuthController'
                    }
                }
            },
            development: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        apiEndpoint: 'https://crams-api-dev.erc.monash.edu/',
                        authServer: 'https://crams-api-dev.erc.monash.edu:8389',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'RapidConnAuthController'
                    }
                }
            },
            staging: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'product',
                        frontend: 'dd_staging',
                        apiEndpoint: 'https://crams-api-staging.erc.monash.edu/',
                        authServer: 'https://crams-api-staing.erc.monash.edu:8389',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'AAFAuthController'
                    }
                }
            },
            qat: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'qat',
                        frontend: 'dd_qat',
                        apiEndpoint: 'https://crams-api-qat.erc.monash.edu/',
                        authServer: 'https://crams-api-qat.erc.monash.edu:8389',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'AAFAuthController'
                    }
                }
            },
            demo: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'product',
                        frontend: 'dd_prod',
                        apiEndpoint: 'https://crams-api-demo.erc.monash.edu/',
                        authServer: 'https://crams-api-demo.erc.monash.edu:8389',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'RapidConnAuthController'
                    }
                }
            },
            product: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'product',
                        frontend: 'dd_prod',
                        apiEndpoint: 'https://crams-api.erc.monash.edu/',
                        authServer: 'https://crams-api.erc.monash.edu:8389',
                        theme: 'racmon',
                        funding_body: 'CRAMS',
                        system: 'CRAMS-ERB-SYS',
                        erb: 'CRAMS-ERB',
                        auth: 'AAFAuthController'
                    }
                }
            }
        },
        // run the http server
        'http-server': {
            'dev': {
                // the server root directory
                root: 'app',

                // the server port
                // can also be written as a function, e.g.
                // port: function() { return 8282; }
                port: 9000,

                // the host ip address
                // If specified to, for example, "127.0.0.1" the server will
                // only be available on that ip.
                // Specify "0.0.0.0" to be available everywhere
                host: "0.0.0.0",
                showDir: true,
                autoIndex: true,

                // server default file extension
                ext: "html",

                // Tell grunt task to open the browser
                openBrowser: true,

                // customize url to serve specific pages
                customPages: {
                    "/readme": "README.md",
                    "/readme.html": "README.html"
                }
            }
        },

        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            unit: {
                singleRun: true
            },
            continuous: {
                singleRun: false,
                autoWatch: true
            }
        }
    });


    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ng-constant');

    grunt.registerTask('utest', ['karma:unit']);

    // grunt run dev version
    grunt.registerTask('default', ['ngconstant:development', 'http-server:dev']);

    //grunt run staging version
    grunt.registerTask('runstaging', ['ngconstant:staging', 'http-server:dev']);

    //grunt run qat version
    grunt.registerTask('runqat', ['ngconstant:qat', 'http-server:dev']);

    //grunt run demo version
    grunt.registerTask('rundemo', ['ngconstant:demo', 'http-server:dev']);

    //grunt run production version
    grunt.registerTask('runprod', ['ngconstant:product', 'http-server:dev']);

    //grunt run local version
    grunt.registerTask('runlocal', ['ngconstant:local', 'http-server:dev']);

    grunt.registerTask('dev', 'ngconstant:development');
    grunt.registerTask('staging', 'ngconstant:staging');
    grunt.registerTask('qat', 'ngconstant:qat');
    grunt.registerTask('prod', 'ngconstant:product');
    grunt.registerTask('local', 'ngconstant:local');
};

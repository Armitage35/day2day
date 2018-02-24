module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'client/style.css': 'client/style.sass'
                }
            }
        },
        pug: {
            compile: {
                options: {
                    data: {
                        debug: false,
                        timestamp: '<%= new Date().getTime() %>'
                    }
                },
                files: {
                  'emailTemplates/htmlRender/welcomeEmail.html': 'emailTemplates/welcomeEmail.pug',
                  'emailTemplates/htmlRender/passwordResetEmail.html': 'emailTemplates/passwordResetEmail.pug',
                  'emailTemplates/htmlRender/passwordResetSuccess.html': 'emailTemplates/passwordResetSuccess.pug',
                }
            }
        },
        watch: {
            css: {
                files: 'client/*.sass',
                tasks: ['sass']
            },
            pug: {
                files: 'emailTemplates/*.pug',
                tasks: ['pug']
            }
        }
        // Uglify does not support ES6 for now...
        // uglify: {
        //     options: {
        //         banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //     },
        //     build: {
        //         src: 'client/app.js',
        //         dest: 'client/app.min.js'
        //     }
        // }
    });
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
};

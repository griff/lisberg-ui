module.exports = function(grunt) {
 
  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    shell: {
      patternlab: {
        command: "php core/builder.php -gp"
      }
    },

    less: {
      build: {
        files: {
          "public/css/style.css": "source/less/style.less"
        }
      }
    },

    sass: {
      dist: {
        files: {
          'public/css/style.css': 'source/css/style.scss'
        }
      }
    },

    uncss : {
      dist : {
        options : {
          stylesheets : ['/css/style.css'],
          htmlroot : 'public'
        },
        files : {
          'public/css/style.css' : ['public/patterns/**/*.html']
        }
      }
    },

    svgmin: {                       // Task
      options: {                  // Configuration that will be passed directly to SVGO
          plugins: [{
              removeViewBox: false
          }, {
              removeUselessStrokeAndFill: false
          }, {
              convertPathData: { 
                  straightCurves: false // advanced SVGO plugin option
              }
          }]
      },
      dist: {                     // Target
          files: [{               // Dictionary of files
              expand: true,       // Enable dynamic expansion.
              cwd: 'source/images/',     // Src matches are relative to this path.
              src: ['**/*.svg'],  // Actual pattern(s) to match.
              dest: 'public/images/',       // Destination path prefix.
              ext: '.svg'     // Dest filepaths will have this extension.
              // ie: optimise img/src/branding/logo.svg and store it in img/branding/logo.min.svg
          }]
      }
    },

    "svg-sprites": {
        "svg-sprite": {
            options: {
                spriteElementPath: "public/images/",
                spritePath: "public/images/",
                cssPath: "public/css/",
                cssSuffix: "scss",
                cssPrefix: "_",
                sizes: {
                    std: 18
                },
                refSize: 17,
                unit: 20
            }
        }
    },

    imagemin: {                          // Task
      dynamic: {
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: 'source/images',                   // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
          dest: 'public/images'                  // Destination path prefix
        }]
      }
    },

    responsive_images: {
      myTask: {
        options: {
          files: [{
            expand: true,
            src: ['source/images/**/*.{jpg,gif,png}'],
            dest: 'source/images/responsive'
          }]
        }
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: 'public/css/',
        src: ['style.css'],
        dest: 'public/css/',
        ext: '.min.css'
      }
    },

    pagespeed: {
        prod: {
          options: {
              url: "public/patterns/04-pages-00-homepage/04-pages-00-homepage.html",
              locale: "en_GB",
              strategy: "desktop",
              threshold: 80
          }
        },
        options: {
            key: "AIzaSyAjzushvAfgdUNZ__2kuHi7RFSeKmqB_Oc",
            url: "https://developers.google.com"
        }
    },

    watch: {
      html: {
        files: [
          'source/_patterns/**/*.mustache',
          'source/_patterns/**/*.json',
          'source/_data/*.json',
        ],
        tasks: [ 'shell:patternlab' ],
        options: {
          spawn: false,
          livereload: true
        }
      },
      styles: {
        files: [ 'source/css/**/*.scss' ],
        tasks: [ 'sass' ],
        options: {
          spawn: false
        }
      },
      svgs: {
        files: [ 'source/images/**/*.svg' ],
        tasks: [ 'shell:patternlab', 'svgmin', "svg-sprites" ],
        options: {
          spawn: false,
          livereload: true
        }
      },
      imgs: {
        files: [ 'source/images/**/*.{png,jpg,gif}' ],
        tasks: [ 'responsive_images', 'imagemin' ],
        options: {
          spawn: false,
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'public/*.html',
          '{.tmp,public}/css/{,*/}*.css',
          '{.tmp,public}/js/{,*/}*.js',
          'public/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }

    },

    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            'public'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            'public'
          ]
        }
      },
      dist: {
        options: {
          base: 'source'
        }
      }
    },

    browserSync: {
        bsFiles: {
            src: 'public/css/style.css'
        },
        options: {
            watchTask: true
        }
    },

    concurrent: {
      dist: [
        'shell:patternlab', 'sass'
      ]
    }
  });
 
  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'concurrent',
      'connect:livereload',
      'browserSync',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });
 
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['pagespeed']);
  grunt.registerTask('build', ['concurrent', 'uncss', 'cssmin']);
 
};
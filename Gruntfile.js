module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-postcss');
  var autoprefixer = require('autoprefixer-core');

  var os=require('os');
  var ifaces=os.networkInterfaces();
  var lookupIpAddress = null;
  for (var dev in ifaces) {
      if(dev !== "en1" && dev !== "en0") {
          continue;
      }
      ifaces[dev].forEach(function(details){
        if (details.family==='IPv4') {
          lookupIpAddress = details.address;
        }
      });
  }

  //If an IP Address is passed
  //we're going to use the ip/host from the param
  //passed over the command line 
  //over the ip addressed that was looked up
  var ipAddress = grunt.option('host') || lookupIpAddress;

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    shell: {
      patternlab: { // Core Patternlab build script
        command: "php core/builder.php -gp"
      },
      wraith: { // Visual Regression Testing
        command: [
          "cd tests/wraith",
          "wraith capture config",
          "../../"
          ].join('&&')
      }
    },

    /*
        CSS
    */

    less: {
      build: {
        options: {
          sourceMap: true
        },
        files: {
          "public/css/style.css": "source/less/style.less"
        }
      }
    },

    sass: {
      dist: {
        options: {                       // Target options
          sourcemap: 'inline'
        },

        files: {
          'public/css/style.css': 'source/css/style.scss'
        }
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          autoprefixer({browsers: ['last 2 version', 'ie 9']}).postcss
        ]
      },
      dist: {
        src: 'public/css/*.css'
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

    uncss : { // Removes unused css
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

    /*
        Images
    */

    svgmin: {                     // Task
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

    /*
        Performance & Testing
    */
    'html-inspector': {
        all: {
            src: ['public/patterns/**/*.html', '!public/patterns/**/*escaped.html']
        }
    },

    csscss: {
      dist: {
        src: ['source/css/style.scss']
      }
    },

    cssmetrics: {
        dev: {
            src: [
                'public/css/style.css'
            ]
        },
        prod: {
          src: [
            'public/css/style.min.css'
          ]
        }
    },

    /*
        Server Related
    */

    watch: {
      html: {
        files: [
          'source/_patterns/**/*.hbs',
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
        tasks: [ 'sass', 'postcss' ],
        options: {
          spawn: false
        }
      },
      raw_styles: {
        files: [ 'public/css/*.css' ],
        tasks: [ 'postcss' ],
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
        // change this to '0.0.0.0' to access the server from outsideres
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: false,
          base: [
            '.tmp',
            'public',
            'source/bootstrap',
            '.'
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
          open: false, 
          host: ipAddress,
          watchTask: true,
          ports: {
              min: 6001,
              max: 6100
          }
        }
    },

    /*
        Misc
    */

    replace: {
      ip: {
        src: ['public/**/*.html'],             // source files array (supports minimatch)
        overwrite:true,            // destination directory or file
        replacements: [{
          from: '0.0.0.0',                   // string replacement
          to: ipAddress
        }]
      }
    },

    concurrent: {
      dist: [
        'shell:patternlab', 'sass'
      ]
    }
  });
 
  /*
      Tasks
  */

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'concurrent',
      'shell:patternlab',
      'replace',
      'connect:livereload',
      //'browserSync',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });
 
  grunt.registerTask('default', ['build']);
  grunt.registerTask('wraith', ['shell:wraith']);
  grunt.registerTask('test', ['csscss', 'cssmetrics:dev', 'wraith']);
  grunt.registerTask('build', ['concurrent', 'uncss', 'cssmin', 'cssmetrics:prod']);
 
};
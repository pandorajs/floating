/*
 * floating
 * https://github.com/pandorajs/floating
 *
 * Copyright (c) 2014 pandorajs
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  'use strict';

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    idleading: '<%= pkg.family %>/<%= pkg.name %>/<%= pkg.version %>/',

    sea: 'sea-modules/<%= idleading %>',

    jshint: {
      files: ['src/*.js'],
      options: {
        jshintrc: true
      }
    },

    qunit: {
      options: {
        '--web-security': 'no',
        coverage: {
          baseUrl: './',
          src: ['src/*.js'],
          instrumentedFiles: 'temp/',
          lcovReport: 'report/',
          linesThresholdPct: 85
        }
      },
      all: ['test/*.html']
    },

    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'report/*.info'
      }
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          paths: 'src',
          outdir: 'doc'
        }
      }
    },

    clean: {
      pages: {
        files: {
          src: ['gh-pages/**/*', '!gh-pages/.git*']
        }
      },
      doc: {
        files: {
          src: ['doc/**']
        }
      },
      dist: {
        files: {
          src: ['dist/**/*']
        }
      },
      build: {
        files: {
          src: ['.build/**']
        }
      },
      sea: {
        files: {
          src: ['<%= sea %>**']
        }
      }
    },

    copy: {
      doc: {
        files: [{
          expand: true,
          cwd: 'doc/',
          src: ['**'],
          dest: 'gh-pages/'
        }]
      },
      sea: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**'],
          dest: '<%= sea %>'
        }]
      }
    },

    transport: {
      options: {
        debug: true,
        idleading: '<%= idleading %>',
        alias: '<%= pkg.spm.alias %>'
      },
      src: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.js', '*.handlebars', '*.css'],
          dest: '.build/'
        }]
      }
    },

    concat: {
      options: {
        debug: true,
        include: 'relative'
      },
      src: {
        files: [{
          expand: true,
          cwd: '.build/',
          src: ['floating*.js', '!-debug*.js'],
          dest: 'dist/'
        }]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %>-<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
        beautify: {
          'ascii_only': true
        },
        // mangle: true,
        compress: {
          'global_defs': {
            'DEBUG': false
          },
          'dead_code': true
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['*.js', '!*-debug.js'],
          dest: 'dist/'
        }]
      }
    }

  });

  grunt.registerTask('build', ['clean:dist', 'transport', 'concat', 'clean:build', 'uglify']);

  grunt.registerTask('demo', ['clean:sea', 'copy:sea']);

  grunt.registerTask('doc', ['clean:doc', 'yuidoc', 'clean:pages', 'copy:doc']);

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('default', ['test', 'doc', 'build', 'demo']);

};

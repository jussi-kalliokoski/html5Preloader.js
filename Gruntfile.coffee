module.exports = (grunt) ->
  config =
    jasmine:
      html5Preloader:
        src: 'test/src/html5Preloader.js'
        options:
          specs: 'test/spec/*.js'
    coffee:
      tests:
        expand: true
        cwd: 'test/spec'
        src: '*.coffee'
        dest: 'test/spec/'
        ext: '.js'

  grunt.initConfig(config)

  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-coffee')

  grunt.registerTask('test', [
    'coffee:tests',
    'jasmine:html5Preloader'
  ])

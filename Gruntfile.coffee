module.exports = (grunt) ->
  config =
    jasmine:
      html5Preloader:
        src: 'test/src/html5Preloader'
        options:
          specs: 'test/specs/*.coffee'

  grunt.initConfig(config)

  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('test', ['jasmine'])

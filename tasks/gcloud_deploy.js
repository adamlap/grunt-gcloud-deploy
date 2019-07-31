/*
 * grunt-gcloud-deploy
 * 
 *
 * Copyright (c) 2019 Adam Lapworth
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Imports.
    var sys = require('sys'),
        spawnSync = require('child_process').spawnSync,
        format = require('util').format,

    // Constants.
        COMMAND_KILL = 'kill `cat .grunt-gae-pid` && rm -rf .grunt-gae-pid',
        COMMAND_RUN = 'dev_appserver.py {args}{flags}{path}',
        COMMAND_GCLOUD = 'gcloud app deploy build/app.yaml build/index.yaml',
        COMMAND_GCLOUD_ADVANCED = 'gcloud app deploy --project {app} --version {version} {path}/app.yaml {path}/index.yaml',

        REDIRECT_DEVNULL = '>/dev/null 2>&1';

    /**
     * Runs GAE command.
     * @param command
     * @param options
     */
    function run(command, options) {

        command = command.replace(/{app}/g, options.application);
        command = command.replace(/{version}/g, options.version);
        command = command.replace(/{path}/g, options.path);

        grunt.log.writeln(command);

        // Run the command.
        const childProcess = spawnSync(command, {
            stdio: 'inherit',
            encoding : 'utf8',
            shell: true
        });
    }

    /**
     * Grunt task.
     */
    grunt.registerMultiTask('gcloud_deploy', 'Google App Engine GCloud SDK deployment plugin for Grunt.', function () {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                application: null,
                version: null,
                path: '.',
                asyncOutput: false,
                args: {},
                flags: [],
                stdout: true,
                stdin: true,
                stderr: true
            }),

            kill = grunt.option('kill') || this.data.action === 'kill',
            done = this.async();

        // Handle the action specified
        switch(this.data.action) {
            case 'run':
            case 'kill':
                // Kill running servers first.
                exec(COMMAND_KILL, {}, function () {}).on('exit', function (code) {

                    // If the task is killed only, do not do anything else.
                    if (code === 0) {
                        if (options.stdout) {
                            grunt.log.writeln('Server killed.');
                        }
                    }

                    if (kill) {
                        if (code !== 0) {
                            if (options.stderr) {
                                grunt.log.error('Server not running. Nothing to kill.');
                            }
                        }
                        return done();
                    }

                    run(COMMAND_RUN, options);
                });

                break;

            case 'deploy':
                // Deploy application using gcloud SDK

                run(COMMAND_GCLOUD_ADVANCED, options);

                break;

            default:
                // No option specified

                grunt.log.writeln('No gae-grunt option specified.');
                return done();
        }
    });
};
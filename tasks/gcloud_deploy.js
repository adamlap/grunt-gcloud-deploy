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
        COMMAND_RUN = 'dev_appserver.py --enable_console {db_path} {path}',
        COMMAND_DEPLOY = 'gcloud app deploy -q --project {app} --version {version} {path}/app.yaml {path}/index.yaml {path}/cron.yaml {path}/queue.yaml';

    /**
     * Runs GAE command.
     * @param command
     * @param options
     */
    function run(command, options) {

        command = command.replace(/{app}/g, options.application);
        command = command.replace(/{version}/g, options.version);
        command = command.replace(/{path}/g, options.path);

        if (options.hasOwnProperty('db_path') && options.db_path != '') {
            command = command.replace(/{db_path}/g, '--datastore_path=' + options.db_path);
        }

        grunt.log.writeln(command);

        // Run the command.
        const childProcess = spawnSync(command, {
            stdio: 'inherit',
            encoding : 'utf8',
            shell: true
        });

        // Process exit.
        if (childProcess.status === 0) {
            grunt.log.ok('Action executed successfully.');
        } else {
            grunt.log.error('Error executing the action.');
        }

        return childProcess.status;
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
            done = this.async();

        // Handle the action specified
        switch(this.data.action) {
            case 'run':
                // Run application using gcloud SDK

                var status = run(COMMAND_RUN, options);
                return done();

            case 'deploy':
                // Deploy application using gcloud SDK

                var status = run(COMMAND_DEPLOY, options);
                return done();

            default:
                // No action specified

                grunt.log.writeln('No grunt action specified.');
                return done();
        }
    });
};

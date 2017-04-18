'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
    type: 'mysql',
    log_sql: true,
    log_connect: true,
    adapter: {
        mysql: {
            host: '127.0.0.1',
            port: '',
            database: 'wdfe_publish',
            user: 'root',
            password: '',
            prefix: '',
            encoding: 'utf8'
        },
        mongo: {

        }
    }
};

'use strict';

/**
 * session configs
 */
export default {
    name: 'wdfebuild',
    type: 'memory',
    secret: '8!3B$5DG',
    timeout: 24 * 3600,
    cookie: { // cookie options
        length: 32,
        httponly: true
    },
    adapter: {
        file: {
            path: think.RUNTIME_PATH + '/session',
        }
    }
};

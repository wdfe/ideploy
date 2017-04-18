'use strict';

import Base from './base.js';
import {
    spawn,
    fork
} from 'child_process';
export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    async deployAction(self) {
        let socket = self.http.socket;
        let data = self.http.data;
        let logFile = await self.http.session('deployLogFile');
        const sh = spawn('tail', ['-f', logFile]);
        let me = this;
        //在client主动关掉连接的时候，把进程干掉
        socket.on('disconnect', function() {
            console.log('client close socket===========');
            // socket.disconnect();
            sh.kill();
        });
        sh.stdout.on('data', (data) => {
            me.emit('logserver', '' + data);
            let endText = '' + data;
            if (data.indexOf('end!!!') >= 0) {
                console.log('close socket===========:' + data);
                socket.disconnect();
                sh.kill();
            }
        });
        sh.stderr.on('data', (data) => {
            me.emit("logserver", '' + data);
        });
        sh.on('close', (code) => {
            console.log('close child process exited with code ' + code);
        });
        sh.on('exit', function(code) {
            console.log('exit child process exited with code ' + code);
        });
    }

    async indexAction(self) {
        console.log('indexAction into ');
        let socket = self.http.socket;
        let data = self.http.data;
        let logFile = await self.http.session('logFile');
        const sh = spawn('tail', ['-f', logFile]);
        let me = this;
        //在client主动关掉连接的时候，把进程干掉
        socket.on('disconnect', function() {
            console.log('client close socket===========');
            //socket.disconnect();
            sh.kill();
        });
        sh.stdout.on('data', (data) => {
            me.emit('logserver', '' + data);
            let endText = '' + data;
            if (data.indexOf('end!!!') >= 0) {
                console.log('close socket===========:' + data);
                socket.disconnect();
                sh.kill();
            }
        });
        sh.stderr.on('data', (data) => {
            me.emit("logserver", '' + data);
        });
        sh.on('close', (code) => {
            console.log('close child process exited with code ' + code);
        });
        sh.on('exit', function(code) {
            console.log('exit child process exited with code ' + code);
        });
    }
}

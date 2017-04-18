'use strict';
import childProcessPro from 'child-process-es6-promise';
import fileUtil from './fileutil';
import fs from 'fs'
export default class extends think.service.base {
    /**
     * init
     * @return {}         []
     */
    init(...args) {
        super.init(...args);
    }
        // async  deploy(deployInfo, deployUser, deployPass,deployLogFile) {
    async execRemoteShell(ip,dir,shell) {
        //ansible 127.0.0.1 -m shell -a 'cd /Users/waynelu/vue-ssr-hmr-template && ./restart.sh || ./start.sh'
        let cmd = 'ansible ' +ip+'  -m shell -a \'cd '+dir+' && '+shell+'\'';
        console.log(cmd);
        //改成同步执行
        let result = await childProcessPro.exec(cmd, {
            maxBuffer: 100 * 1024 * 1024
        });
        let options = {
            encoding: 'utf8',
            mode: 438,
            flag: 'a'
        };
        console.log(result);
        //fs.writeFileSync(deployLogFile, result.stdout, options);

        return result;
        //let pro = childProcessPro.spawn('./src/common/service/impl/deploy.sh', [shUser, shPass, sourceDirFinal, deployInfo.ip, shPort, targetDir]);

        // var proChild = pro.child;
        // proChild.stdout.on('data', (data) => {
        //     console.log(`stdout: ${data}`);
        //     let options = { encoding: 'utf8', mode: 438, flag: 'a' };
        //     fs.writeFileSync(deployLogFile, data, options);
        // });
        // proChild.stderr.on('data', (data) => {
        //     console.log(`stderr: ${data}`);
        //     let options = { encoding: 'utf8', mode: 438, flag: 'a' };
        //     fs.writeFileSync(deployLogFile, data, options);
        // });
        //
        // proChild.on('close', (code) => {});
        //return pro;
    }
}

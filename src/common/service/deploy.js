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
    async opDeploy(sourceDirList, deployInfo, deployUser, deployPass, deployLogFile, isInc, incExc, opInfo) {
            let fileU = new fileUtil();
            let buildDir = fileU.getCvsDir(deployUser, deployInfo.pro_id);
            //如果是增量更新，切换目录
            if (isInc && incExc == 1) {
                buildDir = fileU.getLastTagDir(deployUser, deployInfo.pro_id);
            }
            buildDir = buildDir.substring(2);
            let sendOpService = think.service('sendop');
            let sendOpS = new sendOpService();
            let options = {
                encoding: 'utf8',
                mode: 438,
                flag: 'a'
            };
          //  fs.writeFileSync(deployLogFile, JSON.parse(opInfo), options);
            if (sourceDirList.length == 1) {
                opInfo.itemZip += buildDir + (sourceDirList[0][0] == '/' ? '' : '/') + sourceDirList[0];
            } else if (sourceDirList.length == 2) {
                opInfo.itemZip += buildDir + (sourceDirList[0][0] == '/' ? '' : '/') + sourceDirList[0];
                opInfo.staticZip += buildDir + (sourceDirList[1][0] == '/' ? '' : '/') + sourceDirList[1];
            }

          //  return {"data": {"info": "task add successful", "taskId": "22421"}, "statusCode": 200};
            let opResult =  await sendOpS.sendOp(opInfo);
            return opResult;
        }
        // async  deploy(deployInfo, deployUser, deployPass,deployLogFile) {
    async deploy(sourceDir, targetDir, deployInfo, deployUser, deployPass, deployLogFile, isInc, incExc) {
        let fileU = new fileUtil();
        let buildDir = fileU.getCvsDir(deployUser, deployInfo.pro_id);
        //如果是增量更新，切换目录
        if (isInc && incExc == 1) {
            buildDir = fileU.getLastTagDir(deployUser, deployInfo.pro_id);
        }
        let shUser, shPass;
        if (deployInfo.ssh_user == '${user}') {
            //部署线上环境，使用session 用户名
            shUser = deployUser;
            shPass = deployPass;
        } else {
            shUser = deployInfo.ssh_user;
            shPass = deployInfo.ssh_pass;
        }
        let shPort = 22;
        //路径自动添加反斜杠
        let sourceDirFinal = buildDir + (sourceDir[0] == '/' ? '' : '/') + sourceDir;
        console.log('./src/common/service/impl/deploy.sh', shUser, shPass, sourceDirFinal, deployInfo.ip, shPort, targetDir);
        let cmdParam = [shUser, shPass, sourceDirFinal, deployInfo.ip, shPort, targetDir].join(' ');
        let cmd = './src/common/service/impl/deploy.sh ' + cmdParam;
        //改成同步执行
        let changeLog = await childProcessPro.exec(cmd, {
            maxBuffer: 100 * 1024 * 1024
        });
        let options = {
            encoding: 'utf8',
            mode: 438,
            flag: 'a'
        };
        fs.writeFileSync(deployLogFile, changeLog.stdout, options);

        return sourceDirFinal;
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

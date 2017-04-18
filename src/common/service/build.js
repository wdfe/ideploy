'use strict';
import childProcessPro from 'child-process-es6-promise';
import fs from 'fs';
import fileUtil from './fileutil';
export default class extends think.service.base {
    /**
     * init
     * @return {}         []
     */
    init() {}
        //设置最终构建目录，如果是增量部署，则新建一个目录用来构建，将上一次tag文件和本次选择构建文件增加进来，形成新目录
    async initBuildDir(buildInfo, deployFiles, username, homeDir, incExc) {
        let fileU = new fileUtil();
        let chunkDir = fileU.getCvsDir(username, buildInfo.pro_id);
        let lastTagDir = fileU.getLastTagDir(username, buildInfo.pro_id);
        //如果是除以下文件以外的文件都部署，那么构建目录还是在chunkDir，否则构建目录在lastTagDir
        if (incExc == 2) {
            lastTagDir = fileU.getCvsDir(username, buildInfo.pro_id);
            chunkDir = fileU.getLastTagDir(username, buildInfo.pro_id);
        }
        //如果有选择文件则把新文件copy到构建目录
        if (deployFiles && deployFiles.length > 0) {
            for (let i = 0; i < deployFiles.length; i++) {
                let fileObj = deployFiles[i];
                let srcFile = homeDir + chunkDir.substring(2) + fileObj.path_n;
                let destFile = homeDir + lastTagDir.substring(2) + fileObj.path_n;
                fileU.copyOneFile(srcFile, destFile);
            }
        }

    }
    async build(buildInfo, logFile, username, isNpmInstall, isInc, incExc, sync) {
        let self = this;
        let fileU = new fileUtil();
        let buildDir = fileU.getCvsDir(username, buildInfo.pro_id);
        //如果是增量文件,则在tag目录构建
        if (isInc && incExc == 1) {
            buildDir = fileU.getLastTagDir(username, buildInfo.pro_id);
        }
        let packageFileDir = buildDir + '/package.json';
        let task = buildInfo.task;
        console.log('task:', buildInfo);
        let code_lang = buildInfo.code_lang;
        let build_shell = './src/common/service/impl/build_' + code_lang + '.sh';
        console.log(build_shell, buildDir, task, buildInfo.pro_id, isNpmInstall);
        ///执行build_hook before
        buildInfo.shellParams={
          build_shell: build_shell,
          buildDir: buildDir,
          task:task,
          isNpmInstall:isNpmInstall
        }
        let hook= buildInfo.build_hook;
        let hookArray = [];
        if(hook&&hook.length>0){
            let hookStrArray = hook.split(';');
            for(let i=0;i<hookStrArray.length>0;i++ ){
              let hookInstance = think.service(hookStrArray[i]);
              //let hookInstance = new hookService();
              hookArray.push(hookInstance);
            }
        }

        for(let i=0 ;i<hookArray.length;i++){
          hookArray[i].before(buildInfo);
        }
        if (sync) {
            let cmdParam = [buildDir, "'" + task + "'", buildInfo.pro_id, isNpmInstall].join(' ');
            let cmd = build_shell + ' ' + cmdParam;
            //改成同步执行
            let changeLog = await childProcessPro.exec(cmd, {
                maxBuffer: 100 * 1024 * 1024
            });
            let options = {
                encoding: 'utf8',
                mode: 438,
                flag: 'a'
            };
            fs.writeFileSync(logFile, changeLog.stdout, options);
        } else {
            const pro = childProcessPro.spawn('sh', [build_shell, buildDir, task, buildInfo.pro_id, isNpmInstall]);
            let childProcess = pro.child;
            let options = {
                encoding: 'utf8',
                mode: 438,
                flag: 'a'
            };
            childProcess.stdout.on('data', (data) => {
                fs.writeFileSync(logFile, data, options);
            });
            childProcess.stderr.on('data', (data) => {
                fs.writeFileSync(logFile, data, options);
            });
            childProcess.on('close', (code) => {
                fs.writeFileSync(logFile, buildInfo.pro_name + ' build end!!!\n', options);
            });
        }

        buildInfo.buildDir = buildDir;
        for(let i=0 ;i<hookArray.length;i++){
          hookArray[i].after(buildInfo);
        }
        return buildInfo;

    }
}

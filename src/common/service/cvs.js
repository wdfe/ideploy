'use strict';
import svn from './impl/svn';
import git from './impl/git';
import diffDir from './impl/diffdir';
import fileUtil from './fileutil';
import fs from 'fs';
import childProcessPro from 'child-process-es6-promise';
export default class extends think.service.base {
    /**
     * init
     * @return {}         []
     */
    init(type) {
        this.type = type;
        let config = {
            username: think.config('cvsUser'),
            password: think.config('cvsPass')
        }
        if (type == 2) {
            this.cvsClient = new svn(config);
        } else {
            this.cvsClient = new git(config);
        }
    }

    export (codeUrl, dirPath = "/temp", isBranch, callback) {
        this.cvsClient.export([codeUrl, dirPath], isBranch, callback);
    }
    exportTag(codeUrl, dirPath = "/temp", newV, callback) {
        this.cvsClient.exportTag(codeUrl, dirPath, newV, callback);
    }

    async getChangeLog(pro, username) {
        let fileU = new fileUtil();
        let cvsDir = fileU.getCvsDir(username, pro.id);
        let isBranch = pro.branch_deploy;
        let lastTagUrl = this.cvsClient.getLastTagUrl(pro.codeUrl, pro.id, pro.lastTag, isBranch);
        let reArray = await this.cvsClient.getChangeLog(pro.codeUrl, lastTagUrl, pro.lastTag, cvsDir);
        return reArray;
    }
    async getFileChangeInfo(pro,username,commit,lastCommit,filename){
      let fileU = new fileUtil();
      let cvsDir = fileU.getCvsDir(username, pro.id);
      let isBranch = pro.branch_deploy;
      let lastTagUrl = this.cvsClient.getLastTagUrl(pro.codeUrl, pro.id, pro.lastTag, isBranch);
      let content = await this.cvsClient.getFileDiff(pro.codeUrl, lastTagUrl,commit,lastCommit,filename,cvsDir);
      let conArr = content.split('\n');
      return conArr;
    }
    async copyTag(codeUrl, proId, newV, username, isInc, homeDir, incExc) {
        let fileU = new fileUtil();
        let cvsDir = fileU.getCvsDir(username, proId);
        if (isInc && incExc == 1) {
            cvsDir = fileU.getLastTagDir(username, proId);
        }
        //删除dist build  bad code!!!;
//        await childProcessPro.exec('rm -rf dist build', {
  //          cwd: cvsDir
    //    });
      //  await childProcessPro.exec('rm -rf dist weidian', {
      //      cwd: cvsDir
      //  });
        return new Promise((resolve, reject) => {
            this.cvsClient.copyTag(codeUrl, proId, newV, cvsDir, isInc, homeDir, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }

            })
        })
    }
    async getCheckoutInfo(pro, username, nowLogFile) {
        console.log(pro);
        //分支发布
        let isBranch = pro.branch_deploy;

        let fileU = new fileUtil();
        let cvsDir = fileU.getCvsDir(username, pro.id);
        //删除文件
        let self = this;
        //删除除了node_modules文件夹以外的所有文件
        //删除文件夹
        if (fs.existsSync(cvsDir)) {
            await childProcessPro.exec('rm -rf ' + cvsDir);
        }
        let lastTagDir = fileU.getLastTagDir(username, pro.id);
        if (fs.existsSync(lastTagDir)) {
            await childProcessPro.exec('rm -rf ' + lastTagDir);
        }
        //没有上一个tag或者非快捷发布
        if (pro.lastTag&&!pro.isQuickDeploy) {

            let lastTagUrl = this.cvsClient.getLastTagUrl(pro.codeUrl, pro.id, pro.lastTag, isBranch);
            //  let changeLog = await self.getChangeLog(pro.codeUrl,lastTagUrl,pro.lastTag,cvsDir);
            return new Promise((resolve, reject) => {
                // todo: 增加项目配置项：diff路径，从配置中取
                let options = {
                    encoding: 'utf8',
                    mode: 438,
                    flag: 'a'
                };
                fs.writeFileSync(nowLogFile, '=================start to checkout code:\n', options);
                //先拉取上一个tag版本
                self.exportTag(lastTagUrl, lastTagDir, pro.lastTag, (err, stdout) => {

                    if (err) {
                        let errmsg = err.toString() + err.stack;
                        fs.writeFileSync(nowLogFile, errmsg, options);
                        reject(err);
                        return;
                    }
                    fs.writeFileSync(nowLogFile, stdout, options);
                    //或者正式仓库目录
                    self.export(pro.codeUrl, cvsDir, isBranch, (err, stdout) => {
                        if (err) {
                            let errmsg = err.toString() + err.stack;
                            fs.writeFileSync(nowLogFile, errmsg, options);
                            reject(err);
                            return;
                        }
                        fs.writeFileSync(nowLogFile, stdout, options);
                        //过滤node_modules文件夹
                        let diff = new diffDir();
                        let result = diff.diff(cvsDir, lastTagDir, ['node_modules', '.git']);
                        //result.changeInfo = changeLog;

                        resolve(result);
                    })
                })
            })
        } else {

            return new Promise((resolve, reject) => {
                let options = {
                    encoding: 'utf8',
                    mode: 438,
                    flag: 'a'
                };
                fs.writeFileSync(nowLogFile, '=================start to checkout code:\n', options);
                self.export(pro.codeUrl, cvsDir, isBranch, function(err, stdout) {
                    //  console.log('exprot success');
                    if (err) {
                        let errmsg = err.toString() + err.stack;
                        fs.writeFileSync(nowLogFile, errmsg, options);
                        reject(err);
                        return;
                    }
                    //过滤node_modules文件夹
                    fs.writeFileSync(nowLogFile, stdout, options);
                    let diff = new diffDir();
                    let result = diff.diff(cvsDir, undefined, ['node_modules', '.git']);
                    resolve(result);
                })
            })
        }
    }
}

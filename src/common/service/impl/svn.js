//从远程fetch 代码到本地, 这里使用 svn 的export进行获取代码
import childProcessPro from 'child-process-es6-promise';
var exec = require('child_process').exec;

function SvnClient(config = {}) {
    this._userName = config.username;
    this._password = config.password;
}
SvnClient.prototype = {
    //对svn来说分支和非分支是2个地址，没有不一样的地方
    export: function(params, isBranch, cb) {
        console.log('-----'+params+'------------------')
        let cmdStr = [
            'svn export --username',
            this._userName,
            '--password',
            this._password,
            '--force'
        ];
        // exec('svn help',function(err,data){
        //     console.log('---dasda--'+err+'---dasda--');
        //     cb(null, data);
        // })
        cmdStr = cmdStr.concat(params).join(' ');
        exec(cmdStr, function(err, data) {
            console.log('---dasda--'+err+'---dasda--', data);
            if (err) {
                cb(err);
            } else {
                cb(null, data);
            }
        });
    },
    /**
     **/
    async getSvnInfo(codeUrl) {
        let cmd = 'svn info ' + codeUrl;
        console.log('getSvnInfo:' + cmd);
        let changeLog = await childProcessPro.exec(cmd, {
            maxBuffer: 100 * 1024 * 1024
        });

        let info = {};

        let infoArray = changeLog.stdout.split('\n');
        for (let i = 0; i < infoArray.length; i++) {
            let lineArray = infoArray[i].split(': ');
            info[lineArray[0]] = lineArray[1];
        }
        return info;
    },
    async getFileDiff(codeUrl, lastTagUrl,commit,lastCommit,filename,cvsDir) {
      //svn diff -c 39049 src/js/user/index.js
      let cmd = 'svn diff -c '+commit+' '+codeUrl+'/'+filename;
      let changeLog = await childProcessPro.exec(cmd, {
          cwd: cvsDir,
          maxBuffer: 100 * 1024 * 1024
      });
      return changeLog.stdout;
    },
    async getChangeLog(codeUrl, lastTagUrl, lastTag, cvsDir) {
        let info = undefined,
            lastInfo = undefined,
            rev = undefined,
            lastRev = undefined,
            cmd = undefined;
        try {
            info = await this.getSvnInfo(codeUrl);
            lastInfo = await this.getSvnInfo(lastTagUrl);
        } catch (e) {
            console.log(e);
        }
        if (info && lastInfo) {
            rev = info['Revision'] || info['版本'];
            lastRev = lastInfo['Last Changed Rev'] || lastInfo['最后修改的版本'];
            cmd = 'svn log ' + codeUrl + ' -v -r r' + lastRev + ':r' + rev;
        } else {
            cmd = 'svn log ' + codeUrl + ' -v ';
        }
        console.log(cmd);


        let changeLog = await childProcessPro.exec(cmd, {
            cwd: cvsDir,
            maxBuffer: 100 * 1024 * 1024
        });
        let reInfo = [];
        let temp = {};

        //[{'author':'waynelu',chaninfo:[{'rev':'r2323','time':'2323131',chang}]
        let logArr = changeLog.stdout.split('------------------------------------------------------------------------');
        think.log('changeLog.stdout', 'INFO');
        for (let i = 1; i < logArr.length - 1; i++) {
            let lineArray = logArr[i];
            let logArrMsg = lineArray.split('\n\n');
            let msgSplit = logArrMsg[0];
            let msg = logArrMsg[1];
            let infoArray = msgSplit.split('\n');
            let infoData = {};
            let revInfoArray = infoArray[1].split(' | ');
            infoData.rev = revInfoArray[0];
            infoData.author = revInfoArray[1];
            infoData.time = revInfoArray[2];
            infoData.changeFilesLog = infoArray.slice(3, infoArray.length);
            infoData.msg = msg;
            if (!temp[infoData.author]) {
                let recInfo = {
                    'author': infoData.author,
                    'changeLog': [infoData]
                };
                temp[infoData.author] = recInfo;
                reInfo.push(recInfo);
            } else {
                temp[infoData.author].changeLog.push(infoData);
            }
        }
        return reInfo;

    },
    getLastTagUrl: function(url, pid, lastTag) {
        let urlArray;
        if (url.indexOf('trunk') > -1) {
            urlArray = url.split('trunk');
        } else if (url.indexOf('branches') > -1) {
            urlArray = url.split('branches');
        }
        else if (url.indexOf('tags') > -1) {
            urlArray = url.split('tags');
        }
        return urlArray[0] + 'tags/project_' + pid + '/' + lastTag;
    },
    exportTag: function(codeUrl, dirPath, newV, callback) {
        this.export([codeUrl, dirPath], false, callback);
    },
    copyTag: function(codeUrl, proId, newV, cvsDir, isInc, homeDir, cb) {
        console.log('copyTag:' + isInc + ' cvsDir: ' + cvsDir);
        let urlArray;
        if (codeUrl.indexOf('trunk') > -1) {
            urlArray = codeUrl.split('trunk');
        } else if (codeUrl.indexOf('branches') > -1) {
            urlArray = codeUrl.split('branches');
        }
        let tagUrl = urlArray[0] + 'tags/project_' + proId + '/' + newV;
        let tagMsg = '"App build: proId-' + proId + ', proVersion-' + newV + '"';

        //增量更新打tag
        if (isInc) {
            let importDir = homeDir + cvsDir.substring(2);
            let paramsInc = [importDir, tagUrl, '-m', tagMsg];
            let cmdStrInc = [
                'svn import --username',
                this._userName,
                '--password',
                this._password
            ];
            cmdStrInc = cmdStrInc.concat(paramsInc).join(' ');
            console.log(cmdStrInc);
            exec(cmdStrInc, function(err, data) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, data);
                }
            });
            return;
        }
        console.log('copyTag no importTag')

        let params = [codeUrl, tagUrl, '--parents', '-m', tagMsg];
        let cmdStr = [
            'svn copy --username',
            this._userName,
            '--password',
            this._password
        ];
        cmdStr = cmdStr.concat(params).join(' ');
        exec(cmdStr, function(err, data) {
            if (err) {
                cb(err);
            } else {
                cb(null, data);
            }
        });
    }

};

module.exports = SvnClient;

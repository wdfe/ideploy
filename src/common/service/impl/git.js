//从远程fetch 代码到本地, 这里使用 svn 的export进行获取代码
import childProcessPro from 'child-process-es6-promise';
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

function GitClient(config) {
    this._userName = config.username;
    this._password = config.password;
}

GitClient.prototype = {
    getFileDiff: async function(codeUrl, lastTagUrl,commit,lastCommit,filename,cvsDir) {
      //git show 94323900d9f613772800b1387c808cc8e7c1432a src/components/h5index/question/operate.vue
      let cmd = 'git show '+commit+' '+filename;
      let changeLog = await childProcessPro.exec(cmd, {
          cwd: cvsDir,
          maxBuffer: 100 * 1024 * 1024
      });
      return changeLog.stdout;
    },
    getChangeLog: async function(codeUrl, lastTagUrl, lastTag, cvsDir) {
        //如果是tag或者分支部署
        let nowCode = 'HEAD';
        if(codeUrl.indexOf('#') > 0){
            nowCode = codeUrl.split('#')[1];
        }
        let cmd = 'git log ' + lastTag + '..'+nowCode+' --date=format:"%Y-%m-%d\ %H:%M:%S"   --name-status';
        if (!lastTag || lastTag.length <= 1) {
            cmd = 'git log  --date=format:"%Y-%m-%d\ %H:%M:%S"   --name-status';
        }

        let changeLog = await childProcessPro.exec(cmd, {
            cwd: cvsDir,
            maxBuffer: 100 * 1024 * 1024
        });
        let reInfo = [];
        let temp = {};
        //[{'author':'waynelu',chaninfo:[{'rev':'r2323','time':'2323131',chang}]
        let logArr = [];
        if (changeLog.stdout && changeLog.stdout.length > 3) {
            logArr = changeLog.stdout.split('\n\ncommit');
        }

        for (let i = 0; i < logArr.length; i++) {
            let lineArray = logArr[i];
            let infoArray = lineArray.split('\n\n');

            let infoData = {};
            let revInfoArray = infoArray[0].split('\n');
            infoData.msg = infoArray[1];
            infoData.rev = 'commit' + revInfoArray[0].replace('commit', '');
            for (let x = 1; x < revInfoArray.length; x++) {
                let temStr = revInfoArray[x];
                if (temStr.indexOf('Author:') >= 0) {
                    infoData.author = temStr.replace('Author:', '').split(' ')[1];
                }
                if (temStr.indexOf('Date:') >= 0) {
                    infoData.time = temStr.replace('Date:', '');
                }

            }


            if (infoArray[2]) {
                infoData.changeFilesLog = infoArray[2].split('\n');
            } else {
                infoData.changeFilesLog = [];
            }

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
    export: function(params, isBranch, cb) {
        //git clone --branch master git://git.somewhere destination_path
        var cmdStr = [
            'git clone'
        ];
        let codeUrl = params[0];
        let cvsDir = params[1];
        let branch = '';
        //如果是分支
        if (isBranch) {
            let urlArray = codeUrl.split('#');
            branch = urlArray[1];
            params[0] = urlArray[0];
        }
        cmdStr = cmdStr.concat(params).join(' ');
        console.log(cmdStr);
        let cmdDir = params[1];
        let self = this;
        exec(cmdStr, function(err, data, stderr) {
            //  self.delGitDir(cmdDir,function(){
            console.log('git checkout stderr: ', stderr);
            if (err) {
                cb(err);
            } else {
                if (isBranch) {
                    exec('git checkout ' + branch, {
                        cwd: cvsDir
                    }, function(err2, data2, stderr2) {
                        if (err2) {
                            cb(err2);
                        } else {
                            cb(null, stderr + '\n' + stderr2);
                        }
                    })
                } else {
                    cb(null, stderr);
                }

            }
            //});

        });
    },
    getLastTagUrl: function(trunkUrl, pid, lastTag, isBranch) {
        let reUrl = trunkUrl;
        if (isBranch) {
            let urlArray = trunkUrl.split('#');
            if (urlArray.length >= 2) {
                reUrl = urlArray[0];
            }
        }
        return reUrl;
    },
    /**
     * 兼容ssh方式和http方式的tag checkout
     * @param params
     * @param tag
     * @param dir
     * @param cb
     */
    exportTag: function(codeUrl, cvsDir, newV, callback) {
        //git clone --branch master git://git.somewhere destination_path
        let cmdStr = 'git clone ' + codeUrl + ' ' + cvsDir;
        console.log('export Tag:' + cmdStr);
        exec(cmdStr, function(err, data) {
            if (err) {
                callback(err);
            } else {
                exec('git checkout ' + newV, {
                    cwd: cvsDir
                }, function(err2, data2) {
                    if (err2) {
                        callback(err2);
                    } else {
                        callback(null, data);
                    }
                })
            }
        });
    },
    /**
     * git配置
     * @param cmdDir  git 仓库所在路径
     * @param email 用户邮箱  备用
     * @param name  用户名  备用
     * @param callback  回调函数
     */
    config: function(cmdDir, callback, email, name) {
        var userEmail = email ? email : '';
        var userName = name ? name : '';
        var cmdStr = [
            'git config',
            'user.email',
            userEmail,
            '&&',
            'git config',
            'user.name',
            userName
        ];
        console.log('cmdDir:' + cmdDir);
        cmdStr = cmdStr.join(' ');
        exec(cmdStr, {
            cwd: cmdDir
        }, function(err, data) {

            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        });
    },
    /**
     * 将现有代码打上tag
     * git tag -a 20213123123131 -m 'tag test'
     * @param params
     * @param cmdDir 命令路径
     * @param callback
     */
    copyTag: function(codeUrl, proId, newV, cvsDir, isInc, homeDir, callback) {

        // var cmdStr = [
        //     'git tag'
        // ];
        // cmdStr.push(newV);//版本号
        // cmdStr = cmdStr.concat(params);
        // cmdStr = cmdStr.join(' ');
        let tagMsg = '"App build: proId-' + proId + ', proVersion-' + newV + '"';
        let cmdStr = 'git add .;git commit -a -m "inc commit tag";git tag -a ' + newV + ' -m ' + tagMsg + ';git push --tags';
        //console.log('===========================' + cmdDir + cmdStr + '====================/n/n');

        exec(cmdStr, {
            cwd: cvsDir
        }, function(err, data) {
            if (err) {
                callback(err);
            } else {
                var pushCmdStr = 'git push origin ' + newV;
                exec(pushCmdStr, {
                    cwd: cvsDir
                }, function(err, data) {
                    callback(null, data);
                });
            }
        });
    },
    /**
     * 删除.git 文件夹
     * @param cmdDir
     */
    delGitDir: function(cmdDir, callback) {
        //' ./server/temp/temp_dir_' + pro.id + '/.git'
        exec('rm -rf ' + cmdDir + '/.git', function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        });
    }

};

module.exports = GitClient;

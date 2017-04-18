'use strict';

import Base from './base.js';
import ProModel from '../model/project';
import CPersonModel from '../model/cperson';
import Moment from 'moment';
import JSZip from 'jszip';
import fs from 'fs';
import fileUtil from '../../common/service/fileutil';
import verUtil from '../../common/service/verutil';
import HisModel from '../model/history';
import Machine from '../model/machine';


// let checkoutMap = {};
export default class extends Base {
    /**
     * index action
     *
     */
    async indexAction() {
        return this.display();
    }
    async newProjectAction() {
        let pro = {};
        pro.name = this.param('name');
        pro.code_url = this.param('code_url');
        pro.vcs_type = this.param('vcs_type');
        pro.code_lang = this.param('code_lang');
        let sessionUser = await this.http.session('user');
        pro.creater = sessionUser.name;
        pro.op_item_id = this.param('op_item_id');
        pro.op_item_name = this.param('op_item_name');
        pro.pub_time = new Moment().format('YYYY-MM-DD HH:mm:ss');
        pro.status = 1;
        let proModel = new ProModel();
        let insertId = await proModel.newProject(pro);
        return this.success(insertId);
    }
    async updateProjectAction() {
        let pro = {};
        pro.id = this.param('id');
        pro.name = this.param('name');
        pro.code_url = this.param('code_url');
        pro.code_lang = this.param('code_lang');
        let sessionUser = await this.http.session('user');
        pro.op_item_id = this.param('op_item_id');
        pro.op_item_name = this.param('op_item_name');
        pro.hook_params = this.param('hook_params');
        pro.build_hook = this.param('build_hook');
        pro.deploy_hook = this.param('deploy_hook');
        // pro.creater = sessionUser.name;
        pro.vcs_type = this.param('vcs_type');
        pro.pub_time = new Moment().format('YYYY-MM-DD HH:mm:ss');
        pro.status = 1;
        let proModel = new ProModel();
        let aRows = await proModel.updateProject(pro);
        return this.success(aRows);
    }
    async getProjectListAction() {
        let pageId = this.param('pageId');
        let pageSize = this.param('pageSize');
        let proModel = new ProModel();
        let dataList = await proModel.getProjectList(pageId, pageSize);
        return this.success(dataList);
    }
    async getProjectByIdAction() {
        let id = this.param('id');
        let proModel = new ProModel();
        let proInfo = await proModel.getProjectById(id);
        let sessionUser = await this.http.session('user');
        proInfo.sessionUser = sessionUser.name;
        proInfo.op_project = {};
        proInfo.op_project.op_project_id = proInfo.op_item_id;
        proInfo.op_project.op_project_name = proInfo.op_item_name;
        delete proInfo.op_item_id;
        delete proInfo.op_item_name;
        return this.success(proInfo);
    }
    async getChangeInfoAction() {
        let id = this.param('id');
        let commit = this.param('commit');
        let lastCommit = this.param('lastCommit');
        let filename = this.param('filename');
        let proModel = new ProModel();
        let proInfo = await proModel.getProjectById(id);
        let sessionUser = await this.http.session('user');
        let username = sessionUser.name;


        let pro = {};
        pro.id = id;
        //pro.name = this.param('name');
        pro.codeUrl = proInfo.code_url;
        pro.vcsType = proInfo.vcs_type;
        pro.lastTag = proInfo.last_tag;
        //如果是git并且url包含#号，则是git分支发布
        if (pro.vcsType == 1 && pro.codeUrl.indexOf('#') >= 0) {
            pro.branch_deploy = true;
        }

        let cvsService = think.service('cvs');
        let cvsInstance = new cvsService(proInfo.vcs_type);
        let diffContent = await cvsInstance.getFileChangeInfo(pro, username, commit, lastCommit, filename);
        this.success(diffContent);;
    }
    async doCheckOut(pro) {
        //如果是git并且url包含#号，则是git分支发布
        if (pro.vcsType == 1 && pro.codeUrl.indexOf('#') >= 0) {
            pro.branch_deploy = true;
        }
        //这里先生成日志文件
        let sessionUser = await this.http.session('user');
        let myDate = new Date();
        let dir = __dirname.replace('app/home/controller', 'buildLogs/');
        let nowLogFile = dir + sessionUser.name + '/' + pro.id + '/' + myDate.getTime();
        this.http.session('logFile', nowLogFile);
        let fileU = new fileUtil();
        let fileDir = dir + sessionUser.name + '/' + pro.id;
        fileU.mkDirSync(fileDir);
        fileU.mkDirSync(dir + sessionUser.name + '/' + pro.id + '_old');
        let options = {
            encoding: 'utf8',
            mode: 438,
            flag: 'a'
        };
        fs.writeFileSync(nowLogFile, '=================start to build:\n', options);
        let cvsService = think.service('cvs');
        let cvsInstance = new cvsService(pro.vcsType);
        let self = this;
        //await cvsInstance.getChangeLog(pro.codeUrl);
        let result = await cvsInstance.getCheckoutInfo(pro, sessionUser.name, nowLogFile);
        result.isQuickDeploy = pro.isQuickDeploy;
        //如果非快捷部署
        if (!pro.isQuickDeploy) {
            result.changeInfo = await cvsInstance.getChangeLog(pro, sessionUser.name);
            //console.log(__dirname.replace('app/home/controller','temp/')+sessionUser.name+'/'+pro.id+'_inc');
            //  fileU.mkDirSync(__dirname.replace('app/home/controller','temp/')+sessionUser.name+'/'+pro.id+'_inc');
            let replaceDir = './temp/' + sessionUser.name + '/' + pro.id
            this.filterDirName(result.same, replaceDir);
            this.filterDirName(result.add, replaceDir);
            this.filterDirName(result.change, replaceDir);
        }
        return result;
    }
    async checkOutAction() {
        let pro = {};
        pro.id = this.param('id');
        pro.name = this.param('name');
        pro.codeUrl = this.param('code_url');
        pro.vcsType = this.param('vcs_type');
        pro.lastTag = this.param('last_tag');
        pro.isQuickDeploy = parseInt(this.param('quick_deploy'));
        let result = await this.doCheckOut(pro);
        //console.log(result);
        this.success(result);
    }
    filterDirName(objArr, dir) {
        //console.log('=========================='+dir);
        for (let i = 0; i < objArr.length; i++) {
            let fileObj = objArr[i];
            if (fileObj.path_n) {
                fileObj.path_n = fileObj.path_n.replace(dir, '');
            }
            if (fileObj.path_o) {
                fileObj.path_o = fileObj.path_n.replace(dir, '');
            }

        }
    }
    isIncDeploy(deployFiles) {
        if (deployFiles && deployFiles.length > 0) {
            return true;
        } else {
            return false;
        }
    }
    async getZipInfo(fDir) {
        let re = new JSZip.external.Promise(function(resolve, reject) {
            fs.readFile(fDir, function(err, data) {
                if (err) {
                    reject(e);
                } else {
                    resolve(data);
                }
            });
        });
        return re;
    }

    async getDirDataFromZip(content, dir) {
        let zipFiles = content.files;
        let arr = [];
        let reInfo = {};
        reInfo.subArr = arr;
        let isHas = {};
        let isDir = true;
        //判断是否是一个最终文件
        if (dir && dir.length > 0) {
            let fileInfo = zipFiles[dir.substring(1)];
            if (fileInfo) {
                isDir = fileInfo.isDir;
            }
        }
        if (isDir) {
            for (let file in zipFiles) {
                let fileInfo = zipFiles[file];
                let subFile = file.substring(dir.length);
                let preFixPath = file.substring(0, dir.length - 1);
                // console.log('subFile:'+subFile);
                // console.log('preFixPath:'+preFixPath);
                if (dir.substring(1) == preFixPath) {
                    let subArr = subFile.split('/');
                    let filename = subArr[0];
                    if (!isHas[filename]) {
                        arr.push({
                            filename: filename,
                            isDir: true,
                            isZip: true,
                            filesize: ''
                        });
                        isHas[filename] = true;
                    }
                }
            }
            reInfo.isDir = true;
        } else {
            let content = await zipFiles[dir.substring(1)].async('text');
            reInfo.content = content;
            reInfo.isDir = false;
        }
        return reInfo;

    }
    async getBuildResultAction() {
        let dir = this.param('dir');
        let buildDir = this.param('buildDir');
        let pre = __dirname.replace('app/home/controller', '');
        let isZip = this.param('isZip');
        let fDir = pre + buildDir.replace('./', '') + dir;
        let pathInZip = '';
        if (isZip == "true") {
            let zipFileArr = dir.split('.zip');
            fDir = pre + buildDir.replace('./', '') + zipFileArr[0] + '.zip';
            pathInZip = zipFileArr[1];
        } else {
            fDir = pre + buildDir.replace('./', '') + dir;
        }

        let dirInfo = fs.statSync(fDir);
        let reInfo = {};
        //如果是目录
        if (dirInfo.isDirectory()) {
            reInfo.isDir = true;
            let fsReaulst = fs.readdirSync(fDir);
            let reArr = [];
            for (let i = 0; i < fsReaulst.length; i++) {
                let statInfo = fs.statSync(fDir + '/' + fsReaulst[i]);
                reArr.push({
                    filename: fsReaulst[i],
                    isZip: false,
                    isDir: statInfo.isDirectory(),
                    filesize: (statInfo.size / 1024) + 'k'
                })
            }
            reInfo.filesArr = reArr;
        } else {
            let ext = '';
            if (fDir.length > 4) {
                ext = fDir.substring(fDir.length - 4, fDir.length);
            }
            if (ext == '.zip') {
                reInfo.isDir = true;
                reInfo.isZip = true;
                let jsZip = new JSZip()
                let f = await this.getZipInfo(fDir);
                let zipInfo = await jsZip.loadAsync(f);
                //let content = fs.readFileSync(fDir,'utf-8');
                let zip = await this.getDirDataFromZip(zipInfo, pathInZip);
                if (zip.isDir) {

                    reInfo.filesArr = zip.subArr;
                } else {
                    reInfo.isDir = false;
                    reInfo.content = zip.content;
                }


                //reInfo.content = content;
            } else {
                reInfo.isDir = false;
                reInfo.isZip = false;
                let content = fs.readFileSync(fDir, 'utf-8');
                reInfo.content = content;
            }

        }
        this.success(reInfo);
    }
    async doBuild(proId, machineId, buildTask, buildType, incExc, isNpmInstall, deployFiles, isQuickDeploy, sync) {
        let proModel = new ProModel();
        let sessionUser = await this.http.session('user');
        let nowLogFile = await this.http.session('logFile');
        let buildInfo = [];
        let bInfo = {};

        if (buildType == 2) {
            bInfo = await proModel.getProjectById(proId);
            bInfo.task = buildTask;
            bInfo.pro_id = bInfo.id;
            bInfo.pro_name = bInfo.name;
        } else {
            buildInfo = await proModel.getProjectBuildInfo(proId, machineId);
            bInfo = buildInfo[0];
        }
        bInfo.sessionUser =  sessionUser;
        let buildService = think.service('build');
        let buildInstance = new buildService();
        let isInc = this.isIncDeploy(deployFiles);
        //如果是增量部署,则新建一个目录，并将本次上线的所有文件放入文件
        if (isInc) {
            let homeDir = __dirname.replace('app/home/controller', '');
            await buildInstance.initBuildDir(bInfo, deployFiles, sessionUser.name, homeDir, incExc);
        }
        let result = await buildInstance.build(bInfo, nowLogFile, sessionUser.name, isNpmInstall, isInc, incExc, sync);
        result.isQuickDeploy = isQuickDeploy;
        return result;
    }
    async buildAction() {
        let proId = this.param('id');
        let machineId = this.param('machineId');
        let buildTask = this.param('buildTask');
        let buildType = this.param('buildType');
        let incExc = this.param('incExc');
        let isNpmInstall = this.param('isNpmInstall');
        let deployFiles = JSON.parse(this.param('deployFiles'));
        let isQuickDeploy = this.param('quick_deploy');
        let result = await this.doBuild(proId, machineId, buildTask, buildType, incExc, isNpmInstall, deployFiles, isQuickDeploy, false);
        //result.bInfo = bInfo;
        this.success(result);
    }

    async doDeploy(proId, machineId, incExc, deployDesc, deployPass, deployFiles, machineArr, onlineReason, notifyCharger, codeUrl, vcsType, lastTag) {
        let proModel = new ProModel();
        //如果没有日志文件夹生成日志文件夹，并把本次部署文件名放入session
        let dir = __dirname.replace('app/home/controller', 'deployLogs/');
        let sessionUser = await this.http.session('user');
        let myDate = new Date();
        let deployLogFile = dir + sessionUser.name + '/' + proId + '/' + myDate.getTime();
        this.http.session('deployLogFile', deployLogFile);
        let fileU = new fileUtil();
        fileU.mkDirSync(dir + sessionUser.name + '/' + proId);
        let options = {
            encoding: 'utf8',
            mode: 438,
            flag: 'a'
        };
        fs.writeFileSync(deployLogFile, '\n=================start to deploy:\n', options);
        let deployService = think.service('deploy');
        let deployInstance = new deployService();
        //是否是增量部署
        let isInc = this.isIncDeploy(deployFiles);
        //循环多个机器部署
        let bInfo = await proModel.getProjectById(proId);
        bInfo.pro_id = bInfo.id;
        bInfo.pro_name = bInfo.name;
        bInfo.sessionUser = sessionUser;
        let deployInfo = {};
        let deployMac = '';
        let opResult = {};
        let restartService = think.service('restart');
        let restartInstance = new restartService ();
        let hook= bInfo.deploy_hook;
        let hookArray = [];
        if(hook&&hook.length>0){
            let hookStrArray = hook.split(';');
            for(let i=0;i<hookStrArray.length>0;i++ ){
              let hookInstance = think.service(hookStrArray[i]);
            //  let hookInstance = new hookService();
              hookArray.push(hookInstance);
            }
        }

        for(let i=0 ;i<hookArray.length;i++){
          hookArray[i].beforeProject(bInfo);
        }


        for (let i = 0; i < machineArr.length; i++) {
            deployInfo = machineArr[i];
            let sourceDirList = deployInfo.sdir.split(';');
            let targetDirList = deployInfo.dir.split(';');
            deployInfo.pro_id = bInfo.id;
            deployInfo.pro_name = bInfo.name;
            deployInfo.sessionUser = sessionUser;
            let server_dir = deployInfo.server_dir;
            deployMac += deployInfo.ip + ' ';
            let ip =  deployInfo.ip;
            let macHook= deployInfo.deploy_hook;
            let macHookArray = [];
            if(macHook&&macHook.length>0){
                let macHookStrArray = macHook.split(';');
                for(let i=0;i<macHookStrArray.length>0;i++ ){
                  let mHookInstance = think.service(macHookStrArray[i]);
                  //let mHookInstance = new mHookService();
                  macHookArray.push(mHookInstance);
                }
            }
            //如果定义了机器的则覆盖项目的
            if(macHook&&macHook.length>0){
              for(let i=0 ;i<macHookArray.length;i++){
                macHookArray[i].beforeMachine(deployInfo,bInfo.hook_params);
              }
            }
            else{
              for(let i=0 ;i<hookArray.length;i++){
                hookArray[i].beforeMachine(deployInfo,bInfo.hook_params);
              }
            }
            //先远程调用目标机器部署前命令，比如删除脚本
            let beforeShell = deployInfo.before_deploy_shell;
            if(server_dir&&server_dir.length>0&&beforeShell&&beforeShell.length>0){
              let reStartInfo = await restartInstance.execRemoteShell(ip,server_dir,beforeShell);
              fs.writeFileSync(deployLogFile, reStartInfo.stdout, options);
            }
            //循环执行deploy
            for (let i = 0; i < sourceDirList.length; i++) {
                let sourceDir = sourceDirList[i];
                let targetDir = targetDirList[i];
                //如果是正式环境需要用当前用户
                if (deployInfo.type == '1' || deployInfo.type == '2') {
                    targetDir = targetDir.replace('${user}', sessionUser.name);
                }
                let result = await deployInstance.deploy(sourceDir, targetDir, deployInfo, sessionUser.name, deployPass, deployLogFile, isInc, incExc);
            }


            let afterShell = deployInfo.after_deploy_shell;
            //远程调用部署后脚本
            if(server_dir&&server_dir.length>0&&afterShell&&afterShell.length>0){
              let reStartInfo = await restartInstance.execRemoteShell(ip,server_dir,afterShell);
              fs.writeFileSync(deployLogFile, reStartInfo.stdout, options);
            }
            //如果定义了机器的则覆盖项目的
            if(macHook&&macHook.length>0){
              for(let i=0 ;i<macHookArray.length;i++){
                macHookArray[i].afterMachine(deployInfo,bInfo.hook_params);
              }
            }
            else{
              for(let i=0 ;i<hookArray.length;i++){
                hookArray[i].afterMachine(deployInfo,bInfo.hook_params);
              }
            }

        }
        for(let i=0 ;i<hookArray.length;i++){
          hookArray[i].afterProject(bInfo)
        }

        fs.writeFileSync(deployLogFile, '\n================= to deploy end:', options);
        //记录部署记录，如果是正式环境需要打tag
        let pro = {};
        pro.id = bInfo.id;
        pro.name = bInfo.name;
        pro.codeUrl = codeUrl;
        pro.vcsType = vcsType; // this.param('vcs_type');
        pro.lastTag = lastTag; // this.param('last_tag');
        this.tagAction(pro,isInc, incExc, machineArr,deployDesc);
        if (this.param('notifyCharger') === 'true') {
            //通知责任人
            let cpersonModel = new CPersonModel();
            let cPersonList = await cpersonModel.getCpersonByProject(proId);
            let emailService = think.service('email');
            let emailIns = new emailService();
            let emailList = '';
            if (cPersonList.length) {
                for (let i = 0; i < cPersonList.length; i++) {
                    emailList += cPersonList[i].email + ';'
                }
                let pubTime = new Moment().format('YYYY-MM-DD HH:mm:ss');
                let content = `<h2 style="color:red">发布人：${sessionUser.name}</h2>\
                <h2 style="color:red">发布机器：${deployInfo.machine_name}</h2>\
                <h2 style="color:red">发布时间：${pubTime}</h2>\;
                <h2 style="color:red">发布描述：${deployDesc}</h2>`;
                emailIns.sendEmail(deployInfo.pro_name + '项目部署信息：', '微店h5项目部署通知邮件', content, emailList).then((err, body) => {
                    if (!err && body == 'successful') {
                        fs.writeFileSync(deployLogFile, '\n=================发送通知邮件成功:\n', options);
                    } else {
                        //console.log(body);
                        fs.writeFileSync(deployLogFile, '\n=================发送通知邮件失败:\n', options);
                    }
                })
            }

        }
        fs.writeFileSync(deployLogFile, '\n================= end!!!:', options);
        return {
            opResult,
            proId,
            deployDesc,
            deployPass,
            deployInfo,
            sessionUser
        }
    }
    async deployAction() {
            let proId = this.param('id');
            let machineId = this.param('machineId');
            let incExc = this.param('incExc');
            let deployDesc = this.param('build_desc'); //上线原因
            let deployPass = this.param('build_pass');
            let deployFiles = JSON.parse(this.param('deployFiles'));
            let machineArr = JSON.parse(this.param('machineArr'));
            let onlineReason = this.param('onlineReason'); // 上线原因
            let notifyCharger = this.param('notifyCharger');
            let codeUrl = this.param('code_url');
            let vcsType = this.param('vcs_type');
            let lastTag = this.param('last_tag');

            let result = await this.doDeploy(proId, machineId, incExc, deployDesc,
                deployPass, deployFiles, machineArr, onlineReason, notifyCharger, codeUrl, vcsType, lastTag);
            this.success(result);
        }
        /*
         打tag并且入库
        */
    async tagAction(pro, isInc, incExc, machineArr, deployDesc) {
        //let buildInfo = await proModel.getProjectBuildInfo(pro.id,machineId);

        //获取新版本号,svn打tag
        let proModel = new ProModel();
        let verU = new verUtil();
        let newV = verU.getNewVer(pro.lastTag);
        let sessionUser = await this.http.session('user');
        let cvsService = think.service('cvs');
        let cvsInstance = new cvsService(pro.vcsType);

        //填写历史数据库
        let hasProductDeploy = false;
        for (let i = 0; i < machineArr.length; i++) {
            let deployInfo = machineArr[i];
            let his = {};
            his.project_id = pro.id;
            his.user = sessionUser.name;
            his.ip = deployInfo.ip;
            his.pub_time = new Moment().format('YYYY-MM-DD HH:mm:ss');
            his.pub_desc = deployDesc;
            his.type = deployInfo.type;
            let envText = '正式';
            if (his.type == '2') {
                envText = '预发布';
            } else if (his.type == '3') {
                envText = '测试';
            }
            his.ip = envText + '-' + his.ip + '-' + deployInfo.name;
            his.machine_id = deployInfo.id;
            his.tag = newV;
            let deployLogFile = await this.http.session('deployLogFile');
            let nowLogFile = await this.http.session('logFile');
            let dir = __dirname.replace('app/home/controller', '');
            his.build_log = nowLogFile.replace(dir, '');
            his.deploy_log = deployLogFile.replace(dir, '');
            let hisModel = new HisModel();
            let newHis = await hisModel.newHistory(his);
            if (deployInfo.type == '1') {
                hasProductDeploy = true;
            }

        }
        //只有正式环境才打tag,其他只是记录部署
        if (hasProductDeploy) {
            //如果同一次构建部署多次，则需要避免打多次tag,所以从数据库里看看有没有记录
            let proInfo = await proModel.getProjectById(pro.id);
            if (proInfo.last_tag != newV) {
                let homeDir = __dirname.replace('app/home/controller', '');
                await cvsInstance.copyTag(pro.codeUrl, pro.id, newV, sessionUser.name, isInc, homeDir, incExc);
            }
        } else {
            //如果非正式环境，tag不变
            newV = pro.lastTag;
        }
        //如果有正式环境，修改project表的lastTag
        if (hasProductDeploy) {
            let proData = {};
            proData.id = pro.id;
            proData.online_tag = newV;
            proData.last_tag = newV;
            let up = await proModel.updateProject(proData);
        }

        //  this.success(result);
    }
    async getBatchDeployStatusAction() {
        let status = await this.http.session('batchDeployData');
        return this.success(status);
    }
    async batchDeployAction() {
        let deployData = JSON.parse(this.param('deploy'));
        let result = {
            checkout: [],
            log: [],
            build: [],
            deploy: []
        };
        this.http.session('batchDeployData', result);
        //循环checkout,build,deploy
        for (let i = 0; i < deployData.length; i++) {
            let item = deployData[i];
            let pro = {};
            pro.id = item.pInfo.id;
            pro.name = item.pInfo.name;
            pro.codeUrl = item.pInfo.code_url;
            pro.vcsType = item.pInfo.vcs_type;
            pro.lastTag = item.pInfo.last_tag;

            pro.isQuickDeploy = true;
            let log = {};
            log.id = pro.id;
            log.machineId = item.mInfo.id;
            //正在部署
            log.status = 1;
            result.log.push(log);
            this.http.session('batchDeployData', result.log);
            let checkout = await this.doCheckOut(pro); //checkout
            let build = await this.doBuild(pro.id, item.mInfo.id, '', 1, 1, item.isNpmInstall, [], false, true); //build
            let machineArr = [item.mInfo];
            let deploy = await this.doDeploy(pro.id, item.mInfo.id, 1, item.desc, '', [], machineArr, item.onlineReason, 'false', pro.codeUrl, pro.vcsType, pro.lastTag);
            log.deployLogFile = await this.http.session('deployLogFile');
            log.nowLogFile = await this.http.session('logFile');
            log.status = 2; //部署完成
            result.log.push(log);
            result.checkout.push(checkout);
            result.build.push(build);
            result.deploy.push(deploy);
            this.http.session('batchDeployData', result.log);
        }
        this.success(result);

    }
}

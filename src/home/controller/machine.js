'use strict';
import Base from './base.js';
import Machine from '../model/machine';
import ProModel from '../model/project';
import request from 'request';
/**
 * rest controller
 * @type {Class}
 */
export default class extends Base {


    async indexAction() {
        let machineModel = new Machine();
        let data;
        if (this.http.isPost()) {
            let values = this.post();
            let batch = values.batch;
            //如果是批量添加
            let start = 1;
            let end = 1;
            if(batch.indexOf('-')>0){
              let batchArr = batch.split('-');
              start = parseInt(batchArr[0]);
              end = parseInt(batchArr[1]);
            }
            for(let i = start ; i <= end;i ++){
                let machine = {};
                machine.name = values.name.replace(/\${NO}/g,''+i);
                machine.task = values.task.replace(/\${NO}/g,''+i);
                machine.type = values.type;
                machine.ip = values.ip;
                machine.sdir = values.sdir.replace(/\${NO}/g,''+i);
                machine.dir = values.dir.replace(/\${NO}/g,''+i);
                machine.ssh_user = values.ssh_user;
                machine.ssh_pass = values.ssh_pass;
                machine.project_id = values.project_id;
                machine.op_env_id = values.op_env_id;
                await machineModel.newMachine(machine);
            }

          //  let insertId = await machineModel.newMachine(values);
            return this.success(0);
        } else {
            let id = this.get('id');
            if (id) {
                console.log(data);
                data = await machineModel.getMachineById(id);
                return this.success(data);
            } else {
                return this.fail('缺少machineId');
            }
        }
    }
    async updateAction(){
        if (this.http.isPost()) {
            let machineModel = new Machine();
            let values = this.post();
            let aRows = await machineModel.updateMachine(values);
            return this.success(aRows);
        }
    }
    async lockAction(){
        if (this.http.isPost()) {
            let machineModel = new Machine();
            let ac = this.post('ac');
            let machineArr = JSON.parse(this.param('machineArr'));
            let sessionUser = await this.http.session('user');
            let username = sessionUser.name;
            let isAdmin = this.post('isAdmin');
            let errorMsg = '';
            let hasError =false;
            //批量锁定
            for(let i = 0;i < machineArr.length;i ++){
                let mInfo = machineArr[i];
                let data = await machineModel.getMachineById(mInfo.id);

                //如果环境已经被锁定，并且当前用户不是你，那么无法做锁定解锁操作
                if(data.is_lock==1&&data.lock_user != username){
                    if(!isAdmin){
                        errorMsg += data.name+'('+data.ip+'),';
                        hasError = true;
                        //return this.success({'status':403,'msg':'当前环境并'+data.lock_user+'锁定，请联系他解锁！'});
                    }
                }
                if(ac == 'lock'){
                    mInfo.is_lock=1;
                    mInfo.lock_user=username;
                }
                else{
                    mInfo.is_lock=0;
                  mInfo.lock_user='';
                }
                let aRows = await machineModel.updateMachine(mInfo);
            }


            if(hasError){
                return this.success({'status':403,'msg':'环境'+errorMsg+'锁定，请联系他解锁！其他环境操作成功！'});
            }
            return this.success({'status':200,'msg':'操作成功'});
        }
    }
    async deleteAction(){
        if (this.http.isPost()) {
            let machineModel = new Machine();
            let id = this.post('id');
            let aRows = await machineModel.deleteMachine(id);
            return this.success(aRows);
        }
    }

    async projectAction() {
        let machineModel = new Machine();
        let data;
        let projectId = this.get('id');
        if (projectId) {

            data = await machineModel.getMachinesByProject(projectId);
                  console.log(data);
            return this.success(data);
        } else {
            return this.fail('缺少projectId');
        }

    }

    /**
     * before magic method
     * @return {Promise} []
     */
    __before() {

    }
}

'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async getMachineById(machineId) {
        let machineModel = think.model('machine', think.config('db'), 'home');
        let data = await machineModel.where({
            'id': machineId
        }).find();
        return data;
    }

    async getMachinesByProject(projectId) {
        let machineModel = think.model('machine', think.config('db'), 'home');
        // let data = await machineModel.where({ 'project_id': projectId }).select();
        let data = await machineModel.join({
            table: 'project',
            join: 'inner',
            as: 'p',
            on: ['project_id', 'id']
        }).where({
            'project_id': projectId
        }).field('machine.id,machine.name,machine.type,op_env_id,is_lock,lock_user,ip,sdir,dir,task,ssh_user,ssh_pass,server_dir,after_deploy_shell,before_deploy_shell,machine.deploy_hook as deploy_hook,machine.hook_params as hook_params,project_id,p.name as pro_name').select();
        return data;
    }
    async updateMachine(data) {
        let machineModel = think.model("machine", think.config("db"), "home");
        let affectedRows = await machineModel.where({
            id: data.id
        }).update(data);
        return affectedRows;
    }
    async deleteMachine(id) {
        let machineModel = think.model("machine", think.config("db"), "home");
        let affectedRows = await machineModel.where({
            id: id
        }).delete(id);
        return affectedRows;
    }
    async newMachine(data) {
        let machineModel = think.model("machine", think.config("db"), "home");
        let insertId = await machineModel.add(data);
        return insertId;
    }
}

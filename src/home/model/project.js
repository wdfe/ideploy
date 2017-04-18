'use strict';
/**
 * model
 */
export default class extends think.model.base {
    /**
     */
    async getProjectById(id) {
        let proModel = think.model("project", think.config("db"), "home");
        let data = await proModel.where({
            "id": id
        }).find();
        return data;
    }
    async getProjectList(pageId, pageSize) {
        let proModel = think.model("project", think.config("db"), "home");
        let data = await proModel.page(pageId, pageSize).countSelect();
        return data;
    }
    async newProject(pro) {
        let proModel = think.model("project", think.config("db"), "home");
        console.log(pro)
        let insertId = await proModel.add(pro);

        return insertId;
    }
    async updateProject(pro) {
      console.log(pro);
        let proModel = think.model("project", think.config("db"), "home");
        let affectedRows = await proModel.where({
            id: pro.id
        }).update(pro);
        return affectedRows;
    }
    async getProjectBuildInfo(projectId, machindId) {
        let proModel = think.model("project", think.config("db"), "home");
        let data = await proModel.join({
            table: 'machine',
            join: 'inner',
            as: 'm'
        }).where({
            'project.id': projectId,
            'm.id': machindId
        }).field('project.id as pro_id,project.name as pro_name,project.code_lang as code_lang,'
        +'project.hook_params as hook_params,project.deploy_hook as deploy_hook,build_hook,'
        +'m.hook_params as machine_hook_params,m.deploy_hook as machine_deploy_hook,'
        +'m.id as machine_id,m.name as machine_name,ip,sdir,dir,task,ssh_user,ssh_pass,type,is_lock,'
        +'lock_user,server_dir,after_deploy_shell,before_deploy_shell').select();
        return data;
    }
}

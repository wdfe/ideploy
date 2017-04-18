/**
 *
 * @authors Your Name (you@example.org)
 * @date    2016-06-16 17:46:07
 * @version $Id$
 */

'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async getCpersonById(id) {
        let cpersonModel = think.model('cperson', think.config('db'), 'home');
        let data = await cpersonModel.where({
            'id': id
        }).field('cperson.id,cperson.name,cperson.add_time,cperson.project_id,cperson.status,cperson.email').select();
        return data;
    }

    async getCpersonByProject(projectId) {
        let cpersonModel = think.model('cperson', think.config('db'), 'home');
        let data = await cpersonModel.where({
            'project_id': projectId
        }).field('cperson.id,cperson.name,cperson.add_time,cperson.project_id,cperson.status,cperson.email').select();
        console.log('data', data)
        return data;
    }
    async updateCperson(data) {
        let cpersonModel = think.model("cperson", think.config("db"), "home");
        let affectedRows = await cpersonModel.where({
            id: data.id
        }).update(data);
        return affectedRows;
    }
    async deleteCperson(id) {
        let cpersonModel = think.model("cperson", think.config("db"), "home");
        let affectedRows = await cpersonModel.where({
            id: id
        }).delete(id);
        return affectedRows;
    }
    async newCperson(data) {
        let cpersonModel = think.model("cperson", think.config("db"), "home");
        console.log(data);
        let insertId = await cpersonModel.add(data);
        return insertId;
    }
}

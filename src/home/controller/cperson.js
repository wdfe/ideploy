/**
 *
 * @authors Your Name (you@example.org)
 * @date    2016-06-16 17:47:19
 * @version $Id$
 */

'use strict';
import Base from './base.js';
import Cperson from '../model/cperson';
import Moment from 'moment';
/**
 * rest controller
 * @type {Class}
 */
export default class extends Base {

    async indexAction() {
        let cpersonModel = new Cperson();
        let data;
        if (this.http.isPost()) {
            let values = this.post();
            values.project_id = parseInt(values.project_id);
            values.add_time = new Moment().format('YYYY-MM-DD HH:mm:ss');
            let insertId = await cpersonModel.newCperson(values);
            return this.success(insertId);
        } else {
            let id = this.get('id');
            if (id) {
                data = await cpersonModel.getCpersonById(id);
                return this.success(data);
            } else {
                return this.fail('缺少projectId');
            }
        }
    }
    async updateAction() {
        if (this.http.isPost()) {
            let cpersonModel = new Cperson();
            let values = this.post();
            let aRows = await cpersonModel.updateCperson(values);
            return this.success(aRows);
        }
    }
    async deleteAction() {
        if (this.http.isPost()) {
            let cpersonModel = new Cperson();
            let id = this.post('id');
            let aRows = await cpersonModel.deleteCperson(id);
            return this.success(aRows);
        }
    }

    async projectAction() {
        let cpersonModel = new Cperson();
        let data;
        let projectId = this.get('id');
        if (projectId) {
            console.log(data);
            data = await cpersonModel.getCpersonByProject(projectId);
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

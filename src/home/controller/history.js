'use strict';

import Base from './base.js';
import HisModel from '../model/history';
import fs from 'fs';
export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        //auto render template file index_index.html
        return this.display();
    }
    async getHistoryListAction() {
        let proId = this.param('proId');
        let pageId = this.param('pageId');
        let pageSize = this.param('pageSize');
        let hModel = new HisModel();
        let dataList = await hModel.getHistoryList(proId, pageId, pageSize);
        return this.success(dataList);
    }
    async getHistoryLogAction() {
        let buildLog = this.param('buildLog');
        let deployLog = this.param('deployLog');
        let dir = __dirname.replace('app/home/controller', '');
        buildLog=dir+buildLog.replace(dir, '');
        deployLog=dir+deployLog.replace(dir, '');
        let logContent = fs.readFileSync(buildLog, "utf-8") + fs.readFileSync(deployLog, "utf-8");;
        return this.success(logContent);
    }
    async getTotalStatAction(){
        let startTime = this.param('startTime');
        let endTime = this.param('endTime');
        let user = this.param('user');
        let type = this.param('type');
        let hModel = new HisModel();
        let dataList = await hModel.getTotalStat(startTime,endTime,user,type);
        return this.success(dataList);
    }
    async getUserStatAction() {
        let startTime = this.param('startTime');
        let endTime = this.param('endTime');
        let projectId = this.param('id');
        let type = this.param('type');
        let hModel = new HisModel();
        let dataList = await hModel.getUserStat(startTime,endTime,projectId,type);
        return this.success(dataList);
    }
    async getEnvStatAction() {
        let startTime = this.param('startTime');
        let endTime = this.param('endTime');
        let projectId = this.param('id');
        let user = this.param('user');
        let hModel = new HisModel();
        let dataList = await hModel.getEnvStat(startTime,endTime,projectId,user);
        return this.success(dataList);
    }
}

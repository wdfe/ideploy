'use strict';

import Base from './base.js';
import InsModel from '../model/install';
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    return this.display();
  }

  doAction(){
    let ins = new InsModel();
    let res = ins.createTable();
    return this.success('成功');
  }
}

'use strict';
import User from '../model/user'
/**
 * rest controller
 * @type {Class}
 */
export default class extends think.controller.rest {
    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    init(http) {
        super.init(http);
    }

    indexAction() {}
        /**
         *rest get 根据用户名获取用户
         */
    async putAction() {
        console.log('updatePass action=======================');
        let sessionUser = await this.http.session('user');
        let name = sessionUser.name;
        let repass = this.param('name'),
            pass = this.param('pass');
        if (repass != pass) {
            return this.fail('2次输入密码不一致');
        }
        let userModel = new User();
        let affectedRows = await userModel.updatePass(name, pass);
        if (affectedRows) {
              return this.fail('修改成功！');
        } else {
            return this.fail('修改失败')
        }
    }
    async getAction() {
            let data;
            let name = this.get('name');
            let userModel = new User();
            if (name) {
                data = await userModel.getUserByName(name);
                return this.success(data);
            } else {
                data = await userModel.getAll();
                return this.success(data);
            }
        }
        /**
         * before magic method
         * @return {Promise} []
         */
    __before() {

    }
}

'use strict';

import Base from './base.js';
import UserModel from '../model/user'
export default class extends Base {
    /**
     * 登录验证
     * index action
     * @return {Promise} []
     */
    async indexAction() {
        if (this.http.isPost()) {
            let name = this.post('name'),
                pass = this.post('pass');
            let userModel = new UserModel();
            /**
             * promise
             */
            //            let pro = userModel.getUserById(name);
            //            let me=this;
            //            pro.then(function(data){
            //                return me.success(data.pass);
            //            })
            /**
             * Generator
             */
            //             let gen=userModel.getUserById(name)
            //             let reData=gen.next();
            //            return this.success('登陆成功'+reData.value);
            /**
             * await
             */

            /*
             * 先检查LDAP是否能登录成功；否则尝试连接本地数据库
             */
            let canloginFromLDAP = false; //await userModel.loginFromLDAP(name, pass);

            if(canloginFromLDAP) {
                let info = {
                    name: name,
                    pass: pass
                };
                this.http.session('user', info);
                return this.success(info);
            }else {
                let userInfo = await userModel.getUserByName(name);
                if(userInfo && userInfo.pass === pass) {
                    this.http.session('user', userInfo);
                    return this.success(userInfo);
                } else {
                    return this.fail('登陆失败')
                }
            }

        } else {
            return this.display();
        }
    }
    async updatePassAction() {
      if (this.http.isPost()) {
          let repass = this.post('name'),
              pass = this.post('pass');
          if(repass != pass){
              return this.fail('密码不一致');
          }
          let userModel = new UserModel();
          let affectedRows = await userModel.updateUser(name,pass);
          if (userInfo && userInfo.pass === pass) {
              this.http.session('user', userInfo);
              return this.success(userInfo);
          } else {
              return this.fail('登陆失败')
          }

      } else {
          return this.display();
      }
    }
    async isuserexistAction() {
        if (this.http.isGet()) {
            let name = this.get('name');
            let data = await this.model('user').where({
                name: name
            }).find();
            if (data) {
                return this.success({
                    isExist: true
                });
            } else {
                return this.success({
                    isExist: false
                })
            }
        }
    }

    // testAction(){
    //     return this.success();
    // }
}

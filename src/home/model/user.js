'use strict';
import rp from 'request-promise';

/**
 * model
 */
export default class extends think.model.base {
    async getUserByName(name) {
        let userModel = think.model("user", think.config("db"), "home");
        let data = await userModel.where({
            "name": name
        }).find();
        return data;
    }
    async loginFromLDAP(name, pass) {
        console.log(name,pass);
        let requestOption = {
            method: 'GET',
            uri: 'http://yourldap.com/api/login',
            qs: {
                username: name,
                password: pass
            },
            json: true
        };
        let data = await rp(requestOption);
        let result;
        try {
            result = (data.result.result.status_code == 0);
        }catch(e) {
            result = false;
        }
        return result;
    }
    async getUserById(id) {
        let userModel = think.model("user", think.config("db"), "home");
        let data = await userModel.where({
            "id": id
        }).find();
        return data;
    }
    async updatePass(name,pass) {
        let user = {};
        user.name = name;
        user.pass = pass;
        let userModel = think.model("user", think.config("db"), "home");
        let affectedRows = await userModel.where({
            "name": name,
        }).update(user);
       return affectedRows;
    }
    async getAll() {
        let userModel = think.model("user", think.config("db"), "home");
        let data = await userModel.fieldReverse('pass').select();
        return data;
    }
}

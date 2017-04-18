'use strict';
import fs from 'fs';
/**
 * model
 */
export default class extends think.model.base {
  async createTable() {
      let model=think.model('', think.config('db'), 'home');
      let dir = __dirname.replace('app/home/model','')+'db/db.sql';
      var sql = fs.readFileSync(dir).toString('utf-8');
      let sqlArray = sql.split(';');
      let reArray = [];
      for(let i =0 ;i<sqlArray.length;i++){
        let execSql = sqlArray[i];
        if(execSql && execSql.length>5){
          reArray[i] = await model.execute(execSql);
        }
        else{
          reArray[i] = 'nosql'
        }
      }
      return reArray;
    }
}

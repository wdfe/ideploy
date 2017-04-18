'use strict';
/**
 * model
 */
export default class extends think.model.base {

    async getHistoryList(proId, pageId, pageSize) {
        let hisModel = think.model("history", think.config("db"), "home");
        let data = await hisModel.where({
            "project_id": proId
        }).order("id DESC").page(pageId, pageSize).countSelect();
        return data;
    }
    async newHistory(his) {
        let hisModel = think.model("history", think.config("db"), "home");
        let insertId = await hisModel.add(his);
        return insertId;
    }
    async getTotalStat(startTime,endTime,user,te) {
        let hisModel = think.model("history", think.config("db"), "home");
        let sql = "select project_id  ,count(*) as pub,name  from history,project where "+
        "history.project_id=project.id  ";
        let endSql = " group by project_id order by pub desc";
        if(startTime&&startTime.length>0){
          endSql = "and date(history.pub_time)<='"+endTime+"' and date(history.pub_time)>'"+startTime+"'"+endSql;
        }
        let type = parseInt(te);
        if(user&&user.length>0){
          sql = "select project_id  ,count(*) as pub,name  from history,project where "+
          "history.project_id=project.id and history.user='"+user+"' ";
        }else if(type > 0){
          sql = "select project_id  ,count(*) as pub,name  from history,project where "+
          "history.project_id=project.id and history.type="+type+" ";
        }
        sql = sql+ endSql;
        let dataList = await hisModel.query(sql);
        return dataList;
    }
    async getUserStat(startTime,endTime,projectId,te) {
        let hisModel = think.model("history", think.config("db"), "home");
        let pId = parseInt(projectId);
        let type = parseInt(te);
        let sql = "select user as name ,count(*) as pub from history";
        let endSql = " group by user order by pub desc";
        if(startTime&&startTime.length>0){
          endSql = " date(history.pub_time)<='"+endTime+"' and date(history.pub_time)>'"+startTime+"'"+endSql;
        }
        if(pId>0){
          sql = "select user as name ,count(*) as pub from history where project_id="+pId+"  ";
          if(startTime&&startTime.length>0){
            sql = sql+" and "+ endSql;
          }
          else{
            sql = sql+ endSql;
          }
        }else if(type > 0){
          sql = "select user as name ,count(*) as pub from history where type="+type+" ";
          if(startTime&&startTime.length>0){
            sql = sql+" and "+ endSql;
          }
          else{
            sql = sql+ endSql;
          }
        }
        else{
            if(startTime&&startTime.length>0){
              sql = sql+" where "+ endSql;
            }
            else{
              sql = sql+ endSql;
            }
        }

        let dataList = await hisModel.query(sql);
        return dataList;
    }

    async getEnvStat(startTime,endTime,projectId,user) {
        let hisModel = think.model("history", think.config("db"), "home");
        let pId = parseInt(projectId);
        let sql = "select type,count(*) as pub  from history  ";
        let endSql = " group by type order by pub desc";
        if(startTime&&startTime.length>0){
          endSql = " date(history.pub_time)<='"+endTime+"' and date(history.pub_time)>'"+startTime+"'"+endSql;
        }
        if(pId>0){
          sql = "select type,count(*) as pub  from history where project_id="+pId+" ";
          if(startTime&&startTime.length>0){
            sql = sql+" and "+ endSql;
          }
          else{
            sql = sql+ endSql;
          }
        }
        else if(user&&user.length>0){
          sql = "select type,count(*) as pub  from history where user='"+user+"'  ";
          if(startTime&&startTime.length>0){
            sql = sql+" and "+ endSql;
          }
          else{
            sql = sql+ endSql;
          }
        }
        else{
            if(startTime&&startTime.length>0){
              sql = sql+" where "+ endSql;
            }
            else{
              sql = sql+ endSql;
            }
        }
        let dataList = await hisModel.query(sql);
        return dataList;
    }
}

export default class {
  getProjectById(id,that) {
    $.ajax({
      type: 'get',
      url: '/home/project/get_project_by_id',
      data: {
        id: id
      },
      success: function(res) {
        let itemDatas = res.data;
        let baseInfoArray = [];
        let codeLang = itemDatas.code_lang;
        // if(itemDatas.code_lang == 0){
        //   codeLang = 'javascript';
        // }
        // else if(itemDatas.code_lang == 1){
        //   codeLang = 'php';
        // }
        // else if(itemDatas.code_lang == 2){
        //   codeLang = 'java';
        // }
        baseInfoArray.push({key: '1', keyName: '项目名称：', keyValue: itemDatas.name});
        baseInfoArray.push({key: '2', keyName: '创建人：', keyValue: itemDatas.creater});
        baseInfoArray.push({key: '3', keyName: '仓库地址：', keyValue: itemDatas.code_url});
        baseInfoArray.push({key: '4', keyName: '代码语言：', keyValue: codeLang});
        let vcsTypeStr = (itemDatas.vcs_type == 1 ? "git" : "svn");
        that.setState({
          sessionUser: res.data.sessionUser,
          infoData: baseInfoArray,
          projectData: itemDatas,
          code_url: itemDatas.code_url,
          name: itemDatas.name,
          vcs_type: itemDatas.vcs_type
        });
      }
    })
  }

  getMachineList(id,self) {
    $.ajax({
      url: '/home/machine/project/id/' + id,
      type: 'GET',
      success: function(res) {
        if (res.errno == 0) {
          self.setState({machineList: res.data})
        }
      }
    })
  }
  checkout(){

  }
}

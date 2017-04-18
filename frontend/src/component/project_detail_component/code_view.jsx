import React, {Component} from 'react';
import {
  Timeline,
  Row,
  Card,
  CheckBox,
  Col,
  Table,
  Form,
  Input,
  Button,
  Checkbox,
  Tabs,
  Badge,
  Select,
  Icon,
  Modal,
  Radio,
  Tag
} from 'antd';
import '../../style/diffcode.less';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const CodeView = React.createClass({
  getInitialState(){
    return {
      code_url: this.props.code_url,
      commitDiffModalVisible: false,
      commitDiffModalTitle: '',
      commitdiffModalContent:'',
      vcs_type: 1,
      name: '',
      branch_deploy: false,
      authors:[],
      showChangeLog:[],
      addData: [],
      projectId: -1,
      changeData: [],
      sameData: [],
      projectData: {},
      selectedRowKeys: {
        'add': [],
        'change': [],
        'same': []
      },
      incExc: 1,
      checkoutLoading: false,
      curTab:'add',
      selectedFiles: [],
    }
  },
  componentWillReceiveProps(nextProps){
    this.setState({
       code_url: nextProps.code_url,
       projectData: nextProps.projectData,
       name: nextProps.name,

       branch_deploy: nextProps.branch_deploy,
       vcs_type:nextProps.vcs_type,
       projectId:nextProps.projectId
     });
  },
  addFileKey(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].key = i;
    }
    return data;
  },
  handleTabClick(index) {
    let temp;
    switch (index) {
      case '1':
        temp = 'add';
        break;
      case '2':
        temp = 'change';
        break;
      case '3':
        temp = 'same';
        break;
      default:
        temp = 'add';
    }
    this.setState({curTab: temp})
  },
  onIncExcChange(e) {
    this.props.setProState({incExc: e.target.value});
    this.setState({incExc: e.target.value});
  },
  onChange(e) {
    e.preventDefault();
    this.setState({code_url: e.target.value})
    this.props.setProState({code_url: e.target.value});
  },
  closeShowChangeModal() {
    this.setState({isShowChangeModal: false})
  },
  authorBtnClick(name) {
    let author = name;
    for (let i = 0; i < this.state.authors.length; i++) {
      let chInfo = this.state.authors[i];
      if (chInfo.author.trim() == author.trim()) {
        this.setState({showChangeLog: chInfo.changeLog, isShowChangeModal: true});
        break;
      }

    }
  },
  handleCheckout(isQuickDeploy) {
    let quick_deploy = 0;
    if(isQuickDeploy===true){
      quick_deploy = 1;
    } else{
      this.setState({canQuickDeploy:false});
    }
    let self = this;
    let id = this.state.projectId;
    self.setState({checkoutLoading: true});
    let tempLog = '';
    let logCount = 0;

    let startTime = (new Date()).getTime();
    let flushLog = function(){
      let nowTime = (new Date()).getTime();
      let disTime = (nowTime - startTime);
      if(disTime/1000 >= 5){
        self.props.doBuildLog(tempLog);
        tempLog = '' ;
        startTime = nowTime;
      }
      if(!self.props.canTag){
        setTimeout(function(){
          flushLog();
        },3000);
      }else{
        self.props.doBuildLog(tempLog);
        tempLog = '' ;
        startTime = nowTime;
      }
    }

    //每隔3秒写一次日志

    flushLog();
    this.props.websocketOn('index', 'logserver', function(data) {
      if (data) {
        tempLog += data.replace(/\n/g, "<br />");
        let source = self.state.buildLog;
        let nowTime = (new Date()).getTime();
        let disTime = (nowTime - startTime);
        //每50个日志输出更新一次内容或者长度大于2000
        if (data.indexOf('end!!!') >= 0 || disTime/1000 >= 5 || logCount%10 == 0 || tempLog.length>2000) {
          self.props.doBuildLog(tempLog);
          tempLog = '' ;
          startTime = nowTime;
        }

        if (data.indexOf('end!!!') >= 0) {

          self.setState({buildLoading: false});
          self.props.setProState({buildLoading: false,canTag: true});
          if(isQuickDeploy===true){
            self.props.setProState({canDeploy: false});
          }
          else{
            self.props.setProState({canDeploy: true});
          }
              //build 结束，自动运行deploy
          if(isQuickDeploy === true){
            self.props.handleDeploy(isQuickDeploy);
          }

        }
        logCount ++;
      }
    });
    self.props.setProState({canTag: false});
    $.ajax({
      type: 'POST',
      url: '/home/project/check_out',
      data: {
        name: self.state.name,
        vcs_type: self.state.vcs_type,
        code_url: self.state.code_url,
        branch_deploy: self.state.branchDeploy,
        last_tag: self.state.projectData.last_tag,
        quick_deploy: quick_deploy,
        id: id
      },
      success: function(res) {
        if (res.errno == 0) {
          self.setState({
            addData: self.addFileKey(res.data.add),
            changeData: self.addFileKey(res.data.change),
            sameData: self.addFileKey(res.data.same),
            authors: res.data.changeInfo,
            checkoutLoading: false,
          });

          self.props.setCanBuild(true);
          //如果是快捷部署，则调用构建
          if(isQuickDeploy === true){
              self.props.handleBuild(true);
          }
        }
      }
    })
  },
  onFileBtnClick(record) {
    this.setState({
      diffModalVisible: true,
      diffModalTitle: record.path_n + '文件差异：',
      diffModalContent: record.diff
    })
  },
  getDiffInfo(code){
    //@@ -45,7 +45,6 @@
    let splitArr = code.split(' ');
    let oldStr = splitArr[1];
    let newStr = splitArr[2];
    let oldArr = oldStr.split(',');
    let newArr = newStr.split(',');
    let oldStart = parseInt(oldArr[0].substring(1));
    let oldNum = 0;// parseInt(oldArr[1]);
    let newStart = parseInt(newArr[0].substring(1));
    let newNum  = 0;//parseInt(newArr[1]);
    return {
      oldStart: oldStart,
      oldNum: oldNum,
      newStart: newStart,
      newNum: newNum
    }
  },
  htmlDecode(str){
    var s = "";
     if(str.length == 0) return "";
     s = str.replace(/&/g,"&amp;");
     s = s.replace(/</g,"&lt;");
     s = s.replace(/>/g,"&gt;");
     s = s.replace(/ /g,"&nbsp;");
     s = s.replace(/\'/g,"&#39;");
     s = s.replace(/\"/g,"&quot;");
     return s;
	},
  getDiffCodeLine(code,diffInfo){

    let line = '';
    if(code.substring(0,1) == '@'){
      line += '<tr class="line_holder match">'
      +'<td class="diff-line-num js-unfold old_line unfold" >'
      +'...'
      +'</td>'
      +'<td class="diff-line-num js-unfold new_line unfold">'
      +'...'
      +'</td>'
      +'<td class="line_content matched">'+this.htmlDecode(code)+'</td>'
      +'</tr>'
    }
    else if(code.substring(0,1) == '+'){
      line += '<tr class="line_holder new" >'
      +'<td class="old_line">'
      +'&nbsp;'
      +'</td>'
      +'<td class="new_line" >'
      +(diffInfo.newStart+diffInfo.newNum)
      +'</td>'
      +'<td class="line_content new noteable_line" >'+this.htmlDecode(code)+'</td>'
      +'</tr>';
      diffInfo.newNum++;
    }
    else if(code.substring(0,1) == '-'){
      line += '<tr class="line_holder old">'
      +'<td class="old_line  old">'
      +(diffInfo.oldStart+diffInfo.oldNum)
      +'</td>'
      +'<td class="new_line " >'
      +'&nbsp;'
      +'</td>'
      +'<td class="line_content noteable_line old" >'+this.htmlDecode(code)+'</td>'
      +'</tr>';
      diffInfo.oldNum++;
    }
    else {
      line += '<tr class="line_holder" >'
      +'<td class="old_line">'
      +(diffInfo.oldStart+diffInfo.oldNum)
      +'</td>'
      +'<td class="new_line" data-linenumber="45">'
      +(diffInfo.newStart+diffInfo.newNum)
      +'</td>'
      +'<td class="line_content noteable_line" > '+this.htmlDecode(code)+'</td>'
      +'</tr>';
      diffInfo.newNum++;
      diffInfo.oldNum++;
    }
    return line;
  },
  getDiffCodeHtml(data){
    let content = '';
    content += '<table class="text-file">'
           +'<tbody>';
    let tempInfo = {};
    let isA = false;
    for(let i = 0;i < data.length;i++){
        let code = data[i];
        //如果是一个修改段
        if(code.substring(0,1) == '@'){
          tempInfo = this.getDiffInfo(code);
          isA = true;
        }
        else{
          if(!isA){
            continue;
          }
        }
        content += this.getDiffCodeLine(code,tempInfo);
    }
    content += '</tbody></table>';
    return content;
  },
  lcs(lcstest, lcstarget) {
    let matchfound = 0
    let lsclen = lcstest.length
    let result =''
    for(let lcsi=0; lcsi<lcstest.length; lcsi++){
      let lscos=0
      for(let lcsj=0; lcsj<lcsi+1; lcsj++){
        let re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
        let temp = re.test(lcstest);
        re = new RegExp("(" + RegExp.$1 + ")", "i");
        if(re.test(lcstarget)){
          matchfound=1;
          result = RegExp.$1;
          break;
        }
        lscos = lscos + 1;
      }
    if(matchfound==1){return result; break;}
      lsclen = lsclen - 1;
    }
    result = '';
    return result;
 },
  getSvnFileName(name){
    let filename = name.substring(' A /'.length+2);
    let lcs = this.lcs(filename,this.state.code_url);
    return filename.replace(lcs,'');
  },
  onFileLogDiff(change,name){
    let self = this;
    let mod = '';
    let commit = '';
    if(self.state.vcs_type == 1){
      mod = name.substring('M	'.length);
      commit = change.rev.replace('commit ','');
    }
    else{
      mod = self.getSvnFileName(name);
      commit = change.rev.substring(1);
    }

    $.ajax({
      type: 'POST',
      url: '/home/project/get_change_info',
      data: {
        filename: mod,
        lastCommit: commit,
        commit: commit,
        id: self.state.projectId
      },
      success: function(res) {
        let content = self.getDiffCodeHtml(res.data);
        self.setState({
          commitDiffModalVisible: true,
          commitDiffModalTitle: change.author+' 于 '+change.time+' 修改 ' +mod + '内容 '+'(版本号：'+commit+')',
          commitdiffModalContent: content
        })
      }
    })
  },
  closeDiffModal() {
    this.setState({diffModalVisible: false})
  },
  closeCommitDiffModal() {
    this.setState({commitDiffModalVisible: false})
  },
  removeSelectedFile(index, record) {
    let temp1 = this.state.selectedFiles;
    temp1.splice(index, 1);
    this.setState({selectedFiles: temp1});
    this.props.setProState({selectedFiles: temp1});
    let temp2 = this.state.selectedRowKeys;
    let indexTemp = temp2[record.type].indexOf(record.rowKey);
    if (indexTemp != -1) {
      temp2[record.type].splice(indexTemp, 1);
      this.setState({selectedRowKeys: temp2})
    }
  },
  render() {
    let that = this;
    let lastSelectedRowKey = 0;
    const tabContent = [
			  <span><span >新增</span><Badge count={this.state.addData.length} overflowCount={1000} ><span style={{'margin-left':'20px'}}></span></Badge></span>,
			  <span><span >修改</span><Badge count={this.state.changeData.length} overflowCount={1000} style={{ backgroundColor: '#ff9224' }} ><span style={{'margin-left':'20px'}}></span></Badge></span>,
			  <span><span >未修改</span><Badge style={{ backgroundColor: '#87d068' }} overflowCount={1000} count={this.state.sameData.length} ><span style={{'margin-left':'20px'}}></span></Badge></span>,
			];
      const rowSelection = {
        onChange(selectedRowKeys, selectedRows) {
            lastSelectedRowKey = selectedRowKeys[selectedRowKeys.length - 1];
            let temp = that.state.selectedRowKeys;
            temp[that.state.curTab] = selectedRowKeys;
            that.setState({selectedRowKeys});
          },
          onSelect(record, selected, selectedRows) {
            record.rowKey = lastSelectedRowKey;
            let temp = that.state.selectedFiles;
            if (selected) {
              temp.push(record);
            } else {
              for (let i = 0; i < temp.length; i++) {
                if (temp[i].path_n == record.path_n) {
                  temp.splice(i, 1);
                  break;
                }
              }
            }
            let newArr = temp.concat();
            that.props.setProState({ selectedFiles: newArr });
            that.setState({ selectedFiles: newArr });
          },
        onSelectAll(selected, selectedRows, changeRows) {
          let temp = that.state.selectedFiles;
          let selMap = {};
          for(let j = 0;j<temp.length;j++){
            selMap[temp[j].path_n] = temp[j];
          }
          if(selected){
             for(let i = 0;i < selectedRows.length; i++){
                 if(!selMap[selectedRows[i].path_n]){
                    temp.push(selectedRows[i]);
                 }
             }
          }else{
            for(let i = 0;i < changeRows.length; i++){
              for (let j = 0; j < temp.length; j++) {
                if (temp[j].path_n == changeRows[i].path_n) {
                  temp.splice(j, 1);
                  break;
                }
              }
            }
          }
          let newArr = temp.concat();
          that.props.setProState({ selectedFiles: newArr });
          that.setState({ selectedFiles: newArr });
      }}
      const columns = [
        {
          title: '文件名',
          dataIndex: 'path_n'
        }, {
          title: '差异',
          dataIndex: 'diff',
          render: function(text, record, index) {
            if (record.type && record.type == 'change') {
              return <Button type="primary" onClick={that.onFileBtnClick.bind(that, record)}>查看差异</Button>;
            } else {
              return '';
            }
          }
        }
      ];
      const selectedFileColumns = [
        {
          title: '文件名',
          dataIndex: 'path_n'
        }, {
          title: '操作',
          render: (text, record, index) => {
            return <Button
            type="ghost"
            shape="circle-outline"
            size="small"
            onClick={that.removeSelectedFile.bind(that, index, record)}>
            <Icon type="cross"/>
            </Button>;
          }
        }
      ];
    let authors = [];
    if(this.state.authors){
      authors = this.state.authors.map(function(au) {
       let bColor = {};
       if (au.author != that.state.sessionUser) {
         bColor = {
           backgroundColor: '#ff9224'
         };
       }
       return <div style={{
         'padding-top': '20px',
         'display': 'inline-block'
       }}>
         <Badge count={au.changeLog.length} style={{
           backgroundColor: 'red'
         }} overflowCount={1000}>
           <span style={{
             'margin-left': '20px'
           }}></span>
           <Button type="primary" onClick={that.authorBtnClick.bind(that, au.author)} style={bColor}>
             <span >{au.author}</span>
           </Button>
         </Badge>
       </div>;
     });
    }

    let renderChangeTimeLine = this.state.showChangeLog.slice(0).map(function(change) {
      return <Timeline.Item color="red">
        <p style={{
          'color': 'red'
        }}>{change.rev}
          : {change.author}
          于 {change.time}</p>
          <p style={{
            'color': 'blue'
          }}>提交内容：{change.msg}</p>
        {change.changeFilesLog.map(function(name) {
          	return (<div>
                    <Row  style={{ borderBottom: '1px solid #e9e9e9' }} >
                      <Col span={20}>
                        <div style={{height: '40px',lineHeight:'40px' }}>{name}</div>
                      </Col>
                      <Col span={4} style={{padding:'5px 0px' }} >
                        <Button type="primary" htmlType="submit" onClick={that.onFileLogDiff.bind(that, change,name)} >查看</Button>
                      </Col >
                      </Row>
                    </div>)
        	})}
      </Timeline.Item>;
    });
    return (
      <div>
      <Row className="project-box">
        <div className="section-title">检出&diff(如果是git分支需要加：'#分支名称')：</div>
        <div className="section-gap">
          <Input className="code-input" name="code_url" value={this.state.code_url} onChange={this.onChange.bind(this)}/>
          <Row type="flex" justify="end" style={{
            'margin-top': '20px'
          }}>
            <Button type="primary" htmlType="submit" onClick={this.handleCheckout.bind(this)} loading={this.state.checkoutLoading}>开始检出</Button>
          </Row>
        </div>
        <div className="row-width" style={{
          'margin-bottom': '20px'
        }}>

          <Card title="从上次部署正式环境到本次部署间，以下用户修改了代码:">
            {authors}
          </Card>
        </div>

        <div className="row-width">
          <Tabs defaultActiveKey="1" size="large" onTabClick={this.handleTabClick.bind(this)}>
            <TabPane tab={tabContent[0]} key="1" className="row-width">
              <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.addData}/>
            </TabPane>
            <TabPane tab={tabContent[1]} key="2" className="row-width">
              <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.changeData}/>
            </TabPane>
            <TabPane tab={tabContent[2]} key="3" className="row-width">
              <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.sameData}/>
            </TabPane>
          </Tabs>
        </div>
      </Row>


      <Row className="project-box">
        <div className="section-title">
          <Row type="flex" justify="space-between">
            <div>选择的文件：</div>
            <div className="row-width" style={{
              'margin-bottom': '20px'
            }}>
              <RadioGroup onChange={this.onIncExcChange.bind(that)} value={this.state.incExc}>
                <Radio key="1" value={1}>仅部署以下文件</Radio>
                <Radio key="2" value={2}>部署除以下文件以外的所有文件</Radio>
              </RadioGroup>
            </div>
          </Row>
        </div>

        <div className="row-width">
          <Table rowKey="path_n" columns={selectedFileColumns} dataSource={this.state.selectedFiles} pagination={false}/>
        </div>
      </Row>
      <Modal  width={800} title='修改纪录' style={{ top: 20,width:'100%' }} visible={this.state.isShowChangeModal} onOk={this.closeShowChangeModal.bind(that)} onCancel={this.closeShowChangeModal.bind(that)}>
        <Timeline>
            {renderChangeTimeLine}
        </Timeline>
      </Modal>

      <Modal width={1024} title={this.state.commitDiffModalTitle} style={{ top: 20 }} visible={this.state.commitDiffModalVisible} onOk={this.closeCommitDiffModal.bind(that)} onCancel={this.closeCommitDiffModal.bind(that)}>
        <div
        style={{'padding': '0 5px','color': '#ccc','background':'#fff'}}
        dangerouslySetInnerHTML={{__html: this.state.commitdiffModalContent}}
        >
        </div>
      </Modal>

      <Modal width={800} title={this.state.diffModalTitle} style={{ top: 20 }} visible={this.state.diffModalVisible} onOk={this.closeDiffModal.bind(that)} onCancel={this.closeDiffModal.bind(that)}>
        <div style={{'padding': '0 5px','color': '#ccc','background':'#000','max-height':'600px','overflow':'scroll'}} dangerouslySetInnerHTML={{__html: this.state.diffModalContent}}></div>
      </Modal>
      </div>
    );
  }
});

export default CodeView;

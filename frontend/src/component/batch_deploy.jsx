import React, {Component} from 'react';
import {
  Button,
  Table,
  Modal,
  Row,
  Col,
  Select,
  Checkbox,
  Input
} from 'antd';

class BatchDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      projectList: [],
      machineList: [],
      selProId: -1,
      selMachineId: -1,
      loading: true,
      delItem: {},
      code_url: '',
      desc: '批量部署',
      isNpmInstall:1,
      npmInstallIsCheck:false,
      onlineReason: '版本发布',
      deployLoading: false,
      showLogModal: false,
      logContent: '',
      showDelModal: false
    }
  }
  getInfo() {
    let dInfo = {};
    let pInfo = {};
    for (let i = 0; i < this.state.projectList.length; i++) {
      pInfo = JSON.parse(JSON.stringify(this.state.projectList[i]));
      if (pInfo.id == this.state.selProId) {
          pInfo.code_url = this.state.code_url;
        break;
      }
    }
    let mInfo = {};
    for (let i = 0; i < this.state.machineList.length; i++) {
      mInfo = JSON.parse(JSON.stringify(this.state.machineList[i]));
      if (mInfo.id == this.state.selMachineId) {
        break;
      }
    }
    dInfo.id = pInfo.id;
    dInfo.deployStatus = 0; //0未部署，1部署中，2部署完成
    dInfo.tableId = pInfo.id + '_' + mInfo.id;
    dInfo.machine_id = mInfo.id;
    dInfo.name = pInfo.name;
    dInfo.machine = mInfo.name;
    dInfo.desc = this.state.desc;
    dInfo.isNpmInstall = this.state.isNpmInstall;
    dInfo.onlineReason = this.state.onlineReason;


    dInfo.pInfo = pInfo;
    dInfo.mInfo = mInfo;
    return dInfo;
  }
  addProject() {
    if (this.state.selMachineId == -1 || this.state.selProId == -1) {
      Modal.error({title: '请选择部署机器和项目'});
      return;
    }
    let selPro = this.getInfo();

    let data = this.state.data.slice(0);
    data.push(selPro);
    this.setState({data: data, selMachineId: -1});
  }
  onCodeUrlChange(e) {
    e.preventDefault();
    this.setState({code_url: e.target.value})
  }
  onDescChange(e) {
    e.preventDefault();
    this.setState({desc: e.target.value})
  }
  onReasonChange(obj) {
    this.setState({
      onlineReason:obj.label
    })
  }
  handleNpmInstallCheck(e) {
    if(e.target.checked){
        this.setState({isNpmInstall: '2'});
    }
    else {
        this.setState({isNpmInstall: '1'});
    }
     this.setState({npmInstallIsCheck: e.target.checked});
  }
  getDeployStatus() {
    let self = this;
    setTimeout(function() {
      $.ajax({
        type: 'POST',
        url: '/home/project/get_batch_deploy_status',
        success: function(res) {
          if (res.errno == 0) {
            let cloneData = self.state.data.slice(0);
            for (let i = 0; i < res.data.length; i++) {
              let item = res.data[i];
              let tableId = item.id + '_' + item.machineId;
              for (let j = 0; j < cloneData.length; j++) {
                let dData = cloneData[j];
                if (tableId == dData.tableId) {
                  dData.deployStatus = item.status;
                  dData.buildLog = item.nowLogFile;
                  dData.deployLog = item.deployLogFile;
                }
              }
            }
            self.setState({data:cloneData});
            for (let j = 0; j < cloneData.length; j++) {
              let dData = cloneData[j];
              //如果还有没部署完成的，则继续调用
              if (dData.deployStatus < 2) {
                  self.getDeployStatus();
                  break;
              }
            }
          }
        }
      });
    }, 3000);

  }
  deploy() {
    let self = this;
    let deployData = JSON.stringify(this.state.data);
    this.setState({deployLoading: true});
    $.ajax({
      type: 'POST',
      url: '/home/project/batch_deploy',
      data: {
        deploy: deployData
      },
      success: function(res) {
        self.setState({deployLoading: false});
        if (res.errno == 0) {
          Modal.success({title: '批量部署完成'});
        }
      }
    });
    this.getDeployStatus();
  }
  handleDelAction(item) {
    this.setState({showDelModal: true, delItem: item});
  }
  showDeployLog(item) {
    this.setState({showLogModal: true, logContent: '正在读取日志...........................'});
    let self = this;
    $.ajax({
      type: 'post',
      url: '/home/history/get_history_log',
      data: {
        buildLog: item.buildLog,
        deployLog: item.deployLog
      },
      success: function(res) {
        self.setState({
          showLogModal: true,
          logContent: res.data.replace(/\n/g, "<br />")
        });
      }
    })
  }
  doDelAction() {
    let item = this.state.delItem;
    let data = this.state.data.slice(0);
    let sData = [];
    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      if (d.tableId != item.tableId) {
        sData.push(d);
      }
    }
    this.setState({showDelModal: false, data: sData});
  }
  closeModal() {
    this.setState({showDelModal: false});
  }
  closeLogModal() {
    this.setState({showLogModal: false})
  }
  loadProjectList() {
    const self = this;
    $.ajax({
      url: '/home/project/get_project_list?pageId=1&pageSize=10000',
      type: 'GET',
      success: function(res) {
        if (res.errno == 0) {
          self.setState({projectList: res.data.data});
        }
      }
    })
  }
  componentDidMount() {
    this.loadProjectList();
  }
  onMachineSelect(mac, option) {
    let machineId = option.props.machineId;
    this.setState({selMachineId: machineId});
  }
  onProjectSelect(pro, option) {
    let self = this;
    let projectId = option.props.projectId;
    this.setState({selProId: projectId, machineList: []});
    for(let i = 0;i<this.state.projectList.length;i++){
      let pro = this.state.projectList[i];
      if(projectId == pro.id){
          this.setState({code_url: pro.code_url});
          break;
      }
    }
    $.ajax({
      url: '/home/machine/project/id/' + projectId,
      type: 'GET',
      success: function(res) {
        if (res.errno == 0) {
          self.setState({machineList: res.data});
        }
      }
    })
  }

  render() {
    const self = this;
    let projectSelectOptions = this.state.projectList.map(function(project) {
      return <Option projectId={project.id} key={project.id} value={project.name}>{project.name}</Option>
    });
    let machineSelectOptions = this.state.machineList.map(function(machine) {
      return <Option machineId={machine.id} key={machine.id} value={machine.name}>{machine.name}</Option>
    });
    let expandedRowRender = function(record){
      return <div>部署代码仓库:{record.pInfo.code_url}</div>
    }
    const columns = [
      {
        title: '项目名',
        width: '100',
        dataIndex: 'name'
      }, {
        title: '部署机器',
        width: '100',
        dataIndex: 'machine'
      },{
        title: '部署原因',
        width: '100',
        dataIndex: 'onlineReason'
      },{
        title: '部署内容',
        width: '100',
        dataIndex: 'desc'
      }, {
        title: '是否更新node_modules',
        width: '100',
        dataIndex: 'isNpmInstall',
        render(text, record) {
          let statusText = '否';
          if(record.isNpmInstall == '2'){
            statusText = '是';
          }
          return (
            <span>
              <a href="javascript:void(0)">{statusText}</a>
            </span>
          )
        }
      }, {
        title: '部署状态',
        width: '100',
        dataIndex: 'deployStatus',
        render(text, record) {
          let button = <div></div>;

          let statusText = '未部署';
          if (record.deployStatus == 1) {
            statusText = '';
            button = <Button type="primary" size="large" loading={true}>部署中。。。</Button>
          } else if (record.deployStatus == 2) {
            statusText = '';
            button = <Button type="primary" size="large" onClick={self.showDeployLog.bind(self, record)} loading={false}>部署完成,查看日志</Button>
          }
          return (
            <span>
              <a href="javascript:void(0)">{statusText}</a>{button}
            </span>
          )
        }
      }, {
        title: '操作',
        width: '60',
        dataIndex: 'id',
        render(text, record) {
          return (
            <span>
              <a href="javascript:void(0)" onClick={self.handleDelAction.bind(self, record)} data-action="delete" data-id={text}>删除</a>
            </span>
          );
        }
      }
    ];
    return (
      <div>
        <div id="machineAction" className="project-box">
          <div className="section-title">添加项目：</div>
          <div style={{
            'margin-top': '20px'
          }} >选择项目：</div>
          <Select size="large" showSearch={true} onSelect={this.onProjectSelect.bind(this)} style={{
            display: 'inline-block'
          }} style={{
            width: '100%',
          }}>
            {projectSelectOptions}
          </Select>
          <div style={{
            'margin-top': '20px'
          }} >选择部署机器：</div>
          <Select size="large" showSearch={true} onSelect={this.onMachineSelect.bind(this)} style={{
            display: 'inline-block'
          }} style={{
            width: '100%',
          }}>
            {machineSelectOptions}
          </Select>
          <div style={{
            'margin-top': '20px'
          }} >代码仓库(如果是git分支需要加：'#分支名称')：</div>
          <Input className="code-input" name="code_url" value={this.state.code_url} onChange={this.onCodeUrlChange.bind(this)}/>
          <div className="row-width" style={{
            'margin-top': '20px'
          }} >
              <div>部署的内容:</div>
              <Input type="textarea" id="buildDesc" value={this.state.desc} rows="3" onChange={this.onDescChange.bind(this)}/>
            </div>
            <div style={{
              'margin-top': '20px'
            }}>
              <div>选择上线原因:</div>
                  <Select size="large" labelInValue defaultValue={{ key: '0' }} onChange={this.onReasonChange.bind(this)} style={{
                  display: 'inline-block'
                }} style={{
                  width: '100%'
                }} >
                    <Option value="0">版本发布</Option>
                    <Option value="1">功能更新</Option>
                    <Option value="100">缺陷修复</Option>
                    <Option value="3">性能优化</Option>
                  </Select>
            </div>
          <Row type="flex" justify="end" className="section-gap" style={{
            width: '100%',
            marginTop: '20px'
          }}>
          <Checkbox checked={this.state.npmInstallIsCheck} style={{
            'line-height': '28px',
            'padding-right': '10px'
          }} onChange={this.handleNpmInstallCheck.bind(this)}>是否更新node_modules</Checkbox>
            <Button type="primary" size="large" onClick={this.addProject.bind(this)}>添加部署项</Button>
          </Row>
        </div>
        <div className="project-box">
          <Table columns={columns}
          rowKey="tableId"
          pagination={false}
          dataSource={this.state.data}
          expandedRowRender = {expandedRowRender}
          defaultExpandAllRows = {true}
          scroll={{
            x: 500,
            y: false
          }} size="middle"></Table>
          <Row type="flex" justify="end" className="section-gap" style={{
            width: '100%',
            marginTop: '20px'
          }}>
            <Button type="primary" size="large" onClick={this.deploy.bind(this)} loading={this.state.deployLoading}>批量部署</Button>
          </Row>
          <Modal title="删除项目" visible={this.state.showDelModal} onOk={this.doDelAction.bind(this)} onCancel={this.closeModal.bind(this)}>
            <p>确认要删除该项目？</p>
          </Modal>
          <Modal width={800} height={600} title="查看日志" visible={this.state.showLogModal} onOk={this.closeLogModal.bind(this)} onCancel={this.closeLogModal.bind(this)}>
            <p>
              <div style={{
                'padding': '0 5px',
                'color': '#ccc',
                'background': '#000',
                'max-height': '400px',
                'overflow': 'scroll'
              }} dangerouslySetInnerHTML={{
                __html: this.state.logContent
              }}></div>
            </p>
          </Modal>
        </div>
      </div>
    );
  }
}

export default BatchDeploy;

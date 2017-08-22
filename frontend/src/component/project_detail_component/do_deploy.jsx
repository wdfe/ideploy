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
  Menu,
  Tag
} from 'antd';
import {Link} from 'react-router';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const DoDeploy = React.createClass({
  getInitialState(){
    return {
      buildType: 1,
      buildTask: '',
      projectId: -1,
      selectedFiles: [],
      curMachineId: 0,
      isNpmInstall: 1,
      canNotify: true,
      canSendOp :true,
      onlineReason:'',
      selectedMachines: [],
      buildDesc:  '',
      buildPass:  '',
      opDeployId: '',
      opSucc: false,
      notifyCharger:false,
      sendOp : false,
      opInfo: '',
      machineList: []
    }
  },
  componentWillReceiveProps(nextProps){

    this.setState({
        selectedMacRowKeys: nextProps.selectedMacRowKeys,
        selectedMachines: nextProps.selectedMachines,
        OpItemInfo :'',//默认空
        selectedFiles: nextProps.selectedFiles,
        buildTask: nextProps.buildTask,
        curMachineId: nextProps.curMachineId,
        buildType: nextProps.buildType,
        code_url: nextProps.code_url,
        notifyCharger: nextProps.notifyCharger,
        projectData: nextProps.projectData,
        name: nextProps.name,
        incExc: nextProps.incExc,
        branch_deploy: nextProps.branch_deploy,
        vcs_type:nextProps.vcs_type,
        projectId:this.props.projectId,
        isShowOpIofo:0
     });
  },
  handleNotifyCheck(e) {
    this.setState({notifyCharger: e.target.checked});
    this.props.setProState({notifyCharger: e.target.checked});
  },
  handleSendOp(e){
    this.setState({sendOp: e.target.checked});
    this.props.setProState({sendOp: e.target.checked});
  },
  onInputChange(e) {
    let stateData = {};
    stateData[e.target.getAttribute('id')] = e.target.value;
    this.setState(stateData);
  },
  getMachineInfo(curMachineId) {
    for (let i = 0; i < this.props.machineList.length; i++) {
      let machineInfo = this.props.machineList[i];
      if (machineInfo.id == curMachineId) {
        return machineInfo;
      }
    }
  },

  handleQuickDeploy(){
    let self = this;
    if (this.state.buildType == 1) {
      if (!self.state.curMachineId) {
        Modal.error({title: '请选择构建的机器'});
        return;
      }
      let macInfo = this.getMachineInfo(self.state.curMachineId);
      if (macInfo.is_lock == 1) {
        let tipContent = '本项目的' + macInfo.name + '(' + macInfo.ip + ')环境已经被' + macInfo.lock_user + '锁定占用，请联系他解除锁定！！';
        this.props.setProState({tipModalVisible: true, tipModalCheckVisible: 'block', tipModalContent: tipContent})
        return;
      }
    }
    if (this.state.buildTask.length <= 1 && this.state.buildType == 2) {
      let tipContent = '请填写自定义构建任务！！';
      this.props.setProState({tipModalCheckVisible: 'none', tipModalVisible: true, tipModalContent: tipContent})
      return;
    }

    var machineInfo = self.getMachineInfo(self.state.curMachineId);
    if (machineInfo.type == 1) {
      Modal.error({title: '正式环境不能使用快捷部署'});
      return
    }
    if(self.state.selectedMachines && self.state.selectedMachines.length>0){
      for(let i = 0; i < self.state.selectedMachines.length; i++){
        var machineInfo = self.getMachineInfo(self.state.selectedMachines[i].id);
        if (machineInfo.type == 1) {
          Modal.error({title: '正式环境不能使用快捷部署'});
          return
        }
      }
    }
    let desc = self.state.buildDesc;
    let pass = self.state.buildPass;
    if (desc <= 0 ) {
            Modal.error({title: '请输入构建原因'});
            return
    }
    self.setState({quickDeployLoading: true});
    self.props.handleCheckout(true);
  },
  handleDeploy(isQuickDeploy) {
    let self = this;
    let quick_deploy = 0;
    let id = this.props.projectId
    if (this.state.buildType == 1) {
      if (!self.state.curMachineId) {
        Modal.error({title: '请选择构建的机器'});
        return;
      }
      let macInfo = this.getMachineInfo(self.state.curMachineId);
      if (macInfo.is_lock == 1) {
        let tipContent = '本项目的' + macInfo.name + '(' + macInfo.ip + ')环境已经被' + macInfo.lock_user + '锁定占用，请联系他解除锁定！！';
        this.props.setProState({tipModalVisible: true, tipModalCheckVisible: 'block', tipModalContent: tipContent})
        return;
      }
    }

    let desc = self.state.buildDesc;
    let pass = self.state.buildPass;


      if(!self.state.onlineReason){
        Modal.error({title: '请选择上线原因'});
        return;
      }
    if (desc) {
      if (self.state.curMachineId || (self.state.selectedMachines && self.state.selectedMachines.length > 0)) {
        self.props.websocketOn('deploy', 'logserver', function(data) {
          if (data) {
            self.props.doBuildLog(data.replace(/\n/g, "<br />"));
            if (data.indexOf('end!!!') >= 0) {
              let tipContent = '项目部署完毕。';
              self.setState({canTag: true, quickDeployLoading:false, deployLoading: false, tipModalVisible: true, tipModalContent: tipContent});
              self.props.setProState({canTag: true, canDeploy: false, quickDeployLoading:false, deployLoading: false, tipModalVisible: true, tipModalContent: tipContent});
            }
          }
        });
        let deployFiles = JSON.parse(JSON.stringify(this.state.selectedFiles));
        for (let i = 0; i < deployFiles.length; i++) {
          let fileObj = deployFiles[i];
          delete fileObj.diff;
        }

        const data ={
            machineId: self.state.curMachineId,
            machineArr: JSON.stringify(self.state.selectedMachines),
            name: self.state.name,
            vcs_type: self.state.vcs_type,
            code_url: self.state.code_url,
            deployFiles: JSON.stringify(deployFiles),
            last_tag: self.state.projectData.last_tag,
            id: id,
            incExc: self.state.incExc,
            quick_deploy: quick_deploy,
            build_desc: desc,
            build_pass: pass,
            notifyCharger: self.state.notifyCharger,
            op_project_id:self.state.projectData.op_project.op_project_id,//op 项目id
            is_SendOp :self.state.sendOp,//是否同时部署给op
            onlineReason : self.state.onlineReason//上线原因 by abel
        }
        self.props.setProState({canTag: false});
        if(isQuickDeploy === true){
          quick_deploy = 1;
        }
        else{
          self.setState({deployLoading: true})
        }
        $.ajax({
          type: 'POST',
          url: '/home/project/deploy',
          data: data,
          success: function(res) {
            if (res.errno == 0) {
              let opResult =res.data.opResult;
              if(opResult.statusCode==200){
                self.setState({
                  opInfo:opResult.data.info,
                  opSucc:true,
                  opDeployId: opResult.data.taskId
                })
              }
              else {
                self.setState({
                  opSucc:false,
                  opInfo:opResult.data
                })
              }
              self.setState({
              	tagBuild:true
              })
            }
          }
        })
      } else {
        Modal.error({title: '请选择构建的机器'});
        self.setState({deployLoading: false,quickDeployLoading: false});
        return;
      }
    } else {
      Modal.error({title: '请输入构建原因'});
      self.setState({deployLoading: false,quickDeployLoading: false});
      return;
    }
  },

  render() {
    let that =  this;
    let deployInfo = <div></div>;
    let opDeployId = this.state.opDeployId;
    //部署机器选择器
    let deployMacSelection = {
      selectedRowKeys: that.state.selectedMacRowKeys,
      onChange(selectedRowKeys, selectedRows) {
        if(Number(selectedRows.length)&&selectedRows[0].name=='product_env1'){
          console.log(selectedRows[0].name);
          that.constdeployItemInfoNumber()//加载项目列表
          that.setState({
            isShowOpIofo:true
          })
        }
        that.setState({selectedMachines: selectedRows, selectedMacRowKeys: selectedRowKeys})
      },
      onSelect(record, selected, selectedRows) {
        that.setState({selectedMachines: selectedRows})
      },
      onSelectAll(selected, selectedRows, changeRows) {
        that.setState({selectedMachines: selectedRows})
      }
    }

    const deployMachineColumns = [
      {
        title: '机器别名',
        dataIndex: 'name'
      }, {
        title: 'ip',
        dataIndex: 'ip'
      }
    ];

    function handleChange(obj) {
      that.setState({
        onlineReason:obj.label
      })
    }

    return (
      <div>
      <Row className="project-box">
        <div className="section-title" style={{
          'margin-top': '20px'
        }}>构建完成，部署上线：</div>
        <div className="row-width">
          <span >选择要部署的目标机器：</span>
          <Table rowKey="id" rowSelection={deployMacSelection} columns={deployMachineColumns} dataSource={this.props.machineList} pagination={
            false
          }/>
        </div>

        <div className="row-width" style={{
          'margin-top': '20px'
        }} ref="buildDescEle">
          <div>
            <div>部署的内容:</div>
            <Input type="textarea" id="buildDesc" rows="3" onChange={this.onInputChange.bind(this)}/>
          </div>
          <div style={{
            'margin-top': '20px'
          }}>
            <div>上线的原因:</div>

                <Select size="large" labelInValue defaultValue={{ key: '-1' }} onChange={handleChange} style={{
                display: 'inline-block'
              }} style={{
                width: '100%'
              }} >
                  <Option value="-1">选择上线原因</Option>
                  <Option value="0">版本发布</Option>
                  <Option value="1">功能更新</Option>
                  <Option value="100">缺陷修复</Option>
                  <Option value="3">性能优化</Option>
                </Select>
          </div>
          <div></div>
          <div>
          </div>
          {deployInfo}
          <Row type="flex" justify="end" style={{
            'margin-top': '20px'
          }}>
            <Checkbox checked={this.state.notifyCharger}  style={{
              'line-height': '28px',
              'padding-right': '15px'
            }} onChange={this.handleNotifyCheck.bind(that)}>通知负责人</Checkbox>


          <Button type="primary" loading={this.state.quickDeployLoading} htmlType="submit" size="large" onClick={this.handleQuickDeploy.bind(that)} disabled={!this.props.canQuickDeploy} style={{
            'margin-right': '20px'
          }} >快捷部署</Button>
          <Button type="primary" loading={this.state.deployLoading} htmlType="submit" size="large" onClick={this.handleDeploy.bind(that)} disabled={!this.props.canDeploy}>部署</Button>

          </Row>
        </div>
      </Row>
      </div>
    );
  }
});
//
export default DoDeploy;

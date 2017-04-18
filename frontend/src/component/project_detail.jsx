import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import InitState from './project_detail_component/stateinfo';
import Ajax from './project_detail_component/detail_ajax';
import BaseInfo from './project_detail_component/baseinfo';
import BuildLog from './project_detail_component/build_log';
import CodeView from './project_detail_component/code_view';
import DoBuild from './project_detail_component/do_build';
import DoDeploy from './project_detail_component/do_deploy'
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
import {Link} from 'react-router';
import '../style/project.less';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const ajax = new Ajax();
class ProjectDetail extends Component {
  constructor(props) {
    super(props);
    InitState.projectId = this.props.location.query.id;
    this.state = InitState;
  }

  componentDidMount() {
    const query = this.props.location.query;
    let id = query.id;
    ajax.getProjectById(id,this);
    ajax.getMachineList(id,this);
    if (query.debug) {
      //增加调试模式
      this.setState({canDeploy: true, canDeploy: true, canBuild: true, canTag: true, debug: true})
    }
  }
  setProState(state){
    this.setState(state);
  }
  setCanBuild(canBuild){
    this.setState({canBuild: canBuild});
  }
  doBuildLog(tempLog){
    let bLog = this.refs.buildLog;
    bLog.appendLog(tempLog);
  }
  websocketOn(msgType, event, callback) {
    let socketHost = window.location.protocol + '//' + window.location.host; //+'/'+msgType;
    let socket = io(socketHost);
    socket.emit(msgType);
    socket.on(event, function(data) {
      callback(data);
    });
  }
  handleCheckout(isQuickDeploy){
    this.refs.codeView.handleCheckout(isQuickDeploy);
  }
  handleBuild(isQuickDeploy) {
    this.refs.doBuild.handleBuild(isQuickDeploy);
  }
  handleDeploy(isQuickDeploy) {
    this.refs.doDeploy.handleDeploy(isQuickDeploy);
  }

  closeTipModal() {
    this.setState({tipModalVisible: false})
    if (this.state.isLock) {
      $.ajax({
        url: '/home/machine/lock',
        type: 'POST',
        data: {
          machineArr: JSON.stringify(this.state.selectedMachines),
          ac: 'lock'
        },
        success: function(res) {
          if (!res.errno) {
            Modal.success({title: '锁定机器成功'});
          }
        }
      })
    }
  }


  handleIsLockCheck(e) {
    this.setState({isLock: e.target.checked})
  }

  handleDebug() {
    this.setState({tipModalVisible: true})
  }

  render() {
    let that = this;
    return (
      <div>
        <div>
          {this.state.debug
            ? <Button type="primary" onClick={this.handleDebug.bind(this)}>Debug</Button>
            : null}
        </div>

        <BaseInfo
        projectId={this.state.projectId}
        infoData={this.state.infoData}
        name={this.state.name} />

        <BuildLog ref="buildLog"  />

        <CodeView
          ref="codeView"
          doBuildLog={this.doBuildLog.bind(this)}
          setCanBuild={this.setCanBuild.bind(this)}
          handleBuild={this.handleBuild.bind(this)}
          setProState={this.setProState.bind(this)}
          projectData={this.state.projectData}
          websocketOn={this.websocketOn}
          code_url={this.state.code_url}
          vcs_type={this.state.vcs_type}
          name={this.state.name}
          handleDeploy={this.handleDeploy.bind(this)}
          canDeploy={this.state.canDeploy}
          canTag={this.state.canTag}
          branch_deploy={this.state.branch_deploy}
          quick_deploy={this.state.quick_deploy}
          projectId={this.state.projectId}  />

          <DoBuild
          ref="doBuild"
          setProState={this.setProState.bind(this)}
          handleDeploy={this.handleDeploy.bind(this)}
          canBuild={this.state.canBuild}
          incExc={this.state.incExc}
          projectId={this.state.projectId}
          incExc={this.state.incExc}
          projectData={this.state.projectData}
          websocketOn={this.websocketOn}
          buildLoading={this.state.buildLoading}
          selectedFiles={this.state.selectedFiles}
          machineList={this.state.machineList}
          />
          <DoDeploy
          ref="doDeploy"
          setProState={this.setProState.bind(this)}
          handleDeploy={this.handleDeploy.bind(this)}
          handleCheckout={this.handleCheckout.bind(this)}
          doBuildLog={this.doBuildLog.bind(this)}
          projectId={this.state.projectId}
          projectData={this.state.projectData}
          code_url={this.state.code_url}
          incExc={this.state.incExc}
          vcs_type={this.state.vcs_type}
          name={this.state.name}
          notifyCharger={this.state.notifyCharger}
          incExc={this.state.incExc}
          selectedMachines={this.state.selectedMachines}
          selectedMacRowKeys={this.state.selectedMacRowKeys}
          canDeploy={this.state.canDeploy}

          canQuickDeploy={this.state.canQuickDeploy}
          websocketOn={this.websocketOn}
          machineList={this.state.machineList}
          buildType={this.state.buildType}
          buildTask={this.state.buildTask}
          selectedFiles={this.state.selectedFiles}
          curMachineId={this.state.curMachineId}
          />
				<Modal width={800} title='提示！！！' style={{ top: 20 }} visible={this.state.tipModalVisible} onOk={this.closeTipModal.bind(that)} onCancel={this.closeTipModal.bind(that)}>
					<div  dangerouslySetInnerHTML={{__html: this.state.tipModalContent}}></div>
					<div style={{'display':this.state.tipModalCheckVisible}}>
				 		<Checkbox style={{'line-height':'28px','padding-right':'15px'}}onChange={this.handleIsLockCheck.bind(that)}>是否锁定该环境</Checkbox>
					</div>
				</Modal>

      </div>
    )
  }
}

export default ProjectDetail;

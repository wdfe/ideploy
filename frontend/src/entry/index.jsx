import '../common/lib';
import '../style/app.less';
import Header from '../component/header';
import Sidebar from '../component/sidebar';
import ProjectForm from '../component/project_form';
import ProjectList from '../component/project_list';
import MachineList from '../component/machine_list';
import ChargePersonList from '../component/charge_person_list';
import MachineForm from '../component/machine_form';
import ChargePersonForm from '../component/charge_person_form';
import BuildHistory from '../component/build_history';
import ProjectDetail from '../component/project_detail';
import BatchDeploy from '../component/batch_deploy';
import Stat from '../component/stat';
import ProjectStat from '../component/project_stat';
import UserStat from '../component/user_stat';
import EnvStat from '../component/env_stat';
import ChangePassForm from '../component/changePass_form';
import ReactDOM from 'react-dom';
import {Row, Col} from 'antd';
import {Router, Route, hashHistory} from 'react-router'
import React, {Component} from 'react';

class MainLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerTitle: '工程'
    }
  }
  componentWillReceiveProps(props) {
    this.changeHeaderTitle(props.routes[1].headerTitle);
  }
  changeHeaderTitle(title) {
    this.setState({headerTitle: title});
  }
  render() {
    return (
      <div>
        <Header title={this.state.headerTitle} className="header"/>
        <Row>
          <Col span={6}>
            <Sidebar/>
          </Col>
          <Col span={14}>
            <div >
              {this.props.children}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route component={MainLayout}>
          <Route component={ProjectList} path="/" headerTitle="工程"/>
          <Route path="new_project" component={ProjectForm} headerTitle="新建工程"/>
          <Route path="project_detail" component={ProjectDetail} headerTitle="工程详情"/>
          <Route path="machine_list" component={MachineList} headerTitle="机器列表"/>
          <Route path="new_machine" component={MachineForm} headerTitle="新建机器"/>
          <Route path="chargePerson_list" component={ChargePersonList} headerTitle="负责人列表"/>
          <Route path="chargePerson_form" component={ChargePersonForm} headerTitle="新建负责人"/>
          <Route path="history" component={BuildHistory} headerTitle="构建历史"/>
          <Route path="stat" component={Stat} headerTitle="部署统计"/>
          <Route path="project_stat" component={ProjectStat} headerTitle="项目部署统计"/>
          <Route path="user_stat" component={UserStat} headerTitle="项目部署统计"/>
          <Route path="env_stat" component={EnvStat} headerTitle="环境部署统计"/>
          <Route path="batch_deploy" component={BatchDeploy} headerTitle="批量部署"/>
					<Route path="changePass" component={ChangePassForm} headerTitle="修改密码"/>
        </Route>
      </Router>
    );
  }
}

ReactDOM.render(
  <App/>, document.getElementById('root'));

import React, {Component} from 'react';
import {Menu, Icon,Button,Row,Col,Table} from 'antd';
import {Link} from 'react-router';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const BaseInfo = React.createClass({
  getInitialState() {
    return {
      current: '1',
      infoCol: [
        {
          title: '基本信息：',
          width: '100px',
          dataIndex: 'keyName'
        }, {
          title: '',
          width: '700px',
          dataIndex: 'keyValue'
        }
      ]
    };
  },
  handleProForm(isShow, promFormTitle) {
    let id = this.props.projectId;
    window.location.href = '#/new_project?id=' + id;
  },
  render() {
    let showPage = false;
    return (
      <div>
      <div className="project-action">
        <Link to={'/chargePerson_list?projectId=' + this.props.projectId + '&projectName=' + this.props.name}>
          <Button><Icon type="user"/>负责人</Button>
        </Link>
        <Link to={'/machine_list?projectId=' + this.props.projectId}>
          <Button><Icon type="laptop"/>机器列表</Button>
        </Link>
        <Link to={'/history?projectId=' + this.props.projectId}>
          <Button><Icon type="book"/>构建部署历史</Button>
        </Link>
        <Link to={'/project_stat?id=' + this.props.projectId + '&name=' + this.props.name}>
          <Button><Icon type="book"/>构建部署统计</Button>
        </Link>
      </div>

      <Row className="project-box">
        <div className="section-title">
          <Row type="flex" justify="space-between">
            <Col span="21">
              <div>基本信息：</div>
            </Col>
            <Col span="3">
              <Row type="flex" justify="end">
                <Button type="primary" htmlType="submit" onClick={this.handleProForm.bind(this, true, '修改项目信息')}>修改</Button>
              </Row>
            </Col>
          </Row>
        </div>
        <Table columns={this.state.infoCol} dataSource={this.props.infoData} pagination={showPage} showHeader={showPage}/>
      </Row>
      </div>
    );
  }
});

export default BaseInfo;

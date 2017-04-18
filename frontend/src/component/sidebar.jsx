import React, {Component} from 'react';
import {Menu, Icon} from 'antd';
import {Link} from 'react-router';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const Sidebar = React.createClass({
  getInitialState() {
    return {current: '1'};
  },
  render() {
    return (
      <Menu style={{width: 200}} defaultOpenKeys={['sub1']} selectedKeys={[this.state.current]} mode="inline">
        <Menu.Item key="list">
          <Link to="/"><Icon type="folder"/>工程列表</Link>
        </Menu.Item>
        <Menu.Item key="add">
          <Link to="/new_project"><Icon type="plus"/>新建工程</Link>
        </Menu.Item>
        <Menu.Item key="change">
          <Link to="/changePass"><Icon type="edit"/>修改密码</Link>
        </Menu.Item>
        <Menu.Item key="stat">
          <Link to="/stat"><Icon type="folder"/>统计</Link>
        </Menu.Item>
        <Menu.Item key="batch_deploy">
          <Link to="/batch_deploy"><Icon type="folder"/>批量部署</Link>
        </Menu.Item>
      </Menu>
    );
  }
});

export default Sidebar;

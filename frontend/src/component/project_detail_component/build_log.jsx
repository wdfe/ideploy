import React, {Component} from 'react';
import {Menu, Icon,Button,Row,Col,Table} from 'antd';
import {Link} from 'react-router';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const BuildLog = React.createClass({
  appendLog(logContent){
    let buildLogDom = this.refs.buildLogContent.getDOMNode();
    $(buildLogDom).append(logContent);
    buildLogDom.scrollTop = buildLogDom.scrollHeight;
  },
  render() {

    return (
      <div>
        <Row className="project-box">
          <div className="section-title">后台日志：</div>
          <div className="section-bottom" ref='buildLogContent' style={{
            'padding': '0 5px',
            'color': '#ccc',
            'background': '#000',
            'max-height': '400px',
            'overflow': 'scroll'
          }}></div>
        </Row>
      </div>
    );
  }
});

export default BuildLog;

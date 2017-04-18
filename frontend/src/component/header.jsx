import React, {Component} from 'react';
import {Row, Col} from 'antd';

const Header = React.createClass({
  render() {
    return (
      <Row className="header">
        <Col span="8" style={{
          paddingLeft: 30 + 'px'
        }}>前端构建平台</Col>
        <Col className="tc" span="8">{this.props.title || '登录'}</Col>
        <Col span="8"></Col>
      </Row>
    );
  }
});

export default Header;

import React, {Component} from 'react';
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Modal
} from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const confirm = Modal.confirm;
function noop() {
  return false;
}

class installForm extends React.Component {
  constructor(props) {
    super(props);
  }
  handleSubmit(event) {
    event.preventDefault();
    let me = this;
      $.ajax({
        type: 'POST',
        url: '/home/install/do',
        data: {
        },
        success: res => {
          if (res.errno == 0) {
            //如果安装成功则跳登录页
            window.location.href = './auth';
          } else {
          }
        }
      })
  }
  render() {
    return (
      <div >
            <div style={{display:'flex',justifyContent:'center',fontSize:'22px',marginTop:'30px'}}>
            欢迎使用布道部署系统，配置好数据库后，请点击以下按钮导入数据库表格
            </div>
            <div style={{display:'flex',justifyContent:'center'}}>
              <Button  style={{fontSize:'20px',marginTop:'30px'}} type="primary"  onClick={this.handleSubmit.bind(this)}>确定导入数据库表</Button>
            </div>
      </div>
    );
  }
}

installForm = createForm()(installForm);
export default installForm;
//ReactDOM.render(<loginForm />, mountNode);

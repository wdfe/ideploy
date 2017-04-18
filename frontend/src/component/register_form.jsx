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

function noop() {
  return false;
}

class regForm extends React.Component {

  getValidateStatus(field) {
    const {isFieldValidating, getFieldError, getFieldValue} = this.props.form;

    if (isFieldValidating(field)) {
      return 'validating';
    } else if (!!getFieldError(field)) {
      return 'error';
    } else if (getFieldValue(field)) {
      return 'success';
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('收到表单值：', this.props.form.getFieldsValue());
  }

  userExists(rule, value, callback) {
    if (!value) {
      callback();
    } else {
      $.ajax({
        url: '/home/user',
        type: 'GET',
        data: {
          name: value
        },
        success: res => {
          if (res.errno == 0) {
            if (res.data && res.data.name) {
              callback([new Error('抱歉，该用户名已被占用。')]);
            } else {
              callback();
            }
          }
        }
      })
    }
  }

  hideModal() {
    this.props.regFormHandler(false);
  }

  checkRegRePass(rule, value, callback) {
    const {getFieldValue} = this.props.form;
    let repass = getFieldValue('regPass');
    if (value && value !== getFieldValue('regPass')) {
      callback(new Error('两次输入密码不一致！'));
    } else {
      callback();
    }
  }

  handleRegister() {
    var _self = this;
    const {getFieldValue} = _self.props.form;
    _self.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      if (getFieldValue('regName') && getFieldValue('regPass')) {
        $.ajax({
          type: 'POST',
          url: '/home/user',
          data: {
            name: getFieldValue('regName'),
            pass: getFieldValue('regPass')
          },
          success: function(res) {
            if (res.errno == 0) {
              _self.hideModal();
            }
          }
        })
      }

    });

  }
  render() {
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 14
      }
    };
    const regUserProps = getFieldProps('regName', {
      rules: [
        {
          required: true,
          message: '请填写用户名'
        }, {
          validator: this.userExists
        }
      ]
    });

    const regPassProps = getFieldProps('regPass', {
      rules: [
        {
          required: true,
          whitespace: true,
          message: '请填写密码'
        }
      ]
    });
    const regRePassProps = getFieldProps('regRePass', {
      rules: [
        {
          required: true,
          whitespace: true,
          message: '请再次输入密码'
        }, {
          validator: this.checkRegRePass.bind(this)
        }
      ]
    });

    const regFormItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };
    return (
      <Modal title="注册" visible={this.props.isShowRegForm} onOk={this.handleRegister.bind(this)} onCancel={this.hideModal.bind(this)}>
        <Form horizontal form={this.props.form}>
          <Row>
            <Col span="18">
              <FormItem {...regFormItemLayout} hasFeedback help={isFieldValidating('regName')
                ? '校验中...'
                : (getFieldError('regName') || []).join(', ')} label="用户名：">
                <Input {...regUserProps} type="text" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="regName"/>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="18">
              <FormItem {...regFormItemLayout} hasFeedback label="密码：">
                <Input {...regPassProps} type="password" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="regPass"/>
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col span="18">
              <FormItem {...regFormItemLayout} hasFeedback label="确认密码：">
                <Input {...regRePassProps} type="password" placeholder="两次输入密码保持一致" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="regRePass"/>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
};

export default Form.create()(regForm);

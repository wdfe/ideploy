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

class changePassForm extends React.Component {
  constructor(props) {
    super(props);
  }
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

  handleReset(event) {
    event.preventDefault();
    this.props.form.resetFields();
  }
  /**
  * 显示提示Modal
  */
  showConfirm(title, content) {
    confirm({title: title, content: content, onOk() {}, onCancel() {}});
  }
  handleSubmit(event) {
    console.log(event);
    event.preventDefault();
    let me = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      $.ajax({
        type: 'PUT',
        url: '/home/user/update_pass',
        data: {
          name: values.name,
          pass: values.passwd
        },
        success: res => {
          if (res.errno == 0) {
             me.showConfirm('修改密码成功', '修改密码成功！！')
            //window.location.href = './';
          } else {
            me.showConfirm('修改密码失败', res.errmsg);
          }
        }
      })
    });
  }

  showModal(e) {
    this.props.regFormHandler(true);
  }

  render() {
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        {
          required: true,
          message: '请填写用户名'
        }
      ]
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        {
          required: true,
          whitespace: true,
          message: '请填写密码'
        }
      ]
    });

    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 12
      }
    };
    const resetLayout = {
      labelCol: {
        span: 18
      },
      wrapperCol: {
        span: 1
      }
    };

    const regLayout = {
      labelCol: {
        span: 14
      },
      wrapperCol: {
        span: 5
      }
    };
    return (
      <div>
        <Form horizontal form={this.props.form}>
          <FormItem {...formItemLayout} label="密码：" hasFeedback help={isFieldValidating('name')
            ? '校验中...'
            : (getFieldError('name') || []).join(', ')}>
            <Input {...nameProps} type="password" placeholder=""/>
          </FormItem>

          <FormItem {...formItemLayout} label="重复输入密码：" hasFeedback>
            <Input {...passwdProps} type="password" autoComplete="off" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop}/>
          </FormItem>

          <FormItem {...resetLayout} label=" ">
            <a href="#" onClick={this.handleReset.bind(this)} style={{
              textDecoration: 'underline'
            }}>重置</a>
          </FormItem>

          <FormItem wrapperCol={{
            span: 12,
            offset: 7
          }}>
            <Button type="primary" style={{
              width: '100%'
            }} onClick={this.handleSubmit.bind(this)}>确定</Button>
            &nbsp;&nbsp;&nbsp;

          </FormItem>
        </Form>
      </div>
    );
  }
}

changePassForm = createForm()(changePassForm);
export default changePassForm;
//ReactDOM.render(<loginForm />, mountNode);

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {
  Alert,
  Button,
  Form,
  Input,
  Row,
  Col,
  Radio,
  Modal,
  Select
} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

/**
 *  添加&更新机器form
 *  * 无法用state改变input，this.props.form.getFieldsValue() 获取不到input value值
 */
class MachineForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit :false,
      opData: []
    }
    const query = this.props.location.query;
    var self = this;
    this.props.form.setFieldsValue({project_id: query.projectId})
    if (query.action == 'edit') {
      self.state.isEdit = true;
      $.ajax({
        url: '/home/machine?id=' + query.id,
        type: 'GET',
        success: function(res) {
          if (res.errno == 0) {
            //console.log(res.data);
            res.data.type = '' + res.data.type;
            self.props.form.setFieldsValue(res.data);
          }
        }
      })
    };

  }

  handleSubmit(e) {
    e.preventDefault();
    let _self = this;
    const {getFieldValue} = _self.props.form;
    _self.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      } else {
        const query = this.props.location.query;
        let url = '/home/machine';
        let successMsg = '添加机器成功';
        let data = this.props.form.getFieldsValue();
        if (query.action == 'edit') {
          url = '/home/machine/update';
          data.id = query.id;
          successMsg = '更新机器成功';
        }
        $.ajax({
          type: 'POST',
          url: url,
          data: data,
          success: function(res) {
            if (res.errno == 0) {
              // alert(successMsg);
              ReactDOM.render(
                <Alert message={successMsg} type="success" showIcon/>, document.getElementById('result'));
            } else {
              // alert(res.errmsg);
              ReactDOM.render(
                <Alert message="操作失败" description={res.errmsg} type="error" showIcon/>, document.getElementById('result'));
            }
          }
        });
      }
    })
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
  render() {
    let self = this;
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    let opOptions = this.state.opData.map(function(item){
      console.log(item);
      return  <Option key={item.envId} value={item.envId}>{item.alias}</Option>
    });
    const nameProps = getFieldProps('name', {
      rules: [
        {
          required: true,
          message: '请输入机器名'
        }
      ]
    });
    const batchProps = getFieldProps('batch', {
      rules: [
        {
          required: !self.state.isEdit,
          message: '请输入批量机器范围如：1-100'
        }
      ]
    });
    const taskProps = getFieldProps('task', {
      rules: [
        {
          required: true,
          message: '请输入构建的任务名称'
        }
      ]
    });
    const selectProps = getFieldProps('type', {
      rules: [
        {
          required: true,
          message: '请选择环境类型'
        }
      ]
    });
    const ipProps = getFieldProps('ip', {
      rules: [
        {
          required: true,
          message: '请输入机器ip'
        }
      ]
    });
    const sdirProps = getFieldProps('sdir', {
      rules: [
        {
          required: true,
          message: '请输入机器源目录'
        }
      ]
    });
    const dirProps = getFieldProps('dir', {
      rules: [
        {
          required: true,
          message: '请输入机器目标目录'
        }
      ]
    });

    const deployHookProps = getFieldProps('deploy_hook', {
      rules: [
        {
          required: false,
          message: 'hook'
        }
      ]
    });
    const hookParamsProps = getFieldProps('hook_params', {
      rules: [
        {
          required: false,
          message: '请选择重启命令执行路径'
        }
      ]
    });
    const beforeDeployShellProps = getFieldProps('before_deploy_shell', {
      rules: [
        {
          required: false,
          message: '请选择重启命令执行路径'
        }
      ]
    });
    const serverDirProps = getFieldProps('server_dir', {
      rules: [
        {
          required: true,
          message: '请选择重启命令执行路径'
        }
      ]
    });

    const afterDeployShellProps = getFieldProps('after_deploy_shell', {
      rules: [
        {
          required: true,
          message: '请填写重启命令'
        }
      ]
    });
    const sshUserProps = getFieldProps('ssh_user', {
      rules: [
        {
          required: true,
          message: '请输入ssh用户名'
        }
      ]
    });
    const passwdProps = getFieldProps('ssh_pass', {
      rules: [
        {
          required: true,
          whitespace: true,
          message: '请填写ssh密码'
        }
      ]
    });
    return (

      <div>
        <div id="result"></div>
        <Form horizontal form={this.props.form} onSubmit={this.handleSubmit.bind(this)}>
        {!self.state.isEdit
          ? <FormItem label="批量添加机器(如果是1台填写1，如果多台则：填1-10,表示添加从1到10台机器，另外会在底下的机器名和路径等地方替换${NO}为1到10)：" help={isFieldValidating('name')
            ? '校验中...'
            : (getFieldError('batch') || []).join(', ')}>
            <Input placeholder="" {...batchProps}/>
            </FormItem>
          : null}

          <FormItem label="机器名称：" help={isFieldValidating('name')
            ? '校验中...'
            : (getFieldError('name') || []).join(', ')}>
            <Input placeholder="" {...nameProps}/>
          </FormItem>
          <FormItem label="对应项目id：">
            <Input placeholder="" {...getFieldProps('project_id')} disabled/>
          </FormItem>
          <FormItem hasFeedback label="环境类型：">
            <Select {...selectProps} id="type" name="type" defaultValue="1">
              <Option value="1">正式</Option>
              <Option value="2">预发布</Option>
              <Option value="3">测试</Option>
            </Select>
          </FormItem>
          <FormItem label="项目构建任务：">
            <Input placeholder="" {...taskProps}/>
          </FormItem>
          <FormItem label="机器ip：">
            <Input placeholder="" {...ipProps}/>
          </FormItem>
          <FormItem label='发布源目录(多个目录用";"隔开)：'>
            <Input placeholder="" {...sdirProps}/>
          </FormItem>
          <FormItem label='发布目标目录(多个目录用";"隔开)：'>
            <Input placeholder="" {...dirProps}/>
          </FormItem>

          <FormItem label='部署hook'>
            <Input placeholder="" {...deployHookProps}/>
          </FormItem>
          <FormItem label='hook参数：'>
            <Input placeholder="" {...hookParamsProps} type="textarea"/>
          </FormItem>

          <FormItem label='部署命令执行目录：'>
            <Input placeholder="" {...serverDirProps}/>
          </FormItem>
          <FormItem label='部署前执行命令'>
            <Input placeholder="" {...beforeDeployShellProps}/>
          </FormItem>
          <FormItem label='部署完成执行命令'>
            <Input placeholder="" {...afterDeployShellProps}/>
          </FormItem>


          <FormItem label="ssh用户名: ">
            <Input placeholder="" {...sshUserProps}/>
          </FormItem>
          <FormItem label="ssh密码: ">
            <Input placeholder="" type="password" {...passwdProps}/>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="end" className="section-gap">
              <Button type="primary" htmlType="submit">确定</Button>
            </Row>
          </FormItem>
        </Form>
      </div>

    );
  }
}

MachineForm = Form.create({})(MachineForm);

export default MachineForm;

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
  Modal
} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

/**
 *  添加&更新负责人form
 *  * 无法用state改变input，this.props.form.getFieldsValue() 获取不到input value值
 */
class MachineForm extends Component {
  constructor(props) {
    super(props);
    const query = this.props.location.query;
    this.props.form.setFieldsValue({project_id: query.projectId})
    if (query.action == 'edit') {
      var self = this;
      console.log('edit')
      $.ajax({
        url: '/home/cperson?id=' + query.id,
        type: 'GET',
        success: function(res) {
          if (res.errno == 0) {
            // self.setState(res.data);
            self.props.form.setFieldsValue(res.data[0]);
          }
        }
      })
    } else {}
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
        let url = '/home/cperson';
        let successMsg = '添加负责人成功';
        let data = this.props.form.getFieldsValue();
        if (query.action == 'edit') {
          url = '/home/cperson/update';
          data.id = query.id;
          successMsg = '更新负责人成功';
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
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        {
          required: true,
          message: '请输入负责人'
        }
      ]
    });
    const emailProps = getFieldProps('email', {
      validate: [
        {
          rules: [
            {
              required: true
            }
          ],
          trigger: 'onBlur'
        }, {
          rules: [
            {
              type: 'email',
              message: '请输入正确的邮箱地址'
            }
          ],
          trigger: ['onBlur', 'onChange']
        }
      ]
    });
    return (

      <div>
        <div id="result"></div>
        <Form horizontal form={this.props.form} onSubmit={this.handleSubmit.bind(this)}>
          <FormItem label="负责人：">
            <Input placeholder="" {...nameProps}/>
          </FormItem>
          <FormItem label="负责人邮箱：">
            <Input placeholder="" {...emailProps}/>
          </FormItem>
          <FormItem label="负责项目id：">
            <Input placeholder="" {...getFieldProps('project_id')} disabled/>
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

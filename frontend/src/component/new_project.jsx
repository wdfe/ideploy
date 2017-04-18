import React, {Component} from 'react';
import {
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

class CustomizedForm extends Component {
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
  render() {
    const {getFieldProps} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        {
          required: true,
          message: '请输入项目名'
        }
      ]
    });
    return (
      <div>
        <Form horizontal form={this.props.form}>
          <FormItem label="项目名称：">
            <Input placeholder="" {...nameProps}/>
          </FormItem>
          <FormItem label="项目描述：">
            <Input placeholder="" type="textarea"/>
          </FormItem>
          <FormItem label="版本控制类型：">
            <RadioGroup {...getFieldProps('gender', { initialValue: 'svn' })}>
              <Radio value="svn">svn</Radio>
              <Radio value="git">git</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="svn&git 地址: ">
            <Input placeholder=""/>
          </FormItem>
          <FormItem>
            <Row type="flex" justify="end" className="section-gap">
              <Button type="primary" htmlType="submit">确定2efee</Button>
            </Row>
          </FormItem>
        </Form>
      </div>
    );
  }
}

CustomizedForm = Form.create({})(CustomizedForm);

export default CustomizedForm;

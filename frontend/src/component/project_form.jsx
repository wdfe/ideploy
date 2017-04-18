/**
＊新建项目或者修改项目资料
**/

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
  Alert,
  Button,
  Form,
  Input,
  Row,
  Col,
  Modal,
  Select,
  Table,
  Radio
} from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function noop() {
  return false;
}
class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      getItemList:'',
      selectedRows:'',
      codeLangArray:['javascript','java','go'],
      selectedMacRowKeys :''
    }

  }
  componentDidMount() {
    const query = this.props.location.query;
    let id = query.id;
    if (id) {
      this.getProjectById(id);
    }
  }
  getProjectById(id) {
    let that = this;
    $.ajax({
      type: 'get',
      url: '/home/project/get_project_by_id',
      data: {
        id: id
      },
      success: function(res) {
        let itemDatas = res.data;

        let stateData = {
          name: itemDatas.name,
          code_url: itemDatas.code_url,
          code_lang: '' + itemDatas.code_lang,
          vcs_type: '' + itemDatas.vcs_type,
          hook_params: itemDatas.hook_params,
          build_hook: itemDatas.build_hook,
          deploy_hook: itemDatas.deploy_hook
        };

        if(itemDatas.op_project){
          that.setState({
            selectedRows:{
              id:itemDatas.op_project.op_project_id,
              name : itemDatas.op_project.op_project_name
            },
            selectedMacRowKeys:[itemDatas.op_project.op_project_id]
          })
        }

        that.props.form.setFieldsValue(stateData);
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

  handleSubmit(e) {
    e.preventDefault();
  }
  hideModal() {
    this.props.proFormHandler(false);
  }
  onSelect(value) {
    console.log('onselect:' + value);
    // let v=value=='git'?'1':'2';
    // console.log({vcs_type:v});
    let t = {
      vcs_type: value
    }
    this.setState(t);
    console.log(this.state);
  }
  onChange(e) {
    e.preventDefault();
    let sData = {};
    sData[e.target.name] = e.target.value;
    this.setState(sData);
  }
  onChange(e) {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  }

  handlePost() {
    let _self = this;
    const {getFieldValue} = _self.props.form;
    _self.props.form.validateFields((errors, values) => {
      // if (!!errors) {
      //   return;
      // }

      if (getFieldValue('name') && getFieldValue('code_url')) {
        const query = this.props.location.query;
        let id = query.id;
        let url = '/home/project/update_project'
        if (!id) {
          url = '/home/project/new_project'
        }


        $.ajax({
          type: 'POST',
          url: url,
          data: {
            name: getFieldValue('name'),
            vcs_type: getFieldValue('vcs_type'),
            code_url: getFieldValue('code_url'),
            code_lang: getFieldValue('code_lang'),
            hook_params: getFieldValue('hook_params'),
            build_hook: getFieldValue('build_hook'),
            deploy_hook: getFieldValue('deploy_hook'),
            op_item_id :_self.state.selectedRows.id,
            op_item_name:_self.state.selectedRows.name,
            id: id
          },
          success: function(res) {
            if (res.errno == 0) {
              // _self.hideModal();
              if (res.errno == 0) {
                // alert(successMsg);
                ReactDOM.render(
                  <Alert message="操作成功" type="success" showIcon/>, document.getElementById('result'));
              } else {
                // alert(res.errmsg);
                ReactDOM.render(
                  <Alert message="操作失败" description={res.errmsg} type="error" showIcon/>, document.getElementById('result'));
              }
            }
          }
        })
      }
    })
  }
  render() {

    const {getFieldProps, getFieldError, isFieldValidating, getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 14
      }
    };
    const proNameProps = getFieldProps('name', {
      rules: [
        {
          required: true,
          message: '请填写项目名称'
        }
      ]
    });
    const hookParamsProps = getFieldProps('hook_params', {
      rules: [
        {
          required: false,
          message: ''
        }
      ]
    });
    const deployHookProps = getFieldProps('deploy_hook', {
      rules: [
        {
          required: false,
          message: ''
        }
      ]
    });
    const buildHookProps = getFieldProps('build_hook', {
      rules: [
        {
          required: false,
          message: ''
        }
      ]
    });
    const selectProps = getFieldProps('vcs_type', {
      rules: [
        {
          required: true,
          message: '请选择项目类型'
        }
      ]
    });
    const selectLangProps = getFieldProps('code_lang', {
      rules: [
        {
          required: true,
          message: '请选择语言类型'
        }
      ]
    });

    const proCodeUrlProps = getFieldProps('code_url', {
      rules: [
        {
          required: true,
          whitespace: true,
          message: '请填写项目地址'
        }
      ]
    });

    const itemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };
    let that = this;


    let OpSelection = {
      type:'radio',
      selectedRowKeys: that.state.selectedMacRowKeys,
      onChange(selectedRowKeys, selectedRows) {

        that.setState({
          selectedRows : {
            id:selectedRows[0].id,
            name : selectedRows[0].name
          },
          selectedMacRowKeys:selectedRowKeys
        })

      }
    }

     const deployItemInfo = [
      {
        title: '项目id',
        dataIndex: 'id'
      }, {
        title: '项目名称',
        dataIndex: 'name'
      }
    ];

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    let codeLangListOpts = this.state.codeLangArray.map(function(lang) {
      return <Option  value={lang}>{lang}</Option>;
    })
    let codeLangOptionFormItem =    (
           <FormItem hasFeedback label="代码语言：">
                <Select {...selectLangProps} id="code_lang" name="code_lang" defaultValue="javascript">
                {codeLangListOpts}
                </Select>
              </FormItem>
      )
    return (
      <div>
        <div id="result"></div>
        <Form horizontal form={this.props.form} onSubmit={this.handlePost.bind(this)}>

          <FormItem hasFeedback help={isFieldValidating('name')
            ? ''
            : (getFieldError('name') || []).join(', ')} label="项目名称：">
            <Input {...proNameProps} placeholder="请输入项目名称" type="text" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="name" name="name"/>
          </FormItem>

          <FormItem hasFeedback label="代码仓库类型：">
            <Select {...selectProps} id="vcs_type" name="vcs_type" defaultValue="1">
              <Option value="1">git</Option>
              <Option value="2">svn</Option>
            </Select>
          </FormItem>
          {codeLangOptionFormItem}
          <FormItem hasFeedback label="仓库地址：">
            <Input {...proCodeUrlProps} type="text" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="code_url" name="code_url"/>
          </FormItem>

          <FormItem hasFeedback label="构建hook：">
            <Input  {...buildHookProps} type="text" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="build_hook" name="build_hook"/>
          </FormItem>
          <FormItem hasFeedback label="部署hook：">
            <Input  {...deployHookProps} type="text" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="deploy_hook" name="deploy_hook"/>
          </FormItem>
          <FormItem hasFeedback label="hook参数：">
            <Input {...hookParamsProps} type="textarea" onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} autoComplete="off" id="hook_params" name="hook_params"/>
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
};

export default Form.create()(ProjectForm);

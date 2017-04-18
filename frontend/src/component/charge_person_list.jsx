import React, {Component} from 'react';
import {
  Button,
  Table,
  Modal,
  Row,
  Col,
  Input
} from 'antd';

class ChargePersonList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projectId: this.props.location.query.projectId,
      projectName: this.props.location.query.projectName,
      data: [],
      pagination: {},
      loading: true,
      showDeletModal: false
    }
  }
  handleTableChange(pagination, filters, sorter) {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({pagination: pager});
  }
  addPerson() {
    window.location.href = '#/chargePerson_form?projectId=' + this.state.projectId;
  }
  handleChargePersonAction(e) {
    var self = this;
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;
    if (action == 'edit') {
      window.location.href = '#/chargePerson_form?action=edit&id=' + id;
    } else if (action == 'delete') {
      self.setState({showDeletModal: true, curDeleteId: id})
    }
  }
  handleChargePersonDelete() {
    var self = this;
    if (self.state.curDeleteId) {
      $.ajax({
        url: '/home/cperson/delete',
        type: 'POST',
        data: {
          id: self.state.curDeleteId
        },
        success: function(res) {
          if (!res.errno) {
            self.setState({showDeletModal: false, curDeleteId: null})
            window.location.reload();
          }
        }
      })
    }
  }
  closeModal() {
    this.setState({showDeletModal: false})
  }
  fetch() {
    const self = this;
    $.ajax({
      url: '/home/cperson/project/id/' + self.state.projectId,
      type: 'GET',
      success: function(res) {
        if (res.errno == 0) {
          self.setState({data: res.data, loading: false})
        }
      }
    })
  }
  componentDidMount() {
    this.fetch();
  }
  render() {
    const self = this;
    const columns = [
      {
        title: '负责人',
        dataIndex: 'name'
      }, {
        title: '负责人邮箱',
        dataIndex: 'email'
      }, {
        title: '添加时间',
        dataIndex: 'add_time'
      }, {
        title: '操作',
        dataIndex: 'id',
        render(text, record) {
          return (
            <span>
              <a href="javascript:void(0)" onClick={self.handleChargePersonAction.bind(self)} data-action="edit" data-id={text}>编辑</a>
              <span className="ant-divider"></span>
              <a href="javascript:void(0)" onClick={self.handleChargePersonAction.bind(self)} data-action="delete" data-id={text}>删除</a>
            </span>
          );
        }
      }
    ];
    return (
      <div>
        <div id="machineAction">
          <Row type="flex" justify="end" className="section-gap">
            <Button type="primary" onClick={this.addPerson.bind(this)}>新建负责人</Button>
          </Row>
        </div>
        <div className="section-title">项目:{this.state.projectName}</div>
        <Table columns={columns} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} onChange={this.handleTableChange.bind(this)} size="middle"></Table>
        <Modal title="删除负责人" visible={this.state.showDeletModal} onOk={this.handleChargePersonDelete.bind(this)} onCancel={this.closeModal.bind(this)}>
          <p>确认要删除该负责人？</p>
        </Modal>
      </div>
    );
  }
}

export default ChargePersonList;

import React, {Component} from 'react';
import {
  Button,
  Table,
  Modal,
  Row,
  Col,
  Input
} from 'antd';

class MachineList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: this.props.location.query.projectId,
      data: [],
      pagination: {},
      loading: true,
      lockTitle: '提示',
      lockAction: '',
      showLockModal: false,
      lockInfo: '确认操作吗？',
      showDeletModal: false
    }
  }

  handleTableChange(pagination, filters, sorter) {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({pagination: pager});
  }
  addMachine() {
    window.location.href = '#/new_machine?projectId=' + this.state.projectId;
  }
  handleMachineAction(e) {
    console.log(e);
    var self = this;
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;
    if (action == 'edit') {
      window.location.href = '#/new_machine?action=edit&id=' + id+'&projectId=' + this.state.projectId;
    } else if (action == 'delete') {
      self.setState({showDeletModal: true, curDeleteId: id})
    } else if (action == 'unlock') {
      self.setState({showLockModal: true, lockAction: 'unlock', lockInfo: '确认解锁该环境吗?', curLockId: id})
    } else if (action == 'lock') {
      self.setState({showLockModal: true, lockAction: 'lock', lockInfo: '确认锁定该环境吗?', curLockId: id})
    }

  }
  handleMachineLock() {
    const query = this.props.location.query;
    var isAdmin = query.admin;
    var self = this;
    self.setState({showLockModal: false});
    if (self.state.curLockId) {
      let macInfo = {};
      macInfo.id = self.state.curLockId;
      $.ajax({
        url: '/home/machine/lock',
        type: 'POST',
        data: {
          //id:self.state.curLockId,
          machineArr: JSON.stringify([macInfo]),
          ac: self.state.lockAction,
          isAdmin: isAdmin
        },
        success: function(res) {
          if (!res.errno) {
            let resDoat = res.data;
            self.setState({showLockModal: true, lockAction: null, lockInfo: res.data.msg, curLockId: null})
            //window.location.reload();
          }
        }
      })
    } else {
      window.location.reload();
    }
  }

  handleMachineDelete() {
    var self = this;
    if (self.state.curDeleteId) {
      $.ajax({
        url: '/home/machine/delete',
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
  closeLockModal() {
    this.setState({showLockModal: false});
    window.location.reload();
  }
  fetch() {
    const self = this;
    $.ajax({
      url: '/home/machine/project/id/' + self.state.projectId,
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
        title: '机器名',
        width: '100',
        dataIndex: 'name'
      }, {
        title: '项目名',
        width: '100',
        dataIndex: 'pro_name'
      }, {
        title: '执行任务',
        width: '100',
        dataIndex: 'task'
      }, {
        title: '机器ip',
        width: '100',
        dataIndex: 'ip'
      }, {
        title: '发布源目录',
        width: '300',
        dataIndex: 'sdir'
      }, {
        title: '发布目标目录',
        width: '300',
        dataIndex: 'dir'
      }, {
        title: 'ssh用户名',
        width: '100',
        dataIndex: 'ssh_user'
      }, {
        title: 'ssh密码',
        width: '100',
        dataIndex: 'ssh_pass'
      }, {
        title: '操作',
        width: '140',
        dataIndex: 'id',
        render(text, record) {
          return (
            <span>
              <a href="javascript:void(0)" onClick={self.handleMachineAction.bind(self)} data-action="edit" data-id={text}>编辑</a>
              <span className="ant-divider"></span>
              <a href="javascript:void(0)" onClick={self.handleMachineAction.bind(self)} data-action="delete" data-id={text}>删除</a>
            </span>
          );
        }
      }, {
        title: '锁定状态',
        width: '200',
        dataIndex: 'is_lock',
        render(text, record) {
          if (text == 1) {
            return (
              <span>
                被{record.lock_user}锁定
                <span className="ant-divider"></span>
                <a href="javascript:void(0)" onClick={self.handleMachineAction.bind(self)} data-action="unlock" data-id={record.id}>解锁</a>
              </span>
            );
          } else {
            return (
              <span>
                未锁定
                <span className="ant-divider"></span>
                <a href="javascript:void(0)" onClick={self.handleMachineAction.bind(self)} data-action="lock" data-id={record.id}>锁定</a>
              </span>
            );
          }

        }
      }
    ];
    return (
      <div>
        <div id="machineAction">
          <Row type="flex" justify="end" className="section-gap">
            <Button type="primary" size="large" onClick={this.addMachine.bind(this)}>新建机器</Button>
          </Row>

        </div>
        <Table columns={columns} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} scroll={{
          x: 500,
          y: false
        }} onChange={this.handleTableChange.bind(this)} size="middle"></Table>
        <Modal title="删除机器" visible={this.state.showDeletModal} onOk={this.handleMachineDelete.bind(this)} onCancel={this.closeModal.bind(this)}>
          <p>确认要删除该机器？</p>
        </Modal>
        <Modal title={this.state.lockTitle} visible={this.state.showLockModal} onOk={this.handleMachineLock.bind(this)} onCancel={this.closeLockModal.bind(this)}>
          <p>{this.state.lockInfo}</p>
        </Modal>
      </div>
    );
  }
}

export default MachineList;

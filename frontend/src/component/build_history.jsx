import React, {Component} from 'react';
// import Echarts from 'echarts';
import {
  Row,
  Col,
  Table,
  Form,
  Input,
  Button,
  Checkbox,
  Tabs,
  Badge,
  Modal,
  Select,
  Pagination
} from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
class BuildHistory extends Component {
  constructor(props) {
    super(props);
    self = this;
    this.state = {
      infoCol: [
        {
          title: '版本号：',
          width: '150px',
          dataIndex: 'tag'
        }, {
          title: '版本说明',
          width: '150px',
          dataIndex: 'pub_desc'
        }, {
          title: '发布时间：',
          width: '180px',
          dataIndex: 'pub_time'
        }, {
          title: '发布人',
          width: '120px',
          dataIndex: 'user'
        }, {
          title: '发布机器',
          width: '120px',
          dataIndex: 'ip'
        }, {
          title: '日志',
          width: '100px',
          dataIndex: 'log',
          render(text, record) {
            return (
              <span>
                <a href="javascript:void(0)" onClick={self.handleViewLog.bind(self)} data-blog={record.build_log} data-dlog={record.deploy_log} data-id={text}>查看</a>
              </span>
            );
          }
        }
      ],
      infoData: [
        {
          key: '1',
          tag: '201588821313213',
          pub_desc: '装修项目',
          pub_time: '2015-04-06 21:21:50',
          user: 'waynelu',
          ip: '10.2.22.23',
          log: '查看'
        }
      ],
      logContent: '',
      pager: {},
      showLogModal: false
    };
  }
  closeModal() {
    this.setState({showLogModal: false})
  }
  fetch(pageId, pageSize) {
    const self = this;
    $.ajax({
      type: 'get',
      url: '/home/history/get_history_list',
      data: {
        proId: this.props.location.query.projectId,
        pageId: pageId,
        pageSize: pageSize
      },
      success: function(res) {
        let pager = {};
        pager.total = res.data.count;
        pager.current = res.data.currentPage;
        pager.pageSize = res.data.numsPerPage;
        self.setState({pager: pager, infoData: res.data.data})
      }
    })
  }
  componentDidMount() {
    this.fetch(1, 10);
  }
  handleViewLog(e) {
    this.setState({showLogModal: true, logContent: '正在读取日志...........................'});
    let self = this;
    let buildLog = e.currentTarget.dataset.blog;
    let deployLog = e.currentTarget.dataset.dlog;
    $.ajax({
      type: 'post',
      url: '/home/history/get_history_log',
      data: {
        buildLog: buildLog,
        deployLog: deployLog
      },
      success: function(res) {
        self.setState({
          showLogModal: true,
          logContent: res.data.replace(/\n/g, "<br />")
        });
      }
    })
  }
  onChange(page) {
    this.fetch(page, 10);
  }
  showTotal(total) {
    return `共 ${total} 条`;
  }
  render() {

    return <Row className="project-box">
      <div className="section-title">构建历史：</div>
      <Table columns={this.state.infoCol} dataSource={this.state.infoData} pagination={false} size="middle"></Table>
      <Row type="flex" justify="end" style={{
        'margin-top': '20px'
      }}>
        <Pagination onChange={this.onChange.bind(this)} total={this.state.pager.total} showTotal={this.showTotal.bind(this)} current={this.state.pager.current} pageSize={this.state.pager.pageSize} defaultCurrent={this.state.pager.current}/>
      </Row>
      <Row type="flex" justify="end" style={{
        'margin-top': '20px'
      }}>
        <div id="echartsTest" style={{
          width: '600px',
          height: '400px'
        }}></div>
      </Row>

      <Modal width={800} height={600} title="查看日志" visible={this.state.showLogModal} onOk={this.closeModal.bind(this)} onCancel={this.closeModal.bind(this)}>
        <p>
          <div style={{
            'padding': '0 5px',
            'color': '#ccc',
            'background': '#000',
            'max-height': '400px',
            'overflow': 'scroll'
          }} dangerouslySetInnerHTML={{
            __html: this.state.logContent
          }}></div>
        </p>
      </Modal>
    </Row>;
  }
}

export default BuildHistory;

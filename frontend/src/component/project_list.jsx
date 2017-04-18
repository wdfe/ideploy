import React, {Component} from 'react';
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
  Select,
  Pagination
} from 'antd';
import ProForm from './project_form';
import '../style/project.less'
import '../style/project_list.less';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowProForm: false,
      items: {
        currentPage: 1,
        numsPerPage: 32
      },
      proItemsData: []
    };
  }
  handleClick(itemID) {
    window.location.href = '#project_detail?id=' + itemID;
  }

  getItemData(pageId, pageSize) {
    let self = this;
    $.ajax({
      type: 'get',
      url: '/home/project/get_project_list',
      data: {
        pageId: pageId,
        pageSize: pageSize
      },
      success: function(res) {
        self.setState({items: res.data, proItemsData: res.data.data})
      }
    })
  }

  componentDidMount() {
    this.getItemData(this.state.items.currentPage, this.state.items.numsPerPage);
  }

  onChange(page) {
    this.getItemData(page, 32);
  }
  showTotal(total) {
    return `共 ${total} 条`;
  }
  render() {
    var self = this;
    return (
      <div >
        <Row>
          {this.state.proItemsData.map(function(item) {
            let imgUrl = 'https://github.com/identicons/' + item.id + '.png';
            return <Col span="6" itemID={item.id} onClick={self.handleClick.bind(self, item.id)}>
              <div className="item t_pro_item">
                <div className="image">
                  <img src={imgUrl}/>
                  <a className="star ui corner label"></a>
                </div>
                <div className="content">
                  <div className="name">{item.name}</div>
                  <p className="description">Create By {item.creater}.</p>
                </div>
              </div>
            </Col>
          })
         }
        </Row>
        <Row type="flex" justify="end">
          <Pagination onChange={this.onChange.bind(this)} total={this.state.items.count} showTotal={this.showTotal.bind(this)} current={this.state.items.currentPage} pageSize={this.state.items.numsPerPage} defaultCurrent={this.state.items.currentPage}/>
        </Row>
      </div>
    );
  }
};
export default ProjectList;

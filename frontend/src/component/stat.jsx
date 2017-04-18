import React, {Component} from 'react';
import {
  Button,
  Table,
  Modal,
  Row,
  Col,
  Form,
  DatePicker,
  TimePicker,
  Input
} from 'antd';
import ReactEcharts from 'echarts-for-react';
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
class Stat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalOption: this.getTotalOption(),
      totalOptionData:{},
      userOption: this.getTotalOption(),
      userOptionData:{},
      envOption: this.getTotalOption(),
      startTime: '',
      entTime: '',
      envOptionData:{}
    }
  }
  getTotalOption() {
    let option = {
      title: {
        text: ''
      },
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: [],
          ext:[],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '部署次数',
          type: 'bar',
          barWidth: '60%',
          data: []
        }
      ]
    };
    return option;
  }
  onChartClick(param, echart) {
    if(echart._dom.className == 'total'){
        let dataObject = this.state.totalOptionData.data[param.dataIndex];
        window.location.href = '#project_stat?id=' + dataObject.project_id+'&name='+dataObject.name;
    }
    else if(echart._dom.className == 'user'){
      let dataObject = this.state.userOptionData.data[param.dataIndex];
      window.location.href = '#user_stat?id=' + dataObject.name;
    }
    else if(echart._dom.className == 'env'){
      let dataObject = this.state.envOptionData.data[param.dataIndex];
      window.location.href = '#env_stat?type=' + dataObject.type;
    }

  }
  onChartLegendselectchanged(param, echart) {
  }

  dataAjax(url, title, stateOption) {
    const self = this;
    $.ajax({
      type: 'get',
      url: url,
      success: function(res) {
        let option = self.getTotalOption();
        option.title.text = title;
        if (res.errno == 0) {
          for (let i = 0; i < res.data.length; i++) {
            let data = res.data[i];
            if (stateOption == 'envOption') {
              if (data.type == 1) {
                option.xAxis[0].data.push('正式');
              } else if (data.type == 2) {
                option.xAxis[0].data.push('预发布');
              } else if (data.type == 3) {
                option.xAxis[0].data.push('测试');
              }
            } else {
              option.xAxis[0].data.push(data.name);
            }
            option.series[0].data.push(data.pub);
          }
          let stateData = {};
          stateData[stateOption] = option;
          self.setState(stateData);
          let extData = {};
          extData[stateOption+'Data'] = res;
          self.setState(extData);
        }
      }
    })
  }
  fetch(startTime,endTime) {
    if(!startTime){
      startTime=endTime='';
    }
    //总统计

    this.dataAjax('/home/history/get_total_stat?startTime='+startTime+'&endTime='+endTime, '部署系统项目部署统计', 'totalOption');
    //用户部署统计
    this.dataAjax('/home/history/get_user_stat?startTime='+startTime+'&endTime='+endTime, '部署系统用户部署统计', 'userOption');
    //环境统计
    this.dataAjax('/home/history/get_env_stat?startTime='+startTime+'&endTime='+endTime, '部署系统环境部署统计', 'envOption');
  }
  componentDidMount() {
    this.fetch();
  }
  totalDateChange(dates, dateString) {
    this.fetch(dateString[0],dateString[1]);
  }

  render() {
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    };

    let onEvents = {
        'click': this.onChartClick.bind(this),
        'legendselectchanged': this.onChartLegendselectchanged
    };
    return (
      <div className='examples'>
      <Row>
       <div className="section-title" style={{textAlign:'center'}}>部署系统统计</div>
      </Row>
        <div>
          <FormItem {...formItemLayout} label="请选择日期">
            <RangePicker onChange={this.totalDateChange.bind(this)}/>
          </FormItem>
        </div>
        <div>

          <ReactEcharts option={this.state.totalOption} style={{
            height: '400px',
            width: '100%'
          }}
          onEvents={onEvents}
          className='total'/>

        </div>

        <div>
          <ReactEcharts  option={this.state.userOption} style={{
            height: '400px',
            width: '100%'
          }}
          onEvents={onEvents}
          className='user'/>
        </div>
        <div>
          <ReactEcharts option={this.state.envOption} style={{
            height: '400px',
            width: '100%'
          }}
          onEvents={onEvents}
          className='env'/>
        </div>
      </div>
    );
  }
}

export default Form.create({})(Stat);

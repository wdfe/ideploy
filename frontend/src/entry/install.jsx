import '../common/lib';
import Header from '../component/header';
import InstallForm from '../component/install_form';
import ReactDOM from 'react-dom';
import React, {Component} from 'react';
class Install extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <InstallForm />
      </div>
    );
  }
}

ReactDOM.render(
  <Header title="安装" />, document.getElementById('react-header'));
ReactDOM.render(
  <InstallForm/>, document.getElementById('react-content'));

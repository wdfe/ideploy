import '../common/lib';
import Header from '../component/header';
import LoginForm from '../component/login_form';
import RegisterForm from '../component/register_form';
import ReactDOM from 'react-dom';
import React, {Component} from 'react';
class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowRegForm: false
    };
  }

  handleRegForm(isShow) {
    this.setState({isShowRegForm: isShow})
  }

  render() {
    return (
      <div>
        <LoginForm regFormHandler={this.handleRegForm.bind(this)}/>
        <RegisterForm isShowRegForm={this.state.isShowRegForm} regFormHandler={this.handleRegForm.bind(this)}/>
      </div>
    );
  }
}

ReactDOM.render(
  <Header/>, document.getElementById('react-header'));
ReactDOM.render(
  <Auth/>, document.getElementById('react-content'));

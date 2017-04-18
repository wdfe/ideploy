'use strict';
import mailSender from 'nodemailer';
import  request from 'request';
export default class extends think.service.base {
    /**
     * init
     * @return {}         []
     */
    init(...args) {
        super.init(...args);
    }

    sendEmail(name, subject, content, maillist) {
        let emailHost = think.config('emailHost');
        let emailPort = think.config('emailport') || 465;
        let emailUser = think.config('emailUser');
        let emailPass = think.config('emailPass');
        let smtpConfig = {
          host: emailHost, // 主机
          ignoreTLS: false,
          secureConnection: true, // 使用 SSL
          port: emailPort, // SMTP 端口
          auth: {
            user: emailUser, // 账号
            pass: emailPass // 密码
          }
        };
        console.log(smtpConfig);
        let smtpTransport = mailSender.createTransport("SMTP",smtpConfig);
        var mailOptions = {
          from: emailUser, // 发件地址
          to: maillist, // 收件列表
          subject: subject, // 标题
          html: content // html 内容
        }
        return new Promise((resolve, reject) => {
          smtpTransport.sendMail(mailOptions, function(error, response){
            console.log(error);
            console.log(response);
            smtpTransport.close(); // 如果没用，关闭连接池
            if (!error) {
                resolve(error, response.message);
            } else {
                reject(error, response.message);
            }
          });
        })
    }
}

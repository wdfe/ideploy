// var mod_co = require('./checkout.js');
import fs from 'fs' ;
import diffUtil from './diff';
import sysPath from 'path' ;
import crypto from 'crypto' ;

export default class diffdir {
  getMd5(s) {
      var md5sum = crypto.createHash('md5');
      md5sum.update(s, 'utf8');
      return md5sum.digest('hex');
  }
  getAllFiles(pro, result, exp) {
      var files = {};
      files.same = [];
      files.change = [];
      files.add = [];
      //var local = utils.readJsonConf(result.newDir + '/' + pro.build_conf);
      var k;
      let self = this;
      function handleFile(obj) {
          var files_obj = {
              path_n: obj.n,
              path_o: obj.o
          };
          if (obj.o && fs.existsSync(obj.o)) {
              var md51 = self.getMd5(fs.readFileSync(obj.n));
              var md52 = self.getMd5(fs.readFileSync(obj.o));
              if (md51 === md52) {
                  files_obj.type = 'same';
                  files.same.push(files_obj);
              } else {
                  files_obj.type = 'change';
                  files_obj.diff = self.getDiffData(obj);
                  files.change.push(files_obj);
              }
          } else if (obj.o && !fs.existsSync(obj.o)) {
              files_obj.type = 'del';
              files.del.push(files_obj);
          } else {

              files_obj.type = 'add';
              files.add.push(files_obj);
          }


      }

      //某个目录是否不是在例外里
      function isExp(dir, exp) {
          for (let i = 0; i < exp.length; i++) {
              if (dir == exp[i]) {
                  return true;
              }
          }
          return false;
      }
      //比较新旧2个文件夹的文件修改情况
      function walk(path, exp) {
          let pathArr = path.split(sysPath.sep);
          let lastDir = pathArr[pathArr.length - 1];
          //  console.log('lastDir:'+lastDir+' '+exp);
          if (lastDir == '') {
              lastDir = pathArr[pathArr.length - 2];
          }
          //如果例外
          if (isExp(lastDir, exp)) {
              // console.log('lastDir+-----------:'+lastDir);
          } else {
              var dirList = fs.readdirSync(path);
              dirList.forEach(function(item) {
                  if (fs.existsSync(path + '/' + item) && fs.statSync(path + '/' + item).isFile()) {
                      var newFile = path + '/' + item;
                      var oldFile = newFile.replace(result.newDir, result.oldDir);
                      var oldFileExist = fs.existsSync(oldFile);
                      handleFile({
                          n: newFile,
                          o: oldFileExist ? oldFile : false
                      })
                  }
              });

              dirList.forEach(function(item) {
                  if (fs.existsSync(path + '/' + item) && fs.statSync(path + '/' + item).isDirectory()) {
                      walk(path + '/' + item, exp);
                  }
              });
          }

      }


      if (fs.existsSync(result.newDir)) {
          walk(result.newDir, exp);
      }
      return files;
  }
  getDiffData(obj) {
      var text1 = fs.readFileSync(obj.n, 'utf8');
      var text2 = fs.readFileSync(obj.o, 'utf8');
      var dmp = new diffUtil.diff_match_patch();
      var d = dmp.diff_main(text2, text1);
      return dmp.diff_prettyHtml(d);
  }
  diff(newDir, oldDir, exp) {
      var result = {};
      result.newDir = newDir;
      result.oldDir = oldDir;
      return this.getAllFiles({}, result, exp);
  }
}

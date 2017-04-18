'use strict';
import fs from 'fs';
import path from 'path';
import childProcessPro from 'child-process-es6-promise';
/**
 * 删除文件
 */
export default class {
    /**
     获取checkout目录
    */
    getCvsDir(username, id) {
            return './temp/' + username + '/' + id;
        }
        /**
         获取上一个tag dir
        */
    getLastTagDir(username, id) {
            return './temp/' + username + '/' + id + '_old';
        }
        /*
        获取增量更新是的构建目录
        */
    getIncBuildDir(username, id) {
            return './temp/' + username + '/' + id + '_inc';
        }
        //copy文件，单文件复制，如果已经有文件则覆盖
    copyOneFile(src, dest) {
            //如果没有这个源文件，则返回
            if (!fs.existsSync(src)) {
                return;
            }
            //如果没有文件夹，则建立文件夹
            let splitIndex = dest.lastIndexOf('/');
            let destDir = dest.substring(0, splitIndex);
            if (!fs.existsSync(destDir)) {
                this.mkDirSync(destDir);
            }
            //如果已经有这个文件，则删除
            let exists = fs.existsSync(dest);
            if (exists) {
                fs.unlinkSync(dest);
            }
            fs.linkSync(src, dest);
        }
        //copy目录
    async copyRecursiveSync(src, dest) {
            let excStr = await childProcessPro.exec('cp -rf ' + src + '/* ' + dest);
        }
        //逐级生成目录
    mkDirSync(dirpath) {
            if (!fs.existsSync(dirpath)) {
                let pathtmp;
                dirpath.split(path.sep).forEach(function(dirname) {
                    if (dirname == '') {
                        return;
                    }
                    if (pathtmp) {
                        pathtmp = path.join(pathtmp, dirname);
                    } else {
                        pathtmp = path.sep + dirname;
                    }
                    if (!fs.existsSync(pathtmp)) {
                        if (!fs.mkdirSync(pathtmp)) {
                            return false;
                        }
                    }
                });
            }
            return true;
        }
        //删除文件夹promise
    deleteDir(dir, exp) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var dirs = [];
            try {
                self.iterator(dir, dirs, exp);
                for (var i = 0, el; el = dirs[i++];) {
                    fs.rmdirSync(el); //一次性删除所有收集到的目录
                }
                resolve({
                    'status': 1
                });
                return;
            } catch (e) { //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
                let status = e.code === "ENOENT" ? 1 : 0;
                resolve({
                    'status': 1,
                    'msg': e
                });
                return;
            }
        });
    }
    iterator(url, dirs, exp) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            let pathArr = url.split(path.sep);
            let lastDir = pathArr[pathArr.length - 1];
            if (lastDir == '') {
                lastDir = pathArr[pathArr.length - 2];
            }
            if (lastDir == exp) {
                console.log('lastDir:' + lastDir);
            } else {
                dirs.unshift(url); //收集目录
                this.inner(url, dirs, exp);
            }

        } else if (stat.isFile()) {
            fs.unlinkSync(url); //直接删除文件
        }
    }

    inner(path, dirs, exp) {
        var arr = fs.readdirSync(path);
        for (var i = 0, el; el = arr[i++];) {
            this.iterator(path + "/" + el, dirs, exp);
        }
    }

}

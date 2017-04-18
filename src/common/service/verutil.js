'use strict';
import fs from 'fs';
import path from 'path';
/**
 * 版本计算
 */
export default class {
    /**
     根据老版本获取新版本
    */
    getNewVer(v) {
        let per = '00';
        let now = new Date();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        let today = now.getFullYear() + this.fixZero(month, 2) + this.fixZero(day, 2);
        let vCount;
        if (!v) v = today + per + '001';
        vCount = parseInt(v.slice(-3));
        //如果到999重新从0开始
        if (vCount === 999) vCount = 0;
        vCount = this.fixZero(++vCount, 3);
        return today + per + vCount;
    }

    fixZero(n, l) {
        let i;
        let z = '';
        l = Math.max(('' + n).length, l);
        for (i = 0; i < l; i++) {
            z += '0';
        }
        z += n;
        return z.slice(-1 * l);
    }

}

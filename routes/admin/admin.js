var express = require('express');
var router = express.Router();
let dbUtil = require("../../dao/dbdao");
let md5Util = require("../../util/md5");

/* GET admin listing. */
router.get('/', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("You haven't login the system!");
        return;
    }
    // console.log("req.user_acc is %s",req.query.user_acc)
    res.render('admin/admin',req.session.loginAdmin);
});

// 这个拦截器跳转一下，很有必要
// 302走一下判断session
router.get('/login', function (req, res, next) {
    if (req.session.loginAdmin) {
        res.redirect("/admin");
        return;
    }
    res.send("You haven't login the system!");
});

router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        console.info("Session Destroied");
    });
    res.redirect("../");
});

router.post('/resetpwd', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'FAILED'}");
        return;
    }
    console.warn("admin %s is modifing password now.", req.session.loginAdmin.adminId);
    let jsonRs = {};
    jsonRs.rs = 'OK';

    let oldPwd = md5Util.md5(req.body.oldPwd);
    let newPwd = md5Util.md5(req.body.newPwd);
    console.log("[SQL Param]<oldPwd> is %s", oldPwd);
    console.log("[SQL Param]<newPwd> is %s", newPwd);

    let updateSQL = "UPDATE admin SET user_pwd=? WHERE user_id=? and user_pwd=?";
    let params = [newPwd, req.session.loginAdmin.adminId, oldPwd];

    dbUtil.execute(updateSQL, params, function (exeResult) {
        if(exeResult.affectedRows == 1){
            jsonRs.rs = 'OK';
        }else{
            jsonRs.rs = 'ERROR';
        }
        res.json(jsonRs);
    });
});

// 查询访问明细
router.get('/qryreqlist', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'FAILED'}");
        return;
    }
    //2019-05-27T16:00:00.000Z
    //console.log(req.query.paraBeginDate);
    req.session.touch();
    // 查明细列表
    let qryString = "select a.req_id,b.merchant_name,date_format(a.req_time,'%Y-%m-%d %H:%i:%s') as req_time,a.raw_msg, a.rs_status from mo_command a inner join merchant b on a.merchant_id=b.merchant_id where 1=1";
    let qryCount = "select count(1) as total from mo_command a inner join merchant b on a.merchant_id=b.merchant_id where 1=1";
    let qryParams = [];
    if (req.query.paraName && req.query.paraName != "") {
        qryString += " and b.merchant_name like ? ";
        qryCount += " and b.merchant_name like ? ";
        qryParams.push("%" + req.query.paraName + "%");
    }
    if (req.query.paraBeginDate && req.query.paraBeginDate != "") {
        qryString += " and a.req_time >= str_to_date(?,'%Y-%m-%d %H:%i:%s') ";
        qryCount += " and a.req_time >= str_to_date(?,'%Y-%m-%d %H:%i:%s') ";
        qryParams.push(req.query.paraBeginDate + " 00:00:00");
    }
    if (req.query.paraEndDate && req.query.paraEndDate != "") {
        qryString += " and a.req_time <= str_to_date(?,'%Y-%m-%d %H:%i:%s') ";
        qryCount += " and a.req_time <= str_to_date(?,'%Y-%m-%d %H:%i:%s') ";
        qryParams.push(req.query.paraEndDate + " 23:59:59");
    }
    qryString += " limit " + req.query.limit + " offset " + req.query.offset;
    console.info("[SQL FORMATTER] : %s", qryString);
    console.info("[SQL FORMATTER] : %s", qryCount);
    let rsArray = [];
    let jsonRs = {};
    jsonRs.rs = "ERROR";

    // 回调深渊开始

    // 查总数的回调
    let callbackfunc2 = function (rs, fds) {
        if (rs && rs.length > 0) {
            jsonRs.total = rs[0].total;
            jsonRs.rs = "OK";
        }
        res.json(jsonRs);
    }

    // 查明细的回调
    let callbackfunc = function (rs, fds) {
        if (rs && rs.length > 0) {
            for (let idx = 0; idx < rs.length; idx++) {
                let record = rs[idx];
                rsArray.push(record);
            }
            jsonRs.rsArray = rsArray;
            dbUtil.query(qryCount, qryParams, callbackfunc2);
        }
    };

    dbUtil.query(qryString, qryParams, callbackfunc);
});

module.exports = router;

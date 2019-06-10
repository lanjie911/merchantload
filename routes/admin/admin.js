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
    res.render('admin/admin', req.session.loginAdmin);
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
    console.warn("merchant is %s,admin %s is modifing password now.", req.session.loginAdmin.merchantId, req.session.loginAdmin.adminId);
    let jsonRs = {};
    jsonRs.rs = 'OK';

    let oldPwd = md5Util.md5(req.body.oldPwd);
    let newPwd = md5Util.md5(req.body.newPwd);
    console.log("[SQL Param]<oldPwd> is %s", oldPwd);
    console.log("[SQL Param]<newPwd> is %s", newPwd);

    let updateSQL = "UPDATE merchant_admin SET admin_pwd=? WHERE admin_id=? and admin_pwd=? and merchant_id=?";
    let params = [newPwd, req.session.loginAdmin.adminId, oldPwd, req.session.loginAdmin.merchantId];

    dbUtil.execute(updateSQL, params, function (exeResult) {
        if (exeResult.affectedRows == 1) {
            jsonRs.rs = 'OK';
        } else {
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

    // 这里的查询都得加上商户id
    let merchant_id = req.session.loginAdmin.merchantId;

    // 查明细列表
    let qryString = "select a.req_id, date_format(a.req_time,'%Y-%m-%d %H:%i:%s') as req_time,a.raw_msg, a.rs_status from mo_command a where a.merchant_id=" + merchant_id + " ";
    let qryCount = "select count(1) as total from mo_command a where a.merchant_id=" + merchant_id + " ";
    let qryParams = [];

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
        } else {
            jsonRs.rs = "OK";
            jsonRs.rsArray = rsArray;
            res.json(jsonRs);
        }
    };

    dbUtil.query(qryString, qryParams, callbackfunc);
});

// 查询管理员列表
router.get('/qryadminlist', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'FAILED'}");
        return;
    }
    //2019-05-27T16:00:00.000Z
    //console.log(req.query.paraBeginDate);
    req.session.touch();

    // 这里的查询都得加上商户id
    let merchant_id = req.session.loginAdmin.merchantId;

    // 查明细列表
    let qryString = "select a.merchant_id, a.admin_name, a.admin_id, a.admin_mobile, a.admin_acc, ";
    qryString += "date_format(a.created_time,'%Y-%m-%d %H:%i:%s') as created_time, date_format(a.modified_time,'%Y-%m-%d %H:%i:%s') as modified_time, ";
    qryString += "a.is_root, ";
    qryString += "a.admin_status ";
    qryString += "from merchant_admin a where a.merchant_id=" + merchant_id + " ";
    let qryCount = "select count(1) as total from merchant_admin a where a.merchant_id=" + merchant_id + " ";
    let qryParams = [];

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

// 改变管理员状态
router.get('/changeadminstate', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'ERROR'}");
        return;
    }

    req.session.touch();

    let jsonRs = {};
    jsonRs.rs = 'OK';

    // 只有超管才能修改别人的状态
    if (req.session.loginAdmin.isRoot != 1) {
        jsonRs.rs = 'ERROR';
        jsonRs.text = "只有超管才能修改其他管理员的状态";
        res.json(jsonRs);
        return;
    }

    // 这里的查询都得加上商户id
    console.warn("merchant is %s,admin %s is modifing state to %d.", req.session.loginAdmin.merchantId, req.query.adminId, req.query.nst);

    let updateSQL = "UPDATE merchant_admin SET admin_status=?, modified_time=now() WHERE admin_id=? and merchant_id=?";
    let params = [req.query.nst, req.query.adminId, req.session.loginAdmin.merchantId];

    dbUtil.execute(updateSQL, params, function (exeResult) {
        if (exeResult.affectedRows == 1) {
            jsonRs.rs = 'OK';
        } else {
            jsonRs.rs = 'ERROR';
        }
        res.json(jsonRs);
    });
});

// 增加管理员
router.post('/addadmin', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'ERROR'}");
        return;
    }

    req.session.touch();

    let jsonRs = {};
    jsonRs.rs = 'OK';

    // 只有超管才能创建管理员
    if (req.session.loginAdmin.isRoot != 1) {
        jsonRs.rs = 'ERROR';
        jsonRs.text = "只有超管才能创建管理员";
        res.json(jsonRs);
        return;
    }

    // 这里的查询都得加上商户id
    console.info("[MERCHANT Create Admin]");
    console.info(req.body);

    let updateSQL = "INSERT INTO merchant_admin (merchant_id,admin_name,admin_mobile,admin_acc,admin_pwd,admin_status,created_time,modified_time) ";
    updateSQL += "VALUES (?,?,?,?,?,?,NOW(),NOW())";

    let params = [];
    params.push(req.session.loginAdmin.merchantId);
    params.push(req.body.vname);
    params.push(req.body.mobile);
    params.push(req.body.acc);
    params.push(md5Util.md5(req.body.pwd));
    params.push(req.body.state ? 1 : 0);

    dbUtil.insert(updateSQL, params, function (exeResult) {
        if (exeResult.affectedRows == 1) {
            jsonRs.rs = 'OK';
        } else {
            jsonRs.rs = 'ERROR';
        }
        res.json(jsonRs);
    }, function (err) {
        let code = err.code;
        if ("ER_DUP_ENTRY" == code) {
            jsonRs.text = "账号名已经存在，请更换一个";
            jsonRs.rs = 'ERROR';
            res.json(jsonRs);
        }
    });
});

// 修改管理员
router.post('/modadmin', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'ERROR'}");
        return;
    }

    req.session.touch();

    let jsonRs = {};
    jsonRs.rs = 'OK';

    // 只有超管才能创建管理员
    if (req.session.loginAdmin.isRoot != 1) {
        jsonRs.rs = 'ERROR';
        jsonRs.text = "只有超管才能修改管理员";
        res.json(jsonRs);
        return;
    }

    // 这里的查询都得加上商户id
    console.info("[MERCHANT Modify Admin]");
    console.info(req.body);

    let updateSQL = "UPDATE merchant_admin SET admin_name=?, ";
    updateSQL += "admin_mobile=?, ";
    updateSQL += "admin_acc=?, ";
    updateSQL += "admin_pwd=?, ";
    updateSQL += "admin_status=?, ";
    updateSQL += "modified_time=NOW() ";
    updateSQL += "WHERE merchant_id=? and admin_id=?"

    let params = [];
    params.push(req.body.vname);
    params.push(req.body.mobile);
    params.push(req.body.acc);
    params.push(md5Util.md5(req.body.pwd));
    params.push(req.body.state ? 1 : 0);
    params.push(req.session.loginAdmin.merchantId);
    params.push(req.body.adminid);

    dbUtil.update(updateSQL, params, function (exeResult) {
        if (exeResult.affectedRows == 1) {
            jsonRs.rs = 'OK';
        } else {
            jsonRs.rs = 'ERROR';
        }
        res.json(jsonRs);
    }, function (err) {
        let code = err.code;
        if ("ER_DUP_ENTRY" == code) {
            jsonRs.text = "账号名已经存在，请更换一个";
            jsonRs.rs = 'ERROR';
            res.json(jsonRs);
        }
    });
});

// 查询短信列表
router.get('/qrysmslist', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'FAILED'}");
        return;
    }
    //2019-05-27T16:00:00.000Z
    //console.log(req.query.paraBeginDate);
    req.session.touch();

    // 这里的查询都得加上商户id
    let merchant_id = req.session.loginAdmin.merchantId;

    // 查明细列表
    let qryString = "select a.req_id, a.mobile, a.raw_msg, a.rs_status, a.rs_stat,";
    qryString += "date_format(a.req_time,'%Y-%m-%d %H:%i:%s') as req_time ";
    qryString += "from mt_command a where a.merchant_id=" + merchant_id + " ";
    let qryCount = "select count(1) as total from mt_command a where a.merchant_id=" + merchant_id + " ";
    let qryParams = [];

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
        } else {
            jsonRs.rs = "OK"
            res.json(jsonRs);
        }
    };

    dbUtil.query(qryString, qryParams, callbackfunc);
});


// 查询验证码列表
router.get('/qryvcodelist', function (req, res, next) {
    if (!req.session.loginAdmin) {
        res.send("{rs:'FAILED'}");
        return;
    }
    //2019-05-27T16:00:00.000Z
    //console.log(req.query.paraBeginDate);
    req.session.touch();

    // 这里的查询都得加上商户id
    let merchant_id = req.session.loginAdmin.merchantId;

    // 查明细列表
    let qryString = "select a.mid, a.raw_msg, a.mobile, a.rs_stat, ";
    qryString += "date_format(a.req_time,'%Y-%m-%d %H:%i:%s') as req_time ";
    qryString += "from mt_vcode a where a.merchant_id=" + merchant_id + " ";
    let qryCount = "select count(1) as total from mt_vcode a where a.merchant_id=" + merchant_id + " ";
    let qryParams = [];

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

    if (req.query.paraMobile && req.query.paraMobile != "") {
        qryString += " and a.mobile = ? ";
        qryCount += " and a.mobile = ? ";
        qryParams.push(req.query.paraMobile);
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
        } else {
            jsonRs.rs = "OK"
            res.json(jsonRs);
        }
    };

    dbUtil.query(qryString, qryParams, callbackfunc);
});

module.exports = router;

var express = require('express');
var router = express.Router();
let md5Util = require("../util/md5");
let vcodeUtil = require("../util/vcode");
let dbUtil = require("../dao/dbdao");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * 验证码请求
 */
router.get("/vcode",function(req,res,next){
  console.log("[Verify Code Begin]...");
  console.log(req.session);
  let imgData = vcodeUtil.getCode(req,res);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(String(imgData.img));
  res.end();
});

/**
 * 处理登录请求
 */
router.post('/login', function (req, res, next) {

  let acc = req.body.acc;
  let pwd = md5Util.md5(req.body.pwd);
  let vcode = req.body.vcode;
  
  console.log("acc %s login and pwd is %s and vcode is %s", acc, pwd,vcode);

  // 比较验证码
  let serverVCode = req.session.captcha;
  if(vcode != serverVCode){
    res.json({ rs: 'LoginError' });
    req.session.captcha = null;
    return;
  }

  let qryString = "select a.merchant_id,a.admin_id,a.admin_name,a.admin_mobile,a.is_root,b.merchant_status from merchant_admin a ";
  qryString += "left join merchant b on a.merchant_id=b.merchant_id where a.admin_acc=? and a.admin_pwd=? and a.admin_status=1 ";
  let qryParams = [acc, pwd];
  let callbackfunc = function (rs, fds) {
    if(rs && rs.length > 0){
      let record = rs[0];
      console.log("merchant admin id is %s and merchant_status is %s",record.admin_id,record.merchant_status);

      if(record.merchant_status != 1){
        // 商户不是激活状态
        res.json({ rs: 'LoginError' });
        return;
      }

      //增加session
      req.session.loginAdmin = {};
      req.session.loginAdmin.merchantId = record.merchant_id;
      req.session.loginAdmin.adminId = record.admin_id;
      req.session.loginAdmin.adminName = record.admin_name;
      req.session.loginAdmin.adminMobile = record.admin_mobile;
      req.session.loginAdmin.isRoot = record.is_root;
      res.json({ rs: 'LoginOK', "admin":req.session.loginAdmin });
      return;
    }
    res.json({ rs: 'LoginError' });
    return;
  };

  dbUtil.query(qryString, qryParams, callbackfunc);



  //res.render('index', { title: 'Express' });
});

module.exports = router;

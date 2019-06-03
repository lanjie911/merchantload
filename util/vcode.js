let svgCaptcha = require('svg-captcha');

exports.getCode = (req) => {
    let codeConfig = {
        size: 5,// 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 3, // 干扰线条的数量
        height: 44 
    }
    let captcha = svgCaptcha.create(codeConfig);
    //存session用于验证接口获取文字码
    let vCodeStr = captcha.text.toLowerCase();
    console.log("[Verify Code Access] is <%s>",vCodeStr);
    req.session.captcha = vCodeStr;

    let codeData = {
        img:captcha.data
    };
    return codeData;
}
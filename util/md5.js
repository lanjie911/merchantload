let cryptoPkg = require('crypto');

let md5=function(inboudStr){
    if(inboudStr == null || inboudStr == "" || inboudStr.length == 0){
        return "";
    }
    let md5Util = cryptoPkg.createHash('md5');
    let result = md5Util.update(inboudStr).digest('hex');
    console.log("MD5 Util Seize...[%s]",result);
    return result;
}

exports.md5 = md5;
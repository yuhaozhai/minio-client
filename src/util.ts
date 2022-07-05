import CryptoJS from "crypto-js";
let key  = 'cjyd012345678901'
enum GlobalConstant {
    USER_KEY = '_USERINFO',
    TOKEN = 'token',
    MENU = '_ALLMENU',
    tokenArray = 'tokenArray',
    ctxPath = "/cjyd-manage",  
    imgPath = "/szyun",
}


export function decrypt(value:string,key:string){
    if (value) {
        const keys = CryptoJS.enc.Utf8.parse(key);
        const  bytes = CryptoJS.AES.decrypt(value, keys, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return bytes.toString(CryptoJS.enc.Utf8);
    } else {
        return '';
    }
}
export function encrypt(value:string,key:string){
    const keys = CryptoJS.enc.Utf8.parse(key);
    const values = CryptoJS.enc.Utf8.parse(value);
    return CryptoJS.AES.encrypt(values, keys, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
}

export function getMinIoConfig(key:string){
    if (sessionStorage.getItem(GlobalConstant.USER_KEY)) {
        var userInfo = JSON.parse(sessionStorage.getItem(GlobalConstant.USER_KEY) as any);
        return {
            // 解密
            accessKeyId: decrypt(userInfo.minIoConfig.accessKeyId,key),
            accessKeySecret: decrypt(userInfo.minIoConfig.accessKeySecret,key),
            bucket: decrypt(userInfo.minIoConfig.bucket,key),
            url: decrypt(userInfo.minIoConfig.url,key)
        };
    } else {
        return {
            accessKeyId: decrypt('5n5g5frS0rRLfQn+qxQ1yQ==',key),
            accessKeySecret: decrypt('qcC2P662sgZ5S2nx71I0oQ==',key),
            bucket: decrypt('9iYLlCOzjl+Twj2hJAvwUA==',key),
            url: decrypt('VJGBDiHLsL7+kOMCD6qPSWmGNiWTIHXktY/ioMyf0Vo=',key)
        };
    }
}
export function imgSrcTurn(url:string){
    if (!url) return;
    if (url.indexOf("https://") === 0 || url.indexOf("http://") === 0) {
        return url;
    } else {
        let config = getMinIoConfig(key);
        return config.url + '/' + config.bucket + (!url.indexOf(GlobalConstant.imgPath) ?
            GlobalConstant.imgPath +
            url.substring(url.indexOf(GlobalConstant.imgPath) + GlobalConstant.imgPath.length) :
            GlobalConstant.imgPath + url);
    }
};

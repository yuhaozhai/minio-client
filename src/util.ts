import CryptoJS from "crypto-js";

function decrypt(value:string,key:string){
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
function encrypt(value:string,key:string){
    const keys = CryptoJS.enc.Utf8.parse(key);
    const values = CryptoJS.enc.Utf8.parse(value);
    return CryptoJS.AES.encrypt(values, keys, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
}

function getMinIoConfig(key:string){
    if (sessionStorage.getItem('_USERINFO')) {
        var userInfo = JSON.parse(sessionStorage.getItem('_USERINFO') as any);
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
            region: decrypt('VJGBDiHLsL7+kOMCD6qPSWmGNiWTIHXktY/ioMyf0Vo=',key)
        };
    }
}

export default getMinIoConfig
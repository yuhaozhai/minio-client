import getMinIoConfig from "./util";

var Minio = require('minio');
import {v4 as uuidv4} from 'uuid';
import moment from "moment";
const key  = 'cjyd012345678901'
const bucketName = getMinIoConfig(key).bucket
let xhrList: XMLHttpRequest[] = []


export default class MinIOClient {
    static selectFile(option: {
        mode?: 'single' | 'multiple',
        type?: Array<string>;
        size?: number;
    }) {
        const {type, mode,size} = option;
        return new Promise((resolve,reject) => {
            const inputNode = document.createElement('input');
            inputNode.setAttribute('type', 'file');
            if (type) {
                inputNode.setAttribute('accept', type.toString());
            }
            inputNode.style.display = 'none';
            if (mode && mode === 'multiple') {
                inputNode.setAttribute('multiple', 'multiple');
            }
            document.body.appendChild(inputNode);
            inputNode.click();
            inputNode.onchange = () => {
                if (mode === 'multiple') {
                    const allFileList: any = inputNode['files'];
                    if (allFileList) {
                        for (var i = 0; i < allFileList.length; i++) {
                            let file: any = allFileList[i];
                            const fileName = file.name;
                            let reg = /(.*)$/i;
                            if (type) {
                                reg = new RegExp(`(${type.join('|')})$`, 'i');
                            }
                            if (reg.test(fileName)) {
                                file.pass = true;
                            } else {
                                if (type) {
                                    file.pass = false;
                                }
                            }
                            if (option.size && option.size * 1024 < file.size) {
                                reject(`文件大小超出限制, 最大支持${option.size / 1024}M,已自动过滤`)
                                file.pass = false;
                            }
                        }
                    }
                    let fileList = Array.from(allFileList);
                    resolve(fileList.filter((item: any) => item.pass));
                } else {
                    if (inputNode['files']) {
                        const file = inputNode['files'][0];
                        if (option.size && option.size * 1024 < file.size) {
                            reject(`文件大小超出限制, 最大支持${option.size / 1024}M`)
                            return;
                        }
                        const fileName = file.name;
                        let reg = /(.*)$/i;
                        if (type) {
                            reg = new RegExp(`(${type.join('|')})$`, 'i');
                        }
                        if (reg.test(fileName)) {
                            resolve(file);
                        } else {
                            if (type) {
                                reject(`文件格式不正确，仅支持${type.join()}`)
                            }
                        }
                        // 将节点在body上移除
                        document.body.removeChild(inputNode);
                    }
                }
            };
        });
    }
        /**
     * 分片上传
     */
         static bigFileUpload = (uploadPath: any, file: any, callBack?: (arg0: number) => any, randomName?: any) => {
            let config: any = getMinIoConfig(key);
            let option = {
                // 正式环境
                endPoint: config.url.substring(8,config.url.length),
                port:443,
                useSSL: true,
                accessKey: config.accessKeyId,
                secretKey: config.accessKeySecret
            }
            if(config.url.indexOf('https') === -1){
                // 测试环境
                option = {
                    endPoint: '192.168.196.50',
                     port:9000,
                    useSSL: false,
                    accessKey: config.accessKeyId,
                    secretKey: config.accessKeySecret
                }
            }
            const minioClient = new Minio.Client(option);
            const names = file.name.split('.');
            let fileName = `${uploadPath}${file.name}`;
            if (randomName) {
                // uuid生成文件名称
                fileName = `${uploadPath}${uuidv4().replace(/-/g, '')}.${names[names.length - 1]}`;
            }
            //判断储存桶是否存在
            return new Promise((resolve, reject) => {
                minioClient.bucketExists(bucketName, function (err:any) {
                    if (err) {
                        if (err.code == "NoSuchBucket")
                            return console.log("bucket不存在");
                    }
                    minioClient.presignedPutObject(bucketName, fileName, 24 * 60 * 60, function (err:any, presignedUrl:string) {
                        let xhr = new XMLHttpRequest();
                        xhr.open("PUT", presignedUrl, true);
                        xhr.withCredentials = false;
                        const token = localStorage.getItem("token");
                        if (token) {
                            xhr.setRequestHeader(
                                "Authorization",
                                "Bearer " + localStorage.getItem("token")
                            );
                        }
                        xhr.setRequestHeader(
                            "x-amz-date",
                            moment()
                                .utc()
                                .format("YYYYMMDDTHHmmss") + "Z"
                        );
                        xhr.upload.addEventListener("progress", event => {
                            if (event.lengthComputable) {
                                let complete = (event.loaded / event.total * 100 | 0);
                                callBack ? callBack(complete) : '';
                                if (complete === 100) {
                                    resolve(presignedUrl.substring(presignedUrl.indexOf('/szyun'), presignedUrl.indexOf('?X-Amz-Algorithm')));
                                }
                            }
                        });
                        xhr.send(file);
                        xhrList.push(xhr);
                    });
                });
            });
    
        };
// 取消所有请求
        static abortAllXhr() {
            xhrList.map(item => {
                item.abort();
            });
            xhrList = [];
        }
}


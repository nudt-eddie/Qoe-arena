// 是否监听单个文件进度
let isSeparate = false;
let xhrs = [];
/**
 * 文件change事件
 * @param {*} event 事件
 */
function changeFileChoose(event) {
    let fileList = document.querySelector('#fileList');
    // 判断是否有子节点，如果有，则移除，直到所有的移除完毕
    while(fileList.hasChildNodes()) {
        fileList.removeChild(fileList.firstChild)
    }
    // 创建临时片段，一次性插入使用
    let fragment = document.createDocumentFragment();
    // 获取到当前的对象中的文件，循环显示
    for(let i = 0; i < event.target.files.length; i++) {
        let file = event.target.files[i];
        fragment.appendChild(createFileDom(file, i));
    }
    // 最后增加所有文件片段
    fileList.appendChild(fragment);
}

/**
 * 文件上传操作，根据设定判断是一起上传还是分开上传
 */
function upload() {
    // 获取formData数据信息
    let formData = new FormData(document.getElementById('fileForm'));
    if (isSeparate) {
        // 过滤掉没有选择文件时候的传递
        formData.getAll('file').filter(file => {
            return file.name
        }).forEach((file,index) => {
            let separateFormData = new FormData();
            separateFormData.set('file', file);
            let xhr = createXhr(separateFormData, index);
            xhrs.push(xhr);
        })
    } else {
        let xhr = createXhr(formData);
        xhrs.push(xhr);
    }
}

/**
 * 创建异步上传的数据结果
 * @param {*} formData 
 * @param {*} index 
 */
function createXhr(formData, index) {
    let progress, pgValue;
    if (index !== undefined) {
        progress = document.querySelector(`#fp${index}`);
        pgValue = document.querySelector(`#fpv${index}`);
    } else {
        progress = document.querySelector('#progress');
        pgValue = document.querySelector('#pgValue');
    }
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/upload');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.onprogress = (event) => {
        console.log('onprogress', event)
        console.log(`loaded: ${event.loaded}, total: ${event.total}`);
    }
    xhr.upload.onprogress = (event) => {
        console.log('upload onprogress', event)
        progress.value = event.loaded * 100 / event.total;
        pgValue.textContent = (progress.value).toFixed(2) + '%';
        console.log(`upload loaded: ${event.loaded}, total: ${event.total}`);
    }
    xhr.onreadystatechange = () => {
        if(xhr.readyState === xhr.DONE) {
            progress.value = 100;
        }
    }
    xhr.onabort = (event) => {
        console.log('file abort:', event)
    }
    xhr.send(formData);
    return xhr;
}

/**
 * 取消上传
 * @param {*} index xhr队列
 */
function abort(index) {
    if (xhrs.length > 0) {
        if (index !== undefined && index !== null) {
            xhrs[index].abort();
        } else {
            xhrs.forEach(xhr => {
                xhr.abort();
            })
        }
    }
}
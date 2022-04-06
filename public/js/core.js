

function download() {
    let filename = document.getElementById('filename');
    let progress = document.getElementById('progress2');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/download/${filename.value}`);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.onprogress = (event) => {
        // progress.value = event.loaded * 100 / event.total;
        console.log(`loaded: ${event.loaded}, total: ${event.total}`);
    }
    xhr.onreadystatechange = () => {
        console.log(xhr.readyState);
        if(xhr.readyState === xhr.DONE) {
            progress.value = 100;
        }
    }
    xhr.send();
}

function createFileDom (file, i, isSeparate) {
    let el = document.createElement('div');
    let p = document.createElement('p');
    //添加文件信息
    p.textContent = `File name: ${file.name}, File size: ${returnFileSize(file.size)}`;
    el.appendChild(p);
    if (isSeparate) {
        let progress = document.createElement('progress');
        progress.id = `fp${i}`;
        progress.value = 0;
        progress.max = 100;
        el.appendChild(progress);
        let pValue = document.createElement('span');
        pValue.textContent = '0%';
        pValue.id = `fpv${i}`
        el.appendChild(pValue);
        let button = document.createElement('button');
        button.onclick = () => {
            abort(i);
        }
        button.textContent = '取消';
        el.appendChild(button);
    }
    // 添加图片预览
    if (validateImage(file.type)) {
        let image = document.createElement('img');
        // URL.createObjectURL可以接受File, Blob, MediaSource对象
        image.style.height = '100px';
        image.style.width = '100px';
        image.src = window.URL.createObjectURL(file);
        el.appendChild(image);
    }
    return el
}

/**
 * 验证图片类型
 * @param {*} type 文件类型
 */
function validateImage(type) {
    return ['image/jpeg', 'image/png', 'image/jpg'].includes(type);
}

/**
 * 获取文件尺寸参数
 * @param {*} size 文件size 
 */
function returnFileSize(size) {
    if(size < 1024) {
      return size + 'B';
    } else if(size >= 1024 && size < 1048576) {
      return (size/1024).toFixed(1) + 'KB';
    } else if(size >= 1048576) {
      return (size/1048576).toFixed(1) + 'MB';
    }
}
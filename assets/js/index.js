// assets/js/index.js

// 从 URL 中获取 filename 和 path
var urlParams = new URLSearchParams(window.location.search);
var filename = decodeURIComponent(urlParams.get('filename'));
var path = window.location.pathname.slice(1).replace(/^ipfs\//, ''); // 移除路径开头的 /ipfs/
var query = urlParams.toString();

// 设置输入框的值
document.getElementById('filename').value = filename || '';
document.getElementById('filepath').value = path || '';

// 添加事件监听器
document.getElementById('filename').addEventListener('input', updateUrl);
document.getElementById('filepath').addEventListener('input', updateUrl);

function updateUrl() {
    filename = document.getElementById('filename').value;
    path = document.getElementById('filepath').value;

    if (filename && path) {
        updateButton()
        // 更新URL
        window.history.pushState({}, '', `/${path}?filename=${filename}`);
    }
}

// 更新信息
function updateButton() {
    let quickDownloadLink = document.querySelector('#quick-download-link');
    let slowDownloadLink = document.querySelector('#slow-download-link');
    let oldVersionDownloadLink = document.querySelector('#old-version-download-link');
    let inbrowserlink = document.querySelector('#inbrowser');
    window.history.pushState({}, '', `/${path}?filename=${filename}`);
    quickDownloadLink.href = `/${path}?filename=${filename}#quick`;
    slowDownloadLink.href = `/${path}?filename=${filename}#slow`;
    oldVersionDownloadLink.href = `https://check.ipfs.winx.run/${path}?filename=${filename}`;
    inbrowserlink.href = `https://${path}.ipfs.inbrowser.link/?download=true&filename=${filename}`;
}

if (window.location.hash === '#slow' || window.location.hash === '#quick') {

    // 检查filename和path是否为空
    if (!filename || !path) {
        alert('文件名或路径为空，请返回上一页面查看使用说明');
        throw new Error('文件名或路径为空！');
    }

    // 构建下载地址列表
    const downloadUrls = [
        `https://gw.crustgw.work/ipfs/${path}`,
        `https://gw.crust-gateway.xyz/ipfs/${path}`,
        `https://gw.crust-gateway.com/ipfs/${path}`,
        `https://gw.crustgw.org/ipfs/${path}`,
        `https://ipfs.crossbell.io/ipfs/${path}`,
        `https://gw.smallwolf.me/ipfs/${path}`,
        `https://ipfs-3.yoghourt.cloud/ipfs/${path}`,
        `https://i0.img2ipfs.com/ipfs/${path}`,
        `https://eth.sucks/ipfs/${path}`,
        `https://ipfs-7.yoghourt.cloud/ipfs/${path}`,
        `https://4everland.io/ipfs/${path}`,
        `https://ipfs.forma.art/ipfs/${path}`,
        `https://ipfs-10.yoghourt.cloud/ipfs/${path}`,
        `https://ipfs-11.yoghourt.cloud/ipfs/${path}`,
        `https://ipfs-12.yoghourt.cloud/ipfs/${path}`,
        `https://ipfs-13.yoghourt.cloud/ipfs/${path}`,
        `https://ipfs-14.yoghourt.cloud/ipfs/${path}`,
        `https://ipfs-15.yoghourt.cloud/ipfs/${path}`,
        `https://gateway.pinata.cloud/ipfs/${path}`,
        `https://${path}.ipfs.dweb.link/`,
        `https://ipfs.runfission.com/ipfs/${path}`,
        `https://${path}.ipfs.ipfs.joaoleitao.org/`,
        `https://dweb.link/ipfs/${path}`,
        `https://ipfs.io/ipfs/${path}`

    ];

    // 跟踪下载进度
    var maxProgress = 0;
    var progressCount = 0;

    function updateProgress() {
        const progressElement = document.getElementById('progress');
        const formattedProgress = maxProgress.toFixed(1); // 将进度值保留一位小数
        progressElement.innerHTML = `文件名 <strong>${filename}</strong> <br> 下载进度 <strong>${formattedProgress}%</strong>`;
    }

    // 下载文件并展示进度
    function downloadWithProgress(url, controller=null) {
        return new Promise((resolve, reject) => {
            const config = {
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    let progress;
                    if(!progressEvent.total){
                        progress = 0;
                    } else {
                        progress = (progressEvent.loaded / progressEvent.total) * 100;
                    }
                    console.log('下载进度：', progress);
                    // 在这里更新进度条的显示
                    maxProgress = Math.max(maxProgress, progress);
                    updateProgress();
                }
            };

            if (controller) {
                config.signal = controller.signal;
            }

            axios.get(url, config)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // 保存文件到本地
    function saveLocally(data) {
        const blob = new Blob([data]);
        const link = document.getElementById('save');
        // const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        // URL.revokeObjectURL(link.href);
    }

    // 以上为公用，下面分别处理
    if (window.location.hash === '#slow') {
        // 依次尝试下载地址
        function tryNextDownload(index) {
            if (index >= downloadUrls.length) {
                // 所有下载地址都已尝试完毕
                console.log('所有下载地址都已尝试完毕');
                alert('所有下载地址都已尝试完毕，请考虑手动下载')
                return;
            }

            const url = downloadUrls[index];
            downloadWithProgress(url)
                .then((data) => {
                    console.log(`下载完成：${data.length} bytes`);
                    let myDiv = document.getElementById('success');
                    myDiv.style.display = 'block';
                    saveLocally(data);
                })
                .catch((error) => {
                    console.error(`下载失败：${url}`);
                    progressCount++;
                    tryNextDownload(progressCount);
                });
        }

        updateProgress();
        // 开始下载
        tryNextDownload(progressCount);
    }
    else {
        // 启动下载并中断其他下载
        function startDownload() {
            const controllers = [];
            const downloadPromises = downloadUrls.map((url, index) => {
                const controller = new AbortController();
                controllers.push(controller);

                return new Promise((resolve, reject) => {
                    downloadWithProgress(url, controller)
                        .then((data) => {
                            if (maxProgress === 100) {
                                // 当有一个进程完成时中断其他下载
                                for (let i = 0; i < controllers.length; i++) {
                                    if (i !== index) {
                                        controllers[i].abort();
                                    }
                                }
                            }
                            resolve(data);
                        })
                        .catch((error) => {
                            reject(error);
                        })
                        .finally(() => {
                            progressCount++;
                            if (progressCount === downloadUrls.length) {
                                if (maxProgress !== 100) {
                                    console.log('所有下载都被中断');
                                }
                            }
                        });
                });
            });

            Promise.allSettled(downloadPromises)
                .then((results) => {
                    const successfulDownloads = results.filter(
                        (result) => result.status === 'fulfilled'
                    );
                    if (successfulDownloads.length > 0) {
                        maxProgress = 100;
                        updateProgress();
                        console.log(`下载完成：${successfulDownloads[0].value.length} bytes`);
                        let myDiv = document.getElementById('success');
                        myDiv.style.display = 'block';
                        saveLocally(successfulDownloads[0].value);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        updateProgress();
        // 开始下载
        startDownload();
    }
}
else {
    let myDiv = document.getElementById('default');
    myDiv.style.display = 'block';
    updateButton()
}
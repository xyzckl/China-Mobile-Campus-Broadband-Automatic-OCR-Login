// ==UserScript==
// @name         中国移动校园宽带自动输入验证码登录v7.1
// @namespace    http://tampermonkey.net/
// @icon         https://www.xyzckl.site/xyzckl.ico
// @version      7.1
// @description  全自动闭环识别加确认登陆：识别失败自动刷新，登录失败自动返回重试。第一次安装脚本需要在登陆校园网后，重新打开中国移动校园网登陆界面等待脚本加载文件，当脚本开始填充验证码登陆时则说明文件加载完成，正常情况下文件会被浏览器缓存，后续未登录无互联网情况脚本仍然可以运行。如脚本失效请重新进行加载步骤！！！
// @author       Xyzckl
// @match        http://218.200.239.185:8888/portalserver/*
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // --- 💾 设置存储管理 ---
    const STORAGE_KEY_MASTER = 'sccmcc_master_switch';
    const STORAGE_KEY_RETRY = 'sccmcc_retry_switch';

    function getSetting(key, defaultVal) {
        return localStorage.getItem(key) === null ? defaultVal : localStorage.getItem(key) === 'true';
    }
    function setSetting(key, val) {
        localStorage.setItem(key, val);
    }

    let isMasterOn = getSetting(STORAGE_KEY_MASTER, true);
    let isRetryOn = getSetting(STORAGE_KEY_RETRY, true);

    // --- 🎨 UI 构建 (Material You 风格) ---
    // 主容器
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: 'PingFang SC', sans-serif;
        user-select: none;
    `;
    document.body.appendChild(container);

    // 1. 状态条
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        background-color: #FFDBC9; /* 浅橙色 */
        color: #5E2C04; /* 深褐色 */
        padding: 12px 20px;
        border-radius: 20px;
        font-weight: 500;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(200, 100, 50, 0.2);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    `;
    statusDiv.innerHTML = "<span>🤖</span> <span id='status-text'>脚本准备就绪</span>";
    container.appendChild(statusDiv);

    // 2. 控制面板 (按钮组)
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        display: flex;
        gap: 10px;
    `;
    container.appendChild(controlsDiv);

    // 辅助函数：创建开关按钮
    function createToggle(text, initialState, onClick) {
        const btn = document.createElement('div');
        const updateStyle = (active) => {
            btn.style.cssText = `
                background-color: ${active ? '#FFB596' : '#E0E0E0'};
                color: ${active ? '#3E1C00' : '#757575'};
                padding: 8px 16px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            btn.innerHTML = (active ? '🟢 ' : '⚪ ') + text;
        };
        updateStyle(initialState);
        btn.onclick = () => {
            const newState = !((btn.dataset.active === 'true'));
            btn.dataset.active = newState;
            updateStyle(newState);
            onClick(newState);
        };
        btn.dataset.active = initialState;
        return btn;
    }

    // 添加按钮
    const btnMaster = createToggle("脚本总开关", isMasterOn, (val) => {
        isMasterOn = val;
        setSetting(STORAGE_KEY_MASTER, val);
        if(!val) updateStatus("🚫 脚本已暂停", "🛑");
        else location.reload(); // 开启时刷新页面以激活
    });

    const btnRetry = createToggle("失败自动刷新", isRetryOn, (val) => {
        isRetryOn = val;
        setSetting(STORAGE_KEY_RETRY, val);
        updateStatus(val ? "已开启自动重试" : "已关闭自动重试", "⚙️");
    });

    controlsDiv.appendChild(btnMaster);
    controlsDiv.appendChild(btnRetry);

    // --- 🛠️ 功能逻辑 ---

    function updateStatus(text, icon = "🤖") {
        const span = statusDiv.querySelector('#status-text');
        const iconSpan = statusDiv.querySelector('span:first-child');
        if(span) span.innerText = text;
        if(iconSpan) iconSpan.innerText = icon;
        console.log(`[脚本状态] ${text}`);
    }

    // 核心修复：强制排版 (保留之前的功能)
    function fixPageLayout() {
        try {
            if (typeof unsafeWindow.initPage === 'function') {
                unsafeWindow.initPage();
            } else if (typeof window.initPage === 'function') {
                window.initPage();
            } else {
                const w = document.documentElement.offsetWidth;
                document.documentElement.style.fontSize = (w <= 640 ? 640 : w) + 'px';
            }
        } catch (e) {}
    }

    // --- 🧠 智能路由 (根据页面类型决定动作) ---
    function initLogic() {
        if (!isMasterOn) {
            updateStatus("脚本已关闭 (点击下方开关开启)", "💤");
            return;
        }

        const pageTitle = document.title;
        const adminDiv = document.getElementById('admin');
        const adminText = adminDiv ? adminDiv.innerText : "";

        // 情况1：登录成功
        if (pageTitle.includes("登录成功") || adminText.includes("尊敬的用户")) {
            updateStatus("🎉 恭喜！您已成功上线", "✅");
            // 成功后可以隐藏控制台，或者留着
            setTimeout(() => { container.style.opacity = '0.5'; }, 3000);
            return;
        }

        // 情况2：登录失败 (验证码错误 或 认证拒绝)
        if (pageTitle.includes("登录失败") || adminText.includes("验证码错误") || adminText.includes("认证请求被拒绝")) {
            if (isRetryOn) {
                updateStatus("登录失败，2秒后重试...", "🔄");
                setTimeout(() => {
                    // 尝试点击页面自带的“返回”按钮
                    const backBtn = document.getElementById('login_btn');
                    if (backBtn) {
                        backBtn.click();
                    } else {
                        history.go(-1); // 兜底
                    }
                }, 2000);
            } else {
                updateStatus("登录失败 (自动重试已关闭)", "❌");
            }
            return;
        }

        // 情况3：登录页面 (有验证码图片)
        const imgElement = document.getElementById('randomimage');
        if (imgElement) {
            // 开始 OCR 流程
            startLoginFlow(imgElement);
        } else {
            // 未知页面
            updateStatus("未检测到登录元素", "❓");
        }
    }

    // --- 👁️ OCR 与登录流程 ---
    async function startLoginFlow(imgElement) {
        updateStatus("等待自动填充...", "⏳");

        // 等待一小会儿，确保浏览器填充了密码，同时等待图片加载
        await new Promise(r => setTimeout(r, 800));

        if (!imgElement.complete || imgElement.naturalWidth === 0) {
            updateStatus("图片加载中...", "⏳");
            await new Promise(r => imgElement.onload = r);
        }

        runOCR(imgElement);
    }

    async function runOCR(imgElement) {
        updateStatus("正在识别...", "👁️");
        const inputElement = document.getElementById('ps');
        const loginBtn = document.getElementById('login_btn');

        try {
            // 预处理
            const blob = await preprocessImage(imgElement);

            const worker = await Tesseract.createWorker('eng', 1, {
                // 因为网络好，直接用 CDN
                workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
                corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
                logger: m => {
                    if (m.status === 'recognizing text' && Math.round(m.progress * 100) % 20 === 0) {
                        updateStatus(`识别中... ${(m.progress * 100).toFixed(0)}%`, "👁️");
                    }
                }
            });

            const { data: { text } } = await worker.recognize(blob);
            await worker.terminate();

            const cleanCode = text.replace(/[^a-zA-Z0-9]/g, '');
            console.log("OCR结果:", cleanCode);

            // 逻辑分支：识别是否清晰
            if (cleanCode.length >= 4) {
                // 成功识别
                updateStatus(`识别为: ${cleanCode}，登录中...`, "🚀");
                inputElement.value = cleanCode;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                    loginBtn.click();
                }, 300);
            } else {
                // 识别不清 (<4位)
                if (isRetryOn) {
                    updateStatus("看不清，刷新验证码...", "😵");
                    // 点击图片刷新
                    imgElement.click();
                    // 清空输入框
                    inputElement.value = "";
                    // 稍等图片刷新出来，然后递归重试
                    setTimeout(() => runOCR(imgElement), 800);
                } else {
                    updateStatus("识别不清 (自动重试已关闭)", "⚠️");
                }
            }

        } catch (e) {
            console.error(e);
            if (isRetryOn) {
                updateStatus("引擎出错，重试中...", "🔄");
                setTimeout(() => location.reload(), 2000);
            } else {
                updateStatus("OCR 出错", "❌");
            }
        }
    }

    // 图像预处理 (保持不变，效果不错)
    function preprocessImage(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth || 132;
            canvas.height = img.naturalHeight || 60;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
                const val = gray > 140 ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = val;
            }
            ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);
            canvas.toBlob(resolve);
        });
    }

    // --- 🚀 启动 ---
    // 使用 Interval 确保能够覆盖各种加载情况
    let initCheckTimer = setInterval(() => {
        fixPageLayout(); // 持续修复排版
        // 只要 body 存在，且页面关键元素出现，就可以开始逻辑
        if (document.body && (document.getElementById('admin') || document.title)) {
            clearInterval(initCheckTimer);
            initLogic();
        }
    }, 100);

})();
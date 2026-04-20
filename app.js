'use strict';

const REPLICATE_API = 'https://api.replicate.com/v1';
const MODEL_OWNER = 'stability-ai';
const MODEL_NAME = 'stable-diffusion-img2img';

const GHIBLI_PROMPT =
    'studio ghibli style, ghibli anime, miyazaki, hand drawn animation, ' +
    'soft watercolor, beautiful natural scenery, warm lighting, highly detailed, ' +
    'dreamy atmosphere, whimsical, pastel colors';

const NEGATIVE_PROMPT =
    'realistic, photographic, 3d render, cgi, ugly, blurry, dark, horror, ' +
    'low quality, deformed, disfigured';

const MAX_IMAGE_SIZE = 768;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100;

/* ============================
   状態
   ============================ */
let currentResultUrl = null;
let currentFileName  = null;

/* ============================
   DOM 参照
   ============================ */
const $ = id => document.getElementById(id);

const apiKeyInput      = $('api-key');
const saveKeyBtn       = $('save-key');
const dropZone         = $('drop-zone');
const fileInput        = $('file-input');
const uploadBtn        = $('upload-btn');
const settingsSection  = $('settings-section');
const strengthSlider   = $('strength');
const strengthValue    = $('strength-value');
const imagesSection    = $('images-section');
const originalImg      = $('original-img');
const resultImg        = $('result-img');
const resultPlaceholder = $('result-placeholder');
const convertSection   = $('convert-section');
const convertBtn       = $('convert-btn');
const loadingEl        = $('loading');
const loadingText      = $('loading-text');
const downloadSection  = $('download-section');
const downloadBtn      = $('download-btn');
const resetBtn         = $('reset-btn');
const errorBox         = $('error-box');
const errorMessage     = $('error-message');
const retryBtn         = $('retry-btn');
const filenameLabel    = $('filename-label');

/* ============================
   初期化
   ============================ */
(function init() {
    const savedKey = localStorage.getItem('replicate_api_key');
    if (savedKey) apiKeyInput.value = savedKey;

    saveKeyBtn.addEventListener('click', saveApiKey);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    strengthSlider.addEventListener('input', updateStrengthDisplay);
    convertBtn.addEventListener('click', handleConvert);
    downloadBtn.addEventListener('click', handleDownload);
    resetBtn.addEventListener('click', handleReset);
    retryBtn.addEventListener('click', handleConvert);

    dropZone.addEventListener('dragover',  onDragOver);
    dropZone.addEventListener('dragleave', onDragLeave);
    dropZone.addEventListener('drop',      onDrop);
    dropZone.addEventListener('click',     e => {
        if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
            if (!e.target.closest('.btn')) fileInput.click();
        }
    });
})();

/* ============================
   APIキー管理
   ============================ */
function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        showError('APIキーを入力してください。');
        return;
    }
    localStorage.setItem('replicate_api_key', key);
    hideError();
    saveKeyBtn.textContent = '✓ 保存済';
    setTimeout(() => { saveKeyBtn.textContent = '保存'; }, 2000);
}

function getApiKey() {
    return (apiKeyInput.value.trim() || localStorage.getItem('replicate_api_key') || '').trim();
}

/* ============================
   スライダー
   ============================ */
function updateStrengthDisplay() {
    strengthValue.textContent = strengthSlider.value;
}

/* ============================
   ファイル選択
   ============================ */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) loadImageFile(file);
}

function onDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function onDragLeave() {
    dropZone.classList.remove('drag-over');
}

function onDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFile(file);
    } else {
        showError('画像ファイル（JPEG・PNG・WebP）をドロップしてください。');
    }
}

function loadImageFile(file) {
    hideError();
    currentResultUrl = null;
    currentFileName  = file.name;

    const reader = new FileReader();
    reader.onload = e => {
        originalImg.src = e.target.result;
        filenameLabel.textContent = file.name;
        filenameLabel.hidden = false;
        showElement(imagesSection);
        showElement(settingsSection);
        showElement(convertSection);
        hideElement(downloadSection);
        resultImg.hidden = true;
        showElement(resultPlaceholder);
    };
    reader.readAsDataURL(file);
}

/* ============================
   画像リサイズ（Canvas）
   ============================ */
function resizeImageToBase64(imgElement, maxSize) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        let { naturalWidth: w, naturalHeight: h } = imgElement;

        if (w > maxSize || h > maxSize) {
            if (w >= h) { h = Math.round(h * maxSize / w); w = maxSize; }
            else         { w = Math.round(w * maxSize / h); h = maxSize; }
        }

        // Stable Diffusion は 64 の倍数を推奨
        w = Math.round(w / 64) * 64 || 64;
        h = Math.round(h / 64) * 64 || 64;

        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(imgElement, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
    });
}

/* ============================
   変換実行
   ============================ */
async function handleConvert() {
    const apiKey = getApiKey();
    if (!apiKey) {
        showError('Replicate APIキーを入力して「保存」してください。');
        return;
    }
    if (!originalImg.src) {
        showError('変換する画像を選択してください。');
        return;
    }

    hideError();
    setLoading(true, '📐 画像を準備しています...');
    hideElement(downloadSection);
    resultImg.hidden = true;
    showElement(resultPlaceholder);
    currentResultUrl = null;

    try {
        setLoadingText('📐 画像を準備しています...');
        const base64Image = await resizeImageToBase64(originalImg, MAX_IMAGE_SIZE);
        const strength = parseInt(strengthSlider.value, 10) / 100;

        setLoadingText('📤 リクエストを送信しています...');
        const prediction = await createPrediction(apiKey, base64Image, strength);

        let resultUrl;
        if (prediction.status === 'succeeded') {
            setLoadingText('✅ 変換が完了しました！');
            const output = prediction.output;
            if (!output || (Array.isArray(output) && output.length === 0)) {
                throw new Error('変換結果が空でした。もう一度お試しください。');
            }
            resultUrl = Array.isArray(output) ? output[0] : output;
        } else {
            resultUrl = await pollPrediction(apiKey, prediction.urls?.get);
        }

        resultImg.src = resultUrl;
        resultImg.hidden = false;
        hideElement(resultPlaceholder);
        currentResultUrl = resultUrl;
        showElement(downloadSection);

    } catch (err) {
        showError(err.message || '変換中にエラーが発生しました。APIキーと画像を確認してください。');
    } finally {
        setLoading(false);
    }
}

/* ============================
   Replicate API
   ============================ */
async function createPrediction(apiKey, imageDataUrl, strength) {
    let response;
    try {
        response = await fetch(
            `${REPLICATE_API}/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        image: imageDataUrl,
                        prompt: GHIBLI_PROMPT,
                        negative_prompt: NEGATIVE_PROMPT,
                        prompt_strength: strength,
                        num_outputs: 1,
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                    },
                }),
            }
        );
    } catch {
        throw new Error('Replicate API に接続できませんでした。ネットワーク接続とAPIキーを確認してください。');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('APIキーが無効です。Replicate のダッシュボードで確認してください。');
        if (response.status === 422) throw new Error('入力パラメータが無効です: ' + (err.detail || ''));
        if (response.status === 429) throw new Error('APIリクエスト数の上限に達しました。しばらく待ってから再試行してください。');
        throw new Error(`API エラー (${response.status}): ${err.detail || response.statusText}`);
    }

    return response.json();
}

async function pollPrediction(apiKey, predictionUrl) {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        await sleep(POLL_INTERVAL_MS);

        const response = await fetch(predictionUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) {
            throw new Error(`ポーリングエラー (${response.status})`);
        }

        const prediction = await response.json();
        const elapsed = Math.round((i + 1) * POLL_INTERVAL_MS / 1000);

        switch (prediction.status) {
            case 'starting':
                setLoadingText(`⏳ 処理を開始しています...（${elapsed}秒）`);
                break;
            case 'processing': {
                const pct = Math.min(Math.round(elapsed / 35 * 100), 95);
                setLoadingText(`✨ ジブリの魔法をかけています... ${pct}%（${elapsed}秒）`);
                break;
            }
            case 'succeeded':
                const output = prediction.output;
                if (!output || (Array.isArray(output) && output.length === 0)) {
                    throw new Error('変換結果が空でした。もう一度お試しください。');
                }
                return Array.isArray(output) ? output[0] : output;
            case 'failed':
                throw new Error('変換に失敗しました: ' + (prediction.error || '不明なエラー'));
            case 'canceled':
                throw new Error('変換がキャンセルされました。');
        }
    }
    throw new Error(`タイムアウトしました（${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}秒）。もう一度お試しください。`);
}

/* ============================
   ダウンロード
   ============================ */
async function handleDownload() {
    if (!currentResultUrl) return;

    try {
        const response = await fetch(currentResultUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const prefix = currentFileName
            ? currentFileName.replace(/\.[^.]+$/, '')
            : 'ghibli';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}_ghibli_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    } catch {
        // フォールバック: 直接リンクを開く
        window.open(currentResultUrl, '_blank');
    }
}

/* ============================
   リセット
   ============================ */
function handleReset() {
    fileInput.value = '';
    originalImg.src = '';
    resultImg.src = '';
    resultImg.hidden = true;
    currentResultUrl = null;
    currentFileName  = null;
    filenameLabel.textContent = '';
    filenameLabel.hidden = true;
    hideElement(imagesSection);
    hideElement(settingsSection);
    hideElement(convertSection);
    hideElement(downloadSection);
    hideError();
    showElement(resultPlaceholder);
}

/* ============================
   UI ヘルパー
   ============================ */
function setLoading(visible, text = '') {
    loadingEl.hidden = !visible;
    convertBtn.disabled = visible;
    if (text) loadingText.textContent = text;
}

function setLoadingText(text) {
    loadingText.textContent = text;
}

function showElement(el) { el.hidden = false; }
function hideElement(el) { el.hidden = true; }

function showError(msg) {
    errorMessage.textContent = msg;
    showElement(errorBox);
    retryBtn.hidden = !originalImg.src;
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
    hideElement(errorBox);
    retryBtn.hidden = true;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

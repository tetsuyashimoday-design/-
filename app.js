'use strict';

// Cloudflare Worker をデプロイ後にこの URL を変更してください
const WORKER_URL = 'https://ghibli-converter.tetsuya-shimoda-y.workers.dev';

const STYLE_PRESETS = {
    general: {
        label: '一般ジブリ',
        emoji: '🌿',
        description: '幻想的なジブリの世界',
        prompt:
            'studio ghibli style, ghibli anime, miyazaki, hand drawn animation, ' +
            'soft watercolor, beautiful natural scenery, warm lighting, highly detailed, ' +
            'dreamy atmosphere, whimsical, pastel colors',
        negativePrompt:
            'realistic, photographic, 3d render, cgi, ugly, blurry, dark, horror, ' +
            'low quality, deformed, disfigured',
    },
    totoro: {
        label: 'となりのトトロ',
        emoji: '🌳',
        description: '懐かしい田舎の風景',
        prompt:
            'studio ghibli style, My Neighbor Totoro, lush green countryside, ' +
            'warm golden sunlight filtering through trees, rural Japan, ' +
            'soft watercolor, hand drawn animation, large camphor tree, ' +
            'childhood wonder, peaceful summer atmosphere, highly detailed, miyazaki style',
        negativePrompt:
            'realistic, photographic, 3d render, cgi, urban, dark, horror, ' +
            'low quality, deformed, disfigured, winter, snow',
    },
    spiritedAway: {
        label: '千と千尋の神隠し',
        emoji: '🏮',
        description: '神秘的な湯屋の世界',
        prompt:
            'studio ghibli style, Spirited Away, magical bathhouse, vibrant colors, ' +
            'glowing paper lanterns, spirits and magical creatures, ' +
            'rich saturated colors, hand drawn animation, miyazaki, ' +
            'detailed architecture, mystical atmosphere, highly detailed',
        negativePrompt:
            'realistic, photographic, 3d render, cgi, ugly, blurry, ' +
            'low quality, deformed, disfigured, washed out, desaturated',
    },
    mononoke: {
        label: 'もののけ姫',
        emoji: '🐺',
        description: '古の森と精霊の世界',
        prompt:
            'studio ghibli style, Princess Mononoke, ancient primeval forest, ' +
            'mystical kodama tree spirits, lush moss-covered trees, ' +
            'dramatic atmospheric lighting, deep shadows and dappled light, ' +
            'hand drawn animation, miyazaki, muted earthy tones with vivid accents, ' +
            'detailed foliage, epic and contemplative mood',
        negativePrompt:
            'realistic, photographic, 3d render, cgi, low quality, deformed, ' +
            'disfigured, bright cheerful colors, cute, kawaii, modern',
    },
    laputa: {
        label: '天空の城ラピュタ',
        emoji: '⚙️',
        description: '空中冒険とスチームパンク',
        prompt:
            'studio ghibli style, Castle in the Sky Laputa, ' +
            'steampunk mechanical structures, vast open sky, dramatic cloudscape, ' +
            'adventure atmosphere, flying machines, ancient floating ruins, ' +
            'hand drawn animation, miyazaki, warm adventure lighting, ' +
            'detailed mechanical gears and stone, sweeping aerial perspective, highly detailed',
        negativePrompt:
            'realistic, photographic, 3d render, cgi, ugly, blurry, ' +
            'low quality, deformed, dark horror, underground, claustrophobic',
    },
};

const DEFAULT_PRESET = 'general';

const MAX_IMAGE_SIZE  = 768;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100;

/* ============================
   状態
   ============================ */
let currentResultUrl = null;
let currentFileName  = null;
let currentPreset    = DEFAULT_PRESET;

/* ============================
   DOM 参照
   ============================ */
const $ = id => document.getElementById(id);

const dropZone          = $('drop-zone');
const fileInput         = $('file-input');
const uploadBtn         = $('upload-btn');
const settingsSection   = $('settings-section');
const strengthSlider    = $('strength');
const strengthValue     = $('strength-value');
const imagesSection     = $('images-section');
const originalImg       = $('original-img');
const resultImg         = $('result-img');
const resultPlaceholder = $('result-placeholder');
const convertSection    = $('convert-section');
const convertBtn        = $('convert-btn');
const loadingEl         = $('loading');
const loadingText       = $('loading-text');
const downloadSection   = $('download-section');
const downloadBtn       = $('download-btn');
const resetBtn          = $('reset-btn');
const errorBox          = $('error-box');
const errorMessage      = $('error-message');
const retryBtn          = $('retry-btn');
const filenameLabel     = $('filename-label');

/* ============================
   初期化
   ============================ */
(function init() {
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
    dropZone.addEventListener('click', e => {
        if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
            if (!e.target.closest('.btn')) fileInput.click();
        }
    });

    buildPresetSelector();
})();

/* ============================
   スタイルプリセット
   ============================ */
function buildPresetSelector() {
    const grid = $('preset-grid');
    Object.entries(STYLE_PRESETS).forEach(([key, preset]) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'preset-card' + (key === DEFAULT_PRESET ? ' preset-card--active' : '');
        card.dataset.preset = key;
        card.innerHTML =
            `<span class="preset-emoji">${preset.emoji}</span>` +
            `<span class="preset-label">${preset.label}</span>` +
            `<span class="preset-desc">${preset.description}</span>`;
        card.addEventListener('click', () => selectPreset(key));
        grid.appendChild(card);
    });
}

function selectPreset(key) {
    if (!STYLE_PRESETS[key]) return;
    currentPreset = key;
    document.querySelectorAll('.preset-card').forEach(card => {
        card.classList.toggle('preset-card--active', card.dataset.preset === key);
    });
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
        const base64Image = await resizeImageToBase64(originalImg, MAX_IMAGE_SIZE);
        const strength = parseInt(strengthSlider.value, 10) / 100;

        setLoadingText(`📤 「${STYLE_PRESETS[currentPreset].label}」スタイルで送信中...`);
        const prediction = await createPrediction(base64Image, strength);

        let resultUrl;
        if (prediction.status === 'succeeded') {
            setLoadingText('✅ 変換が完了しました！');
            const output = prediction.output;
            if (!output || (Array.isArray(output) && output.length === 0)) {
                throw new Error('変換結果が空でした。もう一度お試しください。');
            }
            resultUrl = Array.isArray(output) ? output[0] : output;
        } else {
            const predictionId = prediction.id || prediction.urls?.get?.split('/predictions/')[1];
            resultUrl = await pollPrediction(predictionId);
        }

        resultImg.src = resultUrl;
        resultImg.hidden = false;
        hideElement(resultPlaceholder);
        currentResultUrl = resultUrl;
        showElement(downloadSection);

    } catch (err) {
        showError(err.message || '変換中にエラーが発生しました。もう一度お試しください。');
    } finally {
        setLoading(false);
    }
}

/* ============================
   Worker API
   ============================ */
async function createPrediction(imageDataUrl, strength) {
    const preset = STYLE_PRESETS[currentPreset];
    let response;
    try {
        response = await fetch(`${WORKER_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: {
                    image: imageDataUrl,
                    prompt: preset.prompt,
                    negative_prompt: preset.negativePrompt,
                    prompt_strength: strength,
                    num_outputs: 1,
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                },
            }),
        });
    } catch (err) {
        throw new Error(
            'サーバーに接続できませんでした。しばらく待ってから再試行してください。' +
            (err && err.message ? `（${err.message}）` : '')
        );
    }

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        if (response.status === 422) throw new Error('入力パラメータが無効です: ' + (errBody.detail || ''));
        if (response.status === 429) throw new Error('リクエスト数の上限に達しました。しばらく待ってから再試行してください。');
        throw new Error(`サーバーエラー (${response.status}): ${errBody.detail || response.statusText}`);
    }

    return response.json();
}

async function pollPrediction(predictionId) {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        await sleep(POLL_INTERVAL_MS);

        const response = await fetch(`${WORKER_URL}/predictions/${predictionId}`);

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
            case 'succeeded': {
                const output = prediction.output;
                if (!output || (Array.isArray(output) && output.length === 0)) {
                    throw new Error('変換結果が空でした。もう一度お試しください。');
                }
                return Array.isArray(output) ? output[0] : output;
            }
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
    selectPreset(DEFAULT_PRESET);
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

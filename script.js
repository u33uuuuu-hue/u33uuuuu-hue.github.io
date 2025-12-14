// =======================================================
// 💾 Passive Resonance: Modest Echo
// =======================================================

// 1. 設定 & データ読み込み
const defaultTexts = ["こんにちは"];

// 毎回リセット
localStorage.removeItem('passive_resonance_archive');

let savedData = [];
try {
    savedData = JSON.parse(localStorage.getItem('passive_resonance_archive')) || [];
} catch (e) {
    console.error("Storage load error", e);
}

let pastStrings = [...defaultTexts, ...savedData];
pastStrings = [...new Set(pastStrings)];

// 2. Audio設定
const audioFiles = ['sound1.mp3', 'sound2.mp3', 'sound3.mp3'];
const audioPool = audioFiles.map(file => new Howl({
    src: [file],
    volume: 0.3,
    preload: true
}));

// 3. 要素取得
const input = document.getElementById('textInput');
const resetButton = document.getElementById('resetButton');
const volumeButton = document.getElementById('volumeButton');
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const texts = [];
const pulses = [];
const echoQueue = [];
let typing = false;
let isMuted = true;

if (volumeButton) volumeButton.classList.add('muted');

// 4. イベントリスナー

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.mouseX = 0; window.mouseY = 0;
document.addEventListener('mousemove', e => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
});

// 入力検知
input.addEventListener('keydown', e => {
    typing = true; // 波紋ON

    if (e.key === 'Enter') {
        const val = input.value.trim();
        if (val !== '') {
            // 1. 本体を表示
            createText(val, false);

            // 2. 保存
            pastStrings.push(val);
            saveToLocalStorage(val);

            // 3. こだま予約
            triggerEcho(val);

            input.value = '';
            nextPrompt();
        }
    }
});

input.addEventListener('keyup', () => {
    typing = false;
});

// Deleteボタン
if (resetButton) {
    resetButton.addEventListener('click', () => {
        localStorage.removeItem('passive_resonance_archive');
        pastStrings = [...defaultTexts];
        texts.length = 0;
        echoQueue.length = 0;
        document.querySelectorAll('.floating-text').forEach(el => el.remove());
        console.log("Memory Cleared.");
    });
}

// Volumeボタン
if (volumeButton) {
    volumeButton.addEventListener('click', () => {
        if (Howler.ctx && Howler.ctx.state !== 'running') Howler.ctx.resume();

        isMuted = !isMuted;
        if (isMuted) {
            Howler.mute(true);
            volumeButton.classList.add('muted');
        } else {
            Howler.mute(false);
            volumeButton.classList.remove('muted');
            playRandomSound();
        }
    });
}

// 5. 内部ロジック

function saveToLocalStorage(newText) {
    let currentData = JSON.parse(localStorage.getItem('passive_resonance_archive')) || [];
    currentData.push(newText);
    if (currentData.length > 200) currentData.shift();
    localStorage.setItem('passive_resonance_archive', JSON.stringify(currentData));
}

const prompts = ["こんにちは", "今の気分は？", "今日朝何食べた？", "好きな食べ物は？", "最近どう？", "疲れてない？", "週末の予定は？", "好きな言葉は？"];
let pIndex = 0;
function nextPrompt() {
    input.placeholder = prompts[pIndex % prompts.length];
    pIndex++;
}
nextPrompt();

function playRandomSound() {
    if (!isMuted && audioPool.length > 0) {
        const snd = audioPool[Math.floor(Math.random() * audioPool.length)];
        snd.play();
    }
}

// タイピング中の波紋生成
function createPulse() {
    pulses.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0,
        maxR: Math.random() * 20 + 10,
        alpha: 1
    });
}

// 🌟 こだま（Echo）の予約
function triggerEcho(str) {
    // 発生時の波紋（少し控えめに）
    for (let i = 0; i < 2; i++) {
        pulses.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 0,
            maxR: Math.random() * 25 + 15,
            alpha: 1
        });
    }

    // 🌟 キューに言葉を詰める数を減らす（ささやかに）
    // 3個 〜 5個 くらい
    const echoCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < echoCount; i++) {
        echoQueue.push(str);
    }
}

function spawnEchoText() {
    if (echoQueue.length > 0) {
        const str = echoQueue.shift();
        createText(str, true);
    }
}

function createText(str, isEcho = false) {
    // エコーの場合は音を鳴らす確率を下げる（うるさくならないように）
    if (!isEcho || Math.random() < 0.5) {
        playRandomSound();
    }

    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = str;

    // 🌟 エコーは少し薄くして「影」っぽくする
    if (isEcho) {
        el.style.opacity = 0.7;
        el.style.fontSize = "16px"; // 少し小さく
    }

    document.body.appendChild(el);

    if (!isEcho) createPulse(); // 本体が出た時だけ波紋を出す

    texts.push({
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        // 🌟 動きをゆっくりにする (0.5倍速くらい)
        vx: (Math.random() - 0.5) * (isEcho ? 0.6 : 1.5),
        vy: (Math.random() - 0.5) * (isEcho ? 0.6 : 1.5),
        angle: Math.random() * Math.PI * 2,
        waveOffset: Math.random() * 10,
        chars: str.split('').map(c => ({
            c, offsetX: 0, offsetY: 0,
            angle: Math.random() * Math.PI * 2
        })),
        isPast: isEcho
    });
}

// 最初の挨拶
setTimeout(() => { createText("こんにちは", false); }, 1000);


// 6. アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // タイピング中なら波紋だけ出す
    if (typing) {
        for (let i = 0; i < 2; i++) createPulse();
    }

    // 🌟 こだま処理（さらにゆっくり排出）
    if (echoQueue.length > 0) {
        // 0.015 = 1.5%の確率（かなりゆっくりポツポツ出る）
        if (Math.random() < 0.015) {
            spawnEchoText();
        }
    }

    // 波紋描画
    for (let i = pulses.length - 1; i >= 0; i--) {
        let p = pulses[i];
        p.r += 0.6;
        p.alpha -= 0.03;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${p.alpha})`;
        ctx.fill();
        if (p.alpha <= 0) pulses.splice(i, 1);
    }

    // テキスト更新
    for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];

        // 画面外に出ないようにゆっくり消す
        if (texts.length > 50 && t.isPast) {
            t.vx += (Math.random() > 0.5 ? 1 : -1) * 0.1;
            t.vy += (Math.random() > 0.5 ? 1 : -1) * 0.1;
        }

        t.x += t.vx + Math.sin(t.angle + t.waveOffset) * 0.5;
        t.y += t.vy + Math.cos(t.angle + t.waveOffset) * 0.5;
        t.vx *= 0.98; t.vy *= 0.98;

        const dx = window.mouseX - (t.x + t.el.offsetWidth / 2);
        const dy = window.mouseY - (t.y + t.el.offsetHeight / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
            const angle = Math.atan2(dy, dx);
            t.vx -= Math.cos(angle) * 0.5;
            t.vy -= Math.sin(angle) * 0.5;
        }

        t.el.innerHTML = '';
        t.chars.forEach(ch => {
            ch.offsetX += Math.sin(ch.angle) * 0.3;
            ch.offsetY += Math.cos(ch.angle) * 0.3;
            ch.angle += 0.05;
            const span = document.createElement('span');
            span.textContent = ch.c;
            span.style.position = 'relative';
            span.style.left = ch.offsetX + 'px';
            span.style.top = ch.offsetY + 'px';
            t.el.appendChild(span);
        });

        t.el.style.left = t.x + 'px';
        t.el.style.top = t.y + 'px';
        t.angle += 0.01;

        if (t.x + t.el.offsetWidth < 0 || t.x > window.innerWidth ||
            t.y + t.el.offsetHeight < 0 || t.y > window.innerHeight) {
            t.el.remove();
            texts.splice(i, 1);
        }
    }
}

animate();
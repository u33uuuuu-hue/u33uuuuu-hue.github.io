

const imageData = [
    { src: "img/1.png", pos: "center" },
    { src: "img/2.png", pos: "top" },    // この画像は上を基準にトリミング
    { src: "img/3.png", pos: "top" }, // この画像は下を基準にトリミング
    { src: "img/4.png", pos: "center" },
    { src: "img/5.png", pos: "center" },
    { src: "img/6.png", pos: "top" },
    { src: "img/7.png", pos: "center" }
];

const mainImage = document.getElementById('mainImage');
const prevBtn = document.querySelector('.before_btn button'); // クラス名に合わせて修正
const nextBtn = document.querySelector('.next_btn button');
const indicatorContainer = document.querySelector('.indicator');

let currentIndex = 0; // 現在の画像番号

// 3. 初期化関数
function initCarousel() {
    if (imageData.length === 0) return;

    // インジケーター（四角）を作る
    createIndicators();

    // 最初の画像を表示する
    updateCarousel();
}

// 4. 画像とインジケーターを更新する関数
function updateCarousel() {
    // --- 画像の更新 ---
    const data = imageData[currentIndex];
    mainImage.src = data.src;
    mainImage.style.objectPosition = data.pos; // トリミング位置の反映

    // --- インジケーターの更新 ---
    // すべての .rect から active を外し、現在のものだけに active をつける
    const rects = document.querySelectorAll('.rect');
    rects.forEach((rect, index) => {
        if (index === currentIndex) {
            rect.classList.add('active');
        } else {
            rect.classList.remove('active');
        }
    });
}

// 5. インジケーター生成関数
function createIndicators() {
    indicatorContainer.innerHTML = ''; // リセット

    imageData.forEach((_, index) => {
        const div = document.createElement('div');
        div.classList.add('rect'); // CSSで定義した .rect クラスをつける

        // クリックしたらその画像へ飛ぶ機能
        div.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });

        indicatorContainer.appendChild(div);
    });
}

// 6. ボタン操作のイベント
if (nextBtn && prevBtn) {
    // 次へボタン
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % imageData.length; // 最後の次は最初に戻る
        updateCarousel();
    });

    // 前へボタン
    prevBtn.addEventListener('click', () => {
        // 0より小さくなったら最後尾へ
        currentIndex = (currentIndex - 1 + imageData.length) % imageData.length;
        updateCarousel();
    });
}

// --- 実行 ---
initCarousel();


const volumeButton = document.getElementById('volumeButton');

let isMuted = true;

if (volumeButton) volumeButton.classList.add('muted');
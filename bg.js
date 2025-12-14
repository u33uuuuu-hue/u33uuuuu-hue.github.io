// 「img-box」というクラスがついているやつだけを集める
const targets = document.querySelectorAll('.simg');

targets.forEach(target => {
    target.addEventListener('click', function () {

        // 1. 自分に is-active がついてたら外して終了（閉じる動作）
        if (this.classList.contains('is-active')) {
            this.classList.remove('is-active');
            return;
        }

        // 2. 同じ親の中にいる「兄弟の img-box」の is-active を外す
        // （テキストのdivなどは img-box クラスがないので無視される）
        const siblings = this.parentElement.querySelectorAll('.simg');
        siblings.forEach(sibling => {
            sibling.classList.remove('is-active');
        });

        // 3. 自分に is-active をつける
        this.classList.add('is-active');
    });
});


//index
document.addEventListener('DOMContentLoaded', function () {
    const targets = [
        "background", "research", "proto", "feed",
        "system", "sketch", "exhibition", "review", "comment"
    ];

    const navLinks = document.querySelectorAll('.index01 ul li a');
    const navItems = document.querySelectorAll('.index01 ul li');
    const navList = document.querySelector('.index01 ul');

    navLinks.forEach(link => {
        link.setAttribute('data-text', link.textContent);
    });

    // bg.js の activateNav 関数の中身をこれに書き換え

    function activateNav(targetId) {
        navItems.forEach(item => item.classList.remove('here'));

        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetId}`) {
                const activeItem = link.parentElement;
                activeItem.classList.add('here');

                // ★修正ポイント：
                // 「左からの距離」＋「自分の幅」＝「右端（お尻）の位置」
                // これを計算してスライドさせることで、お尻の位置がピタッと揃います
                const slideAmount = activeItem.offsetLeft + activeItem.offsetWidth;

                navList.style.transform = `translateX(-${slideAmount}px)`;
            }
        });
    }


    const options = {
        root: null,
        // 上に戻った時の反応を良くする設定
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // スクロール最上部の誤動作防止
                if (window.scrollY < 100) return;
                activateNav(entry.target.id);
            }
        });
    }, options);

    targets.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element);
        }
    });

    // 強制的にbackgroundにする処理
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            activateNav('background');
        }
    });
});



const volumeButton = document.getElementById('volumeButton');

let isMuted = true;

if (volumeButton) volumeButton.classList.add('muted');

const imageData = [
    { src: "img/ex/ex01.png", pos: "center" },
    { src: "img/2.png", pos: "center" },
    { src: "img/3.png", pos: "center" }
];

// 2. 要素の取得
const mainImage = document.getElementById('mainImage');
const prevBtnWrap = document.querySelector('.before_btn button');
const nextBtnWrap = document.querySelector('.next_btn button');
const indicatorContainer = document.querySelector('.indicator');

let currentIndex = 0;

// 3. 初期化関数
function initCarousel() {
    // カルーセル要素がないページでのエラーを防ぐ
    if (!mainImage || imageData.length === 0) return;

    createIndicators();
    updateCarousel();
}

// 4. 更新関数
function updateCarousel() {
    const data = imageData[currentIndex];
    mainImage.src = data.src;
    mainImage.style.objectPosition = data.pos;

    // インジケーターの更新
    const rects = document.querySelectorAll('.rect');
    rects.forEach((rect, index) => {
        if (index === currentIndex) {
            rect.classList.add('active');
        } else {
            rect.classList.remove('active');
        }
    });
}

// 5. インジケーター生成
function createIndicators() {
    if (!indicatorContainer) return;
    indicatorContainer.innerHTML = '';

    imageData.forEach((_, index) => {
        const div = document.createElement('div');
        div.classList.add('rect');

        div.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });

        indicatorContainer.appendChild(div);
    });
}

// 6. イベント設定
if (nextBtnWrap && prevBtnWrap) {
    nextBtnWrap.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % imageData.length;
        updateCarousel();
    });

    prevBtnWrap.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + imageData.length) % imageData.length;
        updateCarousel();
    });
}

// 実行
// DOM読み込み後に実行するようにラップしておくと安全です
document.addEventListener('DOMContentLoaded', initCarousel);
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nickname-form');
    const resultContainer = document.getElementById('result-container');
    const nicknameDisplay = document.getElementById('generated-nickname');
    const retryBtn = document.getElementById('retry-btn');
    const copyBtn = document.getElementById('copy-btn');

    const birthYear = document.getElementById('birth-year');
    const birthMonth = document.getElementById('birth-month');
    const birthDay = document.getElementById('birth-day');
    const phoneLast = document.getElementById('phone-last');

    // ?먮룞 ?ъ빱???대룞 濡쒖쭅
    const setupAutoForward = (current, next, length) => {
        current.addEventListener('input', () => {
            if (current.value.length >= length && next) {
                next.focus();
            }
        });
    };

    setupAutoForward(birthYear, birthMonth, 4);
    setupAutoForward(birthMonth, birthDay, 2);
    setupAutoForward(birthDay, phoneLast, 2);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const year = birthYear.value;
        const month = birthMonth.value;
        const day = birthDay.value;
        const phone = phoneLast.value;
        const length = document.querySelector('input[name="nickname-length"]:checked').value;

        if (!year || !month || !day || !phone) return;

        // 濡쒕뵫 ?쒖옉
        showLoading(() => {
            const nickname = generateNickname(year, month, day, phone, length);
            showResult(nickname);
        });
    });

    retryBtn.addEventListener('click', () => {
        resultContainer.classList.add('hidden');

        const year = birthYear.value;
        const month = birthMonth.value;
        const day = birthDay.value;
        const phone = phoneLast.value;
        const length = document.querySelector('input[name="result-nickname-length"]:checked').value;

        if (!year || !month || !day || !phone) return;

        // 諛붾줈 ?ㅼ떆 ?앹꽦
        showLoading(() => {
            const nickname = generateNickname(year, month, day, phone, length);
            showResult(nickname);
        });
    });

    copyBtn.addEventListener('click', () => {
        const text = nicknameDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '蹂듭궗 ?꾨즺!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    function generateNickname(yearStr, monthStr, dayStr, phoneStr, length = 'medium') {
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);
        const phoneNum = parseInt(phoneStr);

        // ?쒕뜡 ?ㅽ봽??異붽? (留ㅻ쾲 ?ㅻⅨ 寃곌낵 ?앹꽦)
        const randomOffset = Math.floor(Math.random() * 1000);

        // 濡쒖쭅 湲곕컲 ?몃뜳??怨꾩궛 (怨좎쑀???뺣낫 + ?쒕뜡??
        const adjIndex = (year + month + randomOffset) % nicknameData.adjectives.length;
        const nounIndex = (day * phoneNum + randomOffset) % nicknameData.nouns.length;

        const phoneSum = phoneStr.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
        const titleIndex = (year + month + day + phoneSum + randomOffset) % nicknameData.titles.length;

        // 異붽? ?⑥뼱瑜??꾪븳 ?몃뜳??
        const extraAdjIndex = (year * day + randomOffset) % nicknameData.adjectives.length;

        const adjective = nicknameData.adjectives[adjIndex];
        const noun = nicknameData.nouns[nounIndex];
        const title = nicknameData.titles[titleIndex];
        const extraAdj = nicknameData.adjectives[extraAdjIndex];

        // 湲몄씠???곕씪 ?ㅻⅨ ?뺤떇 諛섑솚
        switch (length) {
            case 'short':
                return `${adjective} ${noun}`;
            case 'long':
                return `${extraAdj} ${adjective} ${noun} ${title}`;
            case 'medium':
            default:
                return `${adjective} ${noun} ${title}`;
        }
    }

    function showLoading(callback) {
        const loadingContainer = document.getElementById('loading-container');
        const progressBar = document.getElementById('progress-bar');
        const loadingText = document.getElementById('loading-text');
        const messages = [
            "?곗씠?곕? 遺꾩꽍 以묒엯?덈떎...",
            "?뱀떊???대챸???쎄퀬 ?덉뒿?덈떎...",
            "?꾩꽕??怨좎꽌瑜??ㅼ???以?..",
            "媛???댁슱由щ뒗 ?대쫫??李얜뒗 以?..",
            "嫄곗쓽 ???섏뿀?듬땲??"
        ];

        form.closest('.card').classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        progressBar.style.width = '0%';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 100) progress = 100;

            progressBar.style.width = `${progress}%`;
            loadingText.textContent = messages[Math.floor((progress / 101) * messages.length)];

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingContainer.classList.add('hidden');
                    callback();
                }, 600);
            }
        }, 200);
    }

    function typeWriter(text, element, speed = 100) {
        element.textContent = '';
        element.classList.remove('typing-done');
        let i = 0;

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.add('typing-done');
            }
        }
        type();
    }

    function hideResult() {
        resultContainer.classList.add('hidden');
    }

    // ?덉뒪?좊━ 愿由??⑥닔
    const HISTORY_KEY = 'nickname-history';
    const MAX_HISTORY = 10;

    function saveToHistory(nickname) {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

        // ?덈줈????ぉ 異붽? (?쒓컙 ?ы븿)
        history.unshift({
            nickname: nickname,
            timestamp: new Date().toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        });

        // 理쒕? 媛쒖닔 ?쒗븳
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        displayHistory();
    }

    function displayHistory() {
        const historyContainer = document.getElementById('history-container');
        const historyList = document.getElementById('history-list');
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

        if (history.length === 0) {
            historyContainer.classList.add('hidden');
            return;
        }

        historyContainer.classList.remove('hidden');
        historyList.innerHTML = '';

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-item-text">${item.nickname}</span>
                <span class="history-item-time">${item.timestamp}</span>
            `;

            historyItem.addEventListener('click', () => {
                navigator.clipboard.writeText(item.nickname).then(() => {
                    const originalText = historyItem.querySelector('.history-item-text').textContent;
                    historyItem.querySelector('.history-item-text').textContent = '??蹂듭궗??';
                    setTimeout(() => {
                        historyItem.querySelector('.history-item-text').textContent = originalText;
                    }, 1500);
                });
            });

            historyList.appendChild(historyItem);
        });
    }

    function clearHistory() {
        if (confirm('紐⑤뱺 蹂꾨챸 湲곕줉????젣?섏떆寃좎뒿?덇퉴?')) {
            localStorage.removeItem(HISTORY_KEY);
            displayHistory();
        }
    }

    // ?덉뒪?좊━ 珥덇린??諛??대깽??由ъ뒪??
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    displayHistory();

    function showResult(nickname) {
        resultContainer.classList.remove('hidden');
        typeWriter(nickname, nicknameDisplay);
        saveToHistory(nickname);  // ?덉뒪?좊━?????

        // ?낅젰?쇱쓽 湲몄씠 ?좏깮怨??숆린??
        const selectedLength = document.querySelector('input[name="nickname-length"]:checked').value;
        const resultLengthRadio = document.querySelector(`input[name="result-nickname-length"][value="${selectedLength}"]`);
        if (resultLengthRadio) {
            resultLengthRadio.checked = true;
        }
    }

    // ?쎌? ?낆옄 ?앹꽦湲?
    function initPixelBackground() {
        const bg = document.getElementById('pixel-bg');
        const count = 30;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'pixel-particle';

            const size = Math.random() * 8 + 4;
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 20;
            const drift = (Math.random() - 0.5) * 200;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--drift', drift);
            particle.style.animationDelay = `-${delay}s`;

            // ?됱긽 臾댁옉??(?묓겕/?붿씠??怨꾩뿴 - 苑껋옂 ?먮굦)
            const isPink = Math.random() > 0.4;
            particle.style.background = isPink ? 'rgba(255, 182, 193, 0.7)' : 'rgba(255, 255, 255, 0.5)';

            bg.appendChild(particle);
        }
    }

    // ???앹꽦湲?
    function initBirds() {
        const bg = document.getElementById('pixel-bg');

        function spawnBird() {
            const bird = document.createElement('div');
            bird.className = 'bird';

            const duration = Math.random() * 10 + 15;
            const startY = Math.random() * 60 + 10; // 10% ~ 70% ?믪씠
            const endY = startY + (Math.random() - 0.5) * 20;

            bird.style.setProperty('--duration', `${duration}s`);
            bird.style.setProperty('--start-y', `${startY}vh`);
            bird.style.setProperty('--end-y', `${endY}vh`);

            bg.appendChild(bird);

            // ?좊땲硫붿씠??醫낅즺 ???쒓굅
            setTimeout(() => {
                bird.remove();
            }, duration * 1000);
        }

        // 珥덇린 ?앹꽦 諛?二쇨린???앹꽦
        setTimeout(spawnBird, 1000);
        setInterval(spawnBird, 8000);
    }

    initPixelBackground();
    initBirds();
});

// 방문자 (CountAPI) - "방문" 횟수
async function updateVisitorCount() {
    const todayElement = document.getElementById('today-visitors');
    const totalElement = document.getElementById('total-visitors');

    const host = window.location.hostname || 'local';
    const pathKey = window.location.pathname.replace(/[^a-zA-Z0-9_]/g, '_') || 'index';
    const namespace = `${host}_nickname`;
    const totalKey = `total_${pathKey}`;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayKey = `today_${pathKey}_${yyyy}${mm}${dd}`;

    try {
        const totalRes = await fetch(`https://api.countapi.xyz/hit/${namespace}/${totalKey}`);
        const totalData = await totalRes.json();
        if (totalElement) totalElement.textContent = totalData.value;
    } catch (e) {
        // fail silently
    }

    try {
        const todayRes = await fetch(`https://api.countapi.xyz/hit/${namespace}/${todayKey}`);
        const todayData = await todayRes.json();
        if (todayElement) todayElement.textContent = todayData.value;
    } catch (e) {
        // fail silently
    }
}

// 페이지 로드 시 방문자 수 업데이트
updateVisitorCount();



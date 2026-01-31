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

    // 자동 포커스 이동 로직
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

        // 로딩 시작
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

        // 바로 다시 생성
        showLoading(() => {
            const nickname = generateNickname(year, month, day, phone, length);
            showResult(nickname);
        });
    });

    copyBtn.addEventListener('click', () => {
        const text = nicknameDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '복사 완료!';
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

        // 랜덤 오프셋 추가 (매번 다른 결과 생성)
        const randomOffset = Math.floor(Math.random() * 1000);

        // 로직 기반 인덱스 계산 (고유성 확보 + 랜덤성)
        const adjIndex = (year + month + randomOffset) % nicknameData.adjectives.length;
        const nounIndex = (day * phoneNum + randomOffset) % nicknameData.nouns.length;

        const phoneSum = phoneStr.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
        const titleIndex = (year + month + day + phoneSum + randomOffset) % nicknameData.titles.length;

        // 추가 단어를 위한 인덱스
        const extraAdjIndex = (year * day + randomOffset) % nicknameData.adjectives.length;

        const adjective = nicknameData.adjectives[adjIndex];
        const noun = nicknameData.nouns[nounIndex];
        const title = nicknameData.titles[titleIndex];
        const extraAdj = nicknameData.adjectives[extraAdjIndex];

        // 길이에 따라 다른 형식 반환
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
            "데이터를 분석 중입니다...",
            "당신의 운명을 읽고 있습니다...",
            "전설의 고서를 뒤지는 중...",
            "가장 어울리는 이름을 찾는 중...",
            "거의 다 되었습니다!"
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

    // 히스토리 관리 함수
    const HISTORY_KEY = 'nickname-history';
    const MAX_HISTORY = 10;

    function saveToHistory(nickname) {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

        // 새로운 항목 추가 (시간 포함)
        history.unshift({
            nickname: nickname,
            timestamp: new Date().toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        });

        // 최대 개수 제한
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
                    historyItem.querySelector('.history-item-text').textContent = '✓ 복사됨!';
                    setTimeout(() => {
                        historyItem.querySelector('.history-item-text').textContent = originalText;
                    }, 1500);
                });
            });

            historyList.appendChild(historyItem);
        });
    }

    function clearHistory() {
        if (confirm('모든 별명 기록을 삭제하시겠습니까?')) {
            localStorage.removeItem(HISTORY_KEY);
            displayHistory();
        }
    }

    // 히스토리 초기화 및 이벤트 리스너
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    displayHistory();

    function showResult(nickname) {
        resultContainer.classList.remove('hidden');
        typeWriter(nickname, nicknameDisplay);
        saveToHistory(nickname);  // 히스토리에 저장

        // 입력폼의 길이 선택과 동기화
        const selectedLength = document.querySelector('input[name="nickname-length"]:checked').value;
        const resultLengthRadio = document.querySelector(`input[name="result-nickname-length"][value="${selectedLength}"]`);
        if (resultLengthRadio) {
            resultLengthRadio.checked = true;
        }
    }

    // 픽셀 입자 생성기
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

            // 색상 무작위 (핑크/화이트 계열 - 꽃잎 느낌)
            const isPink = Math.random() > 0.4;
            particle.style.background = isPink ? 'rgba(255, 182, 193, 0.7)' : 'rgba(255, 255, 255, 0.5)';

            bg.appendChild(particle);
        }
    }

    // 새 생성기
    function initBirds() {
        const bg = document.getElementById('pixel-bg');

        function spawnBird() {
            const bird = document.createElement('div');
            bird.className = 'bird';

            const duration = Math.random() * 10 + 15;
            const startY = Math.random() * 60 + 10; // 10% ~ 70% 높이
            const endY = startY + (Math.random() - 0.5) * 20;

            bird.style.setProperty('--duration', `${duration}s`);
            bird.style.setProperty('--start-y', `${startY}vh`);
            bird.style.setProperty('--end-y', `${endY}vh`);

            bg.appendChild(bird);

            // 애니메이션 종료 후 제거
            setTimeout(() => {
                bird.remove();
            }, duration * 1000);
        }

        // 초기 생성 및 주기적 생성
        setTimeout(spawnBird, 1000);
        setInterval(spawnBird, 8000);
    }

    initPixelBackground();
    initBirds();
});

// 방문자 수 추적 (고유 방문자 기반)
function updateVisitorCount() {
    const today = new Date().toDateString();

    // 고유 방문자 ID 가져오기 또는 생성
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        // 고유 ID 생성 (타임스탬프 + 랜덤 문자열)
        visitorId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }

    // 방문자 데이터 가져오기
    const visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');

    // 초기화
    if (!visitorData.date || visitorData.date !== today) {
        // 날짜가 바뀌면 오늘 방문자 목록 초기화
        visitorData.date = today;
        visitorData.todayVisitors = [];
    }

    if (!visitorData.allVisitors) {
        visitorData.allVisitors = [];
    }

    // 오늘 방문자 추가 (중복 방지)
    if (!visitorData.todayVisitors.includes(visitorId)) {
        visitorData.todayVisitors.push(visitorId);
    }

    // 전체 방문자 추가 (중복 방지)
    if (!visitorData.allVisitors.includes(visitorId)) {
        visitorData.allVisitors.push(visitorId);
    }

    // 저장
    localStorage.setItem('visitorData', JSON.stringify(visitorData));

    // 화면에 표시
    const todayElement = document.getElementById('today-visitors');
    const totalElement = document.getElementById('total-visitors');

    if (todayElement) todayElement.textContent = visitorData.todayVisitors.length;
    if (totalElement) totalElement.textContent = visitorData.allVisitors.length;

    // 디버그 정보 (개발자 콘솔에 표시)
    console.log('=== 방문자 통계 ===');
    console.log('고유 방문자 ID:', visitorId);
    console.log('오늘 방문자 수:', visitorData.todayVisitors.length);
    console.log('총 방문자 수:', visitorData.allVisitors.length);
    console.log('오늘 방문한 고유 ID 목록:', visitorData.todayVisitors);
}

// 페이지 로드 시 방문자 수 업데이트
updateVisitorCount();

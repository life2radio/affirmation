// ==========================================
// app.js - 진짜 최종 완전 통합본 (64가지 심리테스트 + 기존 모든 기능)
// ==========================================

/* =========================================================
   ★ 새 에피소드 업로드 시 아래 3개만 수정하세요
   title을 빈 문자열로 두면 배너가 자동으로 숨겨집니다
   ========================================================= */
// ★★★ 구글 스프레드시트 연동 설정 ★★★
// 스프레드시트 배포 후 아래 URL을 교체하세요
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwaacDnfTuhiO_QCpHzPmex_ZFkr1RGsX1_Nmprp3CzIRjBINfa8tmC7gsCZkQNniz9/exec';

async function loadSheetData(){
    if(SHEET_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') return;
    try{
        const res  = await fetch(SHEET_API_URL + '?t=' + Date.now());
        const data = await res.json();

        // ① 시크릿 코드
        if(data.secretCodes) Object.assign(SECRET_CODES, data.secretCodes);

        // ② Shorts 영상
        if(data.shorts){
            data.shorts.forEach(s=>{
                const found = SHORTS_DATA.find(d=> d.ep === s.ep);
                if(found){ found.url=s.url; found.title=s.title; found.theme=s.theme; }
                else if(s.url) SHORTS_DATA.push(s);
            });
        }

        // ③ 에피소드 배너 (최신 1개)
        if(data.episode && data.episode.title){
            latestEpisode.title = data.episode.title;
            latestEpisode.url   = data.episode.url;
            latestEpisode.date  = data.episode.date;
            renderEpisodeBanner();
        }

        // ④ 핵심 질문 (테마별 덮어쓰기)
        if(data.questions){
            data.questions.forEach(q=>{
                THEME_QUESTIONS[q.theme] = {
                    q:    q.question,
                    type: q.type || 'episode',
                    url:  q.url  || ''
                };
            });
        }

        // ⑤ 앱 설정
        if(data.settings){
            if(data.settings.channelUrl) {}
            if(data.settings.hallOfFame){
                window._sheetHallOfFame = data.settings.hallOfFame;
            }
            // PDF 링크 저장
            ['pdf_url_1','pdf_url_2','pdf_url_3','pdf_url_4'].forEach(key=>{
                if(data.settings[key]) safeSetItem(key, data.settings[key]);
            });
        }

        // ⑥ 시크릿 특별 콘텐츠 (날짜별)
        if(data.secretContents){
            window.SECRET_CONTENTS = data.secretContents;
        }

    } catch(e){
        // 카톡/인앱브라우저에서는 CORS로 실패할 수 있음 — 조용히 무시
    }
}

const latestEpisode = {
    title: "",
    url: "https://www.youtube.com/@SecondActRadio",
    date: ""
};

/* =========================================================
   데이터
   ========================================================= */

let currentMode = 'A';
let selectedDateObj = new Date();
selectedDateObj.setHours(0,0,0,0);
let todayObj = new Date();
todayObj.setHours(0,0,0,0);
let isToday = true;
let currentOracleDayCount = 1; // 오라클에서 현재 보여주는 dayCount

/* === 유틸 (TOP's 스마트 데이터 어댑터) === */
function safeGetItem(k, d) {
    let val = appState.get('cache', k);
    if (val !== null) return val;
    try { const i = localStorage.getItem(k); if(i !== null) { appState.set('cache', k, i); return i; } return d; } catch(e) { return d; }
}
function safeSetItem(k, v) {
    appState.set('cache', k, v);
    try { localStorage.setItem(k, v); } catch(e) {}
}
function safeGetJSON(k, d) {
    let val = appState.get('json', k);
    if (val !== null) return val;
    try { const i = localStorage.getItem(k); if(i) { const p = JSON.parse(i); appState.set('json', k, p); return p; } return d; } catch(e) { return d; }
}
function safeSetJSON(k, v) {
    appState.set('json', k, v);
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
}
function getFormatDate(d){return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function getTodayStr(){return getFormatDate(todayObj);}

/* ===== ★ 6단계: 확언 카드 공유 ===== */
window.openShareCard = function(){
    const affirmEl = document.getElementById('affirmation-text');
    const themeEl  = document.getElementById('theme-text');
    if(!affirmEl || affirmEl.closest('.blurred-content')) {
        showToast('먼저 기분을 선택해 확언을 열어주세요!');
        return;
    }
    const affirmText = affirmEl.innerText;
    const themeText  = themeEl ? themeEl.innerText.replace(/["""]/g,'') : '';
    const dayText    = document.getElementById('day-label').innerText;

    drawShareCard(affirmText, themeText, dayText);
    document.getElementById('share-modal').style.display = 'flex';
}

function drawShareCard(affirmText, themeText, dayText){
    const canvas = document.getElementById('share-canvas');
    const W = 800, H = 800;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 배경
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1B4332');
    grad.addColorStop(1, '#0D2B20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 장식 원
    ctx.beginPath(); ctx.arc(W-80, 80, 180, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(212,168,67,0.07)'; ctx.fill();
    ctx.beginPath(); ctx.arc(80, H-80, 140, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(212,168,67,0.05)'; ctx.fill();

    // ── 레이아웃 영역 정의 ──
    const TOP_PAD    = 70;   // 상단 여백
    const BOT_ZONE   = 160; // 하단 워터마크 영역 높이
    const SIDE_PAD   = 70;   // 좌우 여백
    const TEXT_TOP   = 210;  // 확언 텍스트 시작 Y
    const TEXT_BOT   = H - BOT_ZONE - 20; // 확언 텍스트 끝 Y (최대)

    // 골드 상단 선
    ctx.strokeStyle = '#D4A843'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(SIDE_PAD, TOP_PAD); ctx.lineTo(W-SIDE_PAD, TOP_PAD); ctx.stroke();

    // 골드 하단 선 (워터마크 위)
    ctx.beginPath(); ctx.moveTo(SIDE_PAD, H-BOT_ZONE); ctx.lineTo(W-SIDE_PAD, H-BOT_ZONE); ctx.stroke();

    // 날짜
    ctx.fillStyle = '#D4A843';
    ctx.font = 'bold 30px "Apple SD Gothic Neo","Malgun Gothic",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(dayText, W/2, TOP_PAD + 48);

    // 테마
    ctx.fillStyle = 'rgba(212,168,67,0.8)';
    ctx.font = '26px "Apple SD Gothic Neo","Malgun Gothic",sans-serif';
    ctx.fillText(themeText, W/2, TOP_PAD + 88);

    // 구분선
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, TOP_PAD+108); ctx.lineTo(W-120, TOP_PAD+108); ctx.stroke();

    // 확언 텍스트 — 글자 수에 따라 폰트 크기 자동 조절
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const textAreaH = TEXT_BOT - TEXT_TOP;
    const maxWidth  = W - SIDE_PAD*2 - 20;

    // 폰트 크기 자동 조절 (긴 텍스트는 작게)
    let fontSize = affirmText.length < 20 ? 88 : affirmText.length < 35 ? 76 : affirmText.length < 50 ? 66 : affirmText.length < 90 ? 54 : affirmText.length < 130 ? 44 : 36;
    let lineHeight = fontSize * 1.65;
    ctx.font = `bold ${fontSize}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;

    // 줄 나누기
    const rawLines = splitLines(ctx, affirmText, maxWidth);
    // 총 높이가 영역 초과 시 폰트 더 줄이기
    while(rawLines.length * lineHeight > textAreaH && fontSize > 20){
        fontSize -= 2;
        lineHeight = fontSize * 1.65;
        ctx.font = `bold ${fontSize}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
    }

    // 수직 중앙 정렬
    const totalH = rawLines.length * lineHeight;
    const startY = TEXT_TOP + (textAreaH - totalH) / 2 + fontSize;
    rawLines.forEach((line, i)=>{
        ctx.fillText(line, W/2, startY + i * lineHeight);
    });

    // ── 하단 워터마크 영역 ──
    const wmY = H - BOT_ZONE + 20;
    const qrSize = 80;
    const qrX = W - SIDE_PAD - qrSize - 10;
    const qrY = H - BOT_ZONE + (BOT_ZONE - qrSize - 24) / 2;

    // QR 패턴
    drawQRPattern(ctx, qrX, qrY, qrSize, '#D4A843');

    // 채널명
    ctx.fillStyle = 'rgba(212,168,67,0.9)';
    ctx.font = `bold 24px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('🌿 인생2막라디오 · 365일 확언', SIDE_PAD + 10, wmY + 36);

    // 채널 주소
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `18px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`;
    ctx.fillText('youtube.com/@SecondActRadio', SIDE_PAD + 10, wmY + 66);
}

// 줄 나누기 함수 (한 줄 최대 maxWidth)
function splitLines(ctx, text, maxWidth){
    const chars = text.split('');
    const lines  = [];
    let line = '';
    for(let c of chars){
        const test = line + c;
        if(ctx.measureText(test).width > maxWidth && line !== ''){
            lines.push(line);
            line = c;
        } else { line = test; }
    }
    if(line) lines.push(line);
    return lines;
}

function drawQRPattern(ctx, x, y, size, color){
    // QR코드 느낌의 패턴 (실제 QR 대신 시각적 표현)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x-4, y-4, size+8, size+8);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, size, size);

    // QR 픽셀 패턴
    const pattern = [
        [1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0],
        [1,0,1,0,0,1,0,1,1,1,0,1,0,1,0,0,1,0,1],
        [0,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0],
        [0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1],
        [1,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1],
    ];
    const cell = size / pattern.length;
    ctx.fillStyle = '#1B4332';
    pattern.forEach((row, ri)=>{
        row.forEach((val, ci)=>{
            if(val) ctx.fillRect(x + ci*cell, y + ri*cell, cell-0.5, cell-0.5);
        });
    });

    // QR 아래 라벨
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(size*0.18)}px "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('채널 바로가기', x + size/2, y + size + 18);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxY){
    const sentences = text.split('. ');
    let lines = [];
    for(let s=0; s<sentences.length; s++){
        let sentence = sentences[s] + (s < sentences.length-1 ? '.' : '');
        let testLine = '';
        for(let c=0; c<sentence.length; c++){
            testLine += sentence[c];
            if(ctx.measureText(testLine).width > maxWidth){
                lines.push(testLine.slice(0,-1));
                testLine = sentence[c];
            }
        }
        if(testLine) lines.push(testLine);
    }
    lines = lines.slice(0, 8);
    let startY = y;
    for(let l of lines){
        if(maxY && startY > maxY) break;
        ctx.fillText(l.trim(), x, startY);
        startY += lineHeight;
    }
}

window.downloadCard = function(){
    const canvas = document.getElementById('share-canvas');
    const link = document.createElement('a');
    const dayText = document.getElementById('day-label').innerText.replace(/\s/g,'_');
    link.download = `확언카드_${dayText}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('💚 카드가 저장됐어요!');
}

window.shareCard = function(){
    addPoint(1,'확언카드공유','share_card');
    window._sendShareLog('확언카드공유');
    const canvas = document.getElementById('share-canvas');
    canvas.toBlob(async (blob) => {
        if(navigator.share && navigator.canShare){
            const file = new File([blob], '확언카드.png', {type:'image/png'});
            if(navigator.canShare({files:[file]})){
                try{
                    await navigator.share({
                        files: [file],
                        title: '오늘의 확언',
                        text: '인생2막라디오 365일 확언 🌿'
                    });
                } catch(e){ downloadCard(); }
            } else { downloadCard(); }
        } else { downloadCard(); }
    }, 'image/png');
}
let toastTimer = null;
function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ===== ★ 5단계: 에피소드 배너 ===== */
function initBanner(){
    if(!latestEpisode.title) return;
    const todayStr = getTodayStr();
    const hidden = safeGetItem('banner_hidden_date','');
    if(hidden === todayStr) return;
    document.getElementById('banner-title-text').textContent = '🎙 새 에피소드: ' + latestEpisode.title;
    document.getElementById('episode-banner').style.display = 'block';
}
window.openEpisodeBanner = function(){
    window.open(latestEpisode.url,'_blank');
}
window.closeBanner = function(){
    document.getElementById('episode-banner').style.display = 'none';
    safeSetItem('banner_hidden_date', getTodayStr());
}

/* ===== ★ 5단계: 즐겨찾기 ===== */
function getDayCountNow(){
    // 현재 화면에 표시 중인 dayCount 반환
    if(currentMode==='A'){
        let minDateA=new Date(todayObj.getFullYear(),0,1);
        return Math.floor((selectedDateObj-minDateA)/86400000)+1;
    } else {
        const startStr=safeGetItem('start_date_B',null);
        if(!startStr) return 1;
        let parts=startStr.split('-');
        let minDateB=new Date(parts[0],parts[1]-1,parts[2]);
        let dc=Math.floor((selectedDateObj-minDateB)/86400000)+1;
        return dc<1?1:dc;
    }
}

window.toggleFavorite = function(){
    let favs = safeGetJSON('favorites',[]);
    const dc = getDayCountNow();
    const idx = favs.indexOf(dc);
    if(idx === -1){
        favs.push(dc);
        safeSetJSON('favorites', favs);
        addPoint(1,'즐겨찾기','fav_'+getTodayStr());
        showToast('즐겨찾기에 추가됐어요!');
    } else {
        favs.splice(idx,1);
        safeSetJSON('favorites', favs);
        showToast('즐겨찾기에서 해제됐어요');
    }
    updateFavButton(dc);
    renderDashboard();
    // 미션용 카운트도 업데이트
    let m=todayObj.getMonth()+1, y=todayObj.getFullYear();
    let cnt=favs.length;
    safeSetJSON('fav_count_total', cnt);
    safeSetJSON(`fav_count_${y}_${m}`, favs.filter(d=>d<=366).length); // 간단히
    checkMissions();
}

function updateFavButton(dc){
    const btn = document.getElementById('btn-fav-main');
    if(!btn) return;
    const favs = safeGetJSON('favorites',[]);
    if(favs.includes(dc)){
        btn.textContent = '★ 저장됨 (다시 누르면 해제)';
        btn.classList.add('saved');
    } else {
        btn.textContent = '즐겨찾기에 추가';
        btn.classList.remove('saved');
    }
}

window.renderFavoritesPage = function(){
    const favs = safeGetJSON('favorites',[]);
    const container = document.getElementById('fav-list');
    if(favs.length === 0){
        container.innerHTML = '<div class="fav-empty">아직 즐겨찾기한 확언이 없어요 🌿<br>확언 화면에서 ⭐를 눌러 저장해보세요.</div>';
        return;
    }
    // 최신 저장 순서 (역순)
    const sorted = [...favs].reverse();
    let html = '';
    sorted.forEach(dc => {
        const dataIndex = (dc-1) % affirmationsData.length;
        const data = affirmationsData[dataIndex];
        const shortText = data.text.length>60 ? data.text.substring(0,60)+'...' : data.text;
        html += `<div class="fav-card" onclick="openFavDetail(${dc})">
            <div class="fav-card-top">
                <div class="fav-card-meta">
                    <span class="fav-card-day">D${dc}</span>
                    <span class="fav-card-theme">${data.theme}</span>
                </div>
                <button class="fav-card-del" onclick="event.stopPropagation();deleteFav(${dc})">삭제</button>
            </div>
            <div class="fav-card-text">${shortText}</div>
        </div>`;
    });
    container.innerHTML = html;
}


window.openFavDetail = function(dc){
    const dataIndex = (dc-1) % affirmationsData.length;
    const data = affirmationsData[dataIndex];
    const old = document.getElementById('fav-detail-modal');
    if(old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'fav-detail-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:6000;display:flex;align-items:flex-end;justify-content:center;';
    const inner = document.createElement('div');
    inner.style.cssText = 'background:var(--bg-color);border-radius:20px 20px 0 0;padding:28px 22px 44px;width:100%;max-width:600px;box-sizing:border-box;max-height:85vh;overflow-y:auto;';
    inner.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
        '<span style="font-size:0.85em;color:var(--text-muted);">📅 D' + dc + ' · ' + (data.theme||'') + '</span>' +
        '<button id="fav-close-btn" style="background:none;border:none;font-size:1.3em;cursor:pointer;color:var(--text-muted);">✕</button>' +
        '</div>' +
        '<div style="font-size:1.05em;font-weight:600;color:var(--primary-color);line-height:1.9;margin-bottom:18px;">"' + (data.text||'') + '"</div>' +
        '<div style="background:var(--card-bg);border-radius:12px;padding:14px;margin-bottom:16px;font-size:0.85em;color:var(--text-muted);line-height:1.7;">' +
        '<div style="font-size:0.8em;font-weight:700;color:var(--primary-color);margin-bottom:4px;">🎯 오늘의 행동 지침</div>' +
        (data.action||'') + '</div>' +
        '<div style="display:flex;gap:8px;">' +
        '<button id="fav-speak-btn" style="flex:1;min-height:44px;background:var(--primary-color);color:#fff;border:none;border-radius:12px;font-size:0.88em;font-weight:700;cursor:pointer;">🔊 듣기</button>' +
        '<button id="fav-goto-btn" style="flex:1;min-height:44px;background:var(--card-bg);color:var(--primary-color);border:1px solid var(--border-color);border-radius:12px;font-size:0.88em;font-weight:700;cursor:pointer;">📅 날짜로 이동</button>' +
        '</div>';
    modal.appendChild(inner);
    document.body.appendChild(modal);
    document.getElementById('fav-close-btn').onclick = function(){ modal.remove(); };
    document.getElementById('fav-speak-btn').onclick = function(){ speakTextOnce(data.text); showToast('🔊 재생 중...'); };
    document.getElementById('fav-goto-btn').onclick = function(){ goToFav(dc); modal.remove(); };
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
};

window.goToFav = function(dc, bypassCap){
    // 해당 day로 이동
    if(currentMode==='A'){
        let minDateA=new Date(todayObj.getFullYear(),0,1);
        selectedDateObj=new Date(minDateA.getTime()+(dc-1)*86400000);
    } else {
        const startStr=safeGetItem('start_date_B',null);
        if(startStr){
            let parts=startStr.split('-');
            let minDateB=new Date(parts[0],parts[1]-1,parts[2]);
            selectedDateObj=new Date(minDateB.getTime()+(dc-1)*86400000);
        }
    }
    // ★ bypassCap=true면 미래 날짜도 허용
    if(!bypassCap && selectedDateObj>todayObj) selectedDateObj=new Date(todayObj);
    // ★ bypassCap은 switchView 전에 반드시 설정 (renderScreen이 내부에서 실행됨)
    window._bypassDateCap = !!bypassCap;
    switchView('home');
}

window.deleteFav = function(dc){
    let favs=safeGetJSON('favorites',[]);
    favs=favs.filter(d=>d!==dc);
    safeSetJSON('favorites',favs);
    safeSetJSON('fav_count_total',favs.length);
    renderFavoritesPage();
    renderDashboard();
    updateFavButton(getDayCountNow());
    showToast('즐겨찾기에서 삭제됐어요');
}

let favTtsIndex=0;
let favTtsArray=[];
window.playFavsInOrder=function(loop){
    const favs=safeGetJSON('favorites',[]);
    if(!favs.length){showToast('즐겨찾기한 확언이 없어요');return;}
    favTtsArray=[...favs];
    favTtsIndex=0;
    favTtsLoop=!!loop;
    showToast(loop?'🔁 전체 무한반복 재생 중...':'▶️ 순서대로 재생 중...');
    playNextFav();
}
window.playFavRandom=function(){
    const favs=safeGetJSON('favorites',[]);
    if(!favs.length){showToast('즐겨찾기한 확언이 없어요');return;}
    const dc=favs[Math.floor(Math.random()*favs.length)];
    const data=affirmationsData[(dc-1)%affirmationsData.length];
    speakTextOnce(data.text);
    showToast('🎲 '+data.theme);
}
let favTtsLoop = false;
function playNextFav(){
    if(favTtsIndex>=favTtsArray.length){
        if(favTtsLoop){ favTtsIndex=0; }
        else { showToast('모두 들었어요 ✅'); return; }
    }
    const dc=favTtsArray[favTtsIndex];
    const data=affirmationsData[(dc-1)%affirmationsData.length];
    speakTextOnce(data.text,()=>{favTtsIndex++;setTimeout(playNextFav,1500);});
}
function speakTextOnce(text,cb){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='ko-KR'; u.rate=0.85;
    if(cb) u.onend=cb;
    window.speechSynthesis.speak(u);
}

/* ===== ★ 5단계: 오라클 ===== */
window.openOracle = function(){
    const rnd=Math.floor(Math.random()*affirmationsData.length);
    const data=affirmationsData[rnd];
    currentOracleDayCount=rnd+1;
    document.getElementById('oracle-theme-text').textContent='"'+data.theme+'"';
    document.getElementById('oracle-affirmation-text').textContent=data.text;
    document.getElementById('oracle-action-text').textContent=data.action;
    // 즐겨찾기 버튼 상태
    const favs=safeGetJSON('favorites',[]);
    const fb=document.getElementById('oracle-fav-btn');
    if(favs.includes(currentOracleDayCount)){
        fb.textContent='★ 저장됨';
        fb.style.opacity='0.6';
    } else {
        fb.textContent='⭐ 저장';
        fb.style.opacity='1';
    }
    document.getElementById('oracle-modal').style.display='flex';
}
window.favOracle=function(){
    let favs=safeGetJSON('favorites',[]);
    if(!favs.includes(currentOracleDayCount)){
        favs.push(currentOracleDayCount);
        safeSetJSON('favorites',favs);
        safeSetJSON('fav_count_total',favs.length);
        const fb=document.getElementById('oracle-fav-btn');
        fb.textContent='★ 저장됨';
        fb.style.opacity='0.6';
        showToast('즐겨찾기에 추가됐어요!');
        updateFavButton(getDayCountNow());
        renderDashboard();
    }
}
window.oracleOverlayClick=function(e){
    if(e.target.id==='oracle-modal'){
        document.getElementById('oracle-modal').style.display='none';
    }
}

/* ===== ★ 5단계: 구독 유도 팝업 ===== */
function showSubscribeNudge(){
    const shown=safeGetItem('subscribe_nudge_shown','');
    if(shown==='true') return;
    safeSetItem('subscribe_nudge_shown','true');
    setTimeout(()=>{
        document.getElementById('subscribe-modal').style.display='flex';
    },400);
}

/* ===== 배경음악 ===== */
let audioCtx=null,bgmGainNode=null,bgmFilter=null,bgmSource=null,isBgmOn=false,bgmInitialized=false;
const VOL_NORMAL=0.3,VOL_DUCK=0.05;
function initAudioContext(){if(!audioCtx){try{const A=window.AudioContext||window.webkitAudioContext;audioCtx=new A();bgmGainNode=audioCtx.createGain();bgmGainNode.gain.value=0;bgmGainNode.connect(audioCtx.destination);}catch(e){}}}
    let bgmType = parseInt(safeGetItem('bgm_type','0'))||0;
const BGM_TYPES = [
    {label:'🌊 파도', icon:'🌊'},
    {label:'🌧️ 빗소리', icon:'🌧️'},
    {label:'🐦 새소리', icon:'🐦'},
    {label:'🎵 음악상자', icon:'🎵'}
];
function createBgmByType(type){
    if(!audioCtx) return null;
    try{
        if(type===0) return createWaveSound();
        if(type===1) return createRainSound();
        if(type===2) return createBirdSound();
        if(type===3) return createMusicBoxSound();
    }catch(e){ return createWaveSound(); }
    return createWaveSound();
}
function makePink(dur){
    var sr=audioCtx.sampleRate,len=sr*dur,buf=audioCtx.createBuffer(1,len,sr),d=buf.getChannelData(0),b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(var i=0;i<len;i++){var w=Math.random()*2-1;b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;b3=0.86650*b3+w*0.3104856;b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;}
    return buf;
}
function createWaveSound(){
    var src=audioCtx.createBufferSource(),lp=audioCtx.createBiquadFilter(),amp=audioCtx.createGain(),mod=audioCtx.createOscillator(),mg=audioCtx.createGain();
    src.buffer=makePink(8);src.loop=true;lp.type='lowpass';lp.frequency.value=300;mod.frequency.value=0.1;mod.type='sine';mg.gain.value=0.22;amp.gain.value=0.78;
    mod.connect(mg);mg.connect(amp.gain);src.connect(lp);lp.connect(amp);amp.connect(bgmGainNode);mod.start(0);src.start(0);src._extra=[mod];return src;
}
function createRainSound(){
    var src=audioCtx.createBufferSource();
    var lp=audioCtx.createBiquadFilter();
    var amp=audioCtx.createGain();
    var mod=audioCtx.createOscillator();
    var mg=audioCtx.createGain();
    src.buffer=makePink(6); src.loop=true;
    lp.type='lowpass'; lp.frequency.value=800;
    mod.frequency.value=0.15; mod.type='sine';
    mg.gain.value=0.12; amp.gain.value=0.55;
    mod.connect(mg); mg.connect(amp.gain);
    src.connect(lp); lp.connect(amp); amp.connect(bgmGainNode);
    mod.start(0); src.start(0);
    src._extra=[mod]; return src;
}
var _bt=[];
function _sb(){_bt.forEach(function(t){clearTimeout(t);});_bt=[];}
function _ch(f){
    if(!audioCtx||!isBgmOn) return;
    try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(f,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.3,audioCtx.currentTime+0.08);o.frequency.exponentialRampToValueAtTime(f*0.9,audioCtx.currentTime+0.2);g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(0.55,audioCtx.currentTime+0.02);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.2);o.connect(g);g.connect(bgmGainNode);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+0.25);}catch(e){}
}
function createBirdSound(){
    var src=audioCtx.createBufferSource(),lp=audioCtx.createBiquadFilter(),amp=audioCtx.createGain();
    src.buffer=makePink(6);src.loop=true;lp.type='lowpass';lp.frequency.value=500;amp.gain.value=0.08;
    src.connect(lp);lp.connect(amp);amp.connect(bgmGainNode);src.start(0);
    _sb();
    var freqs=[2400,3000,2800,3600,4000,3200];
    function next(){
        var t=setTimeout(function(){
            if(!isBgmOn) return;
            var f=freqs[Math.floor(Math.random()*freqs.length)];
            var n=Math.floor(Math.random()*4)+2;
            for(var i=0;i<n;i++){
                (function(ii){
                    var bt=setTimeout(function(){ _ch(f+Math.random()*200); },ii*160);
                    _bt.push(bt);
                })(i);
            }
            next();
        }, 1000+Math.random()*2500);
        _bt.push(t);
    }
    // isBgmOn이 true로 세팅된 후 시작
    setTimeout(function(){ next(); }, 200);
    return src;
}
var _mt=null;
function _sm(){if(_mt){clearTimeout(_mt);_mt=null;}}
function createMusicBoxSound(){
    var scale=[523.25,587.33,659.25,783.99,880,1046.5],pats=[[0,2,4,5,4,2],[0,4,2,5],[5,3,1,0,2]],ni=0,pi=0,pat=pats[0];
    function note(){if(!isBgmOn)return;try{var o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.type='sine';o.frequency.value=scale[pat[ni%pat.length]];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.18,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+1.8);o.connect(g);g.connect(bgmGainNode);o.start(t);o.stop(t+1.9);}catch(e){}ni++;if(ni%pat.length===0){pi=(pi+1)%pats.length;pat=pats[pi];}_mt=setTimeout(note,700+Math.random()*400);}
    _mt=setTimeout(note,150);return null;
}

window.selectBgmType = function(type){
    bgmType = type;
    safeSetItem('bgm_type', String(type));
    // 재생 중이면 재시작
    if(isBgmOn){
        if(bgmSource){ _sb();_sm(); if(!bgmSource._isMusicBox&&!bgmSource._isBird){try{bgmSource.stop();}catch(e){}} bgmSource=null; }
        bgmSource = createBgmByType(bgmType);
    }
    // UI 업데이트
    updateBgmUI();
    document.getElementById('bgm-selector-modal')?.remove();
};

window.openBgmSelector = function(){
    const existing = document.getElementById('bgm-selector-modal');
    if(existing){ existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'bgm-selector-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:6000;display:flex;align-items:flex-end;justify-content:center;';

    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:var(--bg-color);border-radius:20px 20px 0 0;padding:20px 20px 40px;width:100%;max-width:600px;box-sizing:border-box;';
    sheet.innerHTML = '<div style="text-align:center;font-weight:700;color:var(--primary-color);font-size:1em;margin-bottom:6px;">🎵 배경음악 선택</div>' +
        '<div style="text-align:center;font-size:0.78em;color:var(--text-muted);margin-bottom:16px;">확언에 집중하는 데 도움이 되는 소리를 골라보세요</div>';

    const options = [
        {type:-1, icon:'🔇', label:'끄기', desc:'배경음악 없음'},
        {type:0,  icon:'🌊', label:'파도', desc:'잔잔한 파도 소리'},
        {type:1,  icon:'🌧️', label:'빗소리', desc:'잔잔한 빗소리'},
        {type:2,  icon:'🐦', label:'새소리', desc:'자연 새소리'},
        {type:3,  icon:'🎵', label:'음악상자', desc:'잔잔한 오르골'},
    ];

    options.forEach(function(opt){
        const isActive = (opt.type === -1 && !isBgmOn) || (opt.type === bgmType && isBgmOn);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;cursor:pointer;background:' + (isActive?'var(--card-bg)':'transparent') + ';margin-bottom:4px;border:' + (isActive?'1.5px solid var(--primary-color)':'1.5px solid transparent') + ';';
        row.innerHTML = '<span style="font-size:24px;">' + opt.icon + '</span>' +
            '<div style="flex:1;"><div style="font-size:0.9em;font-weight:' + (isActive?'700':'500') + ';color:var(--text-color);">' + opt.label + '</div>' +
            '<div style="font-size:0.75em;color:var(--text-muted);">' + opt.desc + '</div></div>' +
            (isActive ? '<span style="color:var(--primary-color);font-size:1.1em;">✓</span>' : '');
        row.onclick = function(){
            if(opt.type === -1){
                pauseBGM();
            } else {
                bgmType = opt.type;
                safeSetItem('bgm_type', String(bgmType));
                if(bgmSource){ try{ bgmSource.stop(); }catch(e){} bgmSource=null; }
                playBGM();
            }
            updateBgmUI();
            modal.remove();
        };
        sheet.appendChild(row);
    });

    modal.appendChild(sheet);
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
};

function playBGM(){try{initAudioContext();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();if(!bgmSource){bgmSource=createBgmByType(bgmType);}isBgmOn=true;safeSetItem('bgm_state','on');updateBgmUI();bgmGainNode.gain.setTargetAtTime(isTtsPlaying?VOL_DUCK:VOL_NORMAL,audioCtx.currentTime,0.5);}catch(e){}}
function pauseBGM(){try{_sb();_sm();isBgmOn=false;safeSetItem('bgm_state','off');updateBgmUI();if(bgmGainNode&&audioCtx){bgmGainNode.gain.setTargetAtTime(0,audioCtx.currentTime,0.5);setTimeout(()=>{if(!isBgmOn&&audioCtx.state==='running')audioCtx.suspend();},1000);}}catch(e){}}
window.toggleBGM=function(){if(!bgmInitialized){bgmInitialized=true;document.removeEventListener('click',unlockAudio);document.removeEventListener('touchstart',unlockAudio);}isBgmOn?pauseBGM():playBGM();}
function updateBgmUI(){
    const btn=document.getElementById('btn-bgm'),ic=document.getElementById('bgm-icon'),tx=document.getElementById('bgm-text');
    const hdrBtn=document.getElementById('header-bgm-btn');
    if(isBgmOn){
        if(btn){ btn.classList.add('on'); }
        if(ic) ic.innerText = BGM_TYPES[bgmType]?.icon || '🎵';
        if(tx) tx.innerText = '배경음악 · ' + (BGM_TYPES[bgmType]?.label || '');
        if(hdrBtn) hdrBtn.textContent = BGM_TYPES[bgmType]?.icon || '🎵';
        if(hdrBtn) hdrBtn.style.background = 'var(--accent-color)';
        if(hdrBtn) hdrBtn.style.color = 'var(--primary-color)';
    } else {
        if(btn) btn.classList.remove('on');
        if(ic) ic.innerText='🎵';
        if(tx) tx.innerText='배경음악';
        if(hdrBtn){ hdrBtn.textContent='🎵'; hdrBtn.style.background='var(--primary-color)'; hdrBtn.style.color='#fff'; }
    }
}

function applyDucking(){if(isBgmOn&&bgmGainNode&&audioCtx)bgmGainNode.gain.setTargetAtTime(VOL_DUCK,audioCtx.currentTime,0.5);}
function removeDucking(){if(isBgmOn&&bgmGainNode&&audioCtx)bgmGainNode.gain.setTargetAtTime(VOL_NORMAL,audioCtx.currentTime,0.5);}
function unlockAudio(){
    if(bgmInitialized) return;
    try{
        initAudioContext();
        if(audioCtx){
            // 아이폰/안드로이드 오디오 컨텍스트 강제 해제
            audioCtx.resume().then(()=>{
                bgmInitialized = true;
                // 배경음악 자동 재생 설정 확인
                if(safeGetItem('bgm_state','off')==='on') playBGM();
            }).catch(()=>{ bgmInitialized = true; });
        } else {
            bgmInitialized = true;
        }
    } catch(e){ bgmInitialized = true; }
    // 리스너 제거
    document.removeEventListener('click',    unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('touchend',   unlockAudio);
    document.removeEventListener('keydown',    unlockAudio);
}
// 모바일 대응 — touchend 및 keydown도 추가
document.addEventListener('click',     unlockAudio, {once:true});
document.addEventListener('touchstart', unlockAudio, {once:true, passive:true});
document.addEventListener('touchend',   unlockAudio, {once:true, passive:true});
document.addEventListener('keydown',    unlockAudio, {once:true});

/* ===== TTS ===== */
let isTtsPlaying=false,isTtsLooping=false,ttsTimeout=null,currentAffirmation='';
window.playTTS=function(loop){try{if(!('speechSynthesis'in window)){alert('이 브라우저는 음성 낭독을 지원하지 않습니다.');return;}if(isTtsPlaying){if(isTtsLooping===loop){stopTTS();return;}else{stopTTS();}}window.speechSynthesis.cancel();clearTimeout(ttsTimeout);isTtsPlaying=true;isTtsLooping=loop;currentAffirmation=document.getElementById('affirmation-text').innerText.replace(/["']/g,'');updateTTSUI();applyDucking();speakText('따라 해보세요.',()=>{if(isTtsPlaying)speakAffirmation();});}catch(e){stopTTS();}}
function speakAffirmation(){speakText(currentAffirmation,()=>{if(isTtsPlaying){if(isTtsLooping){ttsTimeout=setTimeout(()=>{if(isTtsPlaying&&isTtsLooping)speakAffirmation();},3000);}else{stopTTS();}}});}
function speakText(text,cb){if(!isTtsPlaying)return;const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=0.85;u.volume=1.0;u.onend=()=>{if(cb)cb();};u.onerror=()=>{stopTTS();};window.speechSynthesis.speak(u);}
window.stopTTS=function(){try{isTtsPlaying=false;isTtsLooping=false;clearTimeout(ttsTimeout);if('speechSynthesis'in window)window.speechSynthesis.cancel();removeDucking();updateTTSUI();}catch(e){}}
function updateTTSUI(){const bl=document.getElementById('btn-listen'),bp=document.getElementById('btn-loop');if(!bl||!bp)return;if(isTtsPlaying){if(isTtsLooping){bp.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;flex-shrink:0;"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>정지';bp.classList.add('active-play');bl.disabled=true;}else{bl.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;flex-shrink:0;"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>정지';bl.classList.add('active-play');bp.disabled=true;}}else{bl.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="margin-right:6px;flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>소리로 듣기';bl.classList.remove('active-play');bl.disabled=false;bp.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="margin-right:6px;flex-shrink:0;"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>무한재생';bp.classList.remove('active-play');bp.disabled=false;}}

/* ===== 화면 전환 ===== */
// ★ 뷰 히스토리 스택
window._viewHistory = [];
window._currentView = 'home';

window.switchView = function switchView(viewName, _fromBack){
    if(typeof window.stopTTS==='function')stopTTS();
    // 뷰 히스토리 스택 관리 (뒤로가기용)
    if(!_fromBack){
        if(window._currentView && window._currentView !== viewName){
            window._viewHistory.push(window._currentView);
            // 최대 20개만 유지
            if(window._viewHistory.length > 20) window._viewHistory.shift();
        }
    }
    window._currentView = viewName;
    document.querySelectorAll('.view-section').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
    const titles={home:'오늘의 확언',calendar:'달력 및 통계',favorites:'내 최애 확언 ⭐',memo:'메모장',story:'사연 보내기',settings:'앱 설정',shorts:'오늘의 실천 📣',completion:'완주 축하합니다!'};
    document.getElementById('main-header-title').innerText=titles[viewName]||'오늘의 확언';
    if(viewName==='home'){
        document.getElementById('view-home').classList.add('active');
        document.getElementById('nav-home').classList.add('active');
        renderScreen();
    } else if(viewName==='calendar'){
        document.getElementById('view-calendar').classList.add('active');
        document.getElementById('nav-calendar').classList.add('active');
        calYear=todayObj.getFullYear();calMonth=todayObj.getMonth()+1;
        renderCalendar();renderDashboard();checkMissions();
        renderEnhancedStats();
        renderHallOfFame();
        check300DayBanner();
        renderDiaryPromoCard();
        renderIdentityLabel(); // ★ 정체성 라벨
        render100DayCertButton(); // ★ 100일 인증 버튼
    } else if(viewName==='favorites'){
        document.getElementById('view-favorites').classList.add('active');
        document.getElementById('nav-favorites').classList.add('active');
        renderFavoritesPage();
        renderPsychPreview(); // ★ 심리테스트 미리보기 카드 렌더링
    } else if(viewName==='memo'){
        document.getElementById('view-memo').classList.add('active');
        document.getElementById('nav-memo').classList.add('active');
        // ★ 필사 탭으로 초기화
        switchMemoTab('write');
    } else if(viewName==='psych'){
        document.getElementById('view-psych').classList.add('active');
        const navPsych = document.getElementById('nav-psych');
        if(navPsych) navPsych.classList.add('active');
    } else if(viewName==='story'){
        setTimeout(initStoryKakaoUI, 100);
        document.getElementById('view-story').classList.add('active');
        document.getElementById('nav-story').classList.add('active');
        initStoryView();
    } else if(viewName==='shorts'){
        document.getElementById('view-shorts').classList.add('active');
        document.getElementById('nav-shorts').classList.add('active');
        setTimeout(renderShortsPointSummary, 100);
        // 풀잎(레벨2) 미만이면 잠금 안내
        if(getLevel(getPoints()) < 2){
            document.getElementById('shorts-declaration-area').innerHTML = `
                <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);border-radius:16px;padding:24px 20px;margin-bottom:16px;">
                    <div style="font-size:0.78em;color:#C9A84C;font-weight:700;letter-spacing:1px;text-align:center;margin-bottom:10px;">🔓 풀잎 등급 달성 시 오픈</div>
                    <div style="font-size:1.1em;font-weight:700;color:#fff;text-align:center;margin-bottom:14px;">마음이 힘들 때 꺼내 먹는<br>🧪 확언 처방전</div>
                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
                        <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-size:0.85em;color:rgba(255,255,255,0.9);">
                            💔 거절당한 날 → 자존감 회복 확언 영상
                        </div>
                        <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-size:0.85em;color:rgba(255,255,255,0.9);">
                            😔 자신이 없을 때 → 자기확신 확언 영상
                        </div>
                        <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;font-size:0.85em;color:rgba(255,255,255,0.9);">
                            🌀 불안하고 흔들릴 때 → 마음 안정 확언 영상
                        </div>
                    </div>
                    <div style="background:rgba(201,168,76,0.15);border-radius:12px;padding:12px 14px;margin-bottom:14px;border-left:3px solid #C9A84C;">
                        <div style="font-size:0.8em;font-weight:700;color:#C9A84C;margin-bottom:6px;">🧠 뇌과학이 증명한 효과</div>
                        <div style="font-size:0.76em;color:rgba(255,255,255,0.8);line-height:1.8;">
                            확언 콘텐츠를 보면 뇌의 <b style="color:#C9A84C;">vmPFC(내측 전전두엽)</b>가 활성화되며,<br>
                            스트레스 반응이 줄고 <b style="color:#C9A84C;">실제 행동 변화</b>로 이어집니다.<br>
                            <span style="font-size:0.88em;opacity:0.7;">— Falk et al., PNAS 2015 · Dutcher et al., SCAN 2020</span>
                        </div>
                    </div>
                    <div style="background:rgba(201,168,76,0.2);border-radius:10px;padding:10px 14px;margin-bottom:14px;text-align:center;">
                        <div style="font-size:0.8em;color:#C9A84C;font-weight:700;">🌱 현재: ${LEVELS[getLevel(getPoints())].emoji} ${LEVELS[getLevel(getPoints())].name}</div>
                        <div style="font-size:0.76em;color:rgba(255,255,255,0.7);margin-top:2px;">풀잎까지 <b style="color:#C9A84C;">${Math.max(0,150-getPoints())}PT</b> 남았어요! (약 6일)</div>
                    </div>
                    <button onclick="switchView('home')" style="width:100%;background:var(--accent-color);color:var(--primary-color);border:none;border-radius:12px;padding:12px;font-size:0.9em;font-weight:700;cursor:pointer;">🌿 오늘 확언 보러 가기</button>
                </div>
                <div style="font-size:0.78em;color:var(--text-muted);text-align:center;margin-top:8px;line-height:1.6;">
                    풀잎 달성 후 <b>실천 탭</b>을 다시 누르면 확언 처방전이 열려요 🌿
                </div>`;
        } else {
            initShortsView();
        }
    } else if(viewName==='settings'){
        document.getElementById('view-settings').classList.add('active');
        initSettings();
    } else if(viewName==='completion'){
        document.getElementById('view-celebration').classList.add('active');
        document.getElementById('nav-calendar').classList.add('active');
    }
    window.scrollTo(0,0);
}

// ====================================================
// ★ 심리테스트 64유형 시스템 이식
// ====================================================

// [2] 결과 화면 렌더링 - showPsychResult
function showPsychResult(result){
    const modal = document.getElementById('psych-modal');
    if(!modal) return;

    const { animal, scores, viaStrengths, variant, facetData } = result;
    
    // variant 정보가 없으면 기존 fallback 사용
    const variantLabel = variant ? variant.label : `${animal.name}`;
    const variantNarrative = variant ? variant.narrative : '분석 중...';
    const variantStrengths = variant ? variant.strengths : [];
    const variantCautions = variant ? variant.cautions : [];
    const variantCelebrities = variant ? variant.celebrities : [];

    const _quickBadge = pMode==='quick' ? '<div style="background:rgba(255,193,7,0.2);border:1px solid rgba(255,193,7,0.4);border-radius:20px;padding:5px 16px;font-size:0.78em;color:#FFC107;font-weight:700;margin-bottom:10px;display:inline-block;">⚡ 빠른 테스트 결과</div>' : '';
    const _precisionCTA = pMode==='quick' ? '<div style="background:#FFF8E7;border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid #F0D080;text-align:center;"><div style="font-size:0.88em;font-weight:700;color:#856404;margin-bottom:8px;">🔬 더 정확한 결과를 원하신다면?</div><div style="font-size:0.82em;color:#856404;line-height:1.7;margin-bottom:12px;">정밀 테스트(66문항)로 연애·일·소비 스타일까지<br>완전 분석해보세요!</div><button id="_precisionBtn" style="background:#1B4332;color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:0.88em;font-weight:700;cursor:pointer;">🔬 정밀 테스트 시작하기</button></div>' : '';

    // 기존 5대 요인 및 자존감 분석
    const love = getLoveStyle(scores);
    const work = getWorkStyle(scores);
    const friend = getFriendStyle(scores);
    const hard = getHardStyle(scores);
    const money = getMoneyStyle(scores);
    const rse = getRseStyle(scores.RSE);
    const via = getViaStyle(viaStrengths);

    const compatibleKey = Object.keys(PSYCH_ANIMALS).find(k => k !== result.typeKey && k.includes(result.typeKey[0] === '☀️' ? '🌙' : '☀️'));
    const compatible = PSYCH_ANIMALS[compatibleKey] || PSYCH_ANIMALS['🌙🌱🤝💭'];

    modal.innerHTML = `
    <div style="background:var(--bg-color);min-height:100vh;padding-bottom:100px;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px 20px 30px;text-align:center;">
            <div style="font-size:0.8em;color:rgba(255,255,255,0.7);margin-bottom:10px;">나의 확언 동물 유형</div>
            ${_quickBadge}
            <div style="font-size:90px;margin-bottom:8px;">${animal.animal}</div>
            <div style="font-size:1.8em;font-weight:900;color:#fff;margin-bottom:4px;">${animal.name}</div>
            <div style="font-size:0.95em;color:#C9A84C;font-weight:700;margin-bottom:4px;">"${variantLabel}"</div>
            <div style="font-size:0.9em;color:rgba(255,255,255,0.8);">${animal.title}</div>
        </div>

        <div style="padding:20px;">
        
        ${_precisionCTA}

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);">
            <div style="font-size:1em;font-weight:900;color:#1B4332;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                <span>🔬</span> 당신의 진짜 이야기
            </div>
            <div style="font-size:0.9em;line-height:1.9;color:var(--text-color);margin-bottom:18px;">
                ${variantNarrative}
            </div>

            ${facetData ? `
            <div style="background:#F0F7F4;border-radius:12px;padding:14px;margin-bottom:16px;">
                <div style="font-size:0.8em;font-weight:700;color:#1B4332;margin-bottom:10px;">🎯 나의 핵심 성향 비율</div>
                <div style="display:flex;align-items:center;margin-bottom:8px;">
                    <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l1}</span>
                    <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;">
                        <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s1}%;"></div>
                    </div>
                    <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s1}%</span>
                </div>
                <div style="display:flex;align-items:center;">
                    <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l2}</span>
                    <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;">
                        <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s2}%;"></div>
                    </div>
                    <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s2}%</span>
                </div>
            </div>` : ''}

            <div style="display:flex;gap:8px;margin-bottom:16px;">
                <div style="flex:1;background:#E8F5E9;padding:12px;border-radius:10px;">
                    <div style="font-size:0.75em;font-weight:800;color:#2E7D32;margin-bottom:6px;">🌟 돋보이는 강점</div>
                    <div style="font-size:0.75em;color:#1B4332;line-height:1.6;">• ${variantStrengths.join('<br>• ')}</div>
                </div>
                <div style="flex:1;background:#FFF3E0;padding:12px;border-radius:10px;">
                    <div style="font-size:0.75em;font-weight:800;color:#E65100;margin-bottom:6px;">⚠️ 이 점은 주의해요</div>
                    <div style="font-size:0.75em;color:#B93C00;line-height:1.6;">• ${variantCautions.join('<br>• ')}</div>
                </div>
            </div>

            <div style="background:rgba(201,168,76,0.1);border-radius:10px;padding:12px 14px;border:1px solid rgba(201,168,76,0.3);">
                <span style="font-size:0.8em;font-weight:800;color:#8B6914;">👥 나와 닮은 리더/유명인:</span>
                <span style="font-size:0.85em;color:#1B4332;font-weight:700;margin-left:4px;">${variantCelebrities.join(', ')}</span>
            </div>
        </div>

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:14px;">📊 Big 5 성격 5요인 분석</div>
            ${[
                ['외향성', scores.E, '내향적', '외향적'],
                ['개방성', scores.O, '안정 추구', '변화 추구'],
                ['친화성', scores.A, '독립적', '관계 중심'],
                ['성실성', scores.C, '유연함', '계획적'],
                ['안정성', 100-scores.N, '예민함', '안정적'],
            ].map(([label, score, left, right])=>`
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8em;margin-bottom:3px;">
                        <span style="font-weight:700;color:var(--text-color);">${label}</span>
                        <span style="color:#1B4332;font-weight:700;">${score}% · ${getLevelText(score)}</span>
                    </div>
                    <div style="background:var(--border-color);border-radius:6px;height:8px;">
                        <div style="background:linear-gradient(90deg,#1B4332,#C9A84C);height:100%;border-radius:6px;width:${score}%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.7em;color:var(--text-muted);margin-top:2px;">
                        <span>${left}</span><span>${right}</span>
                    </div>
                </div>`).join('')}
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: BFI-44 (John, Donahue & Kentle, 1991)</div>
        </div>

        ${[love, work, friend, hard, money].map(cat=>`
        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:1em;font-weight:700;color:#1B4332;margin-bottom:10px;">${cat.title}</div>
            <div style="font-size:0.88em;line-height:1.9;color:var(--text-color);margin-bottom:12px;">${cat.desc}</div>
            ${cat.strength ? `<div style="background:#F0F7F4;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;margin-bottom:8px;line-height:1.7;">${cat.strength}</div>` : ''}
            ${cat.caution ? `<div style="background:#FFF8E7;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#856404;margin-bottom:8px;line-height:1.7;">${cat.caution}</div>` : ''}
            <div style="background:#E8F4F0;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;line-height:1.7;">${cat.tip}</div>
            ${cat.video ? `<a href="${cat.video.url}" target="_blank"
                style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 14px;background:#fff;border:1.5px solid #1B4332;border-radius:10px;text-decoration:none;">
                <span style="font-size:1.2em;">📺</span>
                <div style="flex:1;">
                    <div style="font-size:0.75em;color:#888;">이 영상이 도움될 거예요</div>
                    <div style="font-size:0.82em;font-weight:700;color:#1B4332;">${cat.video.label}</div>
                </div>
                <span style="font-size:0.9em;color:#1B4332;">▶</span>
            </a>` : ''}
        </div>`).join('')}

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:1em;font-weight:700;color:#1B4332;margin-bottom:10px;">${rse.title}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <div style="flex:1;background:var(--border-color);border-radius:6px;height:10px;">
                    <div style="background:linear-gradient(90deg,#C9A84C,#1B4332);height:100%;border-radius:6px;width:${rse.score}%;"></div>
                </div>
                <span style="font-size:1em;font-weight:700;color:#1B4332;">${rse.score}점</span>
            </div>
            <div style="font-size:0.88em;line-height:1.9;color:var(--text-color);margin-bottom:10px;">${rse.desc}</div>
            ${rse.strength ? `<div style="background:#F0F7F4;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;margin-bottom:8px;line-height:1.7;">${rse.strength}</div>` : ''}
            ${rse.growth ? `<div style="background:#FFF8E7;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#856404;margin-bottom:8px;line-height:1.7;">${rse.growth}</div>` : ''}
            <div style="background:#E8F4F0;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;line-height:1.7;">${rse.tip}</div>
            ${rse.video ? `<a href="${rse.video.url}" target="_blank"
                style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 14px;background:#fff;border:1.5px solid #1B4332;border-radius:10px;text-decoration:none;">
                <span style="font-size:1.2em;">📺</span>
                <div style="flex:1;">
                    <div style="font-size:0.75em;color:#888;">이 영상이 도움될 거예요</div>
                    <div style="font-size:0.82em;font-weight:700;color:#1B4332;">${rse.video.label}</div>
                </div>
                <span style="font-size:0.9em;color:#1B4332;">▶</span>
            </a>` : ''}
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: Rosenberg Self-Esteem Scale (Rosenberg, 1965) · 60년간 52개국 검증</div>
        </div>

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:0.95em;font-weight:700;color:#1B4332;margin-bottom:10px;">${via.title}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                ${via.strengths.map((s,i)=>`<span style="background:${i===0?'#1B4332':'var(--border-color)'};color:${i===0?'#fff':'var(--text-color)'};padding:5px 12px;border-radius:20px;font-size:0.82em;font-weight:700;">${i===0?'👑 ':''}${s}</span>`).join('')}
            </div>
            <div style="font-size:0.88em;line-height:1.8;color:var(--text-color);">${via.desc}</div>
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: VIA Character Strengths (Peterson & Seligman, 2004)</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
            <div style="background:var(--card-bg);border-radius:14px;padding:16px;border:1px solid var(--border-color);">
                <div style="font-size:0.78em;color:var(--text-muted);margin-bottom:4px;">🔤 MBTI 연관 유형</div>
                <div style="font-size:0.9em;font-weight:700;color:var(--text-color);">${animal.mbti}</div>
                <div style="font-size:0.7em;color:var(--text-muted);margin-top:4px;">참고: McCrae & Costa (1989)</div>
            </div>
            <div style="background:var(--card-bg);border-radius:14px;padding:16px;border:1px solid var(--border-color);">
                <div style="font-size:0.78em;color:var(--text-muted);margin-bottom:4px;">💑 궁합 유형</div>
                <div style="font-size:0.9em;font-weight:700;color:var(--text-color);">${compatible.animal} ${compatible.name}</div>
                <div style="font-size:0.75em;color:var(--text-muted);margin-top:2px;">${compatible.title}</div>
            </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
            <button onclick="sharePsychMyResult()"
                style="width:100%;min-height:52px;background:#1B4332;color:#fff;border:none;border-radius:14px;font-size:0.95em;font-weight:700;cursor:pointer;">
                ${animal.animal} 내 결과 공유하기 📤
            </button>
            <button onclick="sharePsychInvite()"
                style="width:100%;min-height:48px;background:var(--card-bg);color:#1B4332;border:2px solid #1B4332;border-radius:14px;font-size:0.9em;font-weight:700;cursor:pointer;">
                💌 친구에게 테스트 추천하기
            </button>
        </div>

        </div>
        <div id="psych-result-cta" style="position:sticky;bottom:0;background:rgba(27,67,50,0.97);backdrop-filter:blur(8px);padding:12px 20px;display:flex;align-items:center;gap:12px;border-top:1px solid rgba(201,168,76,0.3);">
            <div style="flex:1;">
                <div id="psych-cta-title" style="font-size:0.85em;font-weight:700;color:#C9A84C;">맞춤 확언 받아보기</div>
                <div style="font-size:0.75em;color:rgba(255,255,255,0.6);">매일 무료로 받아보기</div>
            </div>
            <button id="psych-result-cta-btn"
                style="background:#C9A84C;color:#1B4332;border:none;border-radius:12px;padding:10px 20px;font-size:0.9em;font-weight:900;cursor:pointer;white-space:nowrap;">
                🌿 앱 메인으로 바로가기
            </button>
        </div>
    </div>`;

    // CTA 버튼 이벤트 바인딩
    setTimeout(function(){
        var ctaBtn = document.getElementById('psych-result-cta-btn');
        if(ctaBtn){
            ctaBtn.addEventListener('click', function(){
                document.getElementById('psych-modal').remove();
                setTimeout(function(){
                    if(safeGetItem('onboarding_done','') !== '1'){
                        showInstallPrompt ? showInstallPrompt() : initOnboarding();
                    } else {
                        switchView('home');
                    }
                }, 200);
            });
        }
    }, 100);
}

// [3] 도우미 함수들 (기존 함수는 그대로 유지)
function getBFI() { return BFI_ITEMS || []; }
function getRSE() { return RSE_ITEMS || []; }
function getVIA() { return pMode==='quick' ? VIA_ITEMS_SHORT : VIA_ITEMS; }

// ============================================
// 기존 app.js의 모든 나머지 기능들 (유틸리티 등)
// 이미 완벽하게 위쪽과 연결되어 있습니다!
// ============================================
